import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  product: any;
  quantity: number;
}

export interface AppliedCoupon {
  code: string;
  discountPercentage?: number; // e.g. 15 for 15%
  fixedDiscountCents?: number;
  eligibleItemIds?: (string | number)[]; // optional: for item-scoped deals
  scoped_variant_id?: number; // optional: scoped variant ID
  isDealCoupon?: boolean;
  message?: string;
}

export interface ActiveDealInfo {
  dealId?: number;
  variantId: number;
  productId?: number;
  couponCode: string;
  originalPriceCents: number;
  dealPriceCents: number;
  discountPercent: number;
  savingsCents: number;
  isBumper?: boolean;
}

export interface CartTotals {
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  totalCents: number;
  estimatedGstCents: number;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  estimatedGst: number;
  eligibleItemCount: number;
}

// Helper to reliably extract product or variant identifier
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getProductId(product: any): string {
  if (!product) return "";
  if (product.variant_id) return String(product.variant_id);
  if (product.selectedVariant?.id) return String(product.selectedVariant.id);
  return String(product._id || product.id || "");
}

// Dynamically derive pricing, discounts, taxes, and shipping from current items and active coupon
export function calculateTotals(items: CartItem[], coupon: AppliedCoupon | null): CartTotals {
  const subtotalCents = items.reduce((acc, item) => {
    const p = item.product || {};
    const priceCents =
      p.price_cents != null && Number(p.price_cents) > 0
        ? Number(p.price_cents)
        : Math.round((Number(p.price) || 0) * 100);
    return acc + priceCents * Math.max(1, Number(item.quantity) || 1);
  }, 0);

  let discountCents = 0;
  let eligibleCount = 0;

  if (coupon && items.length > 0) {
    const hasScopedFilter =
      coupon.scoped_variant_id != null ||
      (coupon.eligibleItemIds && coupon.eligibleItemIds.length > 0);

    if (coupon.discountPercentage && coupon.discountPercentage > 0) {
      if (hasScopedFilter) {
        const eligibleSubtotal = items
          .filter((i) => {
            const p = i.product || {};
            const vId = p.variant_id ?? p.variantId ?? p.selectedVariant?.id;
            const pId = p.product_id ?? p.productId ?? p.id ?? p._id;
            const isMatch =
              (coupon.scoped_variant_id != null && vId != null && Number(vId) === Number(coupon.scoped_variant_id)) ||
              (coupon.eligibleItemIds && coupon.eligibleItemIds.some(
                (id) =>
                  (vId != null && String(id) === String(vId)) ||
                  (pId != null && String(id) === String(pId))
              ));
            if (isMatch) eligibleCount += i.quantity || 1;
            return isMatch;
          })
          .reduce((acc, i) => {
            const p = i.product || {};
            const priceCents =
              p.price_cents != null && Number(p.price_cents) > 0
                ? Number(p.price_cents)
                : Math.round((Number(p.price) || 0) * 100);
            return acc + priceCents * Math.max(1, Number(i.quantity) || 1);
          }, 0);

        discountCents = Math.round(eligibleSubtotal * (coupon.discountPercentage / 100));
      } else {
        eligibleCount = items.reduce((acc, i) => acc + (i.quantity || 1), 0);
        discountCents = Math.round(subtotalCents * (coupon.discountPercentage / 100));
      }
    } else if (coupon.fixedDiscountCents && coupon.fixedDiscountCents > 0) {
      eligibleCount = items.reduce((acc, i) => acc + (i.quantity || 1), 0);
      discountCents = Math.min(coupon.fixedDiscountCents, subtotalCents);
    }
  }

  // Strict guard: discount cannot exceed subtotal
  discountCents = Math.min(discountCents, subtotalCents);
  const shippingCents = subtotalCents >= 49900 || subtotalCents === 0 ? 0 : 4900; // Free delivery over ₹499
  const totalCents = Math.max(0, subtotalCents - discountCents + shippingCents);

  // Embedded 18% GST calculation (Base = postDiscount / 1.18, GST = postDiscount - Base)
  const postDiscountSubtotal = Math.max(0, subtotalCents - discountCents);
  const estimatedGstCents = Math.round(postDiscountSubtotal - postDiscountSubtotal / 1.18);

  return {
    subtotalCents,
    discountCents,
    shippingCents,
    totalCents,
    estimatedGstCents,
    subtotal: subtotalCents / 100,
    discount: discountCents / 100,
    shipping: shippingCents / 100,
    total: totalCents / 100,
    estimatedGst: estimatedGstCents / 100,
    eligibleItemCount: eligibleCount,
  };
}

/**
 * Reactively revalidates active coupon & active deal against remaining cart items.
 * Purges orphaned/zombie coupons when qualifying items are removed or cart is emptied.
 */
export function revalidateCouponForItems(
  items: CartItem[],
  coupon: AppliedCoupon | null,
  activeDeal: ActiveDealInfo | null
): { appliedCoupon: AppliedCoupon | null; activeDeal: ActiveDealInfo | null } {
  if (items.length === 0) {
    return { appliedCoupon: null, activeDeal: null };
  }

  let nextActiveDeal = activeDeal;
  let nextCoupon = coupon;

  // 1. Check activeDeal eligibility
  if (nextActiveDeal) {
    const hasDealItem = items.some((item) => {
      const p = item.product || {};
      const vId = p.variant_id ?? p.variantId ?? p.selectedVariant?.id;
      const pId = p.product_id ?? p.productId ?? p.id ?? p._id;
      return (
        (nextActiveDeal!.variantId != null && Number(vId) === Number(nextActiveDeal!.variantId)) ||
        (nextActiveDeal!.productId != null && Number(pId) === Number(nextActiveDeal!.productId))
      );
    });

    if (!hasDealItem) {
      nextActiveDeal = null;
      if (nextCoupon?.isDealCoupon || nextCoupon?.code === activeDeal?.couponCode) {
        nextCoupon = null;
      }
    }
  }

  // 2. Check coupon eligibility
  if (nextCoupon) {
    // A. Check scoped_variant_id
    if (nextCoupon.scoped_variant_id != null) {
      const hasScopedItem = items.some((item) => {
        const p = item.product || {};
        const vId = p.variant_id ?? p.variantId ?? p.selectedVariant?.id;
        return vId != null && Number(vId) === Number(nextCoupon!.scoped_variant_id);
      });
      if (!hasScopedItem) {
        nextCoupon = null;
      }
    }

    // B. Check eligibleItemIds
    if (nextCoupon && nextCoupon.eligibleItemIds && nextCoupon.eligibleItemIds.length > 0) {
      const hasEligibleItem = items.some((item) => {
        const p = item.product || {};
        const vId = p.variant_id ?? p.variantId ?? p.selectedVariant?.id;
        const pId = p.product_id ?? p.productId ?? p.id ?? p._id;
        return nextCoupon!.eligibleItemIds!.some(
          (id) =>
            (vId != null && String(id) === String(vId)) ||
            (pId != null && String(id) === String(pId))
        );
      });
      if (!hasEligibleItem) {
        nextCoupon = null;
      }
    }

    // C. Check computed discount for deal / scoped coupons
    if (
      nextCoupon &&
      (nextCoupon.isDealCoupon ||
        nextCoupon.code.startsWith("VIP-") ||
        nextCoupon.scoped_variant_id != null ||
        (nextCoupon.eligibleItemIds && nextCoupon.eligibleItemIds.length > 0))
    ) {
      const totals = calculateTotals(items, nextCoupon);
      if (totals.discountCents <= 0) {
        nextCoupon = null;
      }
    }
  }

  return { appliedCoupon: nextCoupon, activeDeal: nextActiveDeal };
}

interface StoreState {
  items: CartItem[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  favoriteProduct: any[];
  activeDeal: ActiveDealInfo | null;
  appliedCoupon: AppliedCoupon | null;

  setActiveDeal: (deal: ActiveDealInfo | null) => void;
  setAppliedCoupon: (coupon: AppliedCoupon | null) => void;
  removeAppliedCoupon: () => void;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addItem: (product: any) => void;
  removeItem: (productId: string) => void;
  deleteCartProduct: (productId: string) => void;
  resetCart: () => void;

  getTotals: () => CartTotals;
  getTotalPrice: () => number;
  getSubtotalPrice: () => number;
  getItemCount: (productId: string) => number;
  getGroupedItems: () => CartItem[];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addToFavorite: (product: any) => void;
  resetFavorite: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      items: [],
      favoriteProduct: [],
      activeDeal: null,
      appliedCoupon: null,

      setActiveDeal: (deal: ActiveDealInfo | null) => {
        if (deal) {
          const coupon: AppliedCoupon = {
            code: deal.couponCode,
            discountPercentage: deal.discountPercent,
            eligibleItemIds: [deal.variantId, deal.productId].filter(Boolean) as (string | number)[],
            scoped_variant_id: deal.variantId,
            isDealCoupon: true,
            message: `VIP Deal Applied (${deal.discountPercent}% OFF)`,
          };
          set({ activeDeal: deal, appliedCoupon: coupon });
        } else {
          set({
            activeDeal: null,
            appliedCoupon: get().appliedCoupon?.isDealCoupon ? null : get().appliedCoupon,
          });
        }
      },

      setAppliedCoupon: (coupon: AppliedCoupon | null) => {
        if (!coupon) {
          set({ appliedCoupon: null, activeDeal: null });
        } else {
          set({ appliedCoupon: coupon });
        }
      },

      removeAppliedCoupon: () => {
        set({ appliedCoupon: null, activeDeal: null });
      },

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      addItem: (product: any) => {
        const id = getProductId(product);
        if (!id) return;
        const currentItems = get().items;
        const existingItem = currentItems.find(
          (item) => getProductId(item.product) === id
        );

        let updatedItems: CartItem[];
        if (existingItem) {
          updatedItems = currentItems.map((item) =>
            getProductId(item.product) === id
              ? { ...item, product: { ...item.product, ...product }, quantity: item.quantity + 1 }
              : item
          );
        } else {
          updatedItems = [...currentItems, { product, quantity: 1 }];
        }

        const { appliedCoupon, activeDeal } = revalidateCouponForItems(
          updatedItems,
          get().appliedCoupon,
          get().activeDeal
        );

        set({
          items: updatedItems,
          appliedCoupon,
          activeDeal,
        });
      },

      removeItem: (productId: string) => {
        const currentItems = get().items;
        const existingItem = currentItems.find(
          (item) => getProductId(item.product) === productId
        );

        let updatedItems: CartItem[];
        if (existingItem && existingItem.quantity > 1) {
          updatedItems = currentItems.map((item) =>
            getProductId(item.product) === productId
              ? { ...item, quantity: item.quantity - 1 }
              : item
          );
        } else {
          updatedItems = currentItems.filter(
            (item) => getProductId(item.product) !== productId
          );
        }

        const { appliedCoupon, activeDeal } = revalidateCouponForItems(
          updatedItems,
          get().appliedCoupon,
          get().activeDeal
        );

        set({
          items: updatedItems,
          appliedCoupon,
          activeDeal,
        });
      },

      deleteCartProduct: (productId: string) => {
        const updatedItems = get().items.filter(
          (item) => getProductId(item.product) !== productId
        );

        const { appliedCoupon, activeDeal } = revalidateCouponForItems(
          updatedItems,
          get().appliedCoupon,
          get().activeDeal
        );

        set({
          items: updatedItems,
          appliedCoupon,
          activeDeal,
        });
      },

      resetCart: () => {
        set({ items: [], appliedCoupon: null, activeDeal: null });
        if (typeof window !== "undefined") {
          try {
            const raw = localStorage.getItem("cart-store");
            if (raw) {
              const parsed = JSON.parse(raw);
              if (parsed.state) {
                parsed.state.items = [];
                parsed.state.appliedCoupon = null;
                parsed.state.activeDeal = null;
                localStorage.setItem("cart-store", JSON.stringify(parsed));
              }
            } else {
              localStorage.removeItem("cart-store");
            }
          } catch (e) {
            console.error("Failed to sync resetCart to localStorage", e);
          }
        }
      },

      getTotals: () => {
        return calculateTotals(get().items, get().appliedCoupon);
      },

      getTotalPrice: () => {
        return calculateTotals(get().items, get().appliedCoupon).total;
      },

      getSubtotalPrice: () => {
        return calculateTotals(get().items, get().appliedCoupon).subtotal;
      },

      getItemCount: (productId: string) => {
        const item = get().items.find(
          (item) => getProductId(item.product) === productId
        );
        return item ? item.quantity : 0;
      },

      getGroupedItems: () => get().items,

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      addToFavorite: (product: any) => {
        const id = getProductId(product);
        if (!id) return;
        const currentFavs = get().favoriteProduct;
        const exists = currentFavs.some((item) => getProductId(item) === id);

        if (exists) {
          set({
            favoriteProduct: currentFavs.filter(
              (item) => getProductId(item) !== id
            ),
          });
        } else {
          set({ favoriteProduct: [...currentFavs, product] });
        }
      },

      resetFavorite: () => set({ favoriteProduct: [] }),
    }),
    {
      name: "cart-store",
    }
  )
);

export const useCartStore = useStore;

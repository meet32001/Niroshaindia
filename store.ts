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
    if (coupon.discountPercentage && coupon.discountPercentage > 0) {
      if (coupon.eligibleItemIds && coupon.eligibleItemIds.length > 0) {
        const eligibleSubtotal = items
          .filter((i) => {
            const p = i.product || {};
            const vId = p.variant_id ?? p.variantId ?? p.selectedVariant?.id;
            const pId = p.product_id ?? p.productId ?? p.id ?? p._id;
            const isMatch = coupon.eligibleItemIds!.some(
              (id) =>
                (vId != null && String(id) === String(vId)) ||
                (pId != null && String(id) === String(pId))
            );
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

        if (existingItem) {
          set({
            items: currentItems.map((item) =>
              getProductId(item.product) === id
                ? { ...item, product: { ...item.product, ...product }, quantity: item.quantity + 1 }
                : item
            ),
          });
        } else {
          set({ items: [...currentItems, { product, quantity: 1 }] });
        }
      },

      removeItem: (productId: string) => {
        const currentItems = get().items;
        const existingItem = currentItems.find(
          (item) => getProductId(item.product) === productId
        );

        if (existingItem && existingItem.quantity > 1) {
          set({
            items: currentItems.map((item) =>
              getProductId(item.product) === productId
                ? { ...item, quantity: item.quantity - 1 }
                : item
            ),
          });
        } else {
          set({
            items: currentItems.filter(
              (item) => getProductId(item.product) !== productId
            ),
          });
        }
      },

      deleteCartProduct: (productId: string) => {
        set({
          items: get().items.filter(
            (item) => getProductId(item.product) !== productId
          ),
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

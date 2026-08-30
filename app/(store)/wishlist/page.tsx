"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PriceFormatter } from "@/components/shared/PriceFormatter";
import { useStore } from "@/store";
import { getWishlistItems, removeFromWishlist, moveToCart } from "@/actions/wishlist";
import { Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

export default function WishlistPage() {
  const { favoriteProduct, addToFavorite, addItem } = useStore();
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dbItems, setDbItems] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    getWishlistItems().then((res) => {
      if (!isMounted) return;
      if (res.success && res.items.length > 0) {
        setDbItems(res.items);
        // Hydrate local Zustand store with saved server items
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        res.items.forEach((item: any) => {
          const variant = item.product_variants || {};
          const product = variant.products || {};
          const formatted = {
            id: product.id || variant.id || item.id,
            _id: product.id || variant.id || item.id,
            variant_id: variant.id || item.variant_id,
            wishlist_item_id: item.id,
            name: variant.name || product.name || "Saved Product",
            price: (variant.price_cents || 0) / 100,
            stock: variant.stock ?? 10,
            image: variant.product_images?.[0]?.image_url || "/images/product-placeholder.png",
            slug: product.slug,
          };
          const exists = favoriteProduct.some(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (fav: any) => String(fav.id || fav._id) === String(formatted.id)
          );
          if (!exists) {
            addToFavorite(formatted);
          }
        });
      }
      setLoading(false);
    });
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleRemove = async (product: any, wishlistItemId?: string) => {
    // 1. Optimistic removal in local store
    addToFavorite(product);
    toast.success("Removed from wishlist");

    // 2. Server Action deletion
    const variantId = product.variant_id || product.id || product._id;
    const productId = product.id || product._id;

    const res = await removeFromWishlist({
      wishlistItemId: wishlistItemId || product.wishlist_item_id || null,
      variantId: variantId || null,
      productId: productId || null,
    });

    if (!res.success) {
      console.warn("[WISHLIST REMOVE NOTICE]:", res.error);
      // Revert optimistic removal if server fails
      addToFavorite(product);
      toast.error(res.error || "Failed to remove from wishlist");
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleMoveToCart = async (product: any) => {
    const stock = product.stock ?? 10;
    if (stock <= 0) {
      toast.error("This item is currently out of stock");
      return;
    }

    const variantId = product.variant_id || product.id || product._id;
    const productId = product.id || product._id;

    // 1. Add to local Zustand cart
    addItem(product);

    // 2. Remove from local Zustand favorites
    addToFavorite(product);

    toast.success("Moved to cart!");

    // 3. Server action: Move from DB wishlist to DB cart
    const res = await moveToCart(variantId, productId, 1);
    if (!res.success) {
      console.warn("[MOVE TO CART NOTICE]:", res.error);
    }
  };

  return (
    <Container className="py-8 space-y-6">
      <div className="flex flex-col gap-1 border-b pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Heart className="w-6 h-6 text-rose-600 fill-rose-600" />
          <span>My Wishlist</span>
        </h1>
        <p className="text-sm text-slate-500">
          Curate your desired products, view stock availability, or move them directly to your cart.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <Card key={n} className="overflow-hidden border border-slate-200 dark:border-slate-800 animate-pulse">
              <div className="aspect-square bg-slate-100 dark:bg-slate-800" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      ) : favoriteProduct.length === 0 ? (
        <Card className="p-12 text-center border-dashed space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center mx-auto text-rose-500">
            <Heart className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Your Wishlist is Empty
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              You haven&apos;t saved any items yet. Explore our storefront and click the heart icon on any product to save it for later.
            </p>
          </div>
          <Link href="/shop">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-2 rounded-xl">
              <span>Explore Products</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {favoriteProduct.map((product) => {
            const id = String(product._id || product.id || "");
            const name = product.name || "Saved Product";
            const image =
              product.image ||
              product.images?.[0] ||
              product.product_variants?.[0]?.product_images?.[0]?.image_url ||
              "/images/product-placeholder.png";
            const price = product.price || (product.price_cents || 0) / 100;
            const stock = product.stock ?? 10;
            const inStock = stock > 0;

            // Match DB item ID if present
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const dbMatch = dbItems.find((d: any) => d.product_variants?.id === product.variant_id || d.id === product.wishlist_item_id);
            const wishlistItemId = dbMatch?.id || product.wishlist_item_id;

            return (
              <Card
                key={id}
                className="overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:shadow-md transition-shadow group"
              >
                <div>
                  <div className="relative aspect-square bg-slate-50 dark:bg-slate-900 overflow-hidden">
                    <Image
                      src={typeof image === "string" ? image : "/images/product-placeholder.png"}
                      alt={name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      onClick={() => handleRemove(product, wishlistItemId)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-600 transition-colors shadow-xs cursor-pointer"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-3 left-3">
                      {inStock ? (
                        <Badge className="bg-emerald-600 text-white text-[10px]">In Stock</Badge>
                      ) : (
                        <Badge variant="destructive" className="text-[10px]">Out of Stock</Badge>
                      )}
                    </div>
                  </div>

                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base font-semibold line-clamp-1">
                      <Link
                        href={`/product/${product.slug?.current || product.slug || id}`}
                        className="hover:text-emerald-600 transition-colors"
                      >
                        {name}
                      </Link>
                    </CardTitle>
                    <div className="text-emerald-700 dark:text-emerald-400 font-bold text-base mt-1">
                      <PriceFormatter amount={price} />
                    </div>
                  </CardHeader>
                </div>

                <CardFooter className="p-4 pt-2">
                  <Button
                    onClick={() => handleMoveToCart(product)}
                    disabled={!inStock}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-semibold gap-2 rounded-xl"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{inStock ? "Move to Cart" : "Out of Stock"}</span>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </Container>
  );
}

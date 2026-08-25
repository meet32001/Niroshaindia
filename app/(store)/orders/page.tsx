import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Package, PackageX, ShoppingBag, ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Title } from "@/components/ui/text";
import { getMyOrders } from "@/sanity/lib/queries";
import { OrdersComponent } from "@/components/orders/OrdersComponent";

export default async function OrdersPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const orders = await getMyOrders(userId);

  return (
    <div className="py-8 md:py-12 pb-24 md:pb-12">
      <Container>
        <div className="space-y-6">
          {/* Header Title Bar */}
          <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-shop-orange/10 text-shop-orange">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <Title className="text-xl md:text-2xl font-extrabold">My Orders</Title>
              <p className="text-xs text-slate-500 font-medium">
                Track and manage your order history, invoices, and shipping details.
              </p>
            </div>
          </div>

          {/* Empty State vs Table View */}
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 max-w-md mx-auto shadow-xs">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-400">
                <PackageX className="h-8 w-8" />
              </div>

              <div className="space-y-1">
                <h2 className="text-lg font-bold text-shop-dark dark:text-slate-100">
                  No orders found
                </h2>
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                  You haven&apos;t placed any orders yet. Explore our electronics collection to place your first order!
                </p>
              </div>

              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 bg-shop-orange hover:bg-amber-600 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition-all duration-300 shadow-md cursor-pointer"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Explore Store</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <OrdersComponent orders={orders} />
          )}
        </div>
      </Container>
    </div>
  );
}

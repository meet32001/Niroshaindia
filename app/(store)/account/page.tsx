"use client";

import Link from "next/link";
import { UserProfile, useUser } from "@clerk/nextjs";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Package, Heart, User, ArrowRight, ShieldCheck } from "lucide-react";

export default function AccountPage() {
  const { user, isLoaded } = useUser();

  return (
    <Container className="py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-emerald-50 dark:bg-emerald-950/40 p-6 rounded-2xl border border-emerald-200 dark:border-emerald-900">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-md overflow-hidden">
            {user?.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.imageUrl} alt={user.fullName || "User"} className="w-full h-full object-cover" />
            ) : (
              user?.firstName?.[0] || <User className="w-7 h-7" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Welcome back, {user?.firstName || "Customer"}!
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {user?.primaryEmailAddress?.emailAddress || "Manage your orders and security settings"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800 shadow-xs self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Account Verified</span>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              <span>Address Book</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-3">
            <p className="text-sm text-slate-500">
              Manage saved shipping and billing addresses for fast checkout.
            </p>
            <Link href="/account/addresses">
              <Button variant="outline" size="sm" className="w-full justify-between font-semibold rounded-xl mt-2">
                <span>Manage Addresses</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-600" />
              <span>Order History</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-3">
            <p className="text-sm text-slate-500">
              Track active shipments, view receipts, and reorder products.
            </p>
            <Link href="/orders">
              <Button variant="outline" size="sm" className="w-full justify-between font-semibold rounded-xl mt-2">
                <span>View Orders</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-600" />
              <span>Wishlist</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-3">
            <p className="text-sm text-slate-500">
              View items saved in your wishlist and move them directly to cart.
            </p>
            <Link href="/wishlist">
              <Button variant="outline" size="sm" className="w-full justify-between font-semibold rounded-xl mt-2">
                <span>My Wishlist</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Clerk UserProfile Component */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm p-2 sm:p-4">
        <h2 className="text-lg font-bold p-4 pb-2 text-slate-900 dark:text-slate-100">
          Profile & Security Settings
        </h2>
        {isLoaded && (
          <UserProfile
            routing="hash"
            appearance={{
              elements: {
                rootBox: "w-full shadow-none border-none",
                card: "shadow-none border-none bg-transparent w-full",
                navbar: "border-r border-slate-200 dark:border-slate-800",
                navbarButton: "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800",
                headerTitle: "text-slate-900 dark:text-slate-100 font-bold",
                formButtonPrimary: "bg-emerald-600 hover:bg-emerald-700 text-white font-semibold",
              },
            }}
          />
        )}
      </div>
    </Container>
  );
}

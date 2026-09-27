import { Container } from "@/components/layout/Container";
import Link from "next/link";
import { Truck, MapPin, Zap, ShieldAlert, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Shipping & Delivery Policy | Nirosha India",
  description: "Pan-India delivery timelines, express shipping, and order tracking information for Nirosha India.",
};

export default function ShippingPage() {
  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen py-12 sm:py-16">
      <Container className="max-w-4xl">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-6">
          <Link href="/" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
            Home
          </Link>
          <span>&gt;</span>
          <span className="text-slate-900 dark:text-slate-100 font-semibold">Shipping & Delivery</span>
        </nav>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-8 sm:p-12 shadow-sm space-y-8">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 mb-3">
              <Truck className="w-3.5 h-3.5" /> Pan-India Express Logistics
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Shipping & Delivery Information
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Last updated: September 2026 • Real-time postal validation and verified delivery timelines
            </p>
          </div>

          <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed text-slate-600 dark:text-slate-300 space-y-6">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                1. Free Express Shipping on Orders Above ₹999
              </h2>
              <p>
                We offer free standard express delivery across India on all eligible cart totals exceeding ₹999. In-stock products are processed and dispatched from our primary fulfillment warehouses within 24 to 48 hours of payment confirmation.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                2. Standard Delivery Timelines by Region
              </h2>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-300">
                <li><strong>Tier 1 Metro Cities (Mumbai, Delhi-NCR, Bengaluru, Ahmedabad, Pune, Hyderabad, Chennai, Kolkata):</strong> 2 to 3 Business Days.</li>
                <li><strong>Tier 2 & Urban Centers:</strong> 3 to 5 Business Days.</li>
                <li><strong>Rest of India / Rural Postal Circles:</strong> 5 to 7 Business Days.</li>
                <li><strong>Heavy Appliances (Refrigerators, 55&quot;+ TVs, Washing Machines):</strong> Handled via specialized surface transit logistics with pre-scheduled delivery appointments.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                3. Real-Time India Post PIN Code Validation
              </h2>
              <p>
                To avoid failed deliveries or routing delays, our checkout engine verifies your destination postal code directly against the official India Post Registry. You will receive an instantaneous alert if a PIN code is unserviceable prior to order placement.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                4. Transit Insurance & Tracking
              </h2>
              <p>
                All consignments are fully insured against transit loss or physical damage. Once your order has been dispatched, you will receive an SMS and email notification with an active tracking link. You can track your shipment anytime via the <Link href="/orders" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">Order Tracking Portal</Link>.
              </p>
            </section>
          </div>
        </div>
      </Container>
    </div>
  );
}

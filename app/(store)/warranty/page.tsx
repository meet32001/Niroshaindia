import { Container } from "@/components/layout/Container";
import Link from "next/link";
import { ShieldCheck, CheckCircle2, Clock, HelpCircle, PhoneCall } from "lucide-react";

export const metadata = {
  title: "Warranty Policy | Nirosha India",
  description: "Comprehensive brand warranty guidelines, coverage, and claim processes for products purchased at Nirosha India.",
};

export default function WarrantyPage() {
  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen py-12 sm:py-16">
      <Container className="max-w-4xl">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-6">
          <Link href="/" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
            Home
          </Link>
          <span>&gt;</span>
          <span className="text-slate-900 dark:text-slate-100 font-semibold">Warranty Policy</span>
        </nav>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-8 sm:p-12 shadow-sm space-y-8">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 mb-3">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Genuine Protection
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Brand Warranty Guidelines
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Last updated: September 2026 • Official Brand Warranty Support Across India
            </p>
          </div>

          <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed text-slate-600 dark:text-slate-300 space-y-6">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                1. 100% Original Manufacturer Warranty
              </h2>
              <p>
                Every electronic gadget, television, laptop, and home/kitchen appliance sold on Nirosha India is sourced directly from authorized brand distributors. All products carry standard manufacturer warranty coverage ranging from 1 year to 5+ years (depending on the product category and manufacturer policy).
              </p>
              <p>
                Your official tax invoice downloaded from your <Link href="/orders" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">Nirosha India Orders Dashboard</Link> serves as proof of purchase for all warranty claims at authorized brand service centers.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                2. Warranty Periods by Category
              </h2>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-300">
                <li><strong>Smartphones & Tablets:</strong> 1 Year Comprehensive Device Warranty + 6 Months on in-box accessories.</li>
                <li><strong>Laptops & MacBooks:</strong> 1 to 3 Years Manufacturer Warranty with optional OEM accidental damage protection.</li>
                <li><strong>Televisions & Large Displays:</strong> 1 to 3 Years Comprehensive Warranty + extended panel coverage on select OLED/QLED models.</li>
                <li><strong>Home Appliances (Refrigerators, Washing Machines, ACs):</strong> 1 Year Machine Warranty + 5 to 10 Years Inverter Compressor/Motor Warranty.</li>
                <li><strong>Kitchen Appliances & Personal Care:</strong> 1 to 2 Years Brand Replacement/Repair Warranty.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                3. How to Claim Your Warranty
              </h2>
              <ol className="list-decimal pl-5 space-y-2 text-slate-600 dark:text-slate-300">
                <li>Locate your official invoice under your <Link href="/orders" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">Account Orders</Link> section.</li>
                <li>Contact the brand&apos;s toll-free helpline or visit an authorized brand service center near your location.</li>
                <li>For major home appliances (Air Conditioners, Refrigerators, Washing Machines), the brand technician will provide free on-site service at your residence.</li>
                <li>Present the invoice with serial number matching your unit.</li>
              </ol>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                4. Need Assistance with Brand Service?
              </h2>
              <p>
                If you face any issues claiming warranty with a manufacturer, Nirosha India customer care will step in to escalate with brand liaisons on your behalf. Please reach out to our dedicated support team at <Link href="/contact" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">Support Desk</Link> or email <strong>support@niroshaindia.com</strong>.
              </p>
            </section>
          </div>
        </div>
      </Container>
    </div>
  );
}

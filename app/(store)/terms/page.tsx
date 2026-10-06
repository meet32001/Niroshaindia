import { Container } from "@/components/layout/Container";
import Link from "next/link";
import {
  FileText,
  ShieldCheck,
  RotateCcw,
  Receipt,
  Clock,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Video,
  Scale,
  Ban,
  Building2,
  ShieldAlert,
  ArrowRight,
  Truck,
} from "lucide-react";

export const metadata = {
  title: "Terms of Service & Enterprise Master Policies | Nirosha India",
  description:
    "Authoritative legal agreement governing platform use, 18% GST retail pricing, typographical error protections, 7-day replacement window, video unboxing mandates, and manufacturer brand warranty execution.",
};

export default function TermsOfServicePage() {
  const POLICY_SECTIONS = [
    { id: "general-terms", label: "1. General Terms & Contract" },
    { id: "pricing-and-taxes", label: "2. Pricing, 18% GST & Corrections" },
    { id: "replacement-policy", label: "3. 7-Day Replacement & Video Proof" },
    { id: "brand-warranty", label: "4. Brand Warranty & DOA Protocol" },
    { id: "order-cancellations", label: "5. Cancellations & Reversals" },
    { id: "grievance-redressal", label: "6. Statutory Grievance Redressal" },
  ];

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen py-10 sm:py-16">
      <Container className="max-w-4xl space-y-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <Link href="/" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
            Home
          </Link>
          <span>&gt;</span>
          <span className="text-slate-900 dark:text-slate-100 font-semibold">Terms of Service</span>
        </nav>

        {/* Header Block */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400">
              <FileText className="w-3.5 h-3.5" />
              <span>Master Legal Agreement</span>
            </span>
            <span className="text-xs text-slate-400 font-medium">• Governed under Indian Statutory Laws</span>
            <span className="text-xs text-slate-400 font-medium">• Last Updated: September 2026</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Terms of Service &amp; Master Retail Agreement
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
            This document constitutes the authoritative, legally binding agreement governing platform access, transactions, catalog price parity, 18% GST statutory invoicing, consumer replacement rights, manufacturer brand warranties, and dispute resolution for Nirosha India Retail Ltd.
          </p>

          {/* Quick Anchor Navigation Strip */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
            {POLICY_SECTIONS.map((sec) => (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                {sec.label}
              </a>
            ))}
          </div>
        </div>

        {/* Master Policy Articles */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xs space-y-12 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          
          {/* SECTION 1: General Terms */}
          <section id="general-terms" className="space-y-5 scroll-mt-24">
            <div className="flex items-center gap-2.5 text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Scale className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-xl font-bold tracking-tight">1. General Terms, User Eligibility &amp; Platform Use</h2>
            </div>

            <p>
              By accessing, browsing, registering, or transacting on <strong>Nirosha India</strong> (niroshaindia.com), you represent and warrant that you are entering into a legally enforceable contract with <strong>Nirosha India Retail Ltd.</strong> in strict accordance with the <strong>Indian Contract Act, 1872</strong>.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
                <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 uppercase tracking-wide flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>User Eligibility (18+ Age Mandate)</span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Transactions on Nirosha India are permitted exclusively for individuals who are 18 years of age or older and legally competent to contract. Minors may browse or procure items solely under the supervision and authenticated consent of a legal parent or guardian.
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-amber-200/60 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/10 space-y-2">
                <h4 className="font-bold text-xs text-amber-900 dark:text-amber-200 uppercase tracking-wide flex items-center gap-1.5">
                  <Ban className="w-4 h-4 text-amber-600" />
                  <span>Prohibition on Commercial Scalping</span>
                </h4>
                <p className="text-xs text-amber-800 dark:text-amber-300">
                  Our retail catalog is intended strictly for bona fide personal and household consumption. Nirosha India reserves the unilateral right to flag, freeze, or cancel bulk orders placed by commercial dealers, resellers, or automated bots.
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Account Authentication &amp; Responsibility</h4>
              <p>
                Customer identities and access sessions are authenticated through Clerk infrastructure. You are solely responsible for maintaining the confidentiality of your credentials, as well as for all actions, purchase commitments, and shipping instructions executed through your session.
              </p>
            </div>

            <div className="space-y-2.5">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Intellectual Property Rights</h4>
              <p>
                All platform software, user interface designs, logos, product catalog descriptions, technical specifications, and visual arrangements are the exclusive intellectual property of Nirosha India Retail Ltd. or licensed by its respective OEM brand partners. Unauthorized scraping, caching, or mirroring is strictly prohibited.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
              <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 uppercase tracking-wide flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                <span>Statutory Limitation of Liability &amp; Exclusive Jurisdiction</span>
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                To the maximum extent permitted by Indian jurisprudence, Nirosha India&apos;s total aggregate liability arising out of or related to any transaction, shipment, or product claim is capped strictly to the <strong>exact monetary amount paid by the customer for that specific item</strong>. Under no circumstances shall Nirosha India be liable for indirect, consequential, punitive, or downtime damages. All legal proceedings arising out of this agreement shall fall under the <strong>exclusive jurisdiction of the competent courts in Mumbai, Maharashtra, India</strong>.
              </p>
            </div>
          </section>

          {/* SECTION 2: Pricing, Invoicing & Typographical Errors */}
          <section id="pricing-and-taxes" className="space-y-5 scroll-mt-24">
            <div id="pricing-and-tax" className="scroll-mt-24" />
            <div className="flex items-center gap-2.5 text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Receipt className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-xl font-bold tracking-tight">2. Pricing Transparency, 18% GST &amp; Typographical Error Protections</h2>
            </div>

            <p>
              In strict accordance with the <strong>Central Goods and Services Tax (GST) Act, 2017</strong> and retail transparency norms, <strong>all product prices displayed on Nirosha India are fully inclusive of applicable 18% GST</strong> (CGST + SGST or IGST depending on the shipping destination).
            </p>

            {/* Crucial ₹1 Bug & Typographical Error Shield */}
            <div className="p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 space-y-2.5">
              <h4 className="font-bold text-xs text-amber-900 dark:text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Typographical Errors &amp; Technical Glitch Cancellation Shield (The &quot;₹1 Bug&quot; Clause)</span>
              </h4>
              <p className="text-xs text-amber-900/90 dark:text-amber-200/90 leading-relaxed">
                While Nirosha India strives to provide absolute catalog accuracy, technical glitches, network anomalies, or database synchronization errors may occasionally result in an incorrect price (such as a ₹1,00,000 laptop inadvertently listed at ₹1 or ₹0). In such unforeseen occurrences, <strong>Nirosha India reserves the absolute unilateral right to cancel, refuse, or void any orders placed at the erroneous price</strong>, even if the payment gateway has debited the funds or generated an automated order number. A 100% full refund will be reversed immediately to your original payment method without penalty or breach of contract.
              </p>
            </div>

            <div className="space-y-2.5">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Contract Formation: Order Receipt vs. Order Acceptance</h4>
              <p>
                Receiving an automated SMS notification, email confirmation, or an order reference identifier (e.g. <code>#ORD-XXXXXX</code>) signifies <strong>receipt of your purchase request only</strong> and does NOT constitute legally binding acceptance of the order. Legal contract formation and acceptance occur <strong>solely upon the physical generation of the tax invoice and hand-off of the consignment to our third-party logistics courier</strong>. Nirosha India reserves the right to reject or cancel any order prior to physical dispatch.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 space-y-2">
              <h4 className="font-bold text-xs text-emerald-900 dark:text-emerald-200 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>GST Tax Invoice Compliance</span>
              </h4>
              <p className="text-xs text-emerald-800 dark:text-emerald-300">
                Every dispatched consignment includes a downloadable, official Tax Invoice detailing our registered GSTIN, category HSN codes, and itemized tax breakdowns. This invoice serves as your authentic proof of purchase and manufacturer warranty certificate.
              </p>
            </div>
          </section>

          {/* SECTION 3: 7-Day Replacement Policy & Unboxing Video Mandate */}
          <section id="replacement-policy" className="space-y-5 scroll-mt-24">
            <div id="returns-and-replacements" className="scroll-mt-24" />
            <div id="returns" className="scroll-mt-24" />
            <div className="flex items-center gap-2.5 text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
              <RotateCcw className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-bold tracking-tight">3. 7-Day Replacement Policy &amp; Mandatory Unboxing Video Protocol</h2>
            </div>

            <p>
              To safeguard genuine buyers while defending against retail fraud on high-ticket consumer electronics, Nirosha India provides a <strong>7-Day Replacement Guarantee</strong> calculated from the courier delivery timestamp.
            </p>

            {/* Unboxing Video Mandate Box */}
            <div className="p-5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 space-y-3">
              <div className="flex items-center gap-2 text-rose-900 dark:text-rose-200">
                <Video className="w-4 h-4 text-rose-600 shrink-0" />
                <h4 className="font-bold text-xs uppercase tracking-wider">
                  Mandatory Unboxing Video Protocol (High-Ticket Anti-Fraud Shield)
                </h4>
              </div>
              <p className="text-xs text-rose-800 dark:text-rose-300 leading-relaxed">
                To prevent fraudulent claims regarding missing accessories, empty parcels, exterior denting, or wrong product models on premium laptops (MacBooks, gaming laptops) and 4K smart televisions:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs text-rose-800 dark:text-rose-300">
                <li>
                  <strong>Unedited Continuous Recording:</strong> Customers must record a single, continuous, unedited video capturing the outer courier shipping label, intact tamper-evident security tape, parcel opening, and serial number inspection.
                </li>
                <li>
                  <strong>48-Hour Reporting Window:</strong> Notice of transit damage, exterior physical scratches, or missing bundled components must be submitted via <Link href="/contact" className="underline font-bold">Contact Support</Link> within <strong>48 hours of delivery</strong> along with the unboxing video and photographs.
                </li>
                <li>
                  <strong>Waiver:</strong> Failure to provide unboxing video evidence within 48 hours constitutes an irrevocable waiver of transit damage or missing component claims.
                </li>
              </ul>
            </div>

            {/* Eligibility Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
                <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 uppercase tracking-wide flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Eligible Scenarios (7 Calendar Days)</span>
                </h4>
                <ul className="list-disc pl-4 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <li><strong>Transit Breakage:</strong> Physical impact damage sustained during courier transit with intact unboxing video proof.</li>
                  <li><strong>Dead on Arrival (DOA):</strong> Device fails completely to power on or charge out of the box.</li>
                  <li><strong>Specification Mismatch:</strong> Model, colorway, or hardware configuration differs from the confirmed order.</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
                <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 uppercase tracking-wide flex items-center gap-1.5">
                  <Ban className="w-4 h-4 text-rose-600" />
                  <span>Exclusions &amp; Hygiene Standards</span>
                </h4>
                <ul className="list-disc pl-4 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <li><strong>Hygiene Products:</strong> In-ear earbuds (TWS), earphones, smartwatches, and grooming appliances are strictly non-returnable once the factory blister seal is opened, unless verified DOA.</li>
                  <li><strong>Complete Packaging Required:</strong> All original retail boxes, user manuals, power adapters, and intact warranty cards must accompany the return.</li>
                </ul>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Beyond Economic Repair (BER) &amp; Refund Protocol</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Upon physical receipt and technical verification of the returned item at our fulfillment hub, an identical brand-new replacement is dispatched immediately. If replacement stock is exhausted (BER scenario), a 100% full refund is processed back to your original payment method (Credit/Debit Card, UPI, Net Banking) within 5 to 7 business days.
              </p>
            </div>
          </section>

          {/* SECTION 4: Brand Warranty & DOA Protocol */}
          <section id="brand-warranty" className="space-y-5 scroll-mt-24">
            <div id="warranty-and-support" className="scroll-mt-24" />
            <div id="warranty" className="scroll-mt-24" />
            <div className="flex items-center gap-2.5 text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
              <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-xl font-bold tracking-tight">4. Manufacturer Brand Warranty Desk &amp; Brand DOA Certification</h2>
            </div>

            <p>
              Nirosha India is an authorized distributor channel for premier consumer brands (Samsung, Apple, Sony, Sansui, etc.). <strong>Every product sold carries a genuine, 100% authentic manufacturer brand warranty</strong> valid across thousands of authorized service centers throughout India.
            </p>

            {/* Brand-Direct DOA Protocol Box */}
            <div className="p-5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-900/40 space-y-2.5">
              <h4 className="font-bold text-xs text-purple-900 dark:text-purple-200 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Brand-Direct Dead-on-Arrival (DOA) Certification Protocol</span>
              </h4>
              <p className="text-xs text-purple-900/90 dark:text-purple-200/90 leading-relaxed">
                If an electronic product powers on but exhibits an internal hardware defect (such as logic board failure, panel lines, or sensor malfunctions) within the primary brand window, major manufacturers (Apple, Samsung, Sony) require technical inspection by an authorized OEM service center technician. The technician issues an official <strong>&quot;DOA Certificate&quot;</strong>. Upon presenting this brand certificate to our support desk, Nirosha India executes an immediate doorstep replacement or complete refund.
              </p>
            </div>

            {/* Warranty Boundaries & Comprehensive Exclusions */}
            <div className="space-y-3 pt-1">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                Mechanical &amp; Electrical Coverage Boundaries vs. Exclusions
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Brand warranty coverage applies strictly to sudden internal mechanical or electrical breakdowns occurring during normal domestic use. The following scenarios are strictly excluded from warranty claims:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-1">
                  <strong className="text-slate-900 dark:text-slate-100 block">Cosmetic &amp; Structural</strong>
                  <span className="text-slate-500 dark:text-slate-400 leading-snug block">
                    Dents, chassis scratches, plastic moldings, cracks, and normal cabinet wear and tear.
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-1">
                  <strong className="text-slate-900 dark:text-slate-100 block">Consumables &amp; Cords</strong>
                  <span className="text-slate-500 dark:text-slate-400 leading-snug block">
                    Remote controls, batteries, power adapters, connecting cables, filters, and rubber gaskets.
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-1">
                  <strong className="text-slate-900 dark:text-slate-100 block">Environmental Hazards</strong>
                  <span className="text-slate-500 dark:text-slate-400 leading-snug block">
                    Liquid spills, voltage surges, lightning, insect infestation in circuit boards, or unauthorized repairs.
                  </span>
                </div>
              </div>
            </div>

            {/* On-Site vs Carry-In Service Protocol */}
            <div className="space-y-2 pt-1 text-xs">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Service Protocol Demarcation</h4>
              <p className="text-slate-600 dark:text-slate-300">
                <strong>On-Site Service:</strong> Large home appliances (Air Conditioners, Televisions, Refrigerators, Washing Machines, Kitchen Chimneys) receive authorized brand technician visits directly at your registered installation address.
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                <strong>Carry-In Service:</strong> Portable personal electronics (Smartphones, Tablets, Laptops, TWS Audio) are serviced via carry-in at the nearest authorized brand service network center.
              </p>
            </div>
          </section>

          {/* SECTION 5: Order Cancellations & Payment Reversals */}
          <section id="order-cancellations" className="space-y-5 scroll-mt-24">
            <div className="flex items-center gap-2.5 text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <h2 className="text-xl font-bold tracking-tight">5. Cancellations &amp; Payment Reversal Protocol</h2>
            </div>

            <p>
              Orders may be cancelled free of charge prior to physical fulfillment center packaging and generation of the courier Air Waybill (AWB) tracking number (typically within 12 to 24 hours of payment authorization).
            </p>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
              <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 uppercase tracking-wide flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>In-Transit Shipments &amp; Doorstep Refusal</span>
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Once an Air Waybill has been generated and the parcel is handed to logistics partners (Blue Dart, Delhivery), the shipment cannot be intercepted in transit. Customers wishing to cancel at this stage should simply refuse delivery at their doorstep. Automated return reconciliation will trigger upon the consignment returning to our fulfillment center.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Payment Reconciliation Turnaround (5 to 7 Business Days)</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                In strict compliance with Reserve Bank of India (RBI) payment reconciliation timelines, all refunds for pre-dispatch cancellations or approved replacements are credited back to the original funding instrument (Credit/Debit Card, UPI, Net Banking, or Wallet) within <strong>5 to 7 business days</strong>.
              </p>
            </div>
          </section>

          {/* SECTION 6: Statutory Grievance Redressal */}
          <section id="grievance-redressal" className="space-y-5 scroll-mt-24">
            <div className="flex items-center gap-2.5 text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-xl font-bold tracking-tight">6. Statutory Grievance Redressal Mechanism &amp; Compliance Officer</h2>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              In accordance with the <strong>Information Technology Act, 2000</strong>, the <strong>Consumer Protection (E-Commerce) Rules, 2020</strong>, and the <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong>, the contact details of the designated Grievance Officer are published below:
            </p>

            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 space-y-3 text-xs">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Grievance Officer &amp; Legal Redressal
                  </span>
                  <strong className="text-slate-900 dark:text-slate-100 text-sm block mt-0.5">
                    Nirosha India Grievance Redressal Desk
                  </strong>
                  <span className="text-slate-500">Nirosha India Retail Ltd.</span>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Operational Registered Office
                  </span>
                  <address className="not-italic text-slate-600 dark:text-slate-300 text-xs mt-0.5">
                    Level 8, Platina Tower, C-59, G Block, Bandra Kurla Complex (BKC), Bandra East, Mumbai, Maharashtra 400051, India.
                  </address>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  <strong>Statutory Resolution SLA:</strong> Acknowledgment within 48 business hours; comprehensive grievance resolution within 30 calendar days.
                </span>
              </div>
            </div>
          </section>

          {/* Customer Assistance Callout */}
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Need clarification regarding our terms or replacement policy?</span>
              </h4>
              <p className="text-xs text-slate-500">
                Our customer care desk is available Monday through Saturday to assist with order tracking, brand warranty claims, and policy questions.
              </p>
            </div>
            <Link
              href="/contact"
              className="px-4 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shrink-0 flex items-center gap-1.5"
            >
              <span>Contact Support</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}

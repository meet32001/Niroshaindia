import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Logo } from "@/components/header/Logo";

export default function NotFound() {
  return (
    <Container className="py-20 flex flex-col items-center justify-center text-center min-h-[60vh]">
      <Logo />

      <h2 className="text-2xl md:text-3xl font-bold text-shop-dark dark:text-slate-100 mt-6">
        Looking for something?
      </h2>

      <p className="text-slate-600 dark:text-slate-400 max-w-md mt-2 text-sm leading-relaxed">
        We&apos;re sorry, the web address you entered is not a functioning page on our site.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
        <Link
          href="/"
          className="bg-shop-orange hover:bg-amber-600 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-all duration-300 shadow-md"
        >
          Go to Homepage
        </Link>
        <Link
          href="/contact"
          className="border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
        >
          Contact Support
        </Link>
      </div>
    </Container>
  );
}

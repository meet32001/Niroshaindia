import { SignIn } from "@clerk/nextjs";

interface SignInPageProps {
  searchParams?: Promise<{ redirect?: string; redirect_url?: string }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const targetRedirect = params?.redirect || params?.redirect_url;
  const callbackUrl = targetRedirect
    ? `/auth-callback?redirect=${encodeURIComponent(targetRedirect)}`
    : "/auth-callback";

  return (
    <SignIn
      path="/sign-in"
      routing="path"
      signUpUrl="/sign-up"
      forceRedirectUrl={callbackUrl}
      appearance={{
        elements: {
          rootBox: "w-full shadow-lg rounded-2xl overflow-hidden",
          card: "shadow-none border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 w-full",
          headerTitle: "text-slate-900 dark:text-slate-100 font-bold",
          headerSubtitle: "text-slate-500 dark:text-slate-400 text-sm",
          socialButtonsBlockButton: "border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200",
          formButtonPrimary: "bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md",
          footerActionLink: "text-emerald-600 hover:text-emerald-700 font-medium",
        },
      }}
    />
  );
}

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <SignIn
      path="/sign-in"
      routing="path"
      signUpUrl="/sign-up"
      forceRedirectUrl="/auth-callback"
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

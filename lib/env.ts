import { z } from "zod";

/**
 * Enterprise Runtime Environment Variable Schema & Validator
 * Validates system perimeter configurations at startup.
 */
const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z
    .string({ message: "NEXT_PUBLIC_SUPABASE_URL is required" })
    .url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string({ message: "NEXT_PUBLIC_SUPABASE_ANON_KEY is required" })
    .min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY cannot be empty"),
  SUPABASE_SERVICE_ROLE_KEY: z
    .string({ message: "SUPABASE_SERVICE_ROLE_KEY is required" })
    .min(1, "SUPABASE_SERVICE_ROLE_KEY cannot be empty"),

  // Clerk
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z
    .string({ message: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required" })
    .min(1, "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY cannot be empty"),
  CLERK_SECRET_KEY: z
    .string({ message: "CLERK_SECRET_KEY is required" })
    .min(1, "CLERK_SECRET_KEY cannot be empty"),

  // Resend
  RESEND_API_KEY: z
    .string({ message: "RESEND_API_KEY is required" })
    .min(1, "RESEND_API_KEY cannot be empty"),

  // Canonical Site URL
  NEXT_PUBLIC_BASE_URL: z
    .string()
    .url()
    .optional()
    .default("https://niroshaindia.com"),
});

export type Env = z.infer<typeof envSchema>;

let validatedEnv: Env | null = null;

/**
 * Validates environment variables at runtime.
 * Throws a fatal exception in production if required variables are missing.
 */
export function validateEnv(): Env {
  if (validatedEnv) return validatedEnv;

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const missingKeys = result.error.issues.map((i) => i.path.join(".")).join(", ");
    const fatalMessage = `[FATAL STARTUP ERROR] Missing or invalid required environment variables: ${missingKeys}`;

    console.error(`\n❌ ${fatalMessage}\n`);

    if (process.env.NODE_ENV === "production") {
      throw new Error(fatalMessage);
    }

    // In dev / non-prod fallback to partial mock
    return {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key",
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-service-key",
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_placeholder",
      CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY || "sk_placeholder",
      RESEND_API_KEY: process.env.RESEND_API_KEY || "re_placeholder",
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || "https://niroshaindia.com",
    };
  }

  validatedEnv = result.data;
  return validatedEnv;
}

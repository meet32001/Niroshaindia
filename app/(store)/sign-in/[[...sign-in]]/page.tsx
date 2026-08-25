import { SignIn } from "@clerk/nextjs";
import { Container } from "@/components/layout/Container";

export default function SignInPage() {
  return (
    <Container className="py-16 flex items-center justify-center min-h-[70vh]">
      <SignIn
        fallbackRedirectUrl="/"
        path="/sign-in"
        routing="path"
        signUpUrl="/sign-up"
      />
    </Container>
  );
}

import { SignUp } from "@clerk/nextjs";
import { Container } from "@/components/layout/Container";

export default function SignUpPage() {
  return (
    <Container className="py-16 flex items-center justify-center min-h-[70vh]">
      <SignUp
        fallbackRedirectUrl="/"
        path="/sign-up"
        routing="path"
        signInUrl="/sign-in"
      />
    </Container>
  );
}

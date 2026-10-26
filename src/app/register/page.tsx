import { AuthForm } from "@/components/auth/auth-form";
import { AuthLayout } from "@/components/auth/auth-layout";
export default function Register() {
  return (
    <AuthLayout register>
      <AuthForm register />
    </AuthLayout>
  );
}

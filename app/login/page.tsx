import { Suspense } from "react";
import LoginFormInner from "@/components/auth/LoginFormInner";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginFormInner />
    </Suspense>
  );
}

import { Suspense } from "react";
import ResetPasswordInner from "@/components/auth/ResetPasswordInner";

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordInner />
    </Suspense>
  );
}

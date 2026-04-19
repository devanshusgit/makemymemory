import { cookies } from "next/headers";
import Link from "next/link";
import { buildMeta } from "@/lib/seo";
import AccountClient from "@/components/account/AccountClient";

export const metadata = buildMeta({
  title:       "My Account",
  description: "View your orders, manage your details, and track your personalised gifts.",
  path:        "/account",
  noIndex:     true,
});

export default function AccountPage() {
  const cookieStore = cookies();
  const session = cookieStore.get("user_session");
  let user: { name: string; email: string } | null = null;
  try {
    if (session?.value) {
      const parsed = JSON.parse(session.value);
      if (parsed?.email) user = parsed;
    }
  } catch { /* invalid cookie */ }

  return (
    <div className="bg-canvas min-h-screen">
      {/* Dark hero */}
      <div className="bg-stone-900 py-14 sm:py-20">
        <div className="section-wrap text-center">
          <span className="inline-flex items-center gap-2 text-xs font-semibold
                           tracking-widest uppercase text-sage mb-5">
            <span className="w-5 h-px bg-sage" />
            My Account
            <span className="w-5 h-px bg-sage" />
          </span>
          <h1
            className="font-serif font-bold text-white leading-tight mb-4"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "-0.02em" }}
          >
            {user ? `Welcome back, ${user.name.split(" ")[0]}` : "Your Account"}
          </h1>
          <p className="text-stone-400 text-sm sm:text-base max-w-md mx-auto">
            {user
              ? "Manage your orders, details, and preferences."
              : "Sign in to view your orders and manage your account."}
          </p>
        </div>
      </div>

      <AccountClient user={user} />
    </div>
  );
}

import AuthClient from "@/components/auth/AuthClient";

type Param = string | string[] | undefined;

// Same as URLSearchParams.get(): first value when a key repeats.
const first = (v: Param) => (Array.isArray(v) ? v[0] : v);

// Only send people back to a page on this site after signing in. A full URL
// ("https://evil.example") or protocol-relative "//evil.example" would turn
// the login page into a phishing redirect.
const safeRedirect = (v: Param) => {
  const r = first(v);
  return r && r.startsWith("/") && !r.startsWith("//") && !r.startsWith("/\\") ? r : undefined;
};

// Read the query here (not with useSearchParams in AuthClient) so the form is
// in the server-rendered HTML instead of bailing out to client rendering.
export default function LoginPage({
  searchParams,
}: {
  searchParams?: { redirect?: Param; mode?: Param };
}) {
  return (
    <AuthClient
      initialRedirect={safeRedirect(searchParams?.redirect)}
      initialMode={first(searchParams?.mode)}
    />
  );
}

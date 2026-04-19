"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Invalid password");
      } else {
        router.push("/admin/orders");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1714] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#8FBC8F]/20 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-[#8FBC8F]" />
          </div>
          <h1 className="text-white font-serif text-2xl font-bold">Admin Panel</h1>
          <p className="text-white/40 text-sm mt-1">Make My Memory</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#2C2520] rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1a1714] border border-white/10 rounded-xl px-4 py-3
                         text-white text-sm placeholder:text-white/20
                         focus:outline-none focus:ring-2 focus:ring-[#8FBC8F]/40 focus:border-[#8FBC8F]/50"
              placeholder="Enter admin password"
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#8FBC8F] text-white font-semibold py-3 rounded-xl
                       text-sm transition-all hover:bg-[#7aad7a] disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

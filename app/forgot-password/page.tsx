"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Mail, ArrowLeft, Smartphone } from "lucide-react";
import axios from "axios";

/**
 * Email accounts get a reset link. Phone accounts (signed up with a number
 * only) get a 6-digit SMS code and set the new password right here.
 */
export default function ForgotPasswordPage() {
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [devUrl, setDevUrl] = useState("");

  // Phone flow
  const [phone, setPhone] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<{ email: string }>();

  const onSubmit = async (data: { email: string }) => {
    setError("");
    try {
      const res = await axios.post("/api/auth/forgot-password", data);
      setSuccess(res.data.message);
      if (res.data.devResetUrl) setDevUrl(res.data.devResetUrl);
    } catch (err: any) {
      setError(err.response?.data?.error || "Something went wrong.");
    }
  };

  const sendCode = async () => {
    setError("");
    setSuccess("");
    if (!/^(\+?91[\s-]?|0)?[6-9]\d{4}[\s-]?\d{5}$/.test(phone.trim())) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setBusy(true);
    try {
      const res = await axios.post("/api/auth/forgot-password", { phone: phone.trim() });
      setSuccess(res.data.message);
      setCodeSent(true);
    } catch (err: any) {
      setError(err.response?.data?.error || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const resetWithCode = async () => {
    setError("");
    if (!/^\d{6}$/.test(otpCode)) return setError("Please enter the 6-digit code from the SMS.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (password !== confirm) return setError("Passwords don't match.");
    setBusy(true);
    try {
      await axios.post("/api/auth/reset-password", { phone: phone.trim(), otpCode, password });
      setDone(true);
      setSuccess("");
    } catch (err: any) {
      setError(err.response?.data?.error || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const switchMethod = (m: "email" | "phone") => {
    setMethod(m);
    setError("");
    setSuccess("");
    setCodeSent(false);
  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-serif font-bold text-ink text-2xl">
            Make My <span className="text-sage-dark">Memory</span>
          </Link>
          <h1 className="font-serif font-bold text-ink text-3xl mt-4 mb-2">Forgot Password?</h1>
          <p className="text-stone-500 text-sm">
            {method === "email"
              ? <>Enter your email and we&apos;ll send a reset link</>
              : <>Enter your mobile number and we&apos;ll send a code by SMS</>}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-soft border border-stone-100">
          {!done && !(method === "email" && success) && (
            <div className="flex rounded-xl bg-stone-100 p-1 mb-6">
              {(["email", "phone"] as const).map((m) => (
                <button key={m} type="button" onClick={() => switchMethod(m)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all
                    ${method === m ? "bg-white text-ink shadow-sm" : "text-stone-500 hover:text-ink"}`}>
                  {m === "email" ? "Email" : "Phone"}
                </button>
              ))}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm">
              {success}
              {devUrl && (
                <div className="mt-2">
                  <p className="font-semibold text-xs">Dev mode reset link:</p>
                  <Link href={devUrl} className="text-sage-dark underline break-all text-xs">
                    {devUrl}
                  </Link>
                </div>
              )}
            </div>
          )}

          {method === "email" && !success && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="input-label">Email Address</label>
                <input
                  type="email"
                  {...register("email", { required: "Email is required" })}
                  className="input"
                  placeholder="you@example.com"
                />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3.5">
                {isSubmitting ? "Sending..." : "Send Reset Link"}
                <Mail className="w-4 h-4" />
              </button>
            </form>
          )}

          {method === "phone" && done && (
            <div className="text-center space-y-4">
              <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
                Your password has been changed. You can sign in with your mobile number and new password.
              </div>
              <Link href="/login" className="btn-primary w-full py-3.5 inline-flex justify-center">
                Sign In
              </Link>
            </div>
          )}

          {method === "phone" && !done && (
            <div className="space-y-4">
              <div>
                <label className="input-label">Mobile Number</label>
                <input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={codeSent}
                  className="input disabled:opacity-60"
                  placeholder="98765 43210"
                />
                {codeSent && (
                  <button type="button" onClick={() => { setCodeSent(false); setSuccess(""); setOtpCode(""); }}
                    className="text-xs text-stone-500 underline mt-1">
                    Change number
                  </button>
                )}
              </div>

              {!codeSent ? (
                <button type="button" onClick={sendCode} disabled={busy} className="btn-primary w-full py-3.5">
                  {busy ? "Sending..." : "Send Code"}
                  <Smartphone className="w-4 h-4" />
                </button>
              ) : (
                <>
                  <div>
                    <label className="input-label">6-digit Code</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      className="input tracking-[0.4em] text-center"
                      placeholder="••••••"
                    />
                  </div>
                  <div>
                    <label className="input-label">New Password</label>
                    <input type="password" autoComplete="new-password" value={password}
                      onChange={(e) => setPassword(e.target.value)} className="input" placeholder="At least 6 characters" />
                  </div>
                  <div>
                    <label className="input-label">Confirm New Password</label>
                    <input type="password" autoComplete="new-password" value={confirm}
                      onChange={(e) => setConfirm(e.target.value)} className="input" />
                  </div>
                  <button type="button" onClick={resetWithCode} disabled={busy} className="btn-primary w-full py-3.5">
                    {busy ? "Saving..." : "Reset Password"}
                  </button>
                  <button type="button" onClick={sendCode} disabled={busy}
                    className="w-full text-sm text-stone-500 hover:text-ink">
                    Didn&apos;t get it? Send the code again
                  </button>
                </>
              )}
            </div>
          )}

          <div className="text-center mt-6">
            <Link
              href="/login"
              className="text-sm text-stone-500 hover:text-ink flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

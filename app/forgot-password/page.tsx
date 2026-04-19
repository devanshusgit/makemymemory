"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Mail, ArrowLeft } from "lucide-react";
import axios from "axios";

export default function ForgotPasswordPage() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [devUrl, setDevUrl] = useState("");

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

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-serif font-bold text-ink text-2xl">
            Make My <span className="text-sage-dark">Memory</span>
          </Link>
          <h1 className="font-serif font-bold text-ink text-3xl mt-4 mb-2">Forgot Password?</h1>
          <p className="text-stone-500 text-sm">Enter your email and we&apos;ll send a reset link</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-soft border border-stone-100">
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

          {!success && (
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

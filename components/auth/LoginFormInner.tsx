"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, LogIn } from "lucide-react";
import axios from "axios";

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setError("");
    try {
      await axios.post("/api/auth/login", data);
      setSuccess("Logged in successfully! Redirecting...");
      router.refresh();
      setTimeout(() => router.push(redirect), 1000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-serif font-bold text-ink text-2xl">
            Make My <span className="text-sage-dark">Memory</span>
          </Link>
          <h1 className="font-serif font-bold text-ink text-3xl mt-4 mb-2">Welcome Back</h1>
          <p className="text-stone-500 text-sm">Sign in to your account</p>
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
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="input-label">Email Address</label>
              <input
                type="email"
                {...register("email", { required: "Email is required" })}
                className="input"
                placeholder="you@example.com"
                autoComplete="email"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="input-label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password", { required: "Password is required" })}
                  className="input pr-10"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-ink"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div className="text-right">
              <Link href="/forgot-password" className="text-xs text-sage-dark hover:underline">
                Forgot password?
              </Link>
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3.5">
              {isSubmitting ? "Signing in..." : "Sign In"}
              <LogIn className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-sm text-stone-500 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-sage-dark font-semibold hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

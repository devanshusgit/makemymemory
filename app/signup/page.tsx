"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import axios from "axios";

interface SignupForm {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<SignupForm>();

  const onSubmit = async (data: SignupForm) => {
    setError("");
    try {
      await axios.post("/api/auth/signup", {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
      });
      setSuccess("Account created! Redirecting to login...");
      setTimeout(() => router.push("/login"), 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || "Signup failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-serif font-bold text-ink text-2xl">
            Make My <span className="text-sage-dark">Memory</span>
          </Link>
          <h1 className="font-serif font-bold text-ink text-3xl mt-4 mb-2">Join Us Today</h1>
          <p className="text-stone-500 text-sm">🎉 Get ₹200 off on your first order!</p>
          <p className="text-stone-500 text-sm mt-2">Join thousands of families preserving their precious moments. Sign up and get ₹200 off instantly.</p>
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
              <label className="input-label">Full Name</label>
              <input
                {...register("name", { required: "Name is required" })}
                className="input"
                placeholder="Priya Sharma"
                autoComplete="name"
              />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>

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
              <label className="input-label">Phone Number</label>
              <input
                type="tel"
                {...register("phone", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^[6-9]\d{9}$/,
                    message: "Phone must be 10 digits starting with 6-9"
                  }
                })}
                className="input"
                placeholder="9876543210"
                autoComplete="tel"
              />
              {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="input-label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "Password must be at least 6 characters" },
                  })}
                  className="input pr-10"
                  placeholder="••••••••"
                  autoComplete="new-password"
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

            <div>
              <label className="input-label">Confirm Password</label>
              <input
                type="password"
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (val) => val === watch("password") || "Passwords do not match",
                })}
                className="input"
                placeholder="••••••••"
                autoComplete="new-password"
              />
              {errors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3.5">
              {isSubmitting ? "Creating account..." : "Sign Up"}
              <UserPlus className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-sm text-stone-500 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-sage-dark font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, LogIn, UserPlus } from "lucide-react";
import axios from "axios";

interface LoginForm {
  email: string;
  password: string;
}

interface SignupForm {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export default function AuthClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [mode, setMode] = useState<"signin" | "signup">(
    searchParams.get("mode") === "signup" ? "signup" : "signin"
  );

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ── Sign In ──────────────────────────────────────────────────────────────
  const loginForm = useForm<LoginForm>();

  const onLogin = async (data: LoginForm) => {
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

  // ── Sign Up ──────────────────────────────────────────────────────────────
  const signupForm = useForm<SignupForm>();

  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [savedFormData, setSavedFormData] = useState<SignupForm | null>(null);
  const [otpError, setOtpError] = useState("");

  const onSignup = async (data: SignupForm) => {
    setError("");
    setOtpError("");
    setOtpLoading(true);
    try {
      await axios.post("/api/auth/otp/request", {
        email: data.email,
        type: "email_verification",
        method: "email",
      });
      setSavedFormData(data);
      setShowOtpScreen(true);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to send verification code. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyAndSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!savedFormData) return;
    if (otpCode.length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP code.");
      return;
    }
    setOtpError("");
    setOtpLoading(true);
    try {
      await axios.post("/api/auth/signup", {
        name: savedFormData.name,
        email: savedFormData.email,
        phone: savedFormData.phone,
        password: savedFormData.password,
        otpCode,
      });
      setSuccess("Account created successfully! Redirecting to sign in...");
      setShowOtpScreen(false);
      setTimeout(() => {
        setSuccess("");
        setMode("signin");
      }, 1500);
    } catch (err: any) {
      setOtpError(err.response?.data?.error || "Verification failed. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!savedFormData) return;
    setOtpError("");
    setOtpLoading(true);
    try {
      await axios.post("/api/auth/otp/resend", {
        email: savedFormData.email,
        type: "email_verification",
        method: "email",
      });
      setSuccess("Verification code sent again!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setOtpError(err.response?.data?.error || "Failed to resend code. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const switchMode = (next: "signin" | "signup") => {
    setMode(next);
    setError("");
    setSuccess("");
    setShowOtpScreen(false);
    setOtpError("");
  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-serif font-bold text-ink text-2xl">
            Make My <span className="text-sage-dark">Memory</span>
          </Link>
          <h1 className="font-serif font-bold text-ink text-3xl mt-4 mb-2">
            {mode === "signin" ? "Welcome Back" : "Join Us Today"}
          </h1>
          <p className="text-stone-500 text-sm">
            {mode === "signin" ? "Sign in to your account" : "🎉 Get ₹200 off on your first order!"}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-soft border border-stone-100">
          {/* Tabs */}
          {!showOtpScreen && (
            <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-stone-100 mb-6">
              <button
                type="button"
                onClick={() => switchMode("signin")}
                className={`py-2.5 rounded-xl text-sm font-semibold transition-colors
                            ${mode === "signin" ? "bg-white text-ink shadow-sm" : "text-stone-500 hover:text-ink"}`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => switchMode("signup")}
                className={`py-2.5 rounded-xl text-sm font-semibold transition-colors
                            ${mode === "signup" ? "bg-white text-ink shadow-sm" : "text-stone-500 hover:text-ink"}`}
              >
                Sign Up
              </button>
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
            </div>
          )}

          {mode === "signin" ? (
            <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
              <div>
                <label className="input-label">
                  Email or Phone Number <span className="text-red-400 ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  {...loginForm.register("email", { required: "Email or Phone is required" })}
                  className="input"
                  placeholder="you@example.com or 9876543210"
                  autoComplete="username"
                />
                {loginForm.formState.errors.email && (
                  <p className="text-red-400 text-xs mt-1">{loginForm.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="input-label">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    {...loginForm.register("password", { required: "Password is required" })}
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
                {loginForm.formState.errors.password && (
                  <p className="text-red-400 text-xs mt-1">{loginForm.formState.errors.password.message}</p>
                )}
              </div>

              <div className="text-right">
                <Link href="/forgot-password" className="text-xs text-sage-dark hover:underline">
                  Forgot password?
                </Link>
              </div>

              <button type="submit" disabled={loginForm.formState.isSubmitting} className="btn-primary w-full py-3.5">
                {loginForm.formState.isSubmitting ? "Signing in..." : "Sign In"}
                <LogIn className="w-4 h-4" />
              </button>
            </form>
          ) : showOtpScreen ? (
            <form onSubmit={handleVerifyAndSignup} className="space-y-6">
              <div>
                <h2 className="font-serif font-bold text-xl text-ink mb-1">Verify Your Email</h2>
                <p className="text-stone-500 text-xs leading-relaxed mb-4">
                  We've sent a 6-digit OTP code to <strong className="text-ink">{savedFormData?.email}</strong>. Please enter it below.
                </p>
                {otpError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs">
                    {otpError}
                  </div>
                )}
                <label className="input-label">Verification Code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="input text-center text-2xl tracking-[0.5em] font-mono py-3"
                  required
                />
              </div>

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={otpLoading}
                  className="btn-primary w-full py-3.5 flex items-center justify-center gap-2"
                >
                  {otpLoading ? "Verifying..." : "Verify & Sign Up"}
                </button>

                <div className="flex justify-between items-center text-xs px-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowOtpScreen(false);
                      setOtpCode("");
                      setOtpError("");
                    }}
                    className="text-stone-500 hover:text-ink hover:underline font-medium"
                  >
                    ← Edit Details
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={otpLoading}
                    className="text-sage-dark hover:underline font-semibold disabled:opacity-50"
                  >
                    Resend Code
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-4">
              <div>
                <label className="input-label">Full Name</label>
                <input
                  {...signupForm.register("name", { required: "Name is required" })}
                  className="input"
                  placeholder="Priya Sharma"
                  autoComplete="name"
                />
                {signupForm.formState.errors.name && (
                  <p className="text-red-400 text-xs mt-1">{signupForm.formState.errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="input-label">
                  Email Address <span className="text-red-400 ml-0.5">*</span>
                </label>
                <input
                  type="email"
                  {...signupForm.register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^\S+@\S+\.\S+$/,
                      message: "Enter a valid email address",
                    },
                  })}
                  className="input"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
                {signupForm.formState.errors.email && (
                  <p className="text-red-400 text-xs mt-1">{signupForm.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="input-label">
                  Phone Number <span className="text-red-400 ml-0.5">*</span>
                </label>
                <input
                  type="tel"
                  {...signupForm.register("phone", {
                    required: "Phone number is required",
                    pattern: {
                      value: /^[6-9]\d{9}$/,
                      message: "Phone must be 10 digits starting with 6-9",
                    },
                  })}
                  className="input"
                  placeholder="9876543210"
                  autoComplete="tel"
                />
                {signupForm.formState.errors.phone && (
                  <p className="text-red-400 text-xs mt-1">{signupForm.formState.errors.phone.message}</p>
                )}
              </div>

              <div>
                <label className="input-label">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    {...signupForm.register("password", {
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
                {signupForm.formState.errors.password && (
                  <p className="text-red-400 text-xs mt-1">{signupForm.formState.errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="input-label">Confirm Password</label>
                <input
                  type="password"
                  {...signupForm.register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (val) => val === signupForm.watch("password") || "Passwords do not match",
                  })}
                  className="input"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                {signupForm.formState.errors.confirmPassword && (
                  <p className="text-red-400 text-xs mt-1">{signupForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <button type="submit" disabled={otpLoading} className="btn-primary w-full py-3.5 flex items-center justify-center gap-2">
                {otpLoading ? "Sending OTP..." : "Sign Up"}
                <UserPlus className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

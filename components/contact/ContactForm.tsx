"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import axios from "axios";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const SUBJECTS = [
  "General Enquiry",
  "Custom / Bulk Order",
  "Order Issue",
  "Delivery & Tracking",
  "Returns & Refunds",
  "Other",
];

const ease = [0.4, 0, 0.2, 1] as const;

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="input-label">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-red-400 text-xs mt-1.5">{error}</p>
      )}
    </div>
  );
}

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>();

  const onSubmit = async (data: ContactFormData) => {
    await axios.post("/api/contact", data);
    setSubmitted(true);
    reset();
  };

  return (
    <AnimatePresence mode="wait">
      {/* ── Success state ── */}
      {submitted ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease }}
          className="flex flex-col items-center justify-center text-center py-10 gap-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="w-14 h-14 bg-sage/15 rounded-full flex items-center justify-center"
          >
            <CheckCircle2 className="w-7 h-7 text-sage-dark" strokeWidth={1.5} />
          </motion.div>
          <div>
            <h3 className="font-semibold text-ink text-lg mb-1">Message Sent!</h3>
            <p className="text-stone-500 text-sm">
              We&apos;ll get back to you within 24 hours.
            </p>
          </div>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-2 text-xs font-semibold text-stone-400 hover:text-ink
                       transition-colors underline underline-offset-2"
          >
            Send another message
          </button>
        </motion.div>
      ) : (
        /* ── Form ── */
        <motion.form
          key="form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease }}
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
          noValidate
        >
          {/* Name + Email */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Name" required error={errors.name?.message}>
              <input
                {...register("name", { required: "Name is required" })}
                className="input"
                placeholder="Priya Sharma"
                autoComplete="name"
              />
            </Field>
            <Field label="Email" required error={errors.email?.message}>
              <input
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: "Enter a valid email address",
                  },
                })}
                className="input"
                placeholder="priya@example.com"
                autoComplete="email"
              />
            </Field>
          </div>

          {/* Subject */}
          <Field label="Subject" required error={errors.subject?.message}>
            <select
              {...register("subject", { required: "Please select a subject" })}
              className="input appearance-none"
            >
              <option value="">What is this about?</option>
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>

          {/* Message */}
          <Field label="Message" required error={errors.message?.message}>
            <textarea
              {...register("message", {
                required: "Message is required",
                minLength: {
                  value: 10,
                  message: "Please write at least 10 characters",
                },
              })}
              className="input resize-none"
              rows={5}
              placeholder="Tell us about your order, custom request, or question…"
            />
          </Field>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full py-4 text-sm"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10"
                    stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Sending…
              </span>
            ) : (
              "Send Message"
            )}
          </button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}

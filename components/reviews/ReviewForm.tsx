"use client";

import { useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, ImageIcon, Video, CheckCircle2 } from "lucide-react";

interface FormData {
  name: string;
  email: string;
  title: string;
  content: string;
  product: string;
}

const PRODUCTS = [
  "Custom Photo Book",
  "Personalised Mug",
  "Custom Photo Frame",
  "Memory Cushion",
  "Photo Calendar 2025",
  "Memory Gift Set",
  "Canvas Print",
  "Personalised Keychain",
];

const ease = [0.4, 0, 0.2, 1] as const;

/* ── Interactive star picker ── */
function StarPicker({
  value,
  onChange,
  error,
}: {
  value: number;
  onChange: (v: number) => void;
  error?: boolean;
}) {
  const [hovered, setHovered] = useState(0);
  const labels = ["Terrible", "Poor", "Okay", "Good", "Excellent"];

  return (
    <div>
      <label className="input-label">Your Rating *</label>
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            aria-label={`Rate ${star} star${star !== 1 ? "s" : ""}`}
            className="text-3xl transition-all duration-100 hover:scale-110 active:scale-95"
          >
            <span
              className={
                star <= (hovered || value) ? "text-sage" : "text-stone-200"
              }
            >
              ★
            </span>
          </button>
        ))}
        {(hovered || value) > 0 && (
          <span className="ml-2 text-xs font-semibold text-stone-500">
            {labels[(hovered || value) - 1]}
          </span>
        )}
      </div>
      {error && (
        <p className="text-red-400 text-xs mt-1.5">Please select a rating</p>
      )}
    </div>
  );
}

/* ── Media upload area ── */
interface MediaFile {
  file: File;
  preview: string;
  type: "image" | "video";
}

function MediaUpload({
  files,
  onChange,
}: {
  files: MediaFile[];
  onChange: (files: MediaFile[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const processFiles = useCallback(
    (incoming: FileList | null) => {
      if (!incoming) return;
      const newFiles: MediaFile[] = [];
      Array.from(incoming).forEach((file) => {
        if (files.length + newFiles.length >= 3) return; // max 3
        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");
        if (!isImage && !isVideo) return;
        newFiles.push({
          file,
          preview: URL.createObjectURL(file),
          type: isImage ? "image" : "video",
        });
      });
      onChange([...files, ...newFiles]);
    },
    [files, onChange]
  );

  const remove = (index: number) => {
    const updated = files.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div>
      <label className="input-label">
        Photos / Videos{" "}
        <span className="normal-case font-normal text-stone-400">(optional, max 3)</span>
      </label>

      <div className="flex flex-wrap gap-3">
        {/* Previews */}
        {files.map((f, i) => (
          <div
            key={i}
            className="relative w-20 h-20 rounded-2xl overflow-hidden bg-stone-100 shrink-0"
          >
            {f.type === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={f.preview}
                alt={`Upload ${i + 1}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-stone-200">
                <Video className="w-6 h-6 text-stone-400" />
              </div>
            )}
            <button
              type="button"
              onClick={() => remove(i)}
              aria-label="Remove file"
              className="absolute top-1 right-1 w-5 h-5 bg-ink/70 rounded-full
                         flex items-center justify-center text-white
                         hover:bg-ink transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {/* Drop zone — only show if under limit */}
        {files.length < 3 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              processFiles(e.dataTransfer.files);
            }}
            className={`w-20 h-20 rounded-2xl border-2 border-dashed flex flex-col
                         items-center justify-center gap-1 transition-all duration-200
                         ${dragging
                           ? "border-sage bg-sage/10 scale-105"
                           : "border-stone-300 bg-stone-50 hover:border-sage hover:bg-sage/5"
                         }`}
          >
            <Upload className="w-4 h-4 text-stone-400" />
            <span className="text-[10px] text-stone-400 font-medium">Add</span>
          </button>
        )}
      </div>

      {/* Accepted types note */}
      <p className="mt-2 text-[11px] text-stone-400 flex items-center gap-1.5">
        <ImageIcon className="w-3 h-3" />
        JPG, PNG, HEIC, MP4, MOV — max 20 MB each
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="sr-only"
        onChange={(e) => processFiles(e.target.files)}
      />
    </div>
  );
}

/* ── Field wrapper ── */
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
      {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
    </div>
  );
}

/* ── Main form ── */
export default function ReviewForm() {
  const [rating, setRating]       = useState(0);
  const [ratingError, setRatingError] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    if (rating === 0) { setRatingError(true); return; }
    setRatingError(false);

    // TODO: POST to /api/reviews with FormData (attach mediaFiles)
    await new Promise((r) => setTimeout(r, 1200)); // simulate network
    console.log("Review submitted:", { ...data, rating, mediaFiles });

    setSubmitted(true);
    reset();
    setRating(0);
    setMediaFiles([]);
  };

  return (
    <section className="bg-canvas py-16 sm:py-24" id="write-review">
      <div className="section-wrap">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div className="text-center mb-10">
            <span className="label-tag mb-4 inline-flex">Share Your Experience</span>
            <h2 className="section-heading mb-3">Write a Review</h2>
            <p className="text-stone-500 text-sm">
              Your honest feedback helps others make better decisions — and helps us improve.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {submitted ? (
              /* ── Success state ── */
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease }}
                className="bg-white rounded-4xl p-10 sm:p-14 text-center shadow-soft
                           border border-stone-100"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                  className="w-16 h-16 bg-sage/15 rounded-full flex items-center justify-center mx-auto mb-5"
                >
                  <CheckCircle2 className="w-8 h-8 text-sage-dark" strokeWidth={1.5} />
                </motion.div>
                <h3 className="font-serif font-bold text-ink text-xl mb-2">
                  Thank you for your review!
                </h3>
                <p className="text-stone-500 text-sm mb-7">
                  Your review is being verified and will appear here shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="btn-outline px-8 py-3 text-sm"
                >
                  Write Another Review
                </button>
              </motion.div>
            ) : (
              /* ── Form ── */
              <motion.form
                key="form"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease }}
                onSubmit={handleSubmit(onSubmit)}
                className="bg-white rounded-4xl p-7 sm:p-10 shadow-soft border border-stone-100
                           space-y-6"
              >
                {/* Star rating */}
                <StarPicker
                  value={rating}
                  onChange={(v) => { setRating(v); setRatingError(false); }}
                  error={ratingError}
                />

                {/* Product */}
                <Field label="Product Reviewed" required error={errors.product?.message}>
                  <select
                    {...register("product", { required: "Please select a product" })}
                    className="input appearance-none"
                  >
                    <option value="">Select a product…</option>
                    {PRODUCTS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </Field>

                {/* Review title */}
                <Field label="Review Title" required error={errors.title?.message}>
                  <input
                    {...register("title", {
                      required: "Please add a title",
                      minLength: { value: 5, message: "Title must be at least 5 characters" },
                    })}
                    className="input"
                    placeholder="Summarise your experience in one line"
                  />
                </Field>

                {/* Review content */}
                <Field label="Your Review" required error={errors.content?.message}>
                  <textarea
                    {...register("content", {
                      required: "Please write your review",
                      minLength: { value: 20, message: "Review must be at least 20 characters" },
                    })}
                    className="input resize-none"
                    rows={5}
                    placeholder="Tell us what you loved, what could be better, and who you gifted it to…"
                  />
                </Field>

                {/* Media upload */}
                <MediaUpload files={mediaFiles} onChange={setMediaFiles} />

                {/* Divider */}
                <div className="divider" />

                {/* Name + email */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Your Name" required error={errors.name?.message}>
                    <input
                      {...register("name", { required: "Name is required" })}
                      className="input"
                      placeholder="Priya Sharma"
                    />
                  </Field>
                  <Field label="Email Address" required error={errors.email?.message}>
                    <input
                      type="email"
                      {...register("email", {
                        required: "Email is required",
                        pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" },
                      })}
                      className="input"
                      placeholder="priya@example.com"
                    />
                  </Field>
                </div>

                <p className="text-[11px] text-stone-400 -mt-2">
                  Your email won&apos;t be published. We may contact you to verify your purchase.
                </p>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full py-4 text-sm"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Submitting…
                    </span>
                  ) : (
                    "Submit Review"
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

        </div>
      </div>
    </section>
  );
}

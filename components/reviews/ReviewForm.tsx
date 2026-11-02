"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, ImageIcon, Video, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { MAX_UPLOAD_BYTES } from "@/lib/utils/apiErrorMessage";
import { prepareImageForUpload } from "@/lib/utils/cropImage";

// Mirrors MAX_FILES in app/api/reviews/upload/route.ts.
const MAX_REVIEW_FILES = 4;
const MAX_UPLOAD_MB = (MAX_UPLOAD_BYTES / (1024 * 1024)).toFixed(0);

/** Windows often reports no type for .heic, which would otherwise be dropped. */
function mediaKind(file: File): "image" | "video" | null {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  if (!file.type && /\.(heic|heif)$/i.test(file.name)) return "image";
  return null;
}

interface FormData {
  name: string;
  email?: string;
  title: string;
  content: string;
  product: string;
}

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
  const inputRef  = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [pickError, setPickError] = useState("");

  // Checked here, at pick time, so a customer finds out about a file that
  // cannot go through before they have written the whole review. Photos are
  // shrunk on submit and almost always fit; videos cannot be shrunk in the
  // browser, so an oversized one is refused straight away.
  const processFiles = useCallback(
    (incoming: FileList | null) => {
      if (!incoming) return;
      const newFiles: MediaFile[] = [];
      const problems: string[] = [];
      for (const file of Array.from(incoming)) {
        const kind = mediaKind(file);
        if (!kind) {
          problems.push(`${file.name} is not a photo or video.`);
          continue;
        }
        if (kind === "video" && file.size > MAX_UPLOAD_BYTES) {
          problems.push(`${file.name} is too long — videos can be up to ${MAX_UPLOAD_MB}MB.`);
          continue;
        }
        if (files.length + newFiles.length >= MAX_REVIEW_FILES) {
          problems.push(`You can add up to ${MAX_REVIEW_FILES} photos or videos.`);
          break;
        }
        newFiles.push({ file, preview: URL.createObjectURL(file), type: kind });
      }
      setPickError(problems.join(" "));
      if (newFiles.length) onChange([...files, ...newFiles]);
    },
    [files, onChange]
  );

  const remove = (index: number) => {
    const updated = files.filter((_, i) => i !== index);
    onChange(updated);
  };

  const scrollLeft  = () => scrollRef.current?.scrollBy({ left: -200, behavior: "smooth" });
  const scrollRight = () => scrollRef.current?.scrollBy({ left:  200, behavior: "smooth" });

  return (
    <div>
      <label className="input-label">
        Photos / Videos{" "}
        <span className="normal-case font-normal text-stone-400">(optional)</span>
      </label>

      {/* Scroll container with arrows */}
      <div className="relative">
        {files.length > 3 && (
          <button type="button" onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full
                       bg-white shadow-md flex items-center justify-center -ml-3
                       hover:bg-stone-50 transition-colors">
            <ChevronLeft className="w-4 h-4 text-stone-600" />
          </button>
        )}

        <div ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide scroll-smooth">
          {files.map((f, i) => (
            <div key={i}
              className="relative w-20 h-20 rounded-2xl overflow-hidden bg-stone-100 shrink-0">
              {f.type === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={f.preview} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-stone-200">
                  <Video className="w-6 h-6 text-stone-400" />
                </div>
              )}
              <button type="button" onClick={() => remove(i)} aria-label="Remove file"
                className="absolute top-1 right-1 w-5 h-5 bg-ink/70 rounded-full
                           flex items-center justify-center text-white hover:bg-ink transition-colors">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          {/* Add button — always visible */}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); processFiles(e.dataTransfer.files); }}
            className={`w-20 h-20 rounded-2xl border-2 border-dashed flex flex-col shrink-0
                        items-center justify-center gap-1 transition-all duration-200
                        ${dragging
                          ? "border-sage bg-sage/10 scale-105"
                          : "border-stone-300 bg-stone-50 hover:border-sage hover:bg-sage/5"
                        }`}
          >
            <Upload className="w-4 h-4 text-stone-400" />
            <span className="text-[10px] text-stone-400 font-medium">Add</span>
          </button>
        </div>

        {files.length > 3 && (
          <button type="button" onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full
                       bg-white shadow-md flex items-center justify-center -mr-3
                       hover:bg-stone-50 transition-colors">
            <ChevronRight className="w-4 h-4 text-stone-600" />
          </button>
        )}
      </div>

      {/* "max 20 MB each" used to be promised here. Nothing over ~3MB could
          ever get through Vercel's request limit. */}
      <p className="mt-2 text-[11px] text-stone-400 flex items-center gap-1.5">
        <ImageIcon className="w-3 h-3" />
        Up to {MAX_REVIEW_FILES} · photos are resized automatically · videos up to {MAX_UPLOAD_MB}MB
      </p>
      {pickError && <p className="mt-1 text-[11px] text-red-500">{pickError}</p>}

      <input ref={inputRef} type="file" accept="image/*,video/*" multiple
        className="sr-only" onChange={(e) => processFiles(e.target.files)} />
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
  const [rating, setRating] = useState(0);
  const [ratingError, setRatingError] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [products, setProducts] = useState<string[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<FormData>();

  // Auto-fill name + email from logged-in account
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.ok ? r.json() : { user: null })
      .then((d) => {
        if (d?.user?.name)  setValue("name",  d.user.name);
        if (d?.user?.email) setValue("email", d.user.email);
      })
      .catch(() => {});
  }, [setValue]);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products?limit=100");
        if (res.ok) {
          const data = await res.json();
          const productNames = (data.products || []).map((p: any) => p.name);
          setProducts(productNames);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  const onSubmit = async (data: FormData) => {
    if (rating === 0) { setRatingError(true); return; }
    setRatingError(false);

    try {
      // Photos go to Cloudinary first; the review stores the resulting URLs.
      // Until this existed the files were previewed and then silently dropped
      // on submit, so no review ever had a picture.
      // One file per request. Vercel rejects any request body over 4.5MB
      // before the route runs, so sending them all at once failed on two
      // ordinary phone photos — and threw away the written review with them.
      // Photos are shrunk first, the same way the admin uploader does it.
      const mediaUrls: string[] = [];
      for (const m of mediaFiles) {
        const file = m.type === "image" ? await prepareImageForUpload(m.file) : m.file;
        if (file.size > MAX_UPLOAD_BYTES) {
          throw new Error(`${m.file.name} is too large to upload. Please choose a smaller file.`);
        }
        // globalThis: this file declares its own `FormData` interface for the
        // react-hook-form values, which shadows the DOM one.
        const fd = new globalThis.FormData();
        fd.append("files", file);
        const up = await fetch("/api/reviews/upload", { method: "POST", body: fd });
        // A 413 from Vercel is an HTML page, not JSON, hence the fallback.
        const upJson = await up.json().catch(() => ({}));
        if (!up.ok) {
          throw new Error(
            upJson.error ??
              (up.status === 413
                ? `${m.file.name} is too large to upload.`
                : "Could not upload your photos. Please try again.")
          );
        }
        if (Array.isArray(upJson.urls)) mediaUrls.push(...upJson.urls);
      }

      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, rating, mediaUrls }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to submit");
      setSubmitted(true);
      reset();
      setRating(0);
      setMediaFiles([]);
    } catch (err: any) {
      alert(err.message ?? "Something went wrong. Please try again.");
    }
  };

  return (
    <section className="bg-canvas py-16 sm:py-24" id="write-review">
      <div className="section-wrap">
        <div className="max-w-2xl mx-auto">

          <div className="text-center mb-10">
            <span className="label-tag mb-4 inline-flex">Share Your Experience</span>
            <h2 className="section-heading mb-3">Write a Review</h2>
            <p className="text-stone-500 text-sm">
              Your honest feedback helps others make better decisions — and helps us improve.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {submitted ? (
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
                <StarPicker
                  value={rating}
                  onChange={(v) => { setRating(v); setRatingError(false); }}
                  error={ratingError}
                />

                <Field label="Product Reviewed" required error={errors.product?.message}>
                  <select
                    {...register("product", { required: "Please select a product" })}
                    className="input appearance-none"
                    disabled={loadingProducts}
                  >
                    <option value="">
                      {loadingProducts ? "Loading products..." : "Select a product…"}
                    </option>
                    {products.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </Field>

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

                <MediaUpload files={mediaFiles} onChange={setMediaFiles} />

                <div className="divider" />

                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Your Name" required error={errors.name?.message}>
                    <input
                      {...register("name", { required: "Name is required" })}
                      className="input"
                      placeholder="Your name"
                    />
                  </Field>
                  <Field label="Email Address (optional)" error={errors.email?.message}>
                    <input
                      type="email"
                      {...register("email", {
                        pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" },
                      })}
                      className="input"
                      placeholder="you@example.com"
                    />
                  </Field>
                </div>

                <p className="text-[11px] text-stone-400 -mt-2">
                  Email is optional. If you share it, it won&apos;t be published — we only use it to verify your purchase.
                </p>

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

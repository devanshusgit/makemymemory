import Image from "next/image";

/**
 * The four-step "How It Works" explainer.
 *
 * The steps are real HTML text, not just the poster image: the same audit that
 * pushed products into server-rendered HTML applies here — Google and the AI
 * crawlers cannot read words baked into a JPEG, and neither can a screen
 * reader or anyone who zooms in on a phone. The supplied poster is kept as the
 * illustration alongside it.
 */

export interface HowItWorksStep {
  title: string;
  body: string;
  accent: string;
}

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    title: "Order Your Kit",
    body: "Place your order, and we'll ship a mess-free, inkless wipe kit.",
    accent: "#1F3A5F",
  },
  {
    title: "Capture the Prints",
    body: "Use the kit to easily capture your baby's handprint or footprint onto the provided paper.",
    accent: "#2E7D4F",
  },
  {
    title: "Upload & Approve",
    body: "Scan the QR code on your kit to upload a photo of your prints along with your baby's details. Our design team touches up the prints and sends a draft for your approval.",
    accent: "#C15A1E",
  },
  {
    title: "Foil & Frame",
    body: "Once you approve the design, we transform your prints into stunning gold foil artwork, frame it carefully, and ship the finished piece right to you.",
    accent: "#C9A84C",
  },
];

export const HOW_IT_WORKS_POSTER = "/images/how-it-works.webp";

/**
 * @param compact  Tighter type and spacing, for the narrow product-page column.
 * @param showPoster  Render the poster image above the steps.
 */
export default function HowItWorks({
  compact = false,
  showPoster = true,
}: {
  compact?: boolean;
  showPoster?: boolean;
}) {
  return (
    <div className={compact ? "space-y-3" : "space-y-5"}>
      {showPoster && (
        <div className="relative rounded-2xl overflow-hidden bg-stone-100">
          <Image
            src={HOW_IT_WORKS_POSTER}
            alt="How it works: order your kit, capture the prints, upload and approve, then we foil and frame it."
            width={856}
            height={1024}
            sizes={compact ? "(min-width: 768px) 45vw, 100vw" : "(min-width: 768px) 50vw, 100vw"}
            className="w-full h-auto"
          />
        </div>
      )}

      <ol className={compact ? "space-y-2.5" : "space-y-4"}>
        {HOW_IT_WORKS_STEPS.map((step, i) => (
          <li
            key={step.title}
            className="flex gap-3 rounded-2xl bg-white/70 p-3"
            style={{ borderLeft: `3px solid ${step.accent}` }}
          >
            <span
              className={`shrink-0 rounded-full text-white font-bold flex items-center justify-center ${
                compact ? "w-6 h-6 text-[11px]" : "w-8 h-8 text-sm"
              }`}
              style={{ backgroundColor: step.accent }}
              aria-hidden="true"
            >
              {i + 1}
            </span>
            <div className="min-w-0">
              <h4
                className={`font-bold ${compact ? "text-[13px]" : "text-sm"}`}
                style={{ color: "#1A1A1A" }}
              >
                {step.title}
              </h4>
              <p
                className={`leading-relaxed ${compact ? "text-[12px] mt-0.5" : "text-sm mt-1"}`}
                style={{ color: "#6B6560" }}
              >
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

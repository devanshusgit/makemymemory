import { unstable_cache } from "next/cache";
import { connectDB } from "@/lib/db/connect";
import { ProductOption } from "@/lib/db/models/ProductOption";
import {
  type VariantOption,
  DEFAULT_FONTS, DEFAULT_FRAME_COLORS, DEFAULT_FINISHES,
} from "@/lib/data/defaultProductOptions";
import { buildMeta, resolveBaseUrl } from "@/lib/seo";
import { parseDesign } from "@/lib/preview/design";
import { PREVIEW_PUBLIC } from "@/lib/preview/visibility";
import FramePreviewClient, { type PreviewOption } from "@/components/preview/FramePreviewClient";

type SearchParams = Record<string, string | string[] | undefined>;

/**
 * The same option lists the product page offers, so a design made here can
 * actually be ordered. Cached for five minutes: this page is dynamic (it reads
 * the shared design from the URL) and would otherwise hit the database on
 * every link someone opens from a chat.
 */
const loadOptions = unstable_cache(
  async () => {
    const pick = (o: any): PreviewOption => ({ id: String(o.id), label: String(o.label), ...(o.image ? { image: String(o.image) } : {}) });
    try {
      await connectDB();
      const rows = await ProductOption.find({ group: { $in: ["font", "frame-color", "foil-finish"] } })
        .sort({ sortOrder: 1, createdAt: 1 })
        .lean();
      const of = (group: string, fallback: VariantOption[]) => {
        const list = (rows as any[]).filter((r) => r.group === group);
        return (list.length ? list : fallback).map(pick);
      };
      return {
        fonts: of("font", DEFAULT_FONTS),
        frames: of("frame-color", DEFAULT_FRAME_COLORS),
        foils: of("foil-finish", DEFAULT_FINISHES),
      };
    } catch {
      // A database outage should still leave a working preview.
      return { fonts: DEFAULT_FONTS.map(pick), frames: DEFAULT_FRAME_COLORS.map(pick), foils: DEFAULT_FINISHES.map(pick) };
    }
  },
  ["preview-options"],
  { revalidate: 300 },
);

const hasDesign = (sp: SearchParams) => ["n", "a", "d", "t", "w", "f", "c", "i"].some((k) => sp[k] !== undefined);

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }) {
  const raw = Array.isArray(searchParams.n) ? searchParams.n[0] : searchParams.n;
  const name = (raw ?? "").replace(/\s+/g, " ").trim().slice(0, 24);
  // These titles are what WhatsApp shows in the link preview, so a shared
  // design reads as the friend's frame rather than a generic page.
  // The root layout's title template appends "| Make My Memory" already.
  return buildMeta({
    title: name ? `${name}'s keepsake frame` : "Preview Your Frame",
    description: name
      ? `See ${name}'s gold foil hand & foot imprint frame — and design one for your little one.`
      : "Design your baby's gold foil hand & foot imprint frame: add a name, pick a font and frame colour, and share it with family.",
    path: "/preview",
    // Every shared design is its own URL; only the bare page belongs in search.
    noIndex: !PREVIEW_PUBLIC || hasDesign(searchParams),
  });
}

export default async function PreviewPage({ searchParams }: { searchParams: SearchParams }) {
  const options = await loadOptions();
  const design = parseDesign(searchParams, {
    fonts: options.fonts.map((o) => o.id),
    frames: options.frames.map((o) => o.id),
    foils: options.foils.map((o) => o.id),
  });

  return (
    <main className="bg-canvas min-h-screen">
      <section className="section-wrap py-12 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <header className="mb-10 text-center">
            <span className="label-tag mb-4 inline-flex">Preview Your Frame</span>
            <h1 className="section-heading mb-3">See how your keepsake will look</h1>
            <p className="mx-auto max-w-xl text-sm text-stone-500">
              Add your baby&apos;s name and details, pick a font and frame, and send it to family on WhatsApp.
            </p>
          </header>
          <FramePreviewClient
            initial={design}
            fonts={options.fonts}
            frames={options.frames}
            foils={options.foils}
            shared={searchParams.s === "1"}
            baseUrl={resolveBaseUrl()}
          />
        </div>
      </section>
    </main>
  );
}

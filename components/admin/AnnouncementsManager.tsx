"use client";

import { useEffect, useState } from "react";
import { Megaphone, Plus, Trash2, ArrowUp, ArrowDown, Check } from "lucide-react";
import axios from "axios";
import { MAX_ANNOUNCEMENTS, MAX_ANNOUNCEMENT_LENGTH } from "@/lib/settings/announcements";

/** Edits the scrolling offer strip shown under the site header. */
export default function AnnouncementsManager() {
  const [items, setItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    axios.get("/api/admin/settings/announcements")
      .then((r) => setItems(r.data.announcements || []))
      .catch(() => setStatus({ ok: false, text: "Failed to load messages" }))
      .finally(() => setLoading(false));
  }, []);

  const update = (i: number, v: string) => setItems((l) => l.map((m, n) => (n === i ? v : m)));
  const move = (i: number, d: -1 | 1) => setItems((l) => {
    const j = i + d;
    if (j < 0 || j >= l.length) return l;
    const next = [...l];
    [next[i], next[j]] = [next[j], next[i]];
    return next;
  });

  const save = async () => {
    setSaving(true);
    setStatus(null);
    try {
      const r = await axios.put("/api/admin/settings/announcements", { announcements: items });
      setItems(r.data.announcements);
      setStatus({ ok: true, text: "Saved. The website shows the new text within a minute." });
    } catch (err: any) {
      setStatus({ ok: false, text: err.response?.data?.error || "Failed to save" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-stone-100 space-y-5">
      <div className="flex items-center gap-3">
        <Megaphone className="w-6 h-6 text-ink" />
        <h2 className="text-lg font-bold text-ink">Top Bar Offers</h2>
      </div>
      <p className="text-sm text-stone-500">
        The messages that scroll in the dark strip under the header, in this order.
        Up to {MAX_ANNOUNCEMENTS} messages.
      </p>

      {/* Preview */}
      <div className="rounded-xl px-4 py-2.5 overflow-hidden whitespace-nowrap text-[13px] font-semibold tracking-[0.12em]"
        style={{ backgroundColor: "#1A1A1A", color: "#E8D5A3" }}>
        {items.filter((m) => m.trim()).map((m, i) => (
          <span key={i}>{m}<span className="mx-4" style={{ color: "#C9A84C" }}>✦</span></span>
        ))}
      </div>

      {status && (
        <div className={`p-3 rounded-xl text-sm ${status.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
          {status.text}
        </div>
      )}

      {loading ? (
        <div className="h-24 bg-stone-100 rounded-xl animate-pulse" />
      ) : (
        <div className="space-y-2">
          {items.map((m, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={m}
                maxLength={MAX_ANNOUNCEMENT_LENGTH}
                onChange={(e) => update(i, e.target.value)}
                className="flex-1 min-w-0 bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm
                           focus:outline-none focus:border-[#C9A84C]"
                placeholder="e.g. Extra 5% off on prepaid"
              />
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up"
                className="w-8 h-8 rounded-lg border border-stone-200 flex items-center justify-center disabled:opacity-30">
                <ArrowUp className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Move down"
                className="w-8 h-8 rounded-lg border border-stone-200 flex items-center justify-center disabled:opacity-30">
                <ArrowDown className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => setItems((l) => l.filter((_, n) => n !== i))} aria-label="Delete"
                className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 text-red-600 flex items-center justify-center">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {items.length < MAX_ANNOUNCEMENTS && (
            <button type="button" onClick={() => setItems((l) => [...l, ""])}
              className="flex items-center gap-2 text-sm font-semibold text-[#A07C2E] hover:underline pt-1">
              <Plus className="w-4 h-4" /> Add message
            </button>
          )}
        </div>
      )}

      <button
        onClick={save}
        disabled={saving || loading || !items.some((m) => m.trim())}
        className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-[#1A1A1A]
                   hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {saving ? "Saving..." : <><Check className="w-4 h-4" /> Save Top Bar</>}
      </button>
    </div>
  );
}

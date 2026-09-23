"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Pencil, Trash2, X, Check, Palette, GripVertical, ImagePlus, Loader2 } from "lucide-react";
import axios from "axios";
import { getApiErrorMessage, MAX_UPLOAD_BYTES } from "@/lib/utils/apiErrorMessage";
import { DEFAULT_OPTIONS_BY_GROUP } from "@/lib/data/defaultProductOptions";

interface ProductOption {
  _id: string;
  id: string;
  label: string;
  price: number;
  meta?: string;
  image?: string;
}

interface MetaField {
  label: string;
  type: "color" | "text";
  placeholder?: string;
}

interface Props {
  group: string;
  title: string;
  metaField?: MetaField;
}

const EMPTY_FORM = { id: "", label: "", price: 0, meta: "", image: "" };

export default function ProductOptionsManager({ group, title, metaField }: Props) {
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<ProductOption | null>(null);
  const [formData, setFormData] = useState({
    ...EMPTY_FORM,
    meta: metaField?.type === "color" ? "#C9A84C" : "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // True while the list below is the hardcoded fallback rather than real rows.
  // The storefront, the admin picker and the server-side re-pricing all treat
  // a group with ANY row as the complete set, so writing a single row into a
  // group that is still on defaults would delete every other option from every
  // product — and break the carts that already carry their surcharge.
  const isFallback = useRef(false);

  // Identifies the modal session an upload belongs to. An upload that resolves
  // after its modal was closed (or after a different option was opened) must
  // not drop its URL into whatever form happens to be on screen.
  const uploadSession = useRef(0);

  const defaults = DEFAULT_OPTIONS_BY_GROUP[group] ?? [];

  const fetchOptions = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/admin/product-options", { params: { group } });
      const rows: ProductOption[] = res.data.options || [];
      isFallback.current = rows.length === 0;
      // Show the defaults the storefront is actually using, instead of an
      // empty state that hides them and invites a one-row group.
      setOptions(rows.length ? rows : (defaults as ProductOption[]));
    } catch {
      setError("Failed to load options");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Materialise the fallback list as real rows before the first write to this
   * group. Returns the group's rows as the server now has them.
   */
  const ensureSeeded = async (): Promise<ProductOption[]> => {
    if (!isFallback.current) return options;
    for (const def of defaults) {
      await axios.post("/api/admin/product-options", { group, ...def }).catch(() => {});
    }
    const res = await axios.get("/api/admin/product-options", { params: { group } });
    const rows: ProductOption[] = res.data.options || [];
    isFallback.current = rows.length === 0;
    setOptions(rows);
    return rows;
  };

  useEffect(() => {
    fetchOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group]);

  // Every group can carry a photo of the option — a foil swatch, a paper
  // sample, a font specimen, a layout example. One file per request keeps the
  // body well under Vercel's 4.5MB serverless limit.
  const handleImageUpload = async (file: File) => {
    if (!file) return;
    if (file.size > MAX_UPLOAD_BYTES) {
      setError(`${file.name} is too large. Max ~${(MAX_UPLOAD_BYTES / (1024 * 1024)).toFixed(1)}MB — please compress it first.`);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }

    const session = uploadSession.current;
    setUploading(true);
    setError("");
    try {
      const body = new FormData();
      body.append("files", file);
      const res = await axios.post("/api/upload", body);
      const url = res.data?.files?.[0]?.url;
      if (!url) throw new Error("Upload did not return an image URL.");
      if (uploadSession.current !== session) return; // modal moved on — drop it
      setFormData((prev) => ({ ...prev, image: url }));
    } catch (err) {
      if (uploadSession.current === session) setError(getApiErrorMessage(err, "Failed to upload image."));
    } finally {
      if (uploadSession.current === session) setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAdd = async () => {
    if (!formData.id || !formData.label) {
      setError("ID and Label are required");
      return;
    }

    if (!/^[a-z0-9-]+$/.test(formData.id)) {
      setError("ID must be lowercase letters, numbers, and hyphens only");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await ensureSeeded();
      await axios.post("/api/admin/product-options", {
        group,
        id: formData.id,
        label: formData.label,
        price: formData.price,
        meta: metaField ? formData.meta : undefined,
        image: formData.image || undefined,
      });
      setFormData({ ...EMPTY_FORM, meta: metaField?.type === "color" ? "#C9A84C" : "" });
      setShowAdd(false);
      fetchOptions();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create option");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!editing) return;
    if (!formData.label) {
      setError("Label is required");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await axios.patch(`/api/admin/product-options/${editing._id}`, {
        label: formData.label,
        price: formData.price,
        meta: metaField ? formData.meta : undefined,
        // "" (not undefined) so removing the photo actually clears the field —
        // Mongoose drops undefined keys from $set, which would keep the old one.
        image: formData.image || "",
      });
      setEditing(null);
      setFormData({ ...EMPTY_FORM, meta: metaField?.type === "color" ? "#C9A84C" : "" });
      fetchOptions();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update option");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (opt: ProductOption) => {
    if (!confirm(`Delete "${opt.label}"? This cannot be undone.`)) return;
    try {
      // Same reason as openEdit: a fallback row has no _id to delete, and the
      // rest of the group has to exist as real rows before one is removed.
      let target = opt;
      if (isFallback.current) {
        const rows = await ensureSeeded();
        const real = rows.find((r) => r.id === opt.id);
        if (!real) throw new Error("not seeded");
        target = real;
      }
      await axios.delete(`/api/admin/product-options/${target._id}`);
      fetchOptions();
    } catch {
      alert("Failed to delete option");
    }
  };

  const openEdit = async (opt: ProductOption) => {
    uploadSession.current += 1;
    setUploading(false);
    setError("");

    // Rows shown from the fallback list have no _id to PATCH, so give the
    // whole group real rows first and then edit this option's real one.
    let target = opt;
    if (isFallback.current) {
      setSaving(true);
      try {
        const rows = await ensureSeeded();
        const real = rows.find((r) => r.id === opt.id);
        if (!real) throw new Error("Could not save the default options — reload and try again.");
        target = real;
      } catch (err) {
        setError(getApiErrorMessage(err, "Could not prepare this option for editing."));
        setSaving(false);
        return;
      }
      setSaving(false);
    }

    setEditing(target);
    setFormData({
      id: target.id,
      label: target.label,
      price: target.price,
      meta: target.meta || (metaField?.type === "color" ? "#C9A84C" : ""),
      image: target.image || "",
    });
  };

  const openAdd = () => {
    uploadSession.current += 1;
    setUploading(false);
    setFormData({ ...EMPTY_FORM, meta: metaField?.type === "color" ? "#C9A84C" : "" });
    setError("");
    setShowAdd(true);
  };

  const closeModal = () => {
    uploadSession.current += 1;
    setUploading(false);
    setShowAdd(false);
    setEditing(null);
    setFormData({ ...EMPTY_FORM, meta: metaField?.type === "color" ? "#C9A84C" : "" });
    setError("");
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-stone-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Palette className="w-6 h-6 text-ink" />
          <h2 className="text-lg font-bold text-ink">{title}</h2>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                     bg-[#C9A84C] text-[#1A1A1A] hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" /> Add Option
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 bg-stone-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : options.length === 0 ? (
        <div className="text-center py-10">
          <Palette className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-400 text-sm mb-4">No options yet</p>
          <button
            onClick={openAdd}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#C9A84C] text-[#1A1A1A]"
          >
            Add Your First Option
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {options.length > 0 && !options[0]._id && (
            <p className="text-xs text-stone-500 bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5">
              These are the built-in defaults. Adding, editing or deleting one saves
              the whole list first, so no option disappears from the shop.
            </p>
          )}
          {options.map((opt) => (
            <div
              key={opt._id || opt.id}
              className="flex items-center gap-4 p-4 bg-stone-50 rounded-xl border border-stone-100
                         hover:border-stone-200 transition-colors"
            >
              <GripVertical className="w-4 h-4 text-stone-400 shrink-0" />
              {opt.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={opt.image}
                  alt={opt.label}
                  className="w-10 h-10 rounded-lg object-cover border border-stone-200 shrink-0"
                />
              )}
              {metaField?.type === "color" && (
                <div
                  className="w-8 h-8 rounded-full border-2 border-stone-200 shrink-0"
                  style={{ backgroundColor: opt.meta || "#ccc" }}
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-ink" style={metaField?.type === "text" ? { fontFamily: opt.meta } : undefined}>
                    {opt.label}
                  </h3>
                  <code className="text-xs px-2 py-0.5 bg-stone-200 text-stone-600 rounded">
                    {opt.id}
                  </code>
                </div>
                <p className="text-sm text-stone-500">
                  {opt.price > 0 ? `+₹${opt.price}` : "No extra charge"}
                  {metaField?.type === "text" && opt.meta ? ` · ${opt.meta}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => openEdit(opt)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center
                             bg-white border border-stone-200 text-stone-600
                             hover:border-stone-300 transition-colors"
                  aria-label="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(opt)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center
                             bg-red-50 border border-red-200 text-red-600
                             hover:bg-red-100 transition-colors"
                  aria-label="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAdd || editing) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(26,26,26,0.6)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h2 className="font-serif font-bold text-lg text-[#2C2520]">
                {editing ? `Edit ${title} Option` : `Add ${title} Option`}
              </h2>
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-full flex items-center justify-center
                           hover:bg-stone-100 transition-colors"
              >
                <X className="w-4 h-4 text-stone-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">
                  Option ID *
                </label>
                <input
                  type="text"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value.toLowerCase() })}
                  disabled={!!editing}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm
                             focus:outline-none focus:border-[#C9A84C] disabled:opacity-50"
                  placeholder="e.g., rose-gold"
                />
                <p className="text-xs text-stone-400 mt-1">
                  Lowercase letters, numbers, and hyphens only. Cannot be changed after creation.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">
                  Label *
                </label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm
                             focus:outline-none focus:border-[#C9A84C]"
                  placeholder="e.g., Rose Gold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">
                  Extra Price (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm
                             focus:outline-none focus:border-[#C9A84C]"
                  placeholder="0"
                />
              </div>

              {metaField?.type === "color" && (
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">
                    {metaField.label}
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.meta || "#C9A84C"}
                      onChange={(e) => setFormData({ ...formData, meta: e.target.value })}
                      className="w-10 h-10 rounded-lg border border-stone-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.meta}
                      onChange={(e) => setFormData({ ...formData, meta: e.target.value })}
                      className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm
                                 focus:outline-none focus:border-[#C9A84C]"
                      placeholder={metaField.placeholder || "#C9A84C"}
                    />
                  </div>
                </div>
              )}

              {metaField?.type === "text" && (
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">
                    {metaField.label}
                  </label>
                  <input
                    type="text"
                    value={formData.meta}
                    onChange={(e) => setFormData({ ...formData, meta: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm
                               focus:outline-none focus:border-[#C9A84C]"
                    placeholder={metaField.placeholder}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">
                  Option Photo
                </label>
                <div className="flex items-center gap-3">
                  {formData.image ? (
                    <div className="relative shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={formData.image}
                        alt={formData.label || "Option preview"}
                        className="w-16 h-16 rounded-xl object-cover border border-stone-200"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: "" })}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 text-white
                                   flex items-center justify-center shadow hover:bg-red-700 transition-colors"
                        aria-label="Remove photo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl border border-dashed border-stone-300 bg-stone-50
                                    flex items-center justify-center shrink-0">
                      <ImagePlus className="w-5 h-5 text-stone-400" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="px-4 py-2 rounded-xl text-sm font-semibold bg-stone-100 text-ink
                                 border border-stone-200 hover:border-stone-300 transition-colors
                                 disabled:opacity-50 flex items-center gap-2"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Uploading…
                        </>
                      ) : (
                        <>
                          <ImagePlus className="w-4 h-4" /> {formData.image ? "Replace photo" : "Upload photo"}
                        </>
                      )}
                    </button>
                    <p className="text-xs text-stone-400 mt-1.5">
                      Optional. Shown to customers instead of the colour dot or plain label.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={editing ? handleEdit : handleAdd}
                disabled={saving || uploading}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white
                           bg-[#1A1A1A] hover:opacity-90 transition-opacity
                           disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  "Saving..."
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    {editing ? "Save Changes" : "Add Option"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, Check, Palette, GripVertical } from "lucide-react";
import axios from "axios";

interface ProductOption {
  _id: string;
  id: string;
  label: string;
  price: number;
  color?: string;
}

interface Props {
  group: string;
  title: string;
  hasColor?: boolean;
}

const EMPTY_FORM = { id: "", label: "", price: 0, color: "#C9A84C" };

export default function ProductOptionsManager({ group, title, hasColor }: Props) {
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<ProductOption | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchOptions = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/admin/product-options", { params: { group } });
      setOptions(res.data.options || []);
    } catch {
      setError("Failed to load options");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group]);

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
      await axios.post("/api/admin/product-options", {
        group,
        id: formData.id,
        label: formData.label,
        price: formData.price,
        color: hasColor ? formData.color : undefined,
      });
      setFormData(EMPTY_FORM);
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
        color: hasColor ? formData.color : undefined,
      });
      setEditing(null);
      setFormData(EMPTY_FORM);
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
      await axios.delete(`/api/admin/product-options/${opt._id}`);
      fetchOptions();
    } catch {
      alert("Failed to delete option");
    }
  };

  const openEdit = (opt: ProductOption) => {
    setEditing(opt);
    setFormData({ id: opt.id, label: opt.label, price: opt.price, color: opt.color || "#C9A84C" });
    setError("");
  };

  const closeModal = () => {
    setShowAdd(false);
    setEditing(null);
    setFormData(EMPTY_FORM);
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
          onClick={() => setShowAdd(true)}
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
            onClick={() => setShowAdd(true)}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#C9A84C] text-[#1A1A1A]"
          >
            Add Your First Option
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {options.map((opt) => (
            <div
              key={opt._id}
              className="flex items-center gap-4 p-4 bg-stone-50 rounded-xl border border-stone-100
                         hover:border-stone-200 transition-colors"
            >
              <GripVertical className="w-4 h-4 text-stone-400 shrink-0" />
              {hasColor && (
                <div
                  className="w-8 h-8 rounded-full border-2 border-stone-200 shrink-0"
                  style={{ backgroundColor: opt.color || "#ccc" }}
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-ink">{opt.label}</h3>
                  <code className="text-xs px-2 py-0.5 bg-stone-200 text-stone-600 rounded">
                    {opt.id}
                  </code>
                </div>
                <p className="text-sm text-stone-500">
                  {opt.price > 0 ? `+₹${opt.price}` : "No extra charge"}
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

              {hasColor && (
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">
                    Swatch Colour
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-10 h-10 rounded-lg border border-stone-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm
                                 focus:outline-none focus:border-[#C9A84C]"
                      placeholder="#C9A84C"
                    />
                  </div>
                </div>
              )}

              <button
                onClick={editing ? handleEdit : handleAdd}
                disabled={saving}
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

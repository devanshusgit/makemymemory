"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, Check, Tag, GripVertical } from "lucide-react";
import axios from "axios";

interface Category {
  _id: string;
  id: string;
  title: string;
  description: string;
  sortOrder: number;
}

export default function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ id: "", title: "", description: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/admin/categories");
      setCategories(res.data.categories || []);
    } catch {
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async () => {
    if (!formData.id || !formData.title) {
      setError("ID and Title are required");
      return;
    }

    // Validate ID format (lowercase, hyphens only)
    if (!/^[a-z0-9-]+$/.test(formData.id)) {
      setError("ID must be lowercase letters, numbers, and hyphens only");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await axios.post("/api/admin/categories", formData);
      setFormData({ id: "", title: "", description: "" });
      setShowAdd(false);
      fetchCategories();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create category");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!editing) return;
    if (!formData.title) {
      setError("Title is required");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await axios.patch(`/api/admin/categories/${editing.id}`, {
        title: formData.title,
        description: formData.description,
      });
      setEditing(null);
      setFormData({ id: "", title: "", description: "" });
      fetchCategories();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update category");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    if (!confirm(`Delete category "${cat.title}"? This cannot be undone.`)) return;
    try {
      await axios.delete(`/api/admin/categories/${cat.id}`);
      fetchCategories();
    } catch {
      alert("Failed to delete category");
    }
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setFormData({ id: cat.id, title: cat.title, description: cat.description });
    setError("");
  };

  const closeModal = () => {
    setShowAdd(false);
    setEditing(null);
    setFormData({ id: "", title: "", description: "" });
    setError("");
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-stone-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Tag className="w-6 h-6 text-ink" />
          <h2 className="text-lg font-bold text-ink">Product Categories</h2>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                     bg-[#C9A84C] text-[#1A1A1A] hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <p className="text-sm text-stone-500 mb-6">
        Manage product categories for your shop. Categories are used to organize products and gallery items.
      </p>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 bg-stone-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12">
          <Tag className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-400 text-sm mb-4">No categories yet</p>
          <button
            onClick={() => setShowAdd(true)}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#C9A84C] text-[#1A1A1A]"
          >
            Add Your First Category
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((cat) => (
            <div
              key={cat._id}
              className="flex items-center gap-4 p-4 bg-stone-50 rounded-xl border border-stone-100
                         hover:border-stone-200 transition-colors"
            >
              <GripVertical className="w-4 h-4 text-stone-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-ink">{cat.title}</h3>
                  <code className="text-xs px-2 py-0.5 bg-stone-200 text-stone-600 rounded">
                    {cat.id}
                  </code>
                </div>
                {cat.description && (
                  <p className="text-sm text-stone-500 line-clamp-1">{cat.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => openEdit(cat)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center
                             bg-white border border-stone-200 text-stone-600
                             hover:border-stone-300 transition-colors"
                  aria-label="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(cat)}
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
                {editing ? "Edit Category" : "Add Category"}
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
                  Category ID *
                </label>
                <input
                  type="text"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value.toLowerCase() })}
                  disabled={!!editing}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm
                             focus:outline-none focus:border-[#C9A84C] disabled:opacity-50"
                  placeholder="e.g., photo-frames"
                />
                <p className="text-xs text-stone-400 mt-1">
                  Lowercase letters, numbers, and hyphens only. Cannot be changed after creation.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">
                  Display Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm
                             focus:outline-none focus:border-[#C9A84C]"
                  placeholder="e.g., Photo Frames"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm
                             focus:outline-none focus:border-[#C9A84C] resize-none"
                  rows={3}
                  placeholder="Short description for the shop page"
                />
              </div>

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
                    {editing ? "Save Changes" : "Add Category"}
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

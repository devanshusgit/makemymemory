"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Save, X } from "lucide-react";
import axios from "axios";

interface Policy {
  _id: string;
  slug: string;
  title: string;
  content: string;
  effectiveDate: string;
  updatedAt: string;
}

const POLICY_TEMPLATES = [
  { slug: "privacy-policy", title: "Privacy Policy" },
  { slug: "terms-of-service", title: "Terms of Service" },
  { slug: "returns-policy", title: "Returns Policy" },
  { slug: "shipping-policy", title: "Shipping Policy" },
];

export default function AdminPoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Policy | null>(null);
  const [formData, setFormData] = useState({ title: "", content: "", effectiveDate: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/admin/policies");
      setPolicies(data.policies || []);
    } catch (err) {
      console.error("Failed to fetch policies:", err);
      setError("Failed to load policies");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (policy: Policy) => {
    setEditing(policy);
    setFormData({
      title: policy.title,
      content: policy.content,
      effectiveDate: policy.effectiveDate.split("T")[0],
    });
  };

  const handleSave = async () => {
    if (!editing || !formData.title || !formData.content || !formData.effectiveDate) {
      setError("All fields are required");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await axios.patch(`/api/admin/policies/${editing._id}`, {
        title: formData.title,
        content: formData.content,
        effectiveDate: new Date(formData.effectiveDate),
      });
      setEditing(null);
      fetchPolicies();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to save policy");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(null);
    setFormData({ title: "", content: "", effectiveDate: "" });
    setError("");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-bold text-[#2C2520]">Policies</h1>
        <p className="text-stone-500 text-sm mt-1">Manage privacy, terms, and shipping policies</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-white rounded-2xl border border-stone-100 animate-pulse" />
          ))}
        </div>
      ) : editing ? (
        /* Edit Form */
        <div className="bg-white rounded-2xl border border-stone-100 p-6 max-w-4xl">
          <h2 className="text-lg font-semibold text-ink mb-6">Edit Policy</h2>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wide mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm
                           focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40"
              />
            </div>

            {/* Effective Date */}
            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wide mb-2">
                Effective Date
              </label>
              <input
                type="date"
                value={formData.effectiveDate}
                onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm
                           focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wide mb-2">
                Content
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={12}
                className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm
                           focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold
                           text-white transition-colors hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: "#C9A84C" }}
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save Policy"}
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold
                           border border-stone-200 text-stone-600 transition-colors hover:bg-stone-50"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Policies List */
        <div className="space-y-4">
          {POLICY_TEMPLATES.map((template) => {
            const policy = policies.find((p) => p.slug === template.slug);
            return (
              <div
                key={template.slug}
                className="bg-white rounded-2xl border border-stone-100 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-ink text-base mb-1">{template.title}</h3>
                    {policy ? (
                      <>
                        <p className="text-xs text-stone-500 mb-2">
                          Effective: {new Date(policy.effectiveDate).toLocaleDateString("en-IN")}
                        </p>
                        <p className="text-sm text-stone-600 line-clamp-2">{policy.content}</p>
                      </>
                    ) : (
                      <p className="text-sm text-stone-400 italic">No policy set yet</p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      if (policy) {
                        handleEdit(policy);
                      } else {
                        setEditing({
                          _id: "",
                          slug: template.slug,
                          title: template.title,
                          content: "",
                          effectiveDate: new Date().toISOString(),
                          updatedAt: new Date().toISOString(),
                        });
                        setFormData({
                          title: template.title,
                          content: "",
                          effectiveDate: new Date().toISOString().split("T")[0],
                        });
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                               text-white transition-colors hover:opacity-90 shrink-0"
                    style={{ backgroundColor: "#C9A84C" }}
                  >
                    <Edit2 className="w-4 h-4" />
                    {policy ? "Edit" : "Create"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

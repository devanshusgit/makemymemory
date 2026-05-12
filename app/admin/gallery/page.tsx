"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Plus, Trash2, X, Check, Upload, Image as ImageIcon,
  Video, ArrowUp, ArrowDown, Pencil,
} from "lucide-react";
import axios from "axios";

interface GalleryItem {
  _id: string;
  url: string;
  type: "image" | "video";
  alt: string;
  tall: boolean;
  sortOrder: number;
}

const GRADIENTS = [
  "linear-gradient(135deg, #C9A84C22 0%, #E8D5A3 100%)",
  "linear-gradient(135deg, #1A1A1A 0%, #2d2520 100%)",
  "linear-gradient(135deg, #2d2520 0%, #C9A84C33 100%)",
  "linear-gradient(135deg, #1A1A1A 0%, #3d3228 100%)",
  "linear-gradient(135deg, #E8D5A3 0%, #C9A84C44 100%)",
];

export default function AdminGalleryPage() {
  const [items, setItems]       = useState<GalleryItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState<GalleryItem | null>(null);
  const [saving, setSaving]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError]       = useState("");

  // Form state
  const [file, setFile]         = useState<File | null>(null);
  const [preview, setPreview]   = useState("");
  const [fileType, setFileType] = useState<"image" | "video">("image");
  const [alt, setAlt]           = useState("");
  const [tall, setTall]         = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/admin/gallery");
      setItems(res.data.items || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { fetchItems(); }, []);

  const openAdd = () => {
    setEditing(null);
    setFile(null);
    setPreview("");
    setFileType("image");
    setAlt("");
    setTall(false);
    setError("");
    setShowForm(true);
  };

  const openEdit = (item: GalleryItem) => {
    setEditing(item);
    setFile(null);
    setPreview(item.url);
    setFileType(item.type);
    setAlt(item.alt);
    setTall(item.tall);
    setError("");
    setShowForm(true);
  };

  const handleFileChange = (f: File | null) => {
    if (!f) return;
    const isVideo = f.type.startsWith("video/");
    setFile(f);
    setFileType(isVideo ? "video" : "image");
    setPreview(URL.createObjectURL(f));
  };

  const handleSave = async () => {
    // Editing without a new file — just update metadata
    if (editing && !file) {
      setSaving(true);
      setError("");
      try {
        await axios.patch(`/api/admin/gallery/${editing._id}`, { alt, tall });
        setShowForm(false);
        fetchItems();
      } catch (e: any) {
        setError(e.response?.data?.error ?? "Failed to save.");
      } finally { setSaving(false); }
      return;
    }

    if (!file) { setError("Please select a photo or video."); return; }

    setSaving(true);
    setUploading(true);
    setError("");

    try {
      // Upload to Cloudinary via existing upload route
      const formData = new FormData();
      formData.append("files", file);
      const uploadRes = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const uploaded = uploadRes.data.files?.[0];
      if (!uploaded) throw new Error("Upload failed — no file returned.");

      setUploading(false);

      if (editing) {
        // Replace URL + update metadata
        await axios.patch(`/api/admin/gallery/${editing._id}`, {
          url: uploaded.url,
          type: uploaded.type,
          alt,
          tall,
        });
      } else {
        await axios.post("/api/admin/gallery", {
          url:  uploaded.url,
          type: uploaded.type,
          alt,
          tall,
        });
      }

      setShowForm(false);
      fetchItems();
    } catch (e: any) {
      setError(e.response?.data?.error ?? e.message ?? "Failed to save.");
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this item from the gallery?")) return;
    try {
      await axios.delete(`/api/admin/gallery/${id}`);
      fetchItems();
    } catch { alert("Failed to delete."); }
  };

  const moveItem = async (item: GalleryItem, direction: "up" | "down") => {
    const idx = items.findIndex((i) => i._id === item._id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= items.length) return;

    const other = items[swapIdx];
    try {
      await Promise.all([
        axios.patch(`/api/admin/gallery/${item._id}`,  { sortOrder: other.sortOrder }),
        axios.patch(`/api/admin/gallery/${other._id}`, { sortOrder: item.sortOrder }),
      ]);
      fetchItems();
    } catch { alert("Failed to reorder."); }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#2C2520]">Homepage Gallery</h1>
          <p className="text-stone-500 text-sm mt-1">
            {items.length} item{items.length !== 1 ? "s" : ""} · shown in the &ldquo;Moments Preserved with Love&rdquo; section
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                     text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#C9A84C" }}
        >
          <Plus className="w-4 h-4" /> Add Media
        </button>
      </div>

      {/* Info banner */}
      <div className="mb-6 rounded-2xl px-5 py-4 text-sm"
        style={{ backgroundColor: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)", color: "#7A5C1E" }}>
        <strong>Tip:</strong> Upload as many items as you want. Videos autoplay silently on the homepage.
        Use the arrows to reorder. Click any item to edit its caption or replace the file.
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl aspect-[3/4] animate-pulse border border-stone-100" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <ImageIcon className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-400 text-sm mb-4">No gallery items yet.</p>
          <button
            onClick={openAdd}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: "#C9A84C" }}
          >
            Add Your First Item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {items.map((item, idx) => (
            <div
              key={item._id}
              className="bg-white rounded-2xl border border-stone-100 overflow-hidden
                         hover:shadow-md transition-shadow duration-200 flex flex-col"
            >
              {/* Preview */}
              <div
                className="relative overflow-hidden"
                style={{
                  minHeight: item.tall ? "200px" : "150px",
                  background: GRADIENTS[idx % GRADIENTS.length],
                }}
              >
                {item.type === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.url}
                    alt={item.alt || "Gallery item"}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <video
                      src={item.url}
                      muted
                      loop
                      playsInline
                      autoPlay
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-black/60 rounded-full px-2 py-0.5
                                    flex items-center gap-1">
                      <Video className="w-3 h-3 text-white" />
                      <span className="text-[10px] text-white font-medium">Video</span>
                    </div>
                  </>
                )}
                {item.tall && (
                  <span className="absolute top-2 right-2 bg-[#C9A84C] text-[#1A1A1A] text-[10px]
                                   font-bold px-2 py-0.5 rounded-full">
                    Tall
                  </span>
                )}
              </div>

              {/* Info + actions */}
              <div className="p-3 flex-1 flex flex-col gap-2">
                <p className="text-xs text-stone-500 truncate">{item.alt || <em className="text-stone-300">No caption</em>}</p>
                <div className="flex items-center gap-1 mt-auto">
                  {/* Reorder */}
                  <button
                    onClick={() => moveItem(item, "up")}
                    disabled={idx === 0}
                    aria-label="Move up"
                    className="w-7 h-7 rounded-lg flex items-center justify-center
                               bg-stone-50 text-stone-400 hover:bg-stone-100 disabled:opacity-30
                               transition-colors"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => moveItem(item, "down")}
                    disabled={idx === items.length - 1}
                    aria-label="Move down"
                    className="w-7 h-7 rounded-lg flex items-center justify-center
                               bg-stone-50 text-stone-400 hover:bg-stone-100 disabled:opacity-30
                               transition-colors"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => openEdit(item)}
                    aria-label="Edit"
                    className="w-7 h-7 rounded-lg flex items-center justify-center
                               bg-stone-50 text-stone-500 hover:bg-stone-100 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    aria-label="Delete"
                    className="w-7 h-7 rounded-lg flex items-center justify-center
                               bg-red-50 text-red-500 hover:bg-red-100 transition-colors ml-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(26,26,26,0.6)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}
        >
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h2 className="font-serif font-bold text-lg text-[#2C2520]">
                {editing ? "Edit Gallery Item" : "Add Gallery Item"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center
                           hover:bg-stone-100 transition-colors"
              >
                <X className="w-4 h-4 text-stone-500" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {error && (
                <p className="text-red-500 text-xs bg-red-50 rounded-xl px-3 py-2">{error}</p>
              )}

              {/* File picker */}
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">
                  {editing ? "Replace file (optional)" : "Photo or Video *"}
                </label>

                {/* Preview */}
                {preview && (
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-stone-100 mb-3">
                    {fileType === "image" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <video src={preview} muted loop playsInline autoPlay className="w-full h-full object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={() => { setFile(null); setPreview(editing ? editing.url : ""); }}
                      className="absolute top-2 right-2 w-6 h-6 bg-black/70 rounded-full
                                 flex items-center justify-center text-white hover:bg-black"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Drop zone */}
                {!file && (
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="w-full h-28 rounded-xl border-2 border-dashed border-stone-300
                               flex flex-col items-center justify-center gap-2
                               hover:border-[#C9A84C] hover:bg-[#C9A84C]/5 transition-all"
                  >
                    <Upload className="w-6 h-6 text-stone-400" />
                    <span className="text-sm text-stone-400">Click to upload photo or video</span>
                    <span className="text-xs text-stone-300">MP4, MOV, JPG, PNG, WEBP</span>
                  </button>
                )}

                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                  className="hidden"
                />
              </div>

              {/* Caption / alt */}
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">
                  Caption <span className="normal-case font-normal text-stone-400">(optional)</span>
                </label>
                <input
                  value={alt}
                  onChange={(e) => setAlt(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm
                             focus:outline-none focus:ring-2 focus:border-[#C9A84C]"
                  placeholder="e.g. Gold foil handprint frame"
                />
              </div>

              {/* Tall toggle */}
              <div className="flex items-center justify-between py-1">
                <div>
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Tall card</p>
                  <p className="text-xs text-stone-400 mt-0.5">Makes this card taller in the collage</p>
                </div>
                <button
                  type="button"
                  onClick={() => setTall((v) => !v)}
                  className="relative w-11 h-6 rounded-full transition-colors duration-200"
                  style={{ backgroundColor: tall ? "#C9A84C" : "#D1D5DB" }}
                >
                  <span
                    className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow
                               transition-transform duration-200"
                    style={{ transform: tall ? "translateX(20px)" : "translateX(0)" }}
                  />
                </button>
              </div>

              {/* Save */}
              <button
                onClick={handleSave}
                disabled={saving || uploading}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white
                           disabled:opacity-50 flex items-center justify-center gap-2
                           transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#1A1A1A" }}
              >
                {uploading ? (
                  "Uploading…"
                ) : saving ? (
                  "Saving…"
                ) : (
                  <><Check className="w-4 h-4" /> {editing ? "Save Changes" : "Add to Gallery"}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

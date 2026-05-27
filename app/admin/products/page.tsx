"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Plus, Pencil, Trash2, X, Check, Package, Upload, Video, GripVertical } from "lucide-react";
import axios from "axios";
import Image from "next/image";
import ProductFileUploader from "@/components/admin/ProductFileUploader";

const BADGES     = ["", "Best Seller", "Popular", "New", "Best Value", "Coming Soon"];

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  badge?: string;
  inStock: boolean;
  images: string[];
  videos: string[];
  descriptionAttachments?: Array<{
    url: string;
    type: "image" | "video" | "pdf";
    name?: string;
  }>;
}

interface MediaFile {
  file: File;
  preview: string;
  type: "image" | "video";
}

interface DescriptionAttachment {
  file: File;
  preview: string;
  type: "image" | "video" | "pdf";
  name: string;
}

const EMPTY: Omit<Product, "_id" | "slug"> = {
  name: "", description: "", price: 0, originalPrice: undefined,
  category: "foil-imprints", badge: "", inStock: true, images: [], videos: [],
  descriptionAttachments: [],
};

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
        if (files.length + newFiles.length >= 5) return; // max 5
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
      <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">
        Photos / Videos{" "}
        <span className="normal-case font-normal text-stone-400">(optional, max 5)</span>
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
              className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded-full
                         flex items-center justify-center text-white
                         hover:bg-black transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {/* Drop zone — only show if under limit */}
        {files.length < 5 && (
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
                           ? "border-[#C9A84C] bg-[#C9A84C]/10 scale-105"
                           : "border-stone-300 bg-stone-50 hover:border-[#C9A84C] hover:bg-[#C9A84C]/5"
                         }`}
          >
            <Upload className="w-4 h-4 text-stone-400" />
            <span className="text-[10px] text-stone-400 font-medium">Add</span>
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={(e) => processFiles(e.target.files)}
          className="hidden"
        />
      </div>
    </div>
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState<Product | null>(null);
  const [form, setForm]         = useState({ ...EMPTY });
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [saving, setSaving]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError]       = useState("");

  // Drag & drop reorder
  const dragIndex = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const fetch_ = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        axios.get("/api/admin/products"),
        axios.get("/api/categories"),
      ]);
      setProducts(productsRes.data.products || []);
      setCategories(categoriesRes.data.categories?.map((c: any) => c.id) || ["foil-imprints", "3d-casting"]);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { fetch_(); }, []);

  // Drag & drop handlers
  const handleDragStart = (index: number) => { dragIndex.current = index; };
  const handleDragOver  = (e: React.DragEvent, index: number) => { e.preventDefault(); setDragOver(index); };
  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    setDragOver(null);
    const from = dragIndex.current;
    if (from === null || from === dropIndex) return;
    const reordered = [...products];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(dropIndex, 0, moved);
    setProducts(reordered);
    dragIndex.current = null;
    try {
      await axios.post("/api/admin/products/reorder", { ids: reordered.map((p) => p._id) });
    } catch { fetch_(); }
  };
  const handleDragEnd = () => { dragIndex.current = null; setDragOver(null); };

  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY });
    setMediaFiles([]);
    setError("");
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name, description: p.description, price: p.price,
      originalPrice: p.originalPrice, category: p.category,
      badge: p.badge || "", inStock: p.inStock, images: p.images || [], videos: p.videos || [],
      descriptionAttachments: p.descriptionAttachments || [],
    });
    setMediaFiles([]);
    setError("");
    setShowForm(true);
  };

  const uploadFiles = async (files: MediaFile[]) => {
    if (files.length === 0) return { images: [], videos: [] };

    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach(f => formData.append("files", f.file));

      const res = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      const uploadedFiles = res.data.files || [];
      const images = uploadedFiles.filter((f: any) => f.type === 'image').map((f: any) => f.url);
      const videos = uploadedFiles.filter((f: any) => f.type === 'video').map((f: any) => f.url);

      return { images, videos };
    } catch (error) {
      console.error("Upload failed:", error);
      throw new Error("Failed to upload files");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.description || !form.price || !form.category) {
      setError("Name, description, price and category are required.");
      return;
    }
    setSaving(true);
    setError("");
    
    try {
      let finalForm = { ...form };

      // Upload new media files if any
      if (mediaFiles.length > 0) {
        const { images, videos } = await uploadFiles(mediaFiles);
        finalForm.images = [...(form.images || []), ...images];
        finalForm.videos = [...(form.videos || []), ...videos];
      }

      // Upload description attachments if any
      // Note: ProductFileUploader handles URL attachments directly
      // We only need to upload files that are still in File form (new uploads)
      const newAttachments = form.descriptionAttachments?.filter(
        (att: any) => att instanceof File || att.file instanceof File
      ) || [];

      if (newAttachments.length > 0) {
        const formData = new FormData();
        newAttachments.forEach((att: any) => {
          const file = att instanceof File ? att : att.file;
          formData.append("files", file);
        });

        const res = await axios.post("/api/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        const uploadedAttachments = res.data.files.map((f: any, i: number) => ({
          url: f.url,
          type: newAttachments[i].type,
          name: newAttachments[i].name || newAttachments[i].file?.name,
        }));

        // Combine existing attachments with newly uploaded ones
        const existingAttachments = form.descriptionAttachments?.filter(
          (att: any) => !(att instanceof File || att.file instanceof File)
        ) || [];

        finalForm.descriptionAttachments = [
          ...existingAttachments,
          ...uploadedAttachments
        ];
      }

      if (editing) {
        await axios.patch(`/api/admin/products/${editing._id}`, finalForm);
      } else {
        await axios.post("/api/admin/products", finalForm);
      }
      setShowForm(false);
      fetch_();
    } catch (e: any) {
      setError(e.response?.data?.error ?? e.message ?? "Failed to save product.");
    } finally { 
      setSaving(false); 
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await axios.delete(`/api/admin/products/${id}`);
      fetch_();
    } catch { alert("Failed to delete product."); }
  };

  const handleDeleteAll = async () => {
    if (!confirm("Delete ALL products? This cannot be undone.")) return;
    if (!confirm("Are you absolutely sure? This will delete all products permanently.")) return;
    
    try {
      setSaving(true);
      for (const product of products) {
        await axios.delete(`/api/admin/products/${product._id}`);
      }
      fetch_();
    } catch (error) {
      alert("Failed to delete all products.");
    } finally {
      setSaving(false);
    }
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const removeExistingMedia = (url: string, type: 'images' | 'videos') => {
    setForm(f => ({
      ...f,
      [type]: f[type].filter(item => item !== url)
    }));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-[#2C2520]">Products</h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">{products.length} products</p>
        </div>
        <div className="flex gap-2">
          {products.length > 0 && (
            <button onClick={handleDeleteAll}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold
                         text-white transition-colors hover:opacity-90 min-h-[44px]"
              style={{ backgroundColor: "#DC2626" }}>
              <Trash2 className="w-4 h-4" /> Delete All
            </button>
          )}
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold
                       text-white transition-colors hover:opacity-90 min-h-[44px]"
            style={{ backgroundColor: "#C9A84C" }}>
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Product grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-40 animate-pulse border border-stone-100" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-400 text-sm mb-4">No products yet.</p>
          <button onClick={openAdd}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: "#C9A84C" }}>
            Add Your First Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p, idx) => (
            <div key={p._id}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={(e) => handleDrop(e, idx)}
              onDragEnd={handleDragEnd}
              className="bg-white rounded-2xl overflow-hidden
                         hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing"
              style={{
                border: dragOver === idx ? "2px solid #C9A84C" : "1px solid #F0EBE1",
                opacity: dragIndex.current === idx ? 0.5 : 1,
              }}>
              {/* Product image */}
              <div className="h-28 flex items-center justify-center bg-stone-50 relative">
                {p.images && p.images.length > 0 ? (
                  <Image src={p.images[0]} alt={p.name} width={112} height={112}
                    className="w-full h-full object-cover" />
                ) : (
                  <Package className="w-8 h-8 text-stone-300" />
                )}
                <div className="absolute top-2 right-2 bg-black/30 rounded-full p-1">
                  <GripVertical className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-serif font-semibold text-sm text-[#2C2520] leading-snug">{p.name}</h3>
                  {p.badge && (
                    <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: "#C9A84C", color: "#1A1A1A" }}>
                      {p.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-400 line-clamp-2 mb-3">{p.description}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sm text-[#2C2520]">₹{p.price.toLocaleString("en-IN")}</span>
                    {p.originalPrice && (
                      <span className="text-xs text-stone-400 line-through ml-1.5">₹{p.originalPrice.toLocaleString("en-IN")}</span>
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => openEdit(p)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center
                                 bg-stone-50 text-stone-500 hover:bg-stone-100 transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(p._id, p.name)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center
                                 bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full capitalize"
                    style={{ backgroundColor: "rgba(201,168,76,0.1)", color: "#A07C2E" }}>
                    {p.category.replace(/-/g, " ")}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium
                                    ${p.inStock ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                    {p.inStock ? "In Stock" : "Out of Stock"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4"
          style={{ backgroundColor: "rgba(26,26,26,0.6)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="bg-white w-full h-full md:h-auto md:rounded-2xl md:max-w-2xl md:max-h-[90vh] overflow-y-auto shadow-xl">
            {/* Modal header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-stone-100 sticky top-0 bg-white z-10">
              <h2 className="font-serif font-bold text-base sm:text-lg text-[#2C2520]">
                {editing ? "Edit Product" : "Add New Product"}
              </h2>
              <button onClick={() => setShowForm(false)}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-stone-100 transition-colors min-h-[44px]">
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              {error && (
                <p className="text-red-500 text-xs bg-red-50 rounded-xl px-3 py-2">{error}</p>
              )}

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Product Name *</label>
                <input value={form.name} onChange={set("name")}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm
                             focus:outline-none focus:ring-2 focus:border-[#C9A84C]"
                  style={{ "--tw-ring-color": "rgba(201,168,76,0.3)" } as any}
                  placeholder="e.g. Gold Foil Handprint Frame" />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Description *</label>
                <textarea value={form.description} onChange={set("description")} rows={3}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm resize-none
                             focus:outline-none focus:ring-2 focus:border-[#C9A84C]"
                  placeholder="Describe the product..." />
              </div>

              {/* Description Attachments - Using ProductFileUploader Component */}
              <div>
                <ProductFileUploader
                  attachments={form.descriptionAttachments || []}
                  onAttachmentsChange={(attachments) => {
                    setForm(f => ({
                      ...f,
                      descriptionAttachments: attachments
                    }));
                  }}
                />
              </div>

              {/* Price row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Price (₹) *</label>
                  <input type="number" value={form.price} onChange={set("price")} min={0}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm
                               focus:outline-none focus:ring-2 focus:border-[#C9A84C]"
                    placeholder="1299" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Original Price (₹)</label>
                  <input type="number" value={form.originalPrice || ""} onChange={set("originalPrice")} min={0}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm
                               focus:outline-none focus:ring-2 focus:border-[#C9A84C]"
                    placeholder="1599 (optional)" />
                </div>
              </div>

              {/* Category + Badge */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Category *</label>
                  <select value={form.category} onChange={set("category")}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm
                               focus:outline-none focus:ring-2 focus:border-[#C9A84C]">
                    {categories.map((c) => (
                      <option key={c} value={c}>{c.replace(/-/g, " ")}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Badge</label>
                  <select value={form.badge} onChange={set("badge")}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm
                               focus:outline-none focus:ring-2 focus:border-[#C9A84C]">
                    {BADGES.map((b) => (
                      <option key={b} value={b}>{b || "None"}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Existing Media */}
              {editing && (form.images.length > 0 || form.videos.length > 0) && (
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Current Media</label>
                  <div className="flex flex-wrap gap-3">
                    {form.images.map((url, i) => (
                      <div key={`img-${i}`} className="relative w-20 h-20 rounded-2xl overflow-hidden bg-stone-100 shrink-0">
                        <Image src={url} alt={`Product ${i + 1}`} width={80} height={80} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeExistingMedia(url, 'images')}
                          className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-black transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {form.videos.map((url, i) => (
                      <div key={`vid-${i}`} className="relative w-20 h-20 rounded-2xl overflow-hidden bg-stone-100 shrink-0">
                        <div className="w-full h-full flex items-center justify-center bg-stone-200">
                          <Video className="w-6 h-6 text-stone-400" />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeExistingMedia(url, 'videos')}
                          className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-black transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Media Upload */}
              <MediaUpload files={mediaFiles} onChange={setMediaFiles} />

              {/* In Stock toggle */}
              <div className="flex items-center justify-between py-2">
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide">In Stock</label>
                <button type="button"
                  onClick={() => setForm((f) => ({ ...f, inStock: !f.inStock }))}
                  className="relative w-11 h-6 rounded-full transition-colors duration-200"
                  style={{ backgroundColor: form.inStock ? "#C9A84C" : "#D1D5DB" }}>
                  <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
                    style={{ transform: form.inStock ? "translateX(20px)" : "translateX(0)" }} />
                </button>
              </div>

              {/* Save button */}
              <button onClick={handleSave} disabled={saving || uploading}
                className="w-full py-3 sm:py-3.5 rounded-xl text-sm font-semibold text-white transition-opacity
                           disabled:opacity-50 flex items-center justify-center gap-2 min-h-[44px]"
                style={{ backgroundColor: "#1A1A1A" }}>
                {saving || uploading ? (uploading ? "Uploading..." : "Saving…") : (
                  <><Check className="w-4 h-4" /> {editing ? "Save Changes" : "Add Product"}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
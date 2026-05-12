"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plus, Trash2, X, Check, Upload, Image as ImageIcon,
  Video, Pencil, Loader2, GripVertical,
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

interface PendingFile {
  file: File;
  preview: string;
  type: "image" | "video";
  alt: string;
  tall: boolean;
}

const GRADIENTS = [
  "linear-gradient(135deg, #C9A84C22 0%, #E8D5A3 100%)",
  "linear-gradient(135deg, #1A1A1A 0%, #2d2520 100%)",
  "linear-gradient(135deg, #2d2520 0%, #C9A84C33 100%)",
  "linear-gradient(135deg, #1A1A1A 0%, #3d3228 100%)",
  "linear-gradient(135deg, #E8D5A3 0%, #C9A84C44 100%)",
];

export default function AdminGalleryPage() {
  const [items, setItems]         = useState<GalleryItem[]>([]);
  const [loading, setLoading]     = useState(true);

  // Drag state
  const dragIndex = useRef<number | null>(null);
  const [dragOver, setDragOver]   = useState<number | null>(null);

  // Multi-upload state
  const [showUpload, setShowUpload] = useState(false);
  const [pending, setPending]       = useState<PendingFile[]>([]);
  const [uploading, setUploading]   = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError]           = useState("");
  const [dragging, setDragging]     = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Edit single item state
  const [editing, setEditing]   = useState<GalleryItem | null>(null);
  const [editAlt, setEditAlt]   = useState("");
  const [editTall, setEditTall] = useState(false);
  const [editSaving, setEditSaving] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/admin/gallery");
      setItems(res.data.items || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { fetchItems(); }, []);

  // ── Drag & drop reorder ──
  const handleDragStart = (index: number) => { dragIndex.current = index; };
  const handleDragOver  = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOver(index);
  };
  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    setDragOver(null);
    const from = dragIndex.current;
    if (from === null || from === dropIndex) return;

    const reordered = [...items];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(dropIndex, 0, moved);
    setItems(reordered);
    dragIndex.current = null;

    try {
      await axios.post("/api/admin/gallery/reorder", { ids: reordered.map((i) => i._id) });
    } catch { fetchItems(); }
  };
  const handleDragEnd = () => { dragIndex.current = null; setDragOver(null); };

  // ── Add files to pending queue ──
  const addFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const newFiles: PendingFile[] = [];
    Array.from(fileList).forEach((file) => {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      if (!isImage && !isVideo) return;
      newFiles.push({
        file,
        preview: URL.createObjectURL(file),
        type: isImage ? "image" : "video",
        alt: "",
        tall: false,
      });
    });
    setPending((prev) => [...prev, ...newFiles]);
  };

  const removePending = (index: number) => {
    setPending((prev) => prev.filter((_, i) => i !== index));
  };

  const updatePending = (index: number, key: "alt" | "tall", value: string | boolean) => {
    setPending((prev) => prev.map((f, i) => i === index ? { ...f, [key]: value } : f));
  };

  // ── Upload all pending files ──
  const handleUploadAll = async () => {
    if (pending.length === 0) { setError("Please select at least one file."); return; }
    setUploading(true);
    setError("");
    setUploadProgress(0);

    try {
      for (let i = 0; i < pending.length; i++) {
        const pf = pending[i];
        const formData = new FormData();
        formData.append("files", pf.file);

        const uploadRes = await axios.post("/api/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const uploaded = uploadRes.data.files?.[0];
        if (!uploaded) throw new Error(`Failed to upload ${pf.file.name}`);

        await axios.post("/api/admin/gallery", {
          url:  uploaded.url,
          type: uploaded.type,
          alt:  pf.alt,
          tall: pf.tall,
        });

        setUploadProgress(Math.round(((i + 1) / pending.length) * 100));
      }

      setPending([]);
      setShowUpload(false);
      fetchItems();
    } catch (e: any) {
      setError(e.response?.data?.error ?? e.message ?? "Upload failed.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // ── Edit existing item ──
  const openEdit = (item: GalleryItem) => {
    setEditing(item);
    setEditAlt(item.alt);
    setEditTall(item.tall);
  };

  const handleEditSave = async () => {
    if (!editing) return;
    setEditSaving(true);
    try {
      await axios.patch(`/api/admin/gallery/${editing._id}`, { alt: editAlt, tall: editTall });
      setEditing(null);
      fetchItems();
    } catch { alert("Failed to save."); }
    finally { setEditSaving(false); }
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
            {items.length} item{items.length !== 1 ? "s" : ""} · &ldquo;Moments Preserved with Love&rdquo; section
          </p>
        </div>
        <button
          onClick={() => { setShowUpload(true); setError(""); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                     text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#C9A84C" }}
        >
          <Plus className="w-4 h-4" /> Add Photos / Videos
        </button>
      </div>

      {/* Info */}
      <div className="mb-6 rounded-2xl px-5 py-4 text-sm"
        style={{ backgroundColor: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)", color: "#7A5C1E" }}>
        <strong>Tip:</strong> Select multiple files at once to upload them all together.
        Videos autoplay silently. <strong>Drag & drop cards to reorder.</strong>
      </div>

      {/* Gallery grid */}
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
          <button onClick={() => setShowUpload(true)}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: "#C9A84C" }}>
            Add Your First Items
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {items.map((item, idx) => (
            <div key={item._id}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={(e) => handleDrop(e, idx)}
              onDragEnd={handleDragEnd}
              className="bg-white rounded-2xl overflow-hidden
                         hover:shadow-md transition-all duration-200 flex flex-col cursor-grab active:cursor-grabbing"
              style={{
                border: dragOver === idx ? "2px solid #C9A84C" : "1px solid #F0EBE1",
                opacity: dragIndex.current === idx ? 0.5 : 1,
              }}>
              <div className="relative overflow-hidden"
                style={{ minHeight: item.tall ? "200px" : "150px", background: GRADIENTS[idx % GRADIENTS.length] }}>
                {item.type === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.url} alt={item.alt || "Gallery item"}
                    className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <>
                    <video src={item.url} muted loop playsInline autoPlay
                      className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 bg-black/60 rounded-full px-2 py-0.5 flex items-center gap-1">
                      <Video className="w-3 h-3 text-white" />
                      <span className="text-[10px] text-white font-medium">Video</span>
                    </div>
                  </>
                )}
                <div className="absolute top-2 right-2 bg-black/40 rounded-full p-1">
                  <GripVertical className="w-3 h-3 text-white" />
                </div>
                {item.tall && (
                  <span className="absolute bottom-2 left-2 bg-[#C9A84C] text-[#1A1A1A] text-[10px]
                                   font-bold px-2 py-0.5 rounded-full">Tall</span>
                )}
              </div>
              <div className="p-3 flex-1 flex flex-col gap-2">
                <p className="text-xs text-stone-500 truncate">
                  {item.alt || <em className="text-stone-300">No caption</em>}
                </p>
                <div className="flex items-center gap-1 mt-auto">
                  <button onClick={() => openEdit(item)} aria-label="Edit"
                    className="w-7 h-7 rounded-lg flex items-center justify-center bg-stone-50
                               text-stone-500 hover:bg-stone-100 transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(item._id)} aria-label="Delete"
                    className="w-7 h-7 rounded-lg flex items-center justify-center bg-red-50
                               text-red-500 hover:bg-red-100 transition-colors ml-auto">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Multi-upload modal ── */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(26,26,26,0.6)" }}
          onClick={(e) => { if (e.target === e.currentTarget && !uploading) setShowUpload(false); }}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 shrink-0">
              <h2 className="font-serif font-bold text-lg text-[#2C2520]">
                Add Photos / Videos
              </h2>
              {!uploading && (
                <button onClick={() => { setShowUpload(false); setPending([]); setError(""); }}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-stone-100 transition-colors">
                  <X className="w-4 h-4 text-stone-500" />
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {error && (
                <p className="text-red-500 text-xs bg-red-50 rounded-xl px-3 py-2">{error}</p>
              )}

              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
                onClick={() => inputRef.current?.click()}
                className="w-full rounded-xl border-2 border-dashed cursor-pointer
                           flex flex-col items-center justify-center gap-2 py-8 transition-all"
                style={{
                  borderColor: dragging ? "#C9A84C" : "#D1D5DB",
                  backgroundColor: dragging ? "rgba(201,168,76,0.05)" : "#FAFAFA",
                }}
              >
                <Upload className="w-8 h-8 text-stone-400" />
                <p className="text-sm font-medium text-stone-500">
                  Click or drag & drop to add files
                </p>
                <p className="text-xs text-stone-400">
                  JPG, PNG, WEBP, MP4, MOV — select as many as you want
                </p>
              </div>

              <input
                ref={inputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={(e) => addFiles(e.target.files)}
              />

              {/* Pending files list */}
              {pending.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
                    {pending.length} file{pending.length !== 1 ? "s" : ""} selected
                  </p>
                  {pending.map((pf, i) => (
                    <div key={i} className="flex items-center gap-3 bg-stone-50 rounded-xl p-3"
                      style={{ border: "1px solid #F0EBE1" }}>
                      {/* Thumbnail */}
                      <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-stone-200">
                        {pf.type === "image" ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={pf.preview} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Video className="w-5 h-5 text-stone-400" />
                          </div>
                        )}
                      </div>

                      {/* Caption input */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-stone-400 truncate mb-1">{pf.file.name}</p>
                        <input
                          value={pf.alt}
                          onChange={(e) => updatePending(i, "alt", e.target.value)}
                          placeholder="Caption (optional)"
                          className="w-full text-xs bg-white border border-stone-200 rounded-lg
                                     px-3 py-1.5 focus:outline-none focus:border-[#C9A84C]"
                        />
                      </div>

                      {/* Tall toggle */}
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <span className="text-[10px] text-stone-400">Tall</span>
                        <button
                          type="button"
                          onClick={() => updatePending(i, "tall", !pf.tall)}
                          className="relative w-9 h-5 rounded-full transition-colors duration-200"
                          style={{ backgroundColor: pf.tall ? "#C9A84C" : "#D1D5DB" }}
                        >
                          <span className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow
                                           transition-transform duration-200"
                            style={{ transform: pf.tall ? "translateX(16px)" : "translateX(0)" }} />
                        </button>
                      </div>

                      {/* Remove */}
                      {!uploading && (
                        <button onClick={() => removePending(i)} aria-label="Remove"
                          className="w-7 h-7 rounded-full flex items-center justify-center
                                     bg-red-50 text-red-400 hover:bg-red-100 transition-colors shrink-0">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Upload progress */}
              {uploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Uploading {uploadProgress}%…
                    </span>
                    <span>{Math.round(pending.length * uploadProgress / 100)} / {pending.length} done</span>
                  </div>
                  <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%`, backgroundColor: "#C9A84C" }} />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-stone-100 shrink-0 flex gap-3">
              {!uploading && (
                <button
                  onClick={() => { setShowUpload(false); setPending([]); setError(""); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-stone-200
                             text-stone-600 hover:bg-stone-50 transition-colors">
                  Cancel
                </button>
              )}
              <button
                onClick={handleUploadAll}
                disabled={uploading || pending.length === 0}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white
                           disabled:opacity-50 flex items-center justify-center gap-2
                           transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#1A1A1A" }}
              >
                {uploading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</>
                ) : (
                  <><Check className="w-4 h-4" /> Upload {pending.length > 0 ? `${pending.length} file${pending.length !== 1 ? "s" : ""}` : "Files"}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit single item modal ── */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(26,26,26,0.6)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setEditing(null); }}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h2 className="font-serif font-bold text-lg text-[#2C2520]">Edit Item</h2>
              <button onClick={() => setEditing(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-stone-100 transition-colors">
                <X className="w-4 h-4 text-stone-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Preview */}
              <div className="w-full aspect-video rounded-xl overflow-hidden bg-stone-100">
                {editing.type === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={editing.url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <video src={editing.url} muted loop playsInline autoPlay className="w-full h-full object-cover" />
                )}
              </div>
              {/* Caption */}
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">
                  Caption
                </label>
                <input value={editAlt} onChange={(e) => setEditAlt(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm
                             focus:outline-none focus:border-[#C9A84C]"
                  placeholder="e.g. Gold foil handprint frame" />
              </div>
              {/* Tall toggle */}
              <div className="flex items-center justify-between py-1">
                <div>
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Tall card</p>
                  <p className="text-xs text-stone-400 mt-0.5">Makes this card taller in the collage</p>
                </div>
                <button type="button" onClick={() => setEditTall((v) => !v)}
                  className="relative w-11 h-6 rounded-full transition-colors duration-200"
                  style={{ backgroundColor: editTall ? "#C9A84C" : "#D1D5DB" }}>
                  <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow
                                   transition-transform duration-200"
                    style={{ transform: editTall ? "translateX(20px)" : "translateX(0)" }} />
                </button>
              </div>
              <button onClick={handleEditSave} disabled={editSaving}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white
                           disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ backgroundColor: "#1A1A1A" }}>
                {editSaving ? "Saving…" : <><Check className="w-4 h-4" /> Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Upload, X, FileText, Image as ImageIcon, Video, File, Loader } from "lucide-react";
import axios from "axios";

interface FileAttachment {
  url: string;
  type: "image" | "video" | "pdf";
  name?: string;
}

interface ProductFileUploaderProps {
  attachments: FileAttachment[];
  onAttachmentsChange: (attachments: FileAttachment[]) => void;
}

export default function ProductFileUploader({
  attachments,
  onAttachmentsChange,
}: ProductFileUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const getFileType = (file: File): "image" | "video" | "pdf" | null => {
    const type = file.type;
    if (type.startsWith("image/")) return "image";
    if (type.startsWith("video/")) return "video";
    if (type === "application/pdf") return "pdf";
    return null;
  };

  const getFileIcon = (type: "image" | "video" | "pdf") => {
    switch (type) {
      case "image":
        return <ImageIcon className="w-5 h-5" />;
      case "video":
        return <Video className="w-5 h-5" />;
      case "pdf":
        return <FileText className="w-5 h-5" />;
    }
  };

  const handleFiles = async (files: FileList) => {
    setError("");
    const validFiles: File[] = [];

    // Validate files
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileType = getFileType(file);

      if (!fileType) {
        setError(`${file.name} is not a supported format. Use images, videos, or PDFs.`);
        continue;
      }

      if (file.size > 50 * 1024 * 1024) {
        // 50MB limit
        setError(`${file.name} is too large. Max 50MB per file.`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setUploading(true);

    try {
      // Upload each file
      for (const file of validFiles) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await axios.post("/api/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (response.data.url) {
          const fileType = getFileType(file);
          const newAttachment: FileAttachment = {
            url: response.data.url,
            type: fileType!,
            name: file.name,
          };

          onAttachmentsChange([...attachments, newAttachment]);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeAttachment = (index: number) => {
    onAttachmentsChange(attachments.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3">
          Product Files (Images, Videos, PDFs)
        </label>
        <p className="text-xs text-stone-400 mb-3">
          Upload images, videos, or PDFs to display in product description. Max 50MB per file.
        </p>
      </div>

      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative rounded-2xl border-2 border-dashed transition-colors p-4 sm:p-8 text-center cursor-pointer
          ${
            dragActive
              ? "border-[#C9A84C] bg-[#C9A84C]/5"
              : "border-stone-200 bg-stone-50 hover:border-stone-300"
          }
          ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input
          type="file"
          multiple
          accept="image/*,video/*,.pdf"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          disabled={uploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="flex flex-col items-center gap-2">
          {uploading ? (
            <>
              <Loader className="w-8 h-8 text-[#C9A84C] animate-spin" />
              <p className="text-sm font-semibold text-stone-600">Uploading...</p>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-stone-400" />
              <p className="text-sm font-semibold text-stone-600">
                Drag files here or click to upload
              </p>
              <p className="text-xs text-stone-400">
                Images (JPG, PNG, GIF), Videos (MP4, WebM), PDFs
              </p>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-xl border border-red-200">
          <X className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Attachments List */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-stone-500 uppercase">
            {attachments.length} File{attachments.length !== 1 ? "s" : ""} Attached
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {attachments.map((attachment, index) => (
              <div
                key={index}
                className="relative group rounded-xl overflow-hidden bg-stone-100 border border-stone-200 h-32 sm:h-40"
              >
                {attachment.type === "image" ? (
                  <img
                    src={attachment.url}
                    alt={attachment.name || `Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : attachment.type === "video" ? (
                  <video
                    src={attachment.url}
                    className="w-full h-full object-cover bg-black"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-stone-50">
                    <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-stone-400 mb-2" />
                    <p className="text-xs text-stone-500 text-center px-2 line-clamp-2">
                      {attachment.name || "PDF Document"}
                    </p>
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity
                             w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center
                             hover:bg-red-600 active:scale-95 transition-transform"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Type Badge */}
                <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
                  {getFileIcon(attachment.type)}
                  {attachment.type.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

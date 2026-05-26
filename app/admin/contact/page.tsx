"use client";

import { useState, useEffect } from "react";
import { Mail, MailOpen, Trash2, ChevronDown, ChevronUp, Phone } from "lucide-react";
import axios from "axios";

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

type FilterType = "all" | "unread" | "read";

export default function AdminContactPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/admin/contact");
      setMessages(res.data.messages || []);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const markAsRead = async (id: string, isRead: boolean) => {
    try {
      await axios.patch(`/api/admin/contact/${id}`, { isRead });
      setMessages((prev) =>
        prev.map((m) => (m._id === id ? { ...m, isRead } : m))
      );
    } catch (error) {
      console.error("Failed to update message:", error);
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    try {
      await axios.delete(`/api/admin/contact/${id}`);
      setMessages((prev) => prev.filter((m) => m._id !== id));
      if (expandedId === id) setExpandedId(null);
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  const toggleExpand = (id: string, isRead: boolean) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      if (!isRead) {
        markAsRead(id, true);
      }
    }
  };

  const filteredMessages = messages.filter((m) => {
    if (filter === "unread") return !m.isRead;
    if (filter === "read") return m.isRead;
    return true;
  });

  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-[#2C2520]">
            Contact Messages
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            {messages.length} total • {unreadCount} unread
          </p>
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          {(["all", "unread", "read"] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors min-h-[44px] ${
                filter === f
                  ? "bg-[#C9A84C] text-[#1A1A1A]"
                  : "bg-white text-stone-600 hover:bg-stone-50"
              }`}
              style={{ border: "1px solid #E8D5A3" }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === "unread" && unreadCount > 0 && ` (${unreadCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Messages List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl h-20 animate-pulse border border-stone-100"
            />
          ))}
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="text-center py-20">
          <Mail className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-400 text-sm">
            {filter === "all"
              ? "No messages yet"
              : `No ${filter} messages`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMessages.map((msg) => (
            <div
              key={msg._id}
              className={`bg-white rounded-2xl border transition-all duration-200 ${
                !msg.isRead
                  ? "border-[#C9A84C] shadow-sm"
                  : "border-stone-100"
              }`}
            >
              {/* Message Header */}
              <button
                onClick={() => toggleExpand(msg._id, msg.isRead)}
                className="w-full p-4 sm:p-5 flex items-start gap-3 sm:gap-4 text-left hover:bg-stone-50 transition-colors rounded-2xl"
              >
                {/* Icon */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    !msg.isRead
                      ? "bg-[#C9A84C]/10 text-[#C9A84C]"
                      : "bg-stone-100 text-stone-400"
                  }`}
                >
                  {!msg.isRead ? (
                    <Mail className="w-5 h-5" />
                  ) : (
                    <MailOpen className="w-5 h-5" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3
                      className={`text-sm sm:text-base ${
                        !msg.isRead ? "font-bold" : "font-semibold"
                      } text-[#2C2520] truncate`}
                    >
                      {msg.name}
                    </h3>
                    <span className="text-xs text-stone-400 shrink-0">
                      {new Date(msg.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-500 mb-1">
                    {msg.email}
                  </p>
                  <p
                    className={`text-xs sm:text-sm ${
                      !msg.isRead ? "font-semibold text-[#2C2520]" : "text-stone-600"
                    } truncate`}
                  >
                    {msg.subject}
                  </p>
                </div>

                {/* Expand Icon */}
                <div className="shrink-0">
                  {expandedId === msg._id ? (
                    <ChevronUp className="w-5 h-5 text-stone-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-stone-400" />
                  )}
                </div>
              </button>

              {/* Expanded Content */}
              {expandedId === msg._id && (
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-stone-100">
                  <div className="pt-4 space-y-4">
                    {/* Phone */}
                    {msg.phone && (
                      <div className="flex items-center gap-2 text-sm text-stone-600">
                        <Phone className="w-4 h-4 text-stone-400" />
                        <a
                          href={`tel:${msg.phone}`}
                          className="hover:text-[#C9A84C] transition-colors"
                        >
                          {msg.phone}
                        </a>
                      </div>
                    )}

                    {/* Message */}
                    <div className="bg-stone-50 rounded-xl p-4">
                      <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">
                        Message
                      </p>
                      <p className="text-sm text-[#2C2520] whitespace-pre-wrap leading-relaxed">
                        {msg.message}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => markAsRead(msg._id, !msg.isRead)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold
                                   bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors min-h-[44px]"
                      >
                        {msg.isRead ? (
                          <>
                            <Mail className="w-4 h-4" /> Mark Unread
                          </>
                        ) : (
                          <>
                            <MailOpen className="w-4 h-4" /> Mark Read
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => deleteMessage(msg._id)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold
                                   bg-red-50 text-red-600 hover:bg-red-100 transition-colors min-h-[44px]"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                      <a
                        href={`mailto:${msg.email}`}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold
                                   bg-[#C9A84C] text-[#1A1A1A] hover:opacity-90 transition-opacity min-h-[44px]"
                      >
                        Reply via Email
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

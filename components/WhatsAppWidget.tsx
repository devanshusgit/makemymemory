"use client";

import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";

export default function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim()) return;

    // Format WhatsApp message with your phone number
    const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919999999999";
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    // Open WhatsApp in new tab
    window.open(whatsappUrl, "_blank");

    // Reset form
    setMessage("");
    setIsOpen(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-br from-[#25D366] to-[#20BA5A] 
                   rounded-full flex items-center justify-center shadow-lg hover:shadow-xl 
                   transition-all duration-300 hover:scale-110"
        aria-label="Open WhatsApp chat"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <svg
            className="w-7 h-7 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.272-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.255.949c-1.238.503-2.335 1.236-3.356 2.259-1.02 1.02-1.756 2.117-2.259 3.355-.603 1.692-.757 3.545-.418 5.247.338 1.702 1.138 3.194 2.259 4.316 1.121 1.121 2.613 1.921 4.315 2.259 1.702.339 3.555.185 5.247-.418 1.238-.503 2.335-1.236 3.356-2.259 1.02-1.02 1.756-2.117 2.259-3.355.603-1.692.757-3.545.418-5.247-.338-1.702-1.138-3.194-2.259-4.316-1.121-1.121-2.613-1.921-4.315-2.259-1.702-.338-3.555-.184-5.247.418z" />
          </svg>
        )}
      </button>

      {/* Chat Widget */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-40 w-80 bg-white rounded-2xl shadow-2xl 
                     overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#25D366] to-[#20BA5A] px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.272-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.255.949c-1.238.503-2.335 1.236-3.356 2.259-1.02 1.02-1.756 2.117-2.259 3.355-.603 1.692-.757 3.545-.418 5.247.338 1.702 1.138 3.194 2.259 4.316 1.121 1.121 2.613 1.921 4.315 2.259 1.702.339 3.555.185 5.247-.418 1.238-.503 2.335-1.236 3.356-2.259 1.02-1.02 1.756-2.117 2.259-3.355.603-1.692.757-3.545.418-5.247-.338-1.702-1.138-3.194-2.259-4.316-1.121-1.121-2.613-1.921-4.315-2.259-1.702-.338-3.555-.184-5.247.418z" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="text-white font-semibold text-sm">Make My Memory</h3>
                <p className="text-white/80 text-xs">Typically replies within a minute</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors p-1"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="h-40 bg-gray-50 px-4 py-4 overflow-y-auto flex flex-col gap-3">
            <div className="flex justify-start">
              <div className="bg-white text-gray-800 text-sm px-3 py-2 rounded-lg rounded-tl-none max-w-xs">
                <p className="font-medium">Hi, Welcome to Make My Memory</p>
                <p>How can we help you?</p>
                <span className="text-xs text-gray-400 mt-1 block">12:10 pm</span>
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="bg-white px-4 py-3 border-t border-gray-200">
            <div className="flex gap-2 items-end">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type Message"
                className="flex-1 border border-gray-300 rounded-full px-4 py-2.5 text-sm
                           focus:outline-none focus:border-[#25D366] transition-colors
                           resize-none"
              />
              <button
                onClick={handleSend}
                disabled={!message.trim()}
                className="text-gray-400 hover:text-[#25D366] disabled:opacity-50 
                          disabled:cursor-not-allowed transition-colors p-1"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-2 text-center text-xs text-gray-500 border-t border-gray-200">
            <p>Powered by Interakt</p>
          </div>
        </div>
      )}

      {/* Animation styles */}
      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-in {
          animation: slideInUp 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

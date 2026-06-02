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
            {/* Simple chat bubble icon */}
            <path d="M20.5 3H3.5C2.12 3 1 4.12 1 5.5V15.5C1 16.88 2.12 18 3.5 18H6.5L9 20.5L11.5 18H20.5C21.88 18 23 16.88 23 15.5V5.5C23 4.12 21.88 3 20.5 3ZM12 15C10.6 15 9.5 13.9 9.5 12.5C9.5 11.1 10.6 10 12 10C13.4 10 14.5 11.1 14.5 12.5C14.5 13.9 13.4 15 12 15Z" />
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
                  {/* Simple chat bubble icon */}
                  <path d="M20.5 3H3.5C2.12 3 1 4.12 1 5.5V15.5C1 16.88 2.12 18 3.5 18H6.5L9 20.5L11.5 18H20.5C21.88 18 23 16.88 23 15.5V5.5C23 4.12 21.88 3 20.5 3ZM12 15C10.6 15 9.5 13.9 9.5 12.5C9.5 11.1 10.6 10 12 10C13.4 10 14.5 11.1 14.5 12.5C14.5 13.9 13.4 15 12 15Z" />
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

"use client";

import React, { useState } from "react";
import { Share2, Copy, Check, X } from "lucide-react";
import toast from "react-hot-toast";

export interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  url?: string;
}

export function ShareModal({ isOpen, onClose, productName, url }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy link:", err);
      toast.error("Failed to copy link");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Share2 className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold">Share Product</h3>
        </div>

        <p className="text-sm text-slate-400 mb-4 line-clamp-1">
          Share <span className="text-white font-medium">{productName}</span> with friends & family.
        </p>

        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-2">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="bg-transparent text-xs text-slate-300 flex-1 px-2 focus:outline-none select-all"
          />
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition cursor-pointer shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

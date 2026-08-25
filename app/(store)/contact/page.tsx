"use client";

import { useState } from "react";
import { Mail, Send, CheckCircle2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success("Thank you! Your message has been sent.");
      setFormData({ name: "", email: "", message: "" });
    }, 700);
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen py-12 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Block */}
        <div className="text-center mb-10 sm:mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 mb-3">
            <MessageSquare className="w-3.5 h-3.5" /> Get in Touch
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Contact Us
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-lg mx-auto font-medium">
            Have a question or inquiry? Send us a message below and our team will get back to you shortly.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-full px-4 py-1.5 shadow-2xs">
            <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Direct Email:</span>
            <a
              href="mailto:support@nirosha.in"
              className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              support@nirosha.in
            </a>
          </div>
        </div>

        {/* Contact Form Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 sm:p-10">
          {submitted ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Message Sent!</h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-2 max-w-md mx-auto">
                Thank you for reaching out to Nirosha. We have received your inquiry and will respond to your email address soon.
              </p>
              <Button
                onClick={() => setSubmitted(false)}
                className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg px-6 cursor-pointer"
              >
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="text"
                  required
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-11 rounded-lg border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Email <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="email"
                  required
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-11 rounded-lg border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Message <span className="text-rose-500">*</span>
                </label>
                <Textarea
                  required
                  rows={5}
                  placeholder="How can we help you?"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="rounded-lg border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-600 resize-y"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {loading ? (
                  "Sending..."
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

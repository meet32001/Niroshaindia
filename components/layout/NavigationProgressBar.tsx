"use client";

import { useEffect, useState, useTransition, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function ProgressBarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const [, startTransition] = useTransition();

  // Reset/complete progress when route changes
  useEffect(() => {
    if (visible) {
      setProgress(100);
      const timer = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const startProgress = () => {
      setVisible(true);
      setProgress(25);
      clearInterval(interval);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return prev;
          }
          // Slow down increment as it gets higher
          const diff = Math.max(1, (90 - prev) * 0.15);
          return Math.min(90, prev + diff);
        });
      }, 100);
    };

    const handleClick = (e: MouseEvent) => {
      // Find closest anchor tag
      const anchor = (e.target as HTMLElement)?.closest?.("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      const target = anchor.getAttribute("target");

      // Skip non-HTTP links, new tabs, downloads, external links, or hash-only links
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        target === "_blank" ||
        anchor.hasAttribute("download") ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey ||
        e.defaultPrevented
      ) {
        return;
      }

      try {
        const url = new URL(anchor.href, window.location.href);
        const currentUrl = new URL(window.location.href);

        // Only trigger if same origin and actually navigating to a different path or query
        if (
          url.origin === currentUrl.origin &&
          (url.pathname !== currentUrl.pathname || url.search !== currentUrl.search)
        ) {
          startTransition(() => {
            startProgress();
          });
        }
      } catch {
        // Invalid URL, ignore
      }
    };

    const handlePopState = () => {
      startProgress();
    };

    document.addEventListener("click", handleClick, { capture: true });
    window.addEventListener("popstate", handlePopState);

    return () => {
      clearInterval(interval);
      document.removeEventListener("click", handleClick, { capture: true });
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  if (!visible && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[9999] h-[3px] w-full bg-transparent"
    >
      <div
        className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.7)] transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          opacity: visible ? 1 : 0,
        }}
      />
    </div>
  );
}

export function NavigationProgressBar() {
  return (
    <Suspense fallback={null}>
      <ProgressBarInner />
    </Suspense>
  );
}

import { useEffect, useRef, RefObject } from "react";

/**
 * Custom hook to trigger a callback function when a click is detected outside the referenced element.
 */
export function useOutsideClick<T extends HTMLElement>(
  callback: () => void
): RefObject<T | null> {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [callback]);

  return ref;
}

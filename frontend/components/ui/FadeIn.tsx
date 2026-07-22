"use client";

import { useState, useEffect } from "react";

/**
 * Wraps children with a fade-in animation.
 * Shows nothing for `delayMs`, then fades content in.
 * Used after data loads to smooth the skeleton→data transition.
 */
export function FadeIn({
  children,
  delayMs = 60,
}: {
  children: React.ReactNode;
  delayMs?: number;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setShow(true), delayMs);
    return () => clearTimeout(id);
  }, [delayMs]);

  if (!show) return null;
  return (
    <div className="animate-[fadeIn_0.25s_ease-in-out]">
      {children}
    </div>
  );
}

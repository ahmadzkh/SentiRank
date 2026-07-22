"use client";

import { useEffect, useState } from "react";

export function FadeIn({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  return (
    <div
      className={`transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"} ${className}`}
    >
      {children}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Mounts the <video> only once it nears the viewport, so off-screen clips
 * (and their metadata range requests) don't compete with the initial load.
 */
export function InViewVideo({
  src,
  poster,
  className,
}: {
  src: string;
  poster?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {visible ? (
        <video
          controls
          preload={poster ? "none" : "metadata"}
          poster={poster}
          src={src}
          className="h-full w-full bg-black object-contain"
        />
      ) : (
        <div className="h-full w-full bg-black" aria-hidden />
      )}
    </div>
  );
}

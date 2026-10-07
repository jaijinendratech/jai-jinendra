/** Lucide-style icon: an onion bulb with a slash through it ("no onion, no garlic"). */
export function NoOnionGarlicIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {/* bulb */}
      <path d="M12 7c4.2 2.6 6 5.2 6 8a6 6 0 0 1-12 0c0-2.8 1.8-5.4 6-8Z" />
      {/* sprout */}
      <path d="M12 7V3.5" />
      <path d="M12 5.5c1-1.6 2.3-2 3.5-2" />
      {/* bulb ribs */}
      <path d="M12 9.5c-1.4 2.2-1.9 4.6-1.5 8.2" />
      <path d="M12 9.5c1.4 2.2 1.9 4.6 1.5 8.2" />
      {/* slash */}
      <path d="M3.5 3.5 20.5 20.5" />
    </svg>
  );
}

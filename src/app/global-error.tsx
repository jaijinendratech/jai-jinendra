"use client";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <html lang="en">
      <body>
        <h2>Something went wrong</h2>
        {error.digest ? (
          <p style={{ fontSize: 12, opacity: 0.7 }}>Ref: {error.digest}</p>
        ) : null}
      </body>
    </html>
  );
}

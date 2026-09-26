"use client";

import { useState, type FormEvent } from "react";
import { Button, Input, toast } from "@heroui/react";
import { newsletter } from "@/data/home";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    try {
      const res = await fetch("/api/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = (await res.json()) as { error?: string; already?: boolean };
      if (!res.ok) throw new Error(json.error ?? "Could not subscribe");
      if (json.already) {
        toast.success("Already subscribed", {
          description: "This email is already on the welcome list.",
        });
        return;
      }
      setEmail("");
      toast.success("You're on the list", {
        description: "Your ₹100 welcome offer is on its way.",
      });
    } catch (err) {
      toast.danger(
        err instanceof Error ? err.message : "Could not subscribe",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="relative overflow-hidden border-t border-outline-variant/30 bg-[#FAF2EE] py-10 md:py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[url('/images/footer%20background.png')] bg-bottom bg-no-repeat"
        style={{ backgroundSize: "80% auto" }}
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 " />

      <div className="relative z-10 container-jj mx-auto max-w-2xl text-center">
        <span className="label-sm font-bold uppercase tracking-widest text-[#ffb2bd]">
          {newsletter.eyebrow}
        </span>
        <h2 className="font-display mt-2 text-2xl font-semibold text-[#1d1d1d] md:text-3xl">
          <span className="md:hidden">{newsletter.mobileTitle}</span>
          <span className="hidden md:inline">{newsletter.title}</span>
        </h2>
        <p className="mt-2 text-sm text-black/80 md:mt-3 md:text-base">
          <span className="md:hidden">{newsletter.mobileBody}</span>
          <span className="hidden md:inline">{newsletter.body}</span>
        </p>

        <form
          className="mt-5 flex flex-row items-stretch gap-2 md:mt-6 md:gap-3"
          onSubmit={(event) => void handleSubmit(event)}
        >
          <Input
            type="email"
            name="email"
            required
            aria-label="Email address"
            placeholder="Enter your email"
            className="min-w-0 flex-1"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={sending}
          />
          <Button
            type="submit"
            isDisabled={sending}
            className="shrink-0 rounded-lg bg-primary-container px-4 text-white md:px-6"
          >
            {sending ? (
              "Sending…"
            ) : (
              <>
                <span className="md:hidden">{newsletter.mobileCta}</span>
                <span className="hidden md:inline">{newsletter.cta}</span>
              </>
            )}
          </Button>
        </form>
        <p className="mt-2 text-xs text-white/70 md:mt-3">
          {newsletter.disclaimer}
        </p>
      </div>
    </section>
  );
}

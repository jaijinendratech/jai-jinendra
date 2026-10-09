"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@heroui/react";
import {
  sendBroadcastAction,
  sendBroadcastTestAction,
} from "@/lib/admin/actions";
import type { AdminSubscriber } from "@/lib/admin/queries";
import {
  AdminTableShell,
  fieldClassName,
  labelClassName,
} from "@/components/admin/ui";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";
import { AdminIconButton } from "@/components/admin/AdminIconButton";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { SearchField } from "@/components/admin/SearchField";
import {
  AdminTablePagination,
  useAdminTablePagination,
} from "@/components/admin/AdminTablePagination";

type StatusFilter = "all" | "active" | "unsubscribed";

export function SubscribersTable({
  subscribers,
  broadcastsReady,
}: {
  subscribers: AdminSubscriber[];
  broadcastsReady: boolean;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [composeOpen, setComposeOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  // Snapshot of the form at the moment "Send" was pressed, used after confirming.
  const draft = useRef<FormData | null>(null);

  const activeCount = useMemo(
    () => subscribers.filter((s) => !s.unsubscribedAt).length,
    [subscribers],
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return subscribers.filter((s) => {
      if (needle && !s.email.toLowerCase().includes(needle)) return false;
      if (status === "active" && s.unsubscribedAt) return false;
      if (status === "unsubscribed" && !s.unsubscribedAt) return false;
      return true;
    });
  }, [subscribers, q, status]);

  const { pageItems, page, setPage, totalPages, total, from, to } =
    useAdminTablePagination(filtered);

  function sendTest() {
    if (!formRef.current) return;
    const data = new FormData(formRef.current);
    startTransition(async () => {
      const result = await sendBroadcastTestAction(data);
      if (result.ok) toast.success("Test email sent to your admin address");
      else toast.danger(result.error ?? "Could not send the test email.");
    });
  }

  function askToSend() {
    if (!formRef.current) return;
    const data = new FormData(formRef.current);
    if (!String(data.get("subject") ?? "").trim()) {
      toast.danger("Add a subject first.");
      return;
    }
    if (!String(data.get("bodyHtml") ?? "").trim()) {
      toast.danger("Write a message first.");
      return;
    }
    draft.current = data;
    setConfirmOpen(true);
  }

  function send() {
    const data = draft.current;
    if (!data) return;
    startTransition(async () => {
      const result = await sendBroadcastAction(data);
      if (result.ok) {
        toast.success(
          result.failed
            ? `Sent to ${result.sent}. ${result.failed} could not be delivered.`
            : `Sent to ${result.sent} subscribers`,
        );
        setComposeOpen(false);
        router.refresh();
      } else {
        toast.danger(result.error ?? "Could not send the email.");
      }
    });
  }

  const selectClass = `${fieldClassName()} mt-0! max-w-48`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <SearchField
          value={q}
          onChange={(value) => {
            setQ(value);
            setPage(1);
          }}
          placeholder="Search email…"
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as StatusFilter);
            setPage(1);
          }}
          className={selectClass}
          aria-label="Filter by status"
        >
          <option value="all">All subscribers</option>
          <option value="active">Active</option>
          <option value="unsubscribed">Unsubscribed</option>
        </select>
        <span className="text-xs text-on-surface-variant">
          {activeCount} active of {subscribers.length}
        </span>
        <div className="ml-auto">
          <AdminIconButton
            label="Send email"
            icon="plus"
            variant="primary"
            showLabel
            disabled={!broadcastsReady || activeCount === 0}
            onClick={() => setComposeOpen(true)}
          />
        </div>
      </div>

      {!broadcastsReady ? (
        <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          Sending email needs the latest database update (migration 017,
          subscribers_broadcasts). Apply it in Supabase, then reload this page.
        </p>
      ) : null}

      <AdminTableShell>
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-outline-variant/20 bg-surface-container-low text-xs uppercase tracking-wide text-on-surface-variant">
            <tr>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Subscribed</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/15">
            {pageItems.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-8 text-center text-sm text-on-surface-variant"
                >
                  No subscribers match these filters.
                </td>
              </tr>
            ) : null}
            {pageItems.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-3 font-semibold">{s.email}</td>
                <td className="numeric px-4 py-3 text-xs text-on-surface-variant">
                  {new Date(s.createdAt).toLocaleString("en-IN")}
                </td>
                <td className="px-4 py-3">
                  {s.unsubscribedAt ? (
                    <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-700">
                      Unsubscribed
                    </span>
                  ) : (
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                      Active
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminTableShell>
      <AdminTablePagination
        page={page}
        totalPages={totalPages}
        total={total}
        from={from}
        to={to}
        onPageChange={setPage}
      />

      <AdminModal
        isOpen={composeOpen}
        onOpenChange={setComposeOpen}
        title="Email your subscribers"
        size="lg"
      >
        <form
          ref={formRef}
          onSubmit={(e) => e.preventDefault()}
          className="space-y-4"
        >
          <label className={labelClassName()}>
            Subject
            <input
              name="subject"
              required
              maxLength={150}
              placeholder="e.g. Diwali gift hampers are here"
              className={fieldClassName()}
            />
          </label>
          <RichTextEditor
            name="bodyHtml"
            label="Message"
            placeholder="Write your announcement or offer…"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClassName()}>
              Button label (optional)
              <input
                name="ctaLabel"
                maxLength={40}
                placeholder="Shop the offer"
                className={fieldClassName()}
              />
            </label>
            <label className={labelClassName()}>
              Button link (optional)
              <input
                name="ctaUrl"
                type="url"
                placeholder="https://www.jaijinendrasweets.com/catalogue"
                className={fieldClassName()}
              />
            </label>
          </div>
          <p className="text-xs text-on-surface-variant">
            Every email includes your branding and a personal unsubscribe link.
            Only active subscribers receive it ({activeCount}).
          </p>
          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            <AdminIconButton
              label={pending ? "Working…" : "Send test to me"}
              icon="eye"
              variant="secondary"
              showLabel
              disabled={pending}
              onClick={sendTest}
            />
            <AdminIconButton
              label={`Send to ${activeCount} subscribers`}
              icon="check"
              variant="primary"
              showLabel
              disabled={pending}
              onClick={askToSend}
            />
          </div>
        </form>
      </AdminModal>

      <AdminConfirmDialog
        isOpen={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Send this email?"
        message={`This will email ${activeCount} active subscribers right away. It cannot be undone.`}
        confirmLabel="Send now"
        danger={false}
        onConfirm={() => {
          setConfirmOpen(false);
          send();
        }}
      />
    </div>
  );
}

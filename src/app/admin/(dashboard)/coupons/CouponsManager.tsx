"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@heroui/react";
import {
  saveCouponAction,
  setCouponActiveAction,
} from "@/lib/admin/actions";
import {
  AdminFieldGrid,
  AdminTableShell,
  adminFieldFullClassName,
  fieldClassName,
  labelClassName,
} from "@/components/admin/ui";
import {
  AdminFormSubmitButton,
  AdminIconButton,
} from "@/components/admin/AdminIconButton";
import { AdminModal } from "@/components/admin/AdminModal";
import {
  AdminStatusSelect,
} from "@/components/admin/AdminStatusSelect";
import {
  AdminActionsMenu,
  type AdminMenuItem,
} from "@/components/admin/AdminActionsMenu";
import { isNextRedirectError } from "@/lib/admin/is-redirect-error";
import {
  AdminTablePagination,
  useAdminTablePagination,
} from "@/components/admin/AdminTablePagination";
import { formatINR } from "@/lib/format";
import type { CouponType } from "@/types/database";

export type AdminCouponRow = {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  minOrderPaise: number;
  maxDiscountPaise: number | null;
  active: boolean;
  startsAt: string | null;
  expiresAt: string | null;
  usageLimit: number | null;
  usedCount: number;
  valueLabel: string;
};

const ACTIVE_OPTIONS = [
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
] as const;

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function CouponFormFields({
  coupon,
  onSaved,
}: {
  coupon?: AdminCouponRow | null;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState<CouponType>(coupon?.type ?? "percent");

  const defaultValue =
    coupon == null
      ? ""
      : coupon.type === "fixed"
        ? String(coupon.value / 100)
        : String(coupon.value);

  return (
    <form
      action={async (formData) => {
        setError(null);
        try {
          await saveCouponAction(formData);
          router.refresh();
          toast.success(coupon ? "Coupon updated" : "Coupon created");
          onSaved?.();
        } catch (err) {
          if (isNextRedirectError(err)) throw err;
          const message =
            err instanceof Error ? err.message : "Could not save coupon.";
          setError(message);
          toast.danger(message);
        }
      }}
    >
      <AdminFieldGrid>
        {coupon ? <input type="hidden" name="id" value={coupon.id} /> : null}
        <label className={labelClassName()}>
          Code
          <input
            name="code"
            required
            defaultValue={coupon?.code ?? ""}
            className={`${fieldClassName()} uppercase`}
            placeholder="WELCOME10"
          />
        </label>
        <label className={labelClassName()}>
          Type
          <select
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value as CouponType)}
            className={fieldClassName()}
          >
            <option value="percent">Percent off</option>
            <option value="fixed">Fixed ₹ off</option>
          </select>
        </label>
        <label className={labelClassName()}>
          {type === "percent" ? "Percent (1–100)" : "Amount (₹)"}
          <input
            name="value"
            type="number"
            required
            min={type === "percent" ? 1 : 0.01}
            max={type === "percent" ? 100 : undefined}
            step={type === "percent" ? 1 : 0.01}
            defaultValue={defaultValue}
            className={fieldClassName()}
          />
        </label>
        <label className={labelClassName()}>
          Min order (₹)
          <input
            name="minOrderRupees"
            type="number"
            min={0}
            step={1}
            defaultValue={
              coupon ? String(coupon.minOrderPaise / 100) : "0"
            }
            className={fieldClassName()}
          />
        </label>
        {type === "percent" ? (
          <label className={labelClassName()}>
            Max discount (₹, optional)
            <input
              name="maxDiscountRupees"
              type="number"
              min={0}
              step={1}
              defaultValue={
                coupon?.maxDiscountPaise != null
                  ? String(coupon.maxDiscountPaise / 100)
                  : ""
              }
              className={fieldClassName()}
            />
          </label>
        ) : null}
        <label className={labelClassName()}>
          Usage limit (optional)
          <input
            name="usageLimit"
            type="number"
            min={1}
            step={1}
            defaultValue={
              coupon?.usageLimit != null ? String(coupon.usageLimit) : ""
            }
            className={fieldClassName()}
          />
        </label>
        <label className={labelClassName()}>
          Starts at (optional)
          <input
            name="startsAt"
            type="datetime-local"
            defaultValue={toDatetimeLocal(coupon?.startsAt ?? null)}
            className={fieldClassName()}
          />
        </label>
        <label className={labelClassName()}>
          Expires at (optional)
          <input
            name="expiresAt"
            type="datetime-local"
            defaultValue={toDatetimeLocal(coupon?.expiresAt ?? null)}
            className={fieldClassName()}
          />
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            name="active"
            defaultChecked={coupon?.active ?? true}
          />
          Active
        </label>
        {error ? (
          <p
            className={`text-sm text-red-700 ${adminFieldFullClassName()}`}
            role="alert"
          >
            {error}
          </p>
        ) : null}
        <div
          className={`flex flex-wrap items-center gap-2 ${adminFieldFullClassName()}`}
        >
          <AdminFormSubmitButton
            label={coupon ? "Save coupon" : "Create coupon"}
            pendingLabel={coupon ? "Saving…" : "Creating…"}
            icon={coupon ? "save" : "plus"}
          />
        </div>
      </AdminFieldGrid>
    </form>
  );
}

function CouponRowActions({
  id,
  onEdit,
}: {
  id: string;
  onEdit: (id: string) => void;
}) {
  const items: AdminMenuItem[] = [
    {
      id: "edit",
      type: "button",
      label: "Edit",
      icon: "pencil",
      onPress: () => onEdit(id),
    },
    {
      id: "delete",
      type: "form",
      label: "Delete",
      icon: "trash",
      actionKey: "deleteCoupon",
      fields: { id },
      confirmMessage: "Delete this coupon?",
      danger: true,
    },
  ];

  return <AdminActionsMenu items={items} />;
}

export function CouponsManager({
  coupons,
  supabase,
}: {
  coupons: AdminCouponRow[];
  supabase: boolean;
}) {
  const [modal, setModal] = useState<"create" | string | null>(null);
  const editing =
    modal && modal !== "create"
      ? (coupons.find((c) => c.id === modal) ?? null)
      : null;
  const isOpen = modal !== null;
  const { pageItems, page, setPage, totalPages, total, from, to } =
    useAdminTablePagination(coupons);

  return (
    <>
      {supabase ? (
        <div className="flex justify-end">
          <AdminIconButton
            label="Add coupon"
            icon="plus"
            variant="primary"
            showLabel
            onClick={() => setModal("create")}
          />
        </div>
      ) : null}

      <AdminTableShell>
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-outline-variant/20 bg-surface-container-low text-xs uppercase tracking-wide text-on-surface-variant">
            <tr>
              <th className="px-4 py-3 font-semibold">Code</th>
              <th className="px-4 py-3 font-semibold">Value</th>
              <th className="px-4 py-3 font-semibold">Min order</th>
              <th className="px-4 py-3 font-semibold">Usage</th>
              <th className="px-4 py-3 font-semibold">Expiry</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="w-12 px-4 py-3 font-semibold" />
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/15">
            {pageItems.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-on-surface-variant"
                >
                  No coupons yet.
                </td>
              </tr>
            ) : (
              pageItems.map((coupon) => (
                <tr key={coupon.id}>
                  <td className="px-4 py-3">
                    <p className="font-semibold tracking-wide text-on-surface">
                      {coupon.code}
                    </p>
                    <p className="text-xs capitalize text-on-surface-variant">
                      {coupon.type}
                    </p>
                  </td>
                  <td className="px-4 py-3 font-semibold text-on-surface">
                    {coupon.valueLabel}
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant">
                    {coupon.minOrderPaise > 0
                      ? formatINR(coupon.minOrderPaise / 100)
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant">
                    {coupon.usedCount}
                    {coupon.usageLimit != null ? ` / ${coupon.usageLimit}` : ""}
                  </td>
                  <td className="px-4 py-3 text-xs text-on-surface-variant">
                    {coupon.expiresAt
                      ? new Date(coupon.expiresAt).toLocaleString("en-IN")
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {supabase ? (
                      <AdminStatusSelect
                        action={setCouponActiveAction}
                        fields={{ id: coupon.id }}
                        name="active"
                        value={String(coupon.active)}
                        options={[...ACTIVE_OPTIONS]}
                        kind="publish"
                      />
                    ) : (
                      <span className="text-xs font-semibold">
                        {coupon.active ? "Active" : "Inactive"}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {supabase ? (
                      <CouponRowActions
                        id={coupon.id}
                        onEdit={(id) => setModal(id)}
                      />
                    ) : (
                      <span className="text-xs text-on-surface-variant">
                        View only
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
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
        isOpen={isOpen}
        onOpenChange={(open) => {
          if (!open) setModal(null);
        }}
        title={
          modal === "create"
            ? "Add coupon"
            : editing
              ? `Edit · ${editing.code}`
              : "Edit coupon"
        }
        size="lg"
      >
        {modal === "create" ? (
          <CouponFormFields key="create" onSaved={() => setModal(null)} />
        ) : editing ? (
          <CouponFormFields
            key={editing.id}
            coupon={editing}
            onSaved={() => setModal(null)}
          />
        ) : null}
      </AdminModal>
    </>
  );
}

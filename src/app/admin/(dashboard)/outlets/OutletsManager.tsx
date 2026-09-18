"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveOutletAction, setOutletPublishedAction } from "@/lib/admin/actions";
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
import { OutletRowActions } from "@/components/admin/OutletRowActions";
import { AdminModal } from "@/components/admin/AdminModal";
import {
  AdminStatusSelect,
  PUBLISH_HIDDEN_OPTIONS,
} from "@/components/admin/AdminStatusSelect";
import { isNextRedirectError } from "@/lib/admin/is-redirect-error";

export type AdminOutletRow = {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  hours: string | null;
  city: string;
  lat: number | null;
  lng: number | null;
  sortOrder: number;
  published: boolean;
};

function OutletFormFields({
  outlet,
  onSaved,
}: {
  outlet?: AdminOutletRow | null;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      action={async (formData) => {
        setError(null);
        try {
          await saveOutletAction(formData);
          router.refresh();
          onSaved?.();
        } catch (err) {
          if (isNextRedirectError(err)) throw err;
          setError(
            err instanceof Error ? err.message : "Could not save outlet.",
          );
        }
      }}
    >
      <AdminFieldGrid>
        {outlet ? <input type="hidden" name="id" value={outlet.id} /> : null}
        {outlet?.lat != null ? (
          <input type="hidden" name="lat" value={String(outlet.lat)} />
        ) : null}
        {outlet?.lng != null ? (
          <input type="hidden" name="lng" value={String(outlet.lng)} />
        ) : null}
        <label className={`${labelClassName()} ${adminFieldFullClassName()}`}>
          Name
          <input
            name="name"
            required
            defaultValue={outlet?.name ?? ""}
            className={fieldClassName()}
          />
        </label>
        <label className={`${labelClassName()} ${adminFieldFullClassName()}`}>
          Address
          <textarea
            name="address"
            rows={2}
            required
            defaultValue={outlet?.address ?? ""}
            className={fieldClassName()}
          />
        </label>
        <label className={labelClassName()}>
          Phone
          <input
            name="phone"
            defaultValue={outlet?.phone ?? ""}
            className={fieldClassName()}
          />
        </label>
        <label className={labelClassName()}>
          Hours
          <input
            name="hours"
            defaultValue={outlet?.hours ?? ""}
            className={fieldClassName()}
          />
        </label>
        <label className={labelClassName()}>
          Sort order
          <input
            name="sortOrder"
            type="number"
            defaultValue={outlet?.sortOrder ?? 0}
            className={fieldClassName()}
          />
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            name="published"
            defaultChecked={outlet?.published ?? true}
          />
          Published
        </label>
        {error ? (
          <p className={`text-sm text-red-700 ${adminFieldFullClassName()}`} role="alert">
            {error}
          </p>
        ) : null}
        <div className={`flex flex-wrap items-center gap-2 ${adminFieldFullClassName()}`}>
          <AdminFormSubmitButton
            label={outlet ? "Save outlet" : "Add outlet"}
            pendingLabel={outlet ? "Saving…" : "Creating…"}
            icon={outlet ? "save" : "plus"}
          />
        </div>
      </AdminFieldGrid>
    </form>
  );
}

export function OutletsManager({
  outlets,
  supabase,
}: {
  outlets: AdminOutletRow[];
  supabase: boolean;
}) {
  const [modal, setModal] = useState<"create" | string | null>(null);
  const editing =
    modal && modal !== "create"
      ? (outlets.find((o) => o.id === modal) ?? null)
      : null;
  const isOpen = modal !== null;

  return (
    <>
      {supabase ? (
        <div className="flex justify-end">
          <AdminIconButton
            label="Add outlet"
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
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Phone</th>
              <th className="px-4 py-3 font-semibold">Hours</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="w-12 px-4 py-3 font-semibold" />
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/15">
            {outlets.map((outlet) => (
              <tr key={outlet.id}>
                <td className="px-4 py-3">
                  <p className="font-semibold text-on-surface">{outlet.name}</p>
                  <p className="text-xs text-on-surface-variant">
                    {outlet.address}
                  </p>
                  {outlet.city ? (
                    <p className="text-xs text-outline">{outlet.city}</p>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-on-surface-variant">
                  {outlet.phone || "—"}
                </td>
                <td className="px-4 py-3 text-on-surface-variant">
                  {outlet.hours || "—"}
                </td>
                <td className="px-4 py-3">
                  {supabase ? (
                    <AdminStatusSelect
                      action={setOutletPublishedAction}
                      fields={{ id: outlet.id }}
                      name="published"
                      value={String(outlet.published)}
                      options={PUBLISH_HIDDEN_OPTIONS}
                      kind="publish"
                    />
                  ) : (
                    <span className="text-xs font-semibold">
                      {outlet.published ? "Published" : "Hidden"}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {supabase ? (
                    <OutletRowActions id={outlet.id} onEdit={(id) => setModal(id)} />
                  ) : (
                    <span className="text-xs text-on-surface-variant">
                      View only
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminTableShell>

      <AdminModal
        isOpen={isOpen}
        onOpenChange={(open) => {
          if (!open) setModal(null);
        }}
        title={
          modal === "create"
            ? "Add outlet"
            : editing
              ? `Edit · ${editing.name}`
              : "Edit outlet"
        }
        size="lg"
      >
        {modal === "create" ? (
          <OutletFormFields key="create" onSaved={() => setModal(null)} />
        ) : editing ? (
          <OutletFormFields
            key={editing.id}
            outlet={editing}
            onSaved={() => setModal(null)}
          />
        ) : null}
      </AdminModal>
    </>
  );
}

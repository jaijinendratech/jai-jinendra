import type { Metadata } from "next";
import { getAdminOutlets, getIntegrationStatus } from "@/lib/admin/queries";
import { saveOutletAction, setOutletPublishedAction } from "@/lib/admin/actions";
import {
  AdminCard,
  AdminPageHeader,
  AdminTableShell,
  NoticeBanner,
  fieldClassName,
  labelClassName,
} from "@/components/admin/ui";
import { AdminIconButton } from "@/components/admin/AdminIconButton";
import { OutletRowActions } from "@/components/admin/OutletRowActions";
import {
  AdminStatusSelect,
  PUBLISH_HIDDEN_OPTIONS,
} from "@/components/admin/AdminStatusSelect";

export const metadata: Metadata = {
  title: "Admin · Outlets",
  robots: { index: false, follow: false },
};

export default async function AdminOutletsPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; edit?: string }>;
}) {
  const { notice, edit } = await searchParams;
  const outlets = await getAdminOutlets();
  const { supabase } = getIntegrationStatus();
  const editing = edit ? outlets.find((o) => o.id === edit) : null;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Outlets"
        description={
          supabase
            ? "Flagship stores from Supabase outlets table."
            : "Static flagship outlets — connect Supabase to add/edit."
        }
      />
      <NoticeBanner notice={notice} />

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
                  <p className="text-xs text-on-surface-variant">{outlet.address}</p>
                  {outlet.city ? (
                    <p className="text-xs text-outline">{outlet.city}</p>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-on-surface-variant">{outlet.phone || "—"}</td>
                <td className="px-4 py-3 text-on-surface-variant">{outlet.hours || "—"}</td>
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
                    <OutletRowActions id={outlet.id} />
                  ) : (
                    <span className="text-xs text-on-surface-variant">View only</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminTableShell>

      {supabase ? (
        <AdminCard title={editing ? `Edit · ${editing.name}` : "Add outlet"}>
          <form action={saveOutletAction} className="grid gap-3 sm:grid-cols-2">
            {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
            {editing?.lat != null ? (
              <input type="hidden" name="lat" value={String(editing.lat)} />
            ) : null}
            {editing?.lng != null ? (
              <input type="hidden" name="lng" value={String(editing.lng)} />
            ) : null}
            <label className={`${labelClassName()} sm:col-span-2`}>
              Name
              <input
                name="name"
                required
                defaultValue={editing?.name ?? ""}
                className={fieldClassName()}
              />
            </label>
            <label className={`${labelClassName()} sm:col-span-2`}>
              Address
              <textarea
                name="address"
                rows={2}
                required
                defaultValue={editing?.address ?? ""}
                className={fieldClassName()}
              />
            </label>
            <label className={labelClassName()}>
              Phone
              <input
                name="phone"
                defaultValue={editing?.phone ?? ""}
                className={fieldClassName()}
              />
            </label>
            <label className={labelClassName()}>
              Hours
              <input
                name="hours"
                defaultValue={editing?.hours ?? ""}
                className={fieldClassName()}
              />
            </label>
            <label className={labelClassName()}>
              Sort order
              <input
                name="sortOrder"
                type="number"
                defaultValue={editing?.sortOrder ?? 0}
                className={fieldClassName()}
              />
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                name="published"
                defaultChecked={editing?.published ?? true}
              />
              Published
            </label>
            <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
              <AdminIconButton
                type="submit"
                label={editing ? "Update outlet" : "Save outlet"}
                icon={editing ? "save" : "plus"}
                variant="primary"
              />
              {editing ? (
                <AdminIconButton
                  as="link"
                  href="/admin/outlets"
                  label="Cancel edit"
                  icon="x"
                  variant="secondary"
                />
              ) : null}
            </div>
          </form>
        </AdminCard>
      ) : null}
    </div>
  );
}

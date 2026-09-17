import type { Metadata } from "next";
import { getAdminOutlets, getIntegrationStatus } from "@/lib/admin/queries";
import { saveOutletAction, deleteOutletAction } from "@/lib/admin/actions";
import {
  AdminCard,
  AdminPageHeader,
  AdminTableShell,
  NoticeBanner,
  fieldClassName,
  labelClassName,
  primaryBtnClassName,
} from "@/components/admin/ui";
import { ConfirmDeleteButton } from "@/components/admin/ui-client";
import { LuPlus } from "react-icons/lu";

export const metadata: Metadata = {
  title: "Admin · Outlets",
  robots: { index: false, follow: false },
};

export default async function AdminOutletsPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const { notice } = await searchParams;
  const outlets = await getAdminOutlets();
  const { supabase } = getIntegrationStatus();

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
              <th className="px-4 py-3 font-semibold">Actions</th>
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
                <td className="px-4 py-3 text-xs font-semibold">
                  {outlet.published ? "Published" : "Hidden"}
                </td>
                <td className="px-4 py-3">
                  {supabase ? (
                    <ConfirmDeleteButton action={deleteOutletAction} label="Delete">
                      <input type="hidden" name="id" value={outlet.id} />
                    </ConfirmDeleteButton>
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
        <AdminCard title="Add outlet">
          <form action={saveOutletAction} className="grid gap-3 sm:grid-cols-2">
            <label className={`${labelClassName()} sm:col-span-2`}>
              Name
              <input name="name" required className={fieldClassName()} />
            </label>
            <label className={`${labelClassName()} sm:col-span-2`}>
              Address
              <textarea name="address" rows={2} required className={fieldClassName()} />
            </label>
            <label className={labelClassName()}>
              Phone
              <input name="phone" className={fieldClassName()} />
            </label>
            <label className={labelClassName()}>
              Hours
              <input name="hours" className={fieldClassName()} />
            </label>
            <label className={labelClassName()}>
              Sort order
              <input name="sortOrder" type="number" defaultValue={0} className={fieldClassName()} />
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input type="checkbox" name="published" defaultChecked />
              Published
            </label>
            <button type="submit" className={`${primaryBtnClassName()} inline-flex items-center gap-2`}>
              <LuPlus className="h-4 w-4" />
              Save outlet
            </button>
          </form>
        </AdminCard>
      ) : null}
    </div>
  );
}

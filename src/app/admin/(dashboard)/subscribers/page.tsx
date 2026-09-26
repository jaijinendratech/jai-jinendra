import type { Metadata } from "next";
import { getAdminSubscribers } from "@/lib/admin/queries";
import { AdminEmpty, AdminPageHeader } from "@/components/admin/ui";

export const metadata: Metadata = {
  title: "Admin · Subscribers",
  robots: { index: false, follow: false },
};

export default async function AdminSubscribersPage() {
  const subscribers = await getAdminSubscribers();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Subscribers"
        description="Emails collected from the Welcome Offer."
      />

      {!subscribers.length ? (
        <AdminEmpty
          title="No subscribers yet"
          description="Welcome Offer signups will show here."
        />
      ) : (
        <div className="space-y-3">
          {subscribers.map((subscriber) => (
            <article
              key={subscriber.id}
              className="rounded-xl border border-outline-variant/25 bg-white p-5 shadow-sm"
            >
              <h2 className="text-lg font-bold text-on-surface">
                {subscriber.email}
              </h2>
              <p className="numeric mt-2 text-xs text-outline">
                {new Date(subscriber.createdAt).toLocaleString("en-IN")}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

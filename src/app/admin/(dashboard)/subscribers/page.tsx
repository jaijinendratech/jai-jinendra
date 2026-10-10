import type { Metadata } from "next";
import { getAdminSubscribers } from "@/lib/admin/queries";
import { AdminEmpty, AdminPageHeader } from "@/components/admin/ui";
import { SubscribersTable } from "./SubscribersTable";

export const metadata: Metadata = {
  title: "Admin · Subscribers",
  robots: { index: false, follow: false },
};

// Sending a campaign (server action on this page) batches through Resend.
export const maxDuration = 60;

export default async function AdminSubscribersPage() {
  const { subscribers, broadcastsReady } = await getAdminSubscribers();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Subscribers"
        description="Emails collected from the homepage newsletter. Send announcements and offers to everyone who has not unsubscribed."
      />

      {!subscribers.length ? (
        <AdminEmpty
          title="No subscribers yet"
          description="Newsletter signups will show here."
        />
      ) : (
        <SubscribersTable
          subscribers={subscribers}
          broadcastsReady={broadcastsReady}
        />
      )}
    </div>
  );
}

import { requireCustomer, getProfile } from "@/lib/auth";
import { AccountNav } from "@/components/account/AccountNav";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireCustomer("/login?next=/account");
  const profile = await getProfile(user.id);
  const greeting =
    profile?.full_name?.split(" ")[0] ||
    profile?.phone ||
    user.phone ||
    "there";

  return (
    <main className="container-jj py-6 md:py-10">
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Account" }]}
      />

      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
            My account
          </p>
          <h1 className="font-display mt-1 text-3xl font-semibold text-on-surface md:text-4xl">
            Namaste, {greeting}
          </h1>
        </div>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-[200px_minmax(0,1fr)] lg:grid-cols-[220px_minmax(0,1fr)]">
        <AccountNav />
        <div className="min-w-0">{children}</div>
      </div>
    </main>
  );
}

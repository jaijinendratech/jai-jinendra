import { redirect } from "next/navigation";

export default function AdminPromiseContentRedirect() {
  redirect("/admin/content/home");
}

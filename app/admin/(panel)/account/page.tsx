import { PageHead } from "@/components/admin/page-head";
import { requireUser } from "@/lib/auth/session";
import { PasswordForm } from "./password-form";

export const metadata = { title: "Change password" };

// Signed-in, per-request page: allowed to block instead of streaming a placeholder.
export const instant = false;

export default async function AccountPage() {
  const user = await requireUser("/admin/account");
  return (
    <>
      <PageHead title="Change password">Signed in as {user}.</PageHead>
      <PasswordForm />
    </>
  );
}

import type { Metadata } from "next";
import Account from "@/components/account/Account";
import FieldwornShell from "@/components/FieldwornShell";

export const metadata: Metadata = { title: "Sign in or create an account", robots: { index: false } };

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ signup?: string }> }) {
  const { signup } = await searchParams;
  return (
    <FieldwornShell>
      <Account initialMode={signup ? "signup" : "signin"} />
    </FieldwornShell>
  );
}

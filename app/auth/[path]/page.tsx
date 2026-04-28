import { viewPaths } from "@better-auth-ui/react/core";
import { notFound } from "next/navigation";
import { Auth } from "@/components/auth/auth";

export default async function AuthPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = await params;

  if (!Object.values(viewPaths.auth).includes(path)) {
    notFound();
  }

  return (
    <main className="flex min-h-svh items-center justify-center p-4 md:p-6">
      <Auth path={path} socialLayout="vertical" socialPosition="top" />
    </main>
  );
}

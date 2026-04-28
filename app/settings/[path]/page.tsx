import { viewPaths } from "@better-auth-ui/react/core";
import { notFound } from "next/navigation";
import { Settings } from "@/components/settings/settings";
import { SettingsPageShell } from "@/components/settings-page-shell";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = await params;

  if (!Object.values(viewPaths.settings).includes(path)) {
    notFound();
  }

  return (
    <SettingsPageShell>
      <Settings path={path} />
    </SettingsPageShell>
  );
}

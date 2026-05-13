import { SettingsPageShell } from "@/components/settings-page-shell"
import { listMemories } from "./_actions"
import { MemoriesClient } from "./_components/memories-client"

export default async function MemoriesPage() {
  const initialResult = await listMemories()

  return (
    <SettingsPageShell>
      <MemoriesClient initialResult={initialResult} />
    </SettingsPageShell>
  )
}

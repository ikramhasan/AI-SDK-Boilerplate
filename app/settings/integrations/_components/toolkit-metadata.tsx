import { ExternalLink, Wrench, Zap, Shield } from "lucide-react"
import type { ToolkitDetail } from "../types"

export function ToolkitMetadata({ toolkit }: { toolkit: ToolkitDetail }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      <MetadataCard
        icon={<Wrench className="size-4" />}
        label="Tools"
        value={String(toolkit.toolsCount)}
      />
      <MetadataCard
        icon={<Zap className="size-4" />}
        label="Triggers"
        value={String(toolkit.triggersCount)}
      />
      <MetadataCard
        icon={<Shield className="size-4" />}
        label="Auth"
        value={
          toolkit.authSchemes.length > 0
            ? toolkit.authSchemes.join(", ")
            : "None"
        }
      />
      {toolkit.appUrl && (
        <a
          href={toolkit.appUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg border p-3 text-sm transition-colors hover:bg-muted/50"
        >
          <ExternalLink className="size-4 text-muted-foreground" />
          <span className="truncate">Visit website</span>
        </a>
      )}
      {toolkit.baseUrl && (
        <div className="col-span-full flex items-center gap-2 rounded-lg border p-3 text-sm">
          <span className="text-xs text-muted-foreground">API:</span>
          <span className="truncate font-mono text-xs">{toolkit.baseUrl}</span>
        </div>
      )}
    </div>
  )
}

function MetadataCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <div className="text-muted-foreground">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}

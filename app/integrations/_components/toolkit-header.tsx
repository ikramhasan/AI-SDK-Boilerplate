import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConnectionBadge } from "./connection-badge";
import type { ToolkitDetail } from "../types";

export function ToolkitHeader({
  toolkit,
  actionLoading,
  onConnect,
  onDisconnect,
}: {
  toolkit: ToolkitDetail;
  actionLoading: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-4">
        {toolkit.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={toolkit.logo}
            alt={toolkit.name}
            className="size-14 rounded-xl"
          />
        ) : (
          <div className="flex size-14 items-center justify-center rounded-xl bg-primary/10 text-lg font-semibold text-primary">
            {toolkit.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {toolkit.name}
          </h1>
          {toolkit.description && (
            <p className="text-sm text-muted-foreground max-w-md">
              {toolkit.description}
            </p>
          )}
          <div className="flex items-center gap-2 pt-1">
            <ConnectionBadge isConnected={toolkit.isConnected} />
            {toolkit.categories.map((cat) => (
              <Badge key={cat.slug} variant="secondary" className="text-xs">
                {cat.name}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="shrink-0">
        {toolkit.isConnected ? (
          <Button
            variant="outline"
            size="sm"
            disabled={actionLoading}
            onClick={onDisconnect}
          >
            {actionLoading ? "Disconnecting…" : "Disconnect"}
          </Button>
        ) : (
          <Button size="sm" disabled={actionLoading} onClick={onConnect}>
            {actionLoading ? "Connecting…" : "Connect"}
          </Button>
        )}
      </div>
    </div>
  );
}

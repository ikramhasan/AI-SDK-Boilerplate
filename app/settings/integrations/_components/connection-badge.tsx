import { Badge } from "@/components/ui/badge"

export function ConnectionBadge({ isConnected }: { isConnected: boolean }) {
  return (
    <Badge
      variant="outline"
      className={
        isConnected
          ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400"
          : "border-muted text-muted-foreground"
      }
    >
      <div
        className={`mr-1.5 size-1.5 rounded-full ${
          isConnected ? "bg-green-500" : "bg-muted-foreground/40"
        }`}
      />
      {isConnected ? "Connected" : "Not connected"}
    </Badge>
  )
}

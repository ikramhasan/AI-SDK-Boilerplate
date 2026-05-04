"use client"

import { useSession } from "@better-auth-ui/react"
import { authClient } from "@/lib/auth-client"
import { useState } from "react"
import { toast } from "sonner"

export function ImpersonationBanner() {
  const { data: session } = useSession()
  const [stopping, setStopping] = useState(false)

  const impersonatedBy = (session?.session as Record<string, unknown>)?.impersonatedBy as
    | string
    | null
    | undefined

  if (!impersonatedBy) return null

  const handleStopImpersonating = async () => {
    setStopping(true)
    try {
      await authClient.admin.stopImpersonating()
      // Full page navigation to re-fetch the server-side auth token
      window.location.href = "/admin/users"
    } catch {
      toast.error("Failed to stop impersonating")
      setStopping(false)
    }
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-100 flex items-center justify-center gap-3 bg-amber-500 px-4 py-2 text-sm font-medium text-black">
      <span>
        You are currently impersonating{" "}
        <strong>{session?.user?.name || session?.user?.email || "a user"}</strong>
      </span>
      <button
        onClick={handleStopImpersonating}
        disabled={stopping}
        className="rounded-md bg-black/20 px-3 py-1 text-xs font-semibold transition-colors hover:bg-black/30 disabled:opacity-50"
      >
        {stopping ? "Stopping…" : "Stop Impersonating"}
      </button>
    </div>
  )
}

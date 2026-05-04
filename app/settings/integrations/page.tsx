"use client"

import { useState, useMemo } from "react"
import { useDebounce } from "@uidotdev/usehooks"
import Link from "next/link"
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import {
  useToolkits,
  useConnectToolkit,
  useDisconnectToolkit,
} from "@/lib/integrations/hooks"
import type { ToolkitListItem } from "./types"

export default function IntegrationsPage() {
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 350)

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useToolkits(debouncedSearch)

  const connectMutation = useConnectToolkit()
  const disconnectMutation = useDisconnectToolkit()

  const toolkits = useMemo(
    () => data?.pages.flatMap((p) => p.toolkits) ?? [],
    [data]
  )
  const connected = useMemo(
    () => data?.pages[0]?.connectedToolkits ?? [],
    [data]
  )

  const totalPages = data?.pages[0]?.totalPages ?? null
  const currentPage = data?.pages.length ?? 0
  const available = toolkits

  // Track which toolkit slug currently has a pending connect/disconnect so the
  // corresponding button can show a loading state. `connectMutation.variables`
  // is a slug; `disconnectMutation.variables` is a connectedAccountId, so we
  // resolve it back to a slug via the connected toolkits list. Guarding on
  // `isPending` ensures the disabled state clears after both success and error.
  const connectingSlug = connectMutation.isPending
    ? (connectMutation.variables ?? null)
    : null
  const disconnectingSlug = disconnectMutation.isPending
    ? (connected.find(
        (t) => t.connectedAccountId === disconnectMutation.variables
      )?.slug ?? null)
    : null
  const actionSlug = connectingSlug ?? disconnectingSlug

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex h-dvh flex-col">
        <header className="flex h-12 shrink-0 items-center px-4">
          <SidebarTrigger />
          <span className="ml-2 text-sm font-medium text-muted-foreground">
            Integrations
          </span>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-2xl space-y-6 p-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Integrations
              </h1>
              <p className="text-sm text-muted-foreground">
                Connect your accounts so the AI can work with your tools
              </p>
            </div>

            <Input
              placeholder="Search integrations…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner />
              </div>
            ) : (
              <>
                {connected.length > 0 && (
                  <ConnectedSection
                    toolkits={connected}
                    actionSlug={actionSlug}
                    onDisconnect={(id) => disconnectMutation.mutate(id)}
                  />
                )}

                {available.length > 0 && (
                  <AvailableSection
                    toolkits={available}
                    totalPages={totalPages}
                    search={debouncedSearch}
                    actionSlug={actionSlug}
                    onConnect={(slug) => connectMutation.mutate(slug)}
                  />
                )}

                {toolkits.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <p className="text-sm">
                      {search
                        ? "No integrations match your search"
                        : "No integrations available"}
                    </p>
                  </div>
                )}

                {hasNextPage && (
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <Button
                      variant="outline"
                      disabled={isFetchingNextPage}
                      onClick={() => fetchNextPage()}
                    >
                      {isFetchingNextPage
                        ? "Loading…"
                        : `Load more (page ${currentPage} of ${totalPages})`}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

// ---------------------------------------------------------------------------
// Connected section
// ---------------------------------------------------------------------------

function ConnectedSection({
  toolkits,
  actionSlug,
  onDisconnect,
}: {
  toolkits: ToolkitListItem[]
  actionSlug: string | null
  onDisconnect: (connectedAccountId: string) => void
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-medium text-muted-foreground">
        Connected ({toolkits.length})
      </h2>
      <div className="rounded-xl border">
        {toolkits.map((t, i) => (
          <div key={`connected-${t.slug}`}>
            <Link
              href={`/settings/integrations/${t.slug}?name=${encodeURIComponent(t.name)}`}
              className={`flex items-center justify-between px-4 py-3 transition-colors hover:bg-muted/50 ${
                i === 0 ? "rounded-t-xl" : ""
              } ${i === toolkits.length - 1 ? "rounded-b-xl" : ""}`}
            >
              <div className="flex items-center gap-3">
                <ToolkitLogo name={t.name} logo={t.logo} />
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <Badge variant="outline" className="text-xs text-green-600">
                    Connected
                  </Badge>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={actionSlug === t.slug}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onDisconnect(t.connectedAccountId!)
                }}
              >
                {actionSlug === t.slug ? "Disconnecting…" : "Disconnect"}
              </Button>
            </Link>
            {i < toolkits.length - 1 && <Separator />}
          </div>
        ))}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Available section
// ---------------------------------------------------------------------------

function AvailableSection({
  toolkits,
  totalPages,
  search,
  actionSlug,
  onConnect,
}: {
  toolkits: ToolkitListItem[]
  totalPages: number | null
  search: string
  actionSlug: string | null
  onConnect: (slug: string) => void
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-medium text-muted-foreground">
        Available ({toolkits.length}
        {totalPages && !search ? ` of ~${totalPages * 20}` : ""})
      </h2>
      <div className="rounded-xl border">
        {toolkits.map((t, i) => (
          <div key={`available-${t.slug}`}>
            <Link
              href={`/settings/integrations/${t.slug}?name=${encodeURIComponent(t.name)}`}
              className={`flex items-center justify-between px-4 py-3 transition-colors hover:bg-muted/50 ${
                i === 0 ? "rounded-t-xl" : ""
              } ${i === toolkits.length - 1 ? "rounded-b-xl" : ""}`}
            >
              <div className="flex items-center gap-3">
                <ToolkitLogo name={t.name} logo={t.logo} muted />
                <p className="text-sm font-medium">{t.name}</p>
              </div>
              <Button
                size="sm"
                disabled={actionSlug === t.slug}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onConnect(t.slug)
                }}
              >
                {actionSlug === t.slug ? "Connecting…" : "Connect"}
              </Button>
            </Link>
            {i < toolkits.length - 1 && <Separator />}
          </div>
        ))}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Shared logo component
// ---------------------------------------------------------------------------

function ToolkitLogo({
  name,
  logo,
  muted,
}: {
  name: string
  logo?: string
  muted?: boolean
}) {
  if (logo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={logo} alt={name} className="size-8 rounded-lg" />
    )
  }
  return (
    <div
      className={`flex size-8 items-center justify-center rounded-lg text-xs font-medium ${
        muted ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
      }`}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

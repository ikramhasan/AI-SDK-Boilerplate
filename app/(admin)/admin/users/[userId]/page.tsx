"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Pagination, PaginationContent, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis,
} from "@/components/ui/pagination"
import { Spinner } from "@/components/ui/spinner"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { formatDistanceToNow, format } from "date-fns"
import { getUser, getUserChats, type DetailedUser, type UserChat } from "../_actions"

export default function UserDetailPage() {
  const params = useParams<{ userId: string }>()
  const router = useRouter()
  const [user, setUser] = useState<DetailedUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getUser(params.userId)
      .then(setUser)
      .finally(() => setLoading(false))
  }, [params.userId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner className="size-6" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-6 space-y-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/admin/users")}>
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
          Back to users
        </Button>
        <p className="text-muted-foreground">User not found.</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/admin/users")}>
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
          Back to users
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Avatar className="size-14">
          <AvatarImage src={user.imageUrl} alt={user.name} />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{user.name}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <div className="flex gap-2 ml-auto">
          <Badge variant={user.role === "admin" ? "default" : "outline"}>{user.role}</Badge>
          <Badge variant={user.banned ? "destructive" : "default"}>
            {user.banned ? "banned" : "active"}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="chats">Chats</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
              <InfoRow label="User ID" value={user.id} />
              <InfoRow label="Email" value={user.email} />
              <InfoRow label="Email verified" value={user.emailVerified ? "Yes" : "No"} />
              <InfoRow label="Phone" value={user.phone || "—"} />
              <InfoRow label="Role" value={user.role} />
              <InfoRow label="Status" value={user.banned ? "Banned" : "Active"} />
              <InfoRow
                label="Joined"
                value={format(new Date(user.createdAt), "PPP")}
              />
              <InfoRow
                label="Last sign in"
                value={
                  user.lastSignInAt
                    ? formatDistanceToNow(new Date(user.lastSignInAt), { addSuffix: true })
                    : "Never"
                }
              />
              {user.externalAccounts.length > 0 && (
                <InfoRow
                  label="Connected accounts"
                  value={user.externalAccounts.map((a) => a.provider).join(", ")}
                />
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="chats" className="mt-4">
          <UserChatsTable userId={params.userId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p className="font-medium mt-0.5">{value}</p>
    </div>
  )
}

const CHAT_PAGE_SIZE = 20

type ChatSortKey = "title" | "messageCount" | "createdAt"
type ChatSortDir = "asc" | "desc"

function UserChatsTable({ userId }: { userId: string }) {
  const router = useRouter()
  const [chats, setChats] = useState<UserChat[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<ChatSortKey>("createdAt")
  const [sortDir, setSortDir] = useState<ChatSortDir>("desc")
  const [page, setPage] = useState(1)

  useEffect(() => {
    getUserChats(userId)
      .then(setChats)
      .finally(() => setLoading(false))
  }, [userId])

  const toggleSort = (key: ChatSortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
    setPage(1)
  }

  const sortIndicator = (key: ChatSortKey) =>
    sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : ""

  const filtered = useMemo(() => {
    let result = chats
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((c) => c.title.toLowerCase().includes(q))
    }
    return [...result].sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      return sortDir === "asc" ? cmp : -cmp
    })
  }, [chats, search, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / CHAT_PAGE_SIZE))
  const paginatedChats = filtered.slice(
    (page - 1) * CHAT_PAGE_SIZE,
    page * CHAT_PAGE_SIZE
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="size-6" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Input
          placeholder="Search by title…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("title")}>
                Title{sortIndicator("title")}
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("messageCount")}>
                Messages{sortIndicator("messageCount")}
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("createdAt")}>
                Created{sortIndicator("createdAt")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedChats.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                  No chats found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedChats.map((chat) => (
                <TableRow
                  key={chat.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/admin/chats/${chat.id}`)}
                >
                  <TableCell className="font-medium">{chat.title}</TableCell>
                  <TableCell>{chat.messageCount}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDistanceToNow(new Date(chat.createdAt), { addSuffix: true })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground whitespace-nowrap">
          Showing {paginatedChats.length} of {filtered.length} chats
        </p>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(1, p - 1)) }}
                aria-disabled={page === 1}
                className={page === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
              if (
                totalPages <= 7 ||
                p === 1 ||
                p === totalPages ||
                Math.abs(p - page) <= 1
              ) {
                return (
                  <PaginationItem key={p}>
                    <PaginationLink
                      href="#"
                      isActive={p === page}
                      onClick={(e) => { e.preventDefault(); setPage(p) }}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                )
              }
              if (p === 2 && page > 3) {
                return <PaginationItem key={p}><PaginationEllipsis /></PaginationItem>
              }
              if (p === totalPages - 1 && page < totalPages - 2) {
                return <PaginationItem key={p}><PaginationEllipsis /></PaginationItem>
              }
              return null
            })}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => { e.preventDefault(); setPage((p) => Math.min(totalPages, p + 1)) }}
                aria-disabled={page === totalPages}
                className={page === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}

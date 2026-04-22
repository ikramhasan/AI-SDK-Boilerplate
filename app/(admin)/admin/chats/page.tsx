"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
  Pagination, PaginationContent, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis,
} from "@/components/ui/pagination"
import { Spinner } from "@/components/ui/spinner"
import { formatDistanceToNow } from "date-fns"
import { useRouter } from "next/navigation"
import { getChats, type AdminChat } from "./_actions"

const PAGE_SIZE = 20

type SortKey = "title" | "userName" | "messageCount" | "createdAt"
type SortDir = "asc" | "desc"

export default function ChatsPage() {
  const [chats, setChats] = useState<AdminChat[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("createdAt")
  const [sortDir, setSortDir] = useState<SortDir>("desc")
  const [page, setPage] = useState(1)
  const router = useRouter()

  const fetchChats = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getChats()
      setChats(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchChats()
  }, [fetchChats])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
    setPage(1)
  }

  const sortIndicator = (key: SortKey) =>
    sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : ""

  const filtered = useMemo(() => {
    let result = chats
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.userName.toLowerCase().includes(q) ||
          c.userEmail.toLowerCase().includes(q)
      )
    }
    return [...result].sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      return sortDir === "asc" ? cmp : -cmp
    })
  }, [chats, search, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginatedChats = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="size-6" />
      </div>
    )
  }

  return (
    <div className="space-y-4 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Chats</h1>
        <p className="text-sm text-muted-foreground">
          View all user conversations
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Input
          placeholder="Search by title, user name, or email…"
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
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("userName")}>
                User{sortIndicator("userName")}
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
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
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
                  <TableCell>
                    <div>
                      <div className="text-sm">{chat.userName}</div>
                      <div className="text-xs text-muted-foreground">{chat.userEmail}</div>
                    </div>
                  </TableCell>
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

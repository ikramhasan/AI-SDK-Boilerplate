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
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { ThumbsUpIcon, ThumbsDownIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { getFeedbacks, type AdminFeedback } from "./_actions"

const PAGE_SIZE = 20

type SortKey = "userName" | "chatTitle" | "rating" | "createdAt"
type SortDir = "asc" | "desc"

export default function FeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState<AdminFeedback[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [ratingFilter, setRatingFilter] = useState<"all" | "like" | "dislike">("all")
  const [sortKey, setSortKey] = useState<SortKey>("createdAt")
  const [sortDir, setSortDir] = useState<SortDir>("desc")
  const [page, setPage] = useState(1)
  const router = useRouter()

  const fetchFeedbacks = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getFeedbacks()
      setFeedbacks(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFeedbacks()
  }, [fetchFeedbacks])

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
    let result = feedbacks
    if (ratingFilter !== "all") {
      result = result.filter((f) => f.rating === ratingFilter)
    }
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (f) =>
          f.userName.toLowerCase().includes(q) ||
          f.userEmail.toLowerCase().includes(q) ||
          f.chatTitle.toLowerCase().includes(q) ||
          (f.comment && f.comment.toLowerCase().includes(q))
      )
    }
    return [...result].sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      return sortDir === "asc" ? cmp : -cmp
    })
  }, [feedbacks, search, ratingFilter, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const likeCount = feedbacks.filter((f) => f.rating === "like").length
  const dislikeCount = feedbacks.filter((f) => f.rating === "dislike").length

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
        <h1 className="text-2xl font-semibold tracking-tight">Feedbacks</h1>
        <p className="text-sm text-muted-foreground">
          View all user feedback on AI responses
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Input
          placeholder="Search by user, chat title, or comment…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="max-w-sm"
        />
        <div className="flex items-center gap-1.5">
          <Badge
            variant={ratingFilter === "all" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => { setRatingFilter("all"); setPage(1) }}
          >
            All ({feedbacks.length})
          </Badge>
          <Badge
            variant={ratingFilter === "like" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => { setRatingFilter("like"); setPage(1) }}
          >
            <ThumbsUpIcon className="mr-1 size-3" /> {likeCount}
          </Badge>
          <Badge
            variant={ratingFilter === "dislike" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => { setRatingFilter("dislike"); setPage(1) }}
          >
            <ThumbsDownIcon className="mr-1 size-3" /> {dislikeCount}
          </Badge>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("userName")}>
                User{sortIndicator("userName")}
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("chatTitle")}>
                Chat{sortIndicator("chatTitle")}
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("rating")}>
                Rating{sortIndicator("rating")}
              </TableHead>
              <TableHead>Comment</TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("createdAt")}>
                Date{sortIndicator("createdAt")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No feedbacks found.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((fb) => (
                <TableRow
                  key={fb.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/admin/chats/${fb.chatId}`)}
                >
                  <TableCell>
                    <div>
                      <div className="text-sm">{fb.userName}</div>
                      <div className="text-xs text-muted-foreground">{fb.userEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate font-medium">
                    {fb.chatTitle}
                  </TableCell>
                  <TableCell>
                    {fb.rating === "like" ? (
                      <ThumbsUpIcon className="size-4 text-green-500" />
                    ) : (
                      <ThumbsDownIcon className="size-4 text-red-500" />
                    )}
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate text-sm text-muted-foreground">
                    {fb.comment || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDistanceToNow(new Date(fb.createdAt), { addSuffix: true })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground whitespace-nowrap">
          Showing {paginated.length} of {filtered.length} feedbacks
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

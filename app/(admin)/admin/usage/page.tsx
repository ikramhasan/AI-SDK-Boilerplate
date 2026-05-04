"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import {
  Pagination, PaginationContent, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis,
} from "@/components/ui/pagination"
import { Spinner } from "@/components/ui/spinner"
import { format, formatDistanceToNow, startOfDay, endOfDay } from "date-fns"
import { type DateRange } from "react-day-picker"
import { getUsageRecords, type UsageRecord } from "./_actions"

const PAGE_SIZE = 20

type SortKey = "cost" | "totalTokens" | "inputTokens" | "outputTokens" | "createdAt" | "userName" | "model"
type SortDir = "asc" | "desc"

function formatCost(cost: number) {
  return `$${cost.toFixed(6)}`
}

function formatTokens(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

export default function UsagePage() {
  const [records, setRecords] = useState<UsageRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [sourceFilter, setSourceFilter] = useState<string>("all")
  const [modelFilter, setModelFilter] = useState<string>("all")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [sortKey, setSortKey] = useState<SortKey>("createdAt")
  const [sortDir, setSortDir] = useState<SortDir>("desc")
  const [page, setPage] = useState(1)

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getUsageRecords()
      setRecords(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchRecords() }, [fetchRecords])

  const models = useMemo(() => [...new Set(records.map((r) => r.model).filter((m): m is string => !!m))].sort(), [records])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else { setSortKey(key); setSortDir("desc") }
    setPage(1)
  }

  const sortIndicator = (key: SortKey) =>
    sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : ""

  const filtered = useMemo(() => {
    let result = records

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (r) =>
          r.userName.toLowerCase().includes(q) ||
          r.userEmail.toLowerCase().includes(q) ||
          (r.model?.toLowerCase().includes(q) ?? false) ||
          (r.toolName?.toLowerCase().includes(q) ?? false)
      )
    }
    if (sourceFilter !== "all") {
      result = result.filter((r) => r.source === sourceFilter)
    }
    if (modelFilter !== "all") {
      result = result.filter((r) => r.model === modelFilter)
    }
    if (dateRange?.from) {
      const from = startOfDay(dateRange.from).getTime()
      const to = dateRange.to ? endOfDay(dateRange.to).getTime() : endOfDay(dateRange.from).getTime()
      result = result.filter((r) => r.createdAt >= from && r.createdAt <= to)
    }

    return [...result].sort((a, b) => {
      const aVal = a[sortKey] ?? ""
      const bVal = b[sortKey] ?? ""
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      return sortDir === "asc" ? cmp : -cmp
    })
  }, [records, search, sourceFilter, modelFilter, dateRange, sortKey, sortDir])

  // Stats computed from filtered data
  const stats = useMemo(() => {
    const totalCost = filtered.reduce((s, r) => s + r.cost, 0)
    const totalTokensSum = filtered.reduce((s, r) => s + r.totalTokens, 0)
    const totalInput = filtered.reduce((s, r) => s + r.inputTokens, 0)
    const totalOutput = filtered.reduce((s, r) => s + r.outputTokens, 0)

    // Top users by cost
    const userCostMap = new Map<string, { userId: string; name: string; email: string; cost: number }>()
    for (const r of filtered) {
      const existing = userCostMap.get(r.userId)
      if (existing) existing.cost += r.cost
      else
        userCostMap.set(r.userId, {
          userId: r.userId,
          name: r.userName,
          email: r.userEmail,
          cost: r.cost,
        })
    }
    const topUsers = [...userCostMap.values()]
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 5)

    return { totalCost, totalTokensSum, totalInput, totalOutput, topUsers, requestCount: filtered.length }
  }, [filtered])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const clearFilters = () => {
    setSearch("")
    setSourceFilter("all")
    setModelFilter("all")
    setDateRange(undefined)
    setPage(1)
  }

  const hasActiveFilters = search || sourceFilter !== "all" || modelFilter !== "all" || dateRange?.from

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="size-6" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Usage</h1>
        <p className="text-sm text-muted-foreground">
          Monitor API usage, token consumption, and costs
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card size="sm">
          <CardHeader>
            <CardDescription>Total Cost</CardDescription>
            <CardTitle className="text-2xl">${stats.totalCost.toFixed(4)}</CardTitle>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription>Total Tokens</CardDescription>
            <CardTitle className="text-2xl">{formatTokens(stats.totalTokensSum)}</CardTitle>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription>Input / Output</CardDescription>
            <CardTitle className="text-2xl">
              {formatTokens(stats.totalInput)} / {formatTokens(stats.totalOutput)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription>Requests</CardDescription>
            <CardTitle className="text-2xl">{stats.requestCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Top users by cost */}
      {stats.topUsers.length > 0 && (
        <Card size="sm">
          <CardHeader>
            <CardTitle>Top Users by Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.topUsers.map((u) => (
                <div key={u.userId} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium">{u.name}</span>
                    <span className="ml-2 text-muted-foreground">{u.email}</span>
                  </div>
                  <span className="font-mono">{formatCost(u.cost)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search user, email, or model…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="max-w-xs"
        />
        <Select value={sourceFilter} onValueChange={(v) => { setSourceFilter(v); setPage(1) }}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sources</SelectItem>
            <SelectItem value="chat">Chat</SelectItem>
            <SelectItem value="title">Title</SelectItem>
            <SelectItem value="tool_call">Tool Call</SelectItem>
          </SelectContent>
        </Select>
        <Select value={modelFilter} onValueChange={(v) => { setModelFilter(v); setPage(1) }}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All models</SelectItem>
            {models.map((m) => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="min-w-[200px] justify-start text-left font-normal">
              {dateRange?.from ? (
                dateRange.to ? (
                  <>{format(dateRange.from, "MMM d")} – {format(dateRange.to, "MMM d, yyyy")}</>
                ) : (
                  format(dateRange.from, "MMM d, yyyy")
                )
              ) : (
                <span className="text-muted-foreground">Date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={(range) => { setDateRange(range); setPage(1) }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear filters
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => toggleSort("userName")}
              >
                User{sortIndicator("userName")}
              </TableHead>
              <TableHead>Source</TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => toggleSort("model")}
              >
                Model / Tool{sortIndicator("model")}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none text-right"
                onClick={() => toggleSort("inputTokens")}
              >
                Input{sortIndicator("inputTokens")}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none text-right"
                onClick={() => toggleSort("outputTokens")}
              >
                Output{sortIndicator("outputTokens")}
              </TableHead>
              <TableHead className="text-right">Cache R/W</TableHead>
              <TableHead
                className="cursor-pointer select-none text-right"
                onClick={() => toggleSort("totalTokens")}
              >
                Total{sortIndicator("totalTokens")}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none text-right"
                onClick={() => toggleSort("cost")}
              >
                Cost{sortIndicator("cost")}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => toggleSort("createdAt")}
              >
                Time{sortIndicator("createdAt")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                  No usage records found.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <div>
                      <div className="text-sm font-medium">{r.userName}</div>
                      <div className="text-xs text-muted-foreground">{r.userEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={r.source === "chat" ? "default" : r.source === "tool_call" ? "secondary" : "outline"}>
                      {r.source}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {r.source === "tool_call" ? r.toolName ?? "—" : r.model}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {formatTokens(r.inputTokens)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {formatTokens(r.outputTokens)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {formatTokens(r.cacheReadTokens)} / {formatTokens(r.cacheWriteTokens)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {formatTokens(r.totalTokens)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {formatCost(r.cost)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                    {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground whitespace-nowrap">
          Showing {paginated.length} of {filtered.length} records
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

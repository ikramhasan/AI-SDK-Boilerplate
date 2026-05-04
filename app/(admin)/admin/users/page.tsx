"use client"

import { useState, useMemo, useEffect, useCallback, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HugeiconsIcon } from "@hugeicons/react"
import { MoreHorizontalCircle01Icon } from "@hugeicons/core-free-icons"
import {
  Pagination, PaginationContent, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis,
} from "@/components/ui/pagination"
import { Spinner } from "@/components/ui/spinner"
import { formatDistanceToNow } from "date-fns"
import {
  getUsers, banUser, unbanUser, makeAdmin, removeAdmin, deleteUser,
  type SerializedUser,
} from "./_actions"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"

const PAGE_SIZE = 20

type SortKey = "name" | "email" | "role" | "banned" | "createdAt"
type SortDir = "asc" | "desc"

export default function UsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<SerializedUser[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortKey, setSortKey] = useState<SortKey>("createdAt")
  const [sortDir, setSortDir] = useState<SortDir>("desc")
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getUsers(search || undefined, 500, 0)
      setUsers(result.users)
      setTotalCount(result.totalCount)
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

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
    let result = users
    if (roleFilter !== "all") {
      result = result.filter((u) => u.role === roleFilter)
    }
    if (statusFilter !== "all") {
      const isBanned = statusFilter === "banned"
      result = result.filter((u) => u.banned === isBanned)
    }
    return [...result].sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      return sortDir === "asc" ? cmp : -cmp
    })
  }, [users, roleFilter, statusFilter, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginatedUsers = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleAction = (e: React.MouseEvent, userId: string, action: string) => {
    e.stopPropagation()
    startTransition(async () => {
      switch (action) {
        case "ban": await banUser(userId); break
        case "unban": await unbanUser(userId); break
        case "make-admin": await makeAdmin(userId); break
        case "remove-admin": await removeAdmin(userId); break
        case "delete": await deleteUser(userId); break
      }
      await fetchUsers()
    })
  }

  const handleImpersonate = async (userId: string) => {
    try {
      const { error } = await authClient.admin.impersonateUser({
        userId,
      })
      if (error) {
        toast.error(error.message || "Failed to impersonate user")
        return
      }
      // Full page navigation is needed because the session token has changed
      // and the server-side token needs to be re-fetched from scratch
      window.location.href = "/chat"
    } catch {
      toast.error("Failed to impersonate user")
    }
  }

  return (
    <div className="space-y-4 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="text-sm text-muted-foreground">
          Manage all users of the platform
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="max-w-xs"
        />
        <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(1) }}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="banned">Banned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner className="size-6" />
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("name")}>
                    Name{sortIndicator("name")}
                  </TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("email")}>
                    Email{sortIndicator("email")}
                  </TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("role")}>
                    Role{sortIndicator("role")}
                  </TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("banned")}>
                    Status{sortIndicator("banned")}
                  </TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("createdAt")}>
                    Joined{sortIndicator("createdAt")}
                  </TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((user) => (
                    <TableRow
                      key={user.id}
                      className={`cursor-pointer ${isPending ? "opacity-60" : ""}`}
                      onClick={() => router.push(`/admin/users/${user.id}`)}
                    >
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === "admin" ? "default" : "outline"}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.banned ? "destructive" : "default"}>
                          {user.banned ? "banned" : "active"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              disabled={isPending}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <HugeiconsIcon icon={MoreHorizontalCircle01Icon} size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {user.role === "user" ? (
                              <DropdownMenuItem onClick={(e) => handleAction(e, user.id, "make-admin")}>
                                Make admin
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={(e) => handleAction(e, user.id, "remove-admin")}>
                                Remove admin
                              </DropdownMenuItem>
                            )}
                            {user.banned ? (
                              <DropdownMenuItem onClick={(e) => handleAction(e, user.id, "unban")}>
                                Unban user
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={(e) => handleAction(e, user.id, "ban")}>
                                Ban user
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {user.role !== "admin" && (
                              <DropdownMenuItem onClick={() => handleImpersonate(user.id)}>
                                Impersonate
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={(e) => handleAction(e, user.id, "delete")}
                            >
                              Delete user
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground whitespace-nowrap">
              Showing {paginatedUsers.length} of {filtered.length} users (total: {totalCount})
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
        </>
      )}
    </div>
  )
}

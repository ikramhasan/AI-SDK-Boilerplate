"use client"

import { useMemo, useState, useTransition } from "react"
import { toast } from "sonner"
import {
  BrainCircuitIcon,
  BotIcon,
  CheckIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
  UserRoundIcon,
  XIcon,
} from "lucide-react"
import { addMemory, deleteMemory, listMemories, updateMemory } from "../_actions"
import type { MemoryRecord } from "../_actions"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type MemoriesClientProps = {
  initialResult: Awaited<ReturnType<typeof listMemories>>
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value))
}

function MemorySourceBadge({ source }: { source: MemoryRecord["source"] }) {
  const Icon = source === "manual" ? UserRoundIcon : BotIcon
  const label = source === "manual" ? "Manual" : "AI"

  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
      <Icon className="size-3" />
      {label}
    </span>
  )
}

export function MemoriesClient({ initialResult }: MemoriesClientProps) {
  const [memories, setMemories] = useState<MemoryRecord[]>(
    initialResult.ok ? initialResult.data : []
  )
  const [error, setError] = useState(initialResult.ok ? null : initialResult.error)
  const [newMemory, setNewMemory] = useState("")
  const [search, setSearch] = useState("")
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [deleteMemoryId, setDeleteMemoryId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const filteredMemories = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return memories
    return memories.filter((memory) =>
      [memory.content, memory.title, memory.summary]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query))
    )
  }, [memories, search])

  const refresh = async () => {
    const result = await listMemories()
    if (!result.ok) {
      setError(result.error)
      toast.error(result.error)
      return
    }

    setError(null)
    setMemories(result.data)
  }

  const handleAdd = () => {
    const content = newMemory.trim()
    if (!content) return

    startTransition(async () => {
      const result = await addMemory(content)
      if (!result.ok) {
        toast.error(result.error)
        return
      }

      setNewMemory("")
      toast.success("Memory added")
      await refresh()
    })
  }

  const handleUpdate = (id: string, content: string) => {
    setPendingId(id)
    startTransition(async () => {
      const result = await updateMemory(id, content)
      setPendingId(null)

      if (!result.ok) {
        toast.error(result.error)
        return
      }

      toast.success("Memory updated")
      await refresh()
    })
  }

  const handleDelete = (id: string) => {
    setPendingId(id)
    startTransition(async () => {
      const result = await deleteMemory(id)
      setPendingId(null)

      if (!result.ok) {
        toast.error(result.error)
        return
      }

      setMemories((current) => current.filter((memory) => memory.id !== id))
      setDeleteMemoryId(null)
      toast.success("Memory deleted")
    })
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Memories</h1>
          <p className="text-sm text-muted-foreground">
            Review and manage the long-term context saved for your chats.
          </p>
        </div>
      </div>

      {error ? (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-destructive text-sm">
          {error}
        </div>
      ) : null}

      <Card className="gap-3 rounded-xl py-3 shadow-sm">
        <CardContent className="space-y-2 px-3">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <PlusIcon className="size-4" />
              Add Memory
            </CardTitle>
            <Button
              size="sm"
              disabled={isPending || !newMemory.trim()}
              onClick={handleAdd}
            >
              Add
            </Button>
          </div>
          <Textarea
            value={newMemory}
            onChange={(event) => setNewMemory(event.target.value)}
            placeholder="The user prefers concise answers."
            className="min-h-16 rounded-md px-3 py-2"
          />
        </CardContent>
      </Card>

      <section className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">
            Saved memories ({filteredMemories.length})
          </h2>
          <div className="relative sm:w-72">
            <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search memories"
              className="pl-9"
            />
          </div>
        </div>

        {filteredMemories.length > 0 ? (
          <div className="space-y-2">
            {filteredMemories.map((memory) => (
              <MemoryItem
                key={memory.id}
                memory={memory}
                disabled={isPending && pendingId === memory.id}
                onDelete={() => setDeleteMemoryId(memory.id)}
                onSave={(content) => handleUpdate(memory.id, content)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed px-4 py-12 text-center">
            <BrainCircuitIcon className="mb-3 size-8 text-muted-foreground" />
            <p className="text-sm font-medium">No memories found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add one manually or let chats save useful preferences over time.
            </p>
          </div>
        )}
      </section>

      <AlertDialog
        open={deleteMemoryId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteMemoryId(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete memory?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this saved memory. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                if (deleteMemoryId) {
                  handleDelete(deleteMemoryId)
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function MemoryItem({
  memory,
  disabled,
  onDelete,
  onSave,
}: {
  memory: MemoryRecord
  disabled: boolean
  onDelete: () => void
  onSave: (content: string) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(memory.content)

  return (
    <div className="flex gap-3 rounded-lg bg-card p-3 text-sm shadow-sm ring-1 ring-foreground/5 dark:ring-foreground/10">
      <div className="min-w-0 flex-1 space-y-2">
        {isEditing ? (
          <Textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            className="min-h-20 rounded-md py-2"
          />
        ) : (
          <p className="leading-6 text-pretty">{memory.content}</p>
        )}

        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <MemorySourceBadge source={memory.source} />
          <span>Updated {formatDate(memory.updatedAt)}</span>
        </div>
      </div>

      <div className="flex shrink-0 items-start gap-1">
        {isEditing ? (
          <>
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={disabled}
              onClick={() => {
                setDraft(memory.content)
                setIsEditing(false)
              }}
              aria-label="Cancel editing memory"
            >
              <XIcon className="size-4" />
            </Button>
            <Button
              size="icon-sm"
              disabled={disabled || !draft.trim()}
              onClick={() => {
                onSave(draft)
                setIsEditing(false)
              }}
              aria-label="Save memory"
            >
              <CheckIcon className="size-4" />
            </Button>
          </>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={disabled}
                aria-label="Memory actions"
              >
                <EllipsisVerticalIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setDraft(memory.content)
                  setIsEditing(true)
                }}
              >
                <PencilIcon className="text-muted-foreground" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={onDelete}
              >
                <Trash2Icon />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  )
}

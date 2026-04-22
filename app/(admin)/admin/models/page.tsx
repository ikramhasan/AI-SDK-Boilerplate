"use client"

import { useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Doc, Id } from "@/convex/_generated/dataModel"
import { Button } from "@/components/ui/button"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { HugeiconsIcon } from "@hugeicons/react"
import { MoreVerticalIcon } from "@hugeicons/core-free-icons"
import { AddModelDialog } from "./_components/add-model-dialog"
import { EditModelDialog } from "./_components/edit-model-dialog"

export default function ModelsPage() {
  const models = useQuery(api.models.list)
  const config = useQuery(api.aiConfig.getAdmin)
  const removeModel = useMutation(api.models.remove)
  const duplicateModel = useMutation(api.models.duplicate)

  const [deleteTarget, setDeleteTarget] = useState<{ id: Id<"models">; name: string } | null>(null)
  const [editModel, setEditModel] = useState<Omit<Doc<"models">, "apiKey"> | null>(null)

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await removeModel({ id: deleteTarget.id })
    } catch (error) {
      console.error("Failed to delete model:", error)
    } finally {
      setDeleteTarget(null)
    }
  }

  const handleDuplicate = async (id: Id<"models">) => {
    try {
      await duplicateModel({ id })
    } catch (error) {
      console.error("Failed to duplicate model:", error)
    }
  }

  const isActiveModel = (id: Id<"models">) => config?.modelId === id

  const formatCost = (model: Omit<Doc<"models">, "apiKey">) => {
    const { input, output } = model.costConfig
    return `$${input} / $${output}`
  }

  if (models === undefined) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Models</h1>
          <p className="text-sm text-muted-foreground">
            Manage AI models and provider configurations
          </p>
        </div>
        <AddModelDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All models</CardTitle>
          <CardDescription>
            Models available for your AI assistant
          </CardDescription>
        </CardHeader>
        <CardContent>
          {models.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm text-muted-foreground">
                No models configured yet. Add your first model to get started.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Cost (in/out)</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {models.map((model) => (
                  <TableRow key={model._id}>
                    <TableCell className="font-medium">{model.name}</TableCell>
                    <TableCell className="text-xs">{model.provider}</TableCell>
                    <TableCell className="text-xs">{formatCost(model)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <HugeiconsIcon icon={MoreVerticalIcon} size={16} />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => handleDuplicate(model._id)}>
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => setEditModel(model)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onSelect={() => setDeleteTarget({ id: model._id, name: model.name })}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit dialog — controlled externally */}
      {editModel && (
        <EditModelDialog
          model={editModel}
          open
          onOpenChange={(open) => { if (!open) setEditModel(null) }}
        />
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete model</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && isActiveModel(deleteTarget.id)
                ? `"${deleteTarget?.name}" is currently the active model. Deleting it will leave the assistant without a configured model.`
                : `Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

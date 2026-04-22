"use client"

import { useCallback, useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Doc } from "@/convex/_generated/dataModel"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  createModelFormState,
  getModelCostConfig,
  getModelProvider,
  isModelFormValid,
  type ModelFormField,
  ModelFormFields,
} from "./model-form"

type Props = {
  model: Omit<Doc<"models">, "apiKey">
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditModelDialog({ model, open, onOpenChange }: Props) {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(() => createModelFormState(model))

  const updateModel = useMutation(api.models.update)

  const updateField = useCallback((field: ModelFormField, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }, [])

  const isValid = isModelFormValid(form, { requireApiKey: false })

  const handleSave = async () => {
    if (!isValid) return
    setSaving(true)

    try {
      await updateModel({
        id: model._id,
        name: form.name.trim(),
        modelId: form.modelId.trim(),
        provider: getModelProvider(form),
        ...(form.providerType === "custom"
          ? { baseUrl: form.baseUrl.trim() }
          : {}),
        ...(form.apiKey.trim() ? { apiKey: form.apiKey.trim() } : {}),
        costConfig: getModelCostConfig(form),
      })
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to update model:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen)

    if (nextOpen) {
      setForm(createModelFormState(model))
    }
  }

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit model</DialogTitle>
        </DialogHeader>
        <ModelFormFields
          apiKeyPlaceholder="Leave blank to keep existing"
          form={form}
          idPrefix="edit-model"
          onFieldChange={updateField}
        />
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Cancel
          </Button>
          <Button disabled={!isValid || saving} onClick={handleSave}>
            {saving ? "Saving…" : "Update model"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

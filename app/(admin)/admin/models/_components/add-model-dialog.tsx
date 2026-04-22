"use client"

import type { ReactNode } from "react"
import { useCallback, useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  createEmptyModelFormState,
  getModelCostConfig,
  getModelProvider,
  isModelFormValid,
  type ModelFormField,
  ModelFormFields,
} from "./model-form"

type Props = {
  trigger?: ReactNode
}

export function AddModelDialog({ trigger }: Props) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(createEmptyModelFormState)

  const createModel = useMutation(api.models.create)

  const resetForm = useCallback(() => {
    setForm(createEmptyModelFormState())
  }, [])

  const updateField = useCallback((field: ModelFormField, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }, [])

  const isValid = isModelFormValid(form, { requireApiKey: true })

  const handleSave = async () => {
    if (!isValid) return
    setSaving(true)

    try {
      await createModel({
        name: form.name.trim(),
        modelId: form.modelId.trim(),
        provider: getModelProvider(form),
        ...(form.providerType === "custom"
          ? { baseUrl: form.baseUrl.trim() }
          : {}),
        apiKey: form.apiKey.trim(),
        costConfig: getModelCostConfig(form),
      })
      resetForm()
      setOpen(false)
    } catch (error) {
      console.error("Failed to create model:", error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) {
          resetForm()
        }
      }}
      open={open}
    >
      <DialogTrigger asChild>
        {trigger ?? <Button size="sm">Add model</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add model</DialogTitle>
        </DialogHeader>
        <ModelFormFields
          apiKeyPlaceholder="sk-..."
          form={form}
          idPrefix="add-model"
          onFieldChange={updateField}
        />
        <DialogFooter>
          <Button onClick={() => setOpen(false)} variant="outline">
            Cancel
          </Button>
          <Button disabled={!isValid || saving} onClick={handleSave}>
            {saving ? "Saving…" : "Add model"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

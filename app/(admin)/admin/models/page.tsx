"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ModelsPage() {
  const router = useRouter()

  useEffect(() => {
    // Models are now configured via the main admin page
    router.replace("/admin")
  }, [router])

  return (
    <div className="flex items-center justify-center p-12">
      <p className="text-sm text-muted-foreground">
        Models are now configured from the main admin page. Redirecting…
      </p>
    </div>
  )
}

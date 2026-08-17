"use client"

import { useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

export function WelcomeToast() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const shownRef = useRef(false)

  useEffect(() => {
    if (searchParams.get("welcome") !== "1") return
    if (shownRef.current) return
    shownRef.current = true

    toast.success("welcome to bunnylove mafia $$$")
    router.replace("/", { scroll: false })
  }, [searchParams, router])

  return null
}

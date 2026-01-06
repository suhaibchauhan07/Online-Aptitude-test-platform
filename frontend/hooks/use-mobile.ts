"use client"

import { useEffect, useState } from "react"

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const mq = window.matchMedia("(max-width: 768px)")
    const handler = (e: MediaQueryListEvent) => setIsMobile(Boolean(e.matches))
    setIsMobile(mq.matches)
    // modern browsers
    mq.addEventListener?.("change", handler as any)
    // fallback
    mq.addListener?.(handler as any)
    return () => {
      mq.removeEventListener?.("change", handler as any)
      mq.removeListener?.(handler as any)
    }
  }, [])

  return isMobile
}

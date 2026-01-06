"use client"

import * as React from "react"

export type ToastItem = {
  id: string | number
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  [key: string]: any
}

type UseToastResult = {
  toasts: ToastItem[]
  setToasts: React.Dispatch<React.SetStateAction<ToastItem[]>>
}

export function useToast(): UseToastResult {
  const [toasts, setToasts] = React.useState<ToastItem[]>([])
  return { toasts, setToasts }
}

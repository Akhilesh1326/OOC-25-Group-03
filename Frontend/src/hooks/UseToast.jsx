"use client"

// Simplified version of the toast hook
import { useState } from "react"


export function useToast() {
  const [toasts, setToasts] = useState([])

  const toast = (props) => {
    setToasts((prev) => [...prev, props])
    // In a real implementation, this would handle displaying and removing toasts
    console.log("Toast:", props)
  }

  return { toast, toasts }
}


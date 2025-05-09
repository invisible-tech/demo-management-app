"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function SubmitDemoRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace("/demos/register")
  }, [router])
  
  return null
} 
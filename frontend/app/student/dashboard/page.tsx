"use client"

import type React from "react"
import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import API_BASE_URL from "@/app/config/api"
import { Skeleton } from "@/components/ui/skeleton"

// Lazy load components with loading skeletons
const StudentStatsGrid = dynamic(() => import("@/components/dashboard/student/StudentStatsGrid"), {
  loading: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-8">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-32 rounded-2xl" />
      ))}
    </div>
  ),
  ssr: false // Client-side only
})

const RecentTestsList = dynamic(() => import("@/components/dashboard/student/RecentTestsList"), {
  loading: () => <Skeleton className="h-96 rounded-2xl" />,
  ssr: false
})

const ResultAnalytics = dynamic(() => import("@/components/dashboard/student/ResultAnalytics"), {
  loading: () => <Skeleton className="h-96 rounded-2xl" />,
  ssr: false
})

export default function StudentDashboard() {
  const [tests, setTests] = useState<any[]>([])
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true)
        const [tRes, rRes] = await Promise.all([
          fetch(`${API_BASE_URL}/student/tests/available`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }),
          fetch(`${API_BASE_URL}/student/results`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } })
        ])
        let tData: any[] = []
        if (tRes.ok) {
          const td = await tRes.json()
          tData = Array.isArray(td) ? td : Array.isArray(td?.data) ? td.data : []
        }
        let rData: any[] = []
        if (rRes.ok) {
          rData = await rRes.json()
        }
        setTests(tData)
        setResults(rData)
      } catch (e) {
        setError("Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-8 px-4 sm:px-6">
      <div className="container py-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-900 mb-8 drop-shadow-lg">Student Dashboard</h1>

        <StudentStatsGrid tests={tests} results={results} loading={loading} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <RecentTestsList tests={tests} loading={loading} />
          <ResultAnalytics results={results} loading={loading} />
        </div>
      </div>
    </div>
  )
}

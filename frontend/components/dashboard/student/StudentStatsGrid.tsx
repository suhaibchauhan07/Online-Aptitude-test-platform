"use client"

import React from "react"
import { Calendar, CheckCircle, AlertTriangle } from "lucide-react"
import { DashboardStatsCard } from "../DashboardStatsCard"

interface StudentStatsGridProps {
  tests: any[]
  results: any[]
  loading?: boolean
}

export default function StudentStatsGrid({ tests, results, loading = false }: StudentStatsGridProps) {
  const upcomingTestsCount = tests.filter(t => Date.now() < new Date(t.startTime).getTime()).length
  const completedTestsCount = results.length
  const avgScore = results.length 
    ? Math.round(results.reduce((a, r) => a + (Number(r.percentage) || 0), 0) / results.length) 
    : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-8">
      <DashboardStatsCard
        title="Upcoming Tests"
        value={upcomingTestsCount.toString()}
        description="Tests scheduled for you"
        icon={<Calendar className="h-6 w-6 text-primary-blue" />}
        loading={loading}
      />
      <DashboardStatsCard
        title="Tests Completed"
        value={completedTestsCount.toString()}
        description="Total tests taken"
        icon={<CheckCircle className="h-6 w-6 text-green-600" />}
        loading={loading}
      />
      <DashboardStatsCard
        title="Average Score"
        value={avgScore.toString() + "%"}
        description="Your performance"
        icon={<AlertTriangle className="h-6 w-6 text-amber-500" />}
        loading={loading}
      />
    </div>
  )
}

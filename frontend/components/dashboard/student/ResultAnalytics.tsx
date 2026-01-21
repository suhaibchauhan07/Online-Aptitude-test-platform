"use client"

import React from "react"
import { CheckCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface ResultAnalyticsProps {
  results: any[]
  loading?: boolean
}

export default function ResultAnalytics({ results, loading = false }: ResultAnalyticsProps) {
  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-blue-100 p-6 sm:p-8">
        <div className="mb-6 space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  const recentResults = [...results].sort((a,b)=>new Date(a.completedAt||a.createdAt).getTime()-new Date(b.completedAt||b.createdAt).getTime()).slice(-8)
  const avgScore = recentResults.length ? Math.round(recentResults.reduce((acc,r)=>acc + (Number(r.percentage)||0), 0) / recentResults.length) : 0
  const bestScore = recentResults.length ? Math.round(Math.max(...recentResults.map(r=>Number(r.percentage)||0))) : 0
  const totalObtained = recentResults.reduce((acc,r)=>acc + (Number(r.marksObtained)||0), 0)
  const totalPossible = recentResults.reduce((acc,r)=>acc + (Number(r.totalMarks)||0), 0)
  const lastResult = recentResults[recentResults.length-1]

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl hover:shadow-2xl border border-blue-100 p-6 sm:p-8 transition-transform duration-300">
      <div className="mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-blue-800 mb-1">Recent Result Analytics</h2>
        <p className="text-gray-500">Performance overview</p>
      </div>
      {results.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-blue-100 p-4 bg-gradient-to-br from-blue-50/60 to-indigo-50/40">
              <p className="text-xs text-gray-600">Average Score</p>
              <p className="text-2xl font-bold text-blue-800">{avgScore}%</p>
            </div>
            <div className="rounded-xl border border-blue-100 p-4 bg-gradient-to-br from-green-50/60 to-emerald-50/40">
              <p className="text-xs text-gray-600">Best Score</p>
              <p className="text-2xl font-bold text-green-800">{bestScore}%</p>
            </div>
            <div className="rounded-xl border border-blue-100 p-4 bg-gradient-to-br from-amber-50/60 to-yellow-50/40">
              <p className="text-xs text-gray-600">Marks Obtained</p>
              <p className="text-2xl font-bold text-amber-800">{totalObtained}/{totalPossible}</p>
            </div>
            <div className="rounded-xl border border-blue-100 p-4 bg-gradient-to-br from-slate-50/60 to-gray-50/40">
              <p className="text-xs text-gray-600">Last Test</p>
              <p className="text-sm font-semibold text-gray-800">{lastResult ? (lastResult.testId?.title || lastResult.testId?.testName || "Test") : "-"}</p>
              <p className="text-sm text-blue-700">{lastResult ? Math.round(Number(lastResult.percentage)||0) : 0}%</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-30" />
          <p>No results available</p>
        </div>
      )}
    </div>
  )
}

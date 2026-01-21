"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface RecentTestsListProps {
  tests: any[]
  loading?: boolean
}

export default function RecentTestsList({ tests, loading = false }: RecentTestsListProps) {
  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-blue-100 p-6 sm:p-8">
        <div className="mb-6 space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-blue-100 rounded-xl p-5">
              <div className="flex justify-between mb-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl hover:shadow-2xl border border-blue-100 p-6 sm:p-8 transition-transform duration-300">
      <div className="mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-blue-800 mb-1">Recent Tests</h2>
        <p className="text-gray-500">Latest scheduled tests</p>
      </div>
      {tests.length > 0 ? (
        <div className="space-y-6">
          {[...tests]
            .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
            .slice(0, 6)
            .map((test) => (
            <div key={test._id || test.id} className="border border-blue-100 rounded-xl p-5 bg-gradient-to-br from-blue-50/60 to-indigo-50/40 shadow-md hover:shadow-lg hover:scale-[1.02] transition-transform">
              <div className="flex justify-between items-start gap-3 mb-2">
                <h3 className="font-semibold text-gray-900 text-base sm:text-lg break-words">{test.title || test.testName}</h3>
                <Badge className={(Date.now() < new Date(test.startTime).getTime()) ? "bg-primary-blue shrink-0" : (Date.now() <= new Date(test.startTime).getTime() + (test.duration || 0) * 60000) ? "bg-green-600 shrink-0" : "bg-red-500 shrink-0"}>{(Date.now() < new Date(test.startTime).getTime()) ? "Upcoming" : (Date.now() <= new Date(test.startTime).getTime() + (test.duration || 0) * 60000) ? "Available" : "Expired"}</Badge>
              </div>
              <div className="text-sm text-gray-600 space-y-2">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                  <span>{new Date(test.startTime).toLocaleString()}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-blue-500" />
                  <span>{(test.duration || 0)} minutes</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Calendar className="h-12 w-12 mx-auto mb-2 opacity-30" />
          <p>No tests found</p>
        </div>
      )}
    </div>
  )
}

import React from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface StatsCardProps {
  title: string
  value: string
  description: string
  icon: React.ReactNode
  loading?: boolean
}

export function DashboardStatsCard({ title, value, description, icon, loading = false }: StatsCardProps) {
  if (loading) {
    return (
      <div className="rounded-2xl bg-white/80 backdrop-blur-md shadow-xl p-5 sm:p-6 h-full border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    )
  }

  return (
    <div className="group relative overflow-hidden border-0 rounded-2xl bg-white/80 backdrop-blur-md shadow-xl hover:shadow-2xl transform hover:scale-[1.03] transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="p-5 sm:p-6 relative z-10">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-xs sm:text-sm font-medium text-gray-600">{title}</h3>
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 text-primary-blue shadow-sm">{icon}</div>
        </div>
        <div className="space-y-1">
          <p className="text-xl sm:text-2xl font-extrabold text-blue-900">{value}</p>
          <p className="text-xs sm:text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </div>
  )
}

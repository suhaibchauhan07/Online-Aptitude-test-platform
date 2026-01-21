"use client"

import React from "react"
import { BarChart2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface RecentResult {
  id: string;
  testName: string;
  class: string;
  averageScore: number;
  passPercentage: number;
  completionRate: number;
  date: string;
}

interface RecentResultsListProps {
  recentResults: RecentResult[];
  loading?: boolean;
}

export default function RecentResultsList({ recentResults, loading = false }: RecentResultsListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i} className="border-none shadow-md">
              <CardContent className="p-5">
                <div className="flex justify-between mb-3">
                   <div className="space-y-2">
                     <Skeleton className="h-5 w-32" />
                     <Skeleton className="h-4 w-24" />
                   </div>
                   <Skeleton className="h-8 w-12" />
                </div>
                <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100">
                  <Skeleton className="h-8 rounded-md" />
                  <Skeleton className="h-8 rounded-md" />
                  <Skeleton className="h-8 rounded-md" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <BarChart2 className="mr-2 h-5 w-5 text-indigo-600" /> Recent Results
        </h2>
      </div>

      {recentResults.length > 0 ? (
        <div className="space-y-4">
          {recentResults.map((result) => (
            <Card key={result.id} className="border-none shadow-md hover:shadow-lg transition-all duration-300">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <div className="min-w-0 flex-1 mr-4">
                    <h3 className="font-semibold text-gray-800 truncate">{result.testName}</h3>
                    <p className="text-xs text-gray-500 truncate">{result.class}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 mb-0.5">Avg Score</div>
                    <span className={`text-lg font-bold ${result.averageScore >= 40 ? 'text-green-600' : 'text-orange-600'}`}>
                      {result.averageScore}%
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100">
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">Pass %</div>
                    <div className="font-semibold text-gray-700">{result.passPercentage}%</div>
                  </div>
                  <div className="text-center border-l border-gray-100">
                    <div className="text-xs text-gray-500 mb-1">Completion</div>
                    <div className="font-semibold text-gray-700">{result.completionRate}%</div>
                  </div>
                  <div className="text-center border-l border-gray-100">
                    <div className="text-xs text-gray-500 mb-1">Date</div>
                    <div className="font-semibold text-gray-700">{result.date}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-gray-50 border-dashed border-2 border-gray-200 shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <div className="p-3 bg-white rounded-full shadow-sm mb-3">
              <BarChart2 className="h-8 w-8 text-gray-300" />
            </div>
            <h3 className="font-medium text-gray-900">No results yet</h3>
            <p className="text-sm text-gray-500 mt-1">Student results will appear here once they complete tests.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

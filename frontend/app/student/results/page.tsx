"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Trophy, ChevronRight, Star, TrendingUp, Award, BarChart3, AlertCircle } from "lucide-react"
import API_BASE_URL from "@/app/config/api"

export default function MyResultsPage() {
  const [results, setResults] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${API_BASE_URL}/student/results`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
        if (!res.ok) throw new Error('Failed to load results')
        const data = await res.json()
        setResults(Array.isArray(data) ? data : [])
      } catch (e) {
        setError('Failed to load results')
      } finally {
        setLoading(false)
      }
    }
    fetchResults()
  }, [])

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600"
    if (percentage >= 60) return "text-blue-600"
    if (percentage >= 40) return "text-amber-600"
    return "text-red-600"
  }

  if (loading) {
  return (
        <div className="container mx-auto py-12 min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 font-medium">Loading your results...</p>
        </div>
      </div>
  )
}

  return (
      <div className="min-h-screen bg-gray-50/50 py-8 px-4 sm:px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Results</h1>
            <p className="text-gray-500 mt-1">Track your performance and view detailed reports</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 font-medium flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          )}

          {results.length === 0 && !error && (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <BarChart3 className="h-10 w-10 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No results yet</h3>
              <p className="text-gray-500 max-w-md text-center mb-6">You haven't completed any tests yet. Once you take a test, your results will appear here.</p>
              <Button asChild>
                <Link href="/student/tests">Browse Available Tests</Link>
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((r, index) => {
              const percentage = Math.round(r.percentage)
              const marksStr = `${Number(r.marksObtained)||0}/${Number(r.totalMarks)||0}`
              return (
                <Card 
                  key={r._id} 
                  className="group relative overflow-hidden bg-white border border-gray-100 hover:border-blue-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1"
                >
                  <CardHeader className="pb-3 pt-5 px-5">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="secondary" className={`${percentage >= 40 ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-red-50 text-red-700 hover:bg-red-100'} border-0 px-2.5 py-0.5`}>
                        {percentage >= 40 ? 'Passed' : 'Failed'}
                      </Badge>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {r.completedAt ? new Date(r.completedAt).toLocaleDateString() : '-'}
                      </span>
                    </div>
                    <CardTitle className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors break-words">
                      {r.testId?.title || r.testId?.testName || 'Test Name Unavailable'}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="px-5 pb-5">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Score</p>
                        <p className={`text-xl font-bold ${getScoreColor(percentage)}`}>{percentage}%</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Marks</p>
                        <p className="text-xl font-bold text-gray-900">{marksStr}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Performance</span>
                        <span className="font-medium text-gray-900">{percentage >= 80 ? 'Excellent' : percentage >= 60 ? 'Good' : percentage >= 40 ? 'Average' : 'Needs Improvement'}</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${
                            percentage >= 80 ? 'bg-green-500' : percentage >= 60 ? 'bg-blue-500' : percentage >= 40 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-gray-50">
                      <Button 
                        asChild 
                        className="w-full bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 hover:border-blue-300 shadow-sm"
                        variant="outline"
                      >
                        <Link href={`/student/results/${typeof r.testId === 'object' && r.testId ? r.testId._id : r.testId}`} className="flex items-center justify-center gap-2">
                          <span>View Full Report</span>
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
  )
}

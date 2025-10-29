"use client"
import { useEffect, useState } from "react"
import { StudentLayout } from "@/components/student-layout"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Trophy, ChevronRight, Star, TrendingUp, Award } from "lucide-react"

export default function MyResultsPage() {
  const [results, setResults] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true)
        const res = await fetch('http://localhost:5000/api/student/results', {
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
    if (percentage >= 80) return "text-green-600 bg-gradient-to-br from-green-100 to-emerald-100"
    if (percentage >= 60) return "text-blue-600 bg-gradient-to-br from-blue-100 to-cyan-100"
    if (percentage >= 40) return "text-orange-600 bg-gradient-to-br from-orange-100 to-yellow-100"
    return "text-red-600 bg-gradient-to-br from-red-100 to-rose-100"
  }

  const getScoreIcon = (percentage: number) => {
    if (percentage >= 80) return <Trophy className="h-4 w-4" />
    if (percentage >= 60) return <Award className="h-4 w-4" />
    if (percentage >= 40) return <Star className="h-4 w-4" />
    return <TrendingUp className="h-4 w-4" />
  }

  if (loading) {
  return (
    <StudentLayout>
        <div className="container mx-auto py-12 min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 bg-gradient-to-br from-blue-100 to-indigo-100 p-4"></div>
            <p className="text-gray-600 font-medium">Loading your results...</p>
        </div>
      </div>
    </StudentLayout>
  )
}

  return (
    <StudentLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative container mx-auto py-12 px-6">
            <div className="flex items-center space-x-3 mb-2">
              <Trophy className="h-8 w-8 text-yellow-300 animate-pulse" />
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                My Results
              </h1>
            </div>
            <p className="text-xl text-blue-100 mb-6">Track your academic progress and achievements</p>
            {results.length > 0 && (
              <div className="flex items-center space-x-6 text-blue-100">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="font-medium">{results.length} completed tests</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results Cards */}
        <div className="container mx-auto py-12 px-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 font-medium">
              {error}
            </div>
          )}

          {results.length === 0 && !error && (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center transform rotate-12 hover:rotate-0 transition-transform duration-700">
                <Trophy className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No results yet</h3>
              <p className="text-gray-500">Complete some tests to see your progress here</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {results.map((r, index) => {
              const percentage = Math.round(r.percentage)
              return (
                <Card 
                  key={r._id} 
                  className={`group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-500 hover:-translate-y-2 ${getScoreColor(percentage).replace('text-', 'ring-').replace('bg-', 'bg-')} bg-white/80 backdrop-blur-sm`}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'slideInUp 0.8s ease-out forwards, hoverCard 6s ease-in-out infinite',
                  }}
                >
                  {/* Animated background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-indigo-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Score percentage with dynamic styling */}
                  <div className="absolute top-4 right-4">
                    <div className={`${getScoreColor(percentage)} px-3 py-1.5 rounded-full font-bold text-sm shadow-lg flex items-center space-x-1`}>
                      {getScoreIcon(percentage)}
                      <span>{percentage}%</span>
                    </div>
                  </div>

                  <CardHeader className="pb-4 relative z-10">
                    <CardTitle className="text-xl font-bold text-gray-800 group-hover:text-blue-700 transition-colors duration-300 flex items-center justify-between">
                      <span className="truncate">{r.testId?.title || 'Test'}</span>
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-6 relative z-10">
                    {/* Score details with enhanced UI */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 font-medium flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>Score</span>
                        </span>
                        <Badge variant="outline" className="font-bold text-blue-600 border-blue-200 bg-blue-50">
                          {r.marksObtained}/{r.totalMarks} marks
                        </Badge>
                      </div>

                      {/* Animated progress bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-medium text-gray-700">Performance</span>
                          <span className="font-bold text-gray-800">{percentage}%</span>
                        </div>
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${
                              percentage >= 80 
                                ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                                : percentage >= 60 
                                ? 'bg-gradient-to-r from-blue-400 to-cyan-500'
                                : percentage >= 40
                                ? 'bg-gradient-to-r from-orange-400 to-yellow-500'
                                : 'bg-gradient-to-r from-red-400 to-rose-500'
                            }`}
                            style={{ 
                              width: `${percentage}%`,
                              animationDelay: '500ms',
                              animation: 'slideInWidth 1.5s ease-out forwards'
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Completion time */}
                      <div className="flex items-center space-x-3 text-gray-600">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">
                          {r.completedAt ? new Date(r.completedAt).toLocaleDateString() : '-'}
                        </span>
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">
                          {r.completedAt ? new Date(r.completedAt).toLocaleTimeString() : '-'}
                        </span>
                      </div>
                    </div>

                    {/* Enhanced CTA button */}
                    <div className="pt-4">
                      <Button 
                        asChild 
                        className={`w-full h-12 font-bold text-gray-700 bg-gradient-to-r from-blue-100 via-blue-50 to-indigo-50 hover:from-blue-200 hover:via-blue-100 hover:to-indigo-100 border-2 border-blue-200 hover:border-blue-300 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl group/btn`}
                      >
                        <Link href={`/student/results/${typeof r.testId === 'object' && r.testId ? r.testId._id : r.testId}`} className="flex items-center justify-center space-x-2">
                          <span>View Results</span>
                          <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>

                  {/* Animated border on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-sm"></div>
                </Card>
              )
            })}
          </div>
        </div>

        {/* CSS Animations */}
        <style jsx>{`
          @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translateY(50px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes slideInWidth {
            from {
              width: 0%;
            }
            to {
              width: var(--final-width);
            }
          }

          @keyframes hoverCard {
            0%, 100% {
              transform: translateY(0) scale(1);
            }
            50% {
              transform: translateY(-5px) scale(1.02);
            }
          }

          .hover\:hoverCard:hover {
            animation: hoverCard 0.3s ease-in-out;
          }
        `}</style>
      </div>
    </StudentLayout>
  )
}
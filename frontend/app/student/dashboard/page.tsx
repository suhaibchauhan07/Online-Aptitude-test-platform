"use client"
import type React from "react"
import { useEffect, useState } from "react"
import { StudentLayout } from "@/components/student-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar, CheckCircle, AlertTriangle } from "lucide-react"
import Link from "next/link"
import API_BASE_URL from "@/app/config/api"
 

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

  const recentResults = [...results].sort((a,b)=>new Date(a.completedAt||a.createdAt).getTime()-new Date(b.completedAt||b.createdAt).getTime()).slice(-8)
  const avgScore = recentResults.length ? Math.round(recentResults.reduce((acc,r)=>acc + (Number(r.percentage)||0), 0) / recentResults.length) : 0
  const bestScore = recentResults.length ? Math.round(Math.max(...recentResults.map(r=>Number(r.percentage)||0))) : 0
  const totalObtained = recentResults.reduce((acc,r)=>acc + (Number(r.marksObtained)||0), 0)
  const totalPossible = recentResults.reduce((acc,r)=>acc + (Number(r.totalMarks)||0), 0)
  const lastResult = recentResults[recentResults.length-1]

  return (
    <StudentLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-8 px-4 sm:px-6">
        <div className="container py-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-900 mb-8 drop-shadow-lg">Student Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-8">
            <StatsCard
              title="Upcoming Tests"
              value={(tests.filter(t => Date.now() < new Date(t.startTime).getTime()).length).toString()}
              description="Tests scheduled for you"
              icon={<Calendar className="h-6 w-6 text-primary-blue" />}
            />
            <StatsCard
              title="Tests Completed"
              value={(results.length).toString()}
              description="Total tests taken"
              icon={<CheckCircle className="h-6 w-6 text-green-600" />}
            />
            <StatsCard
              title="Average Score"
              value={(results.length ? Math.round(results.reduce((a, r) => a + (Number(r.percentage) || 0), 0) / results.length) : 0).toString() + "%"}
              description="Your performance"
              icon={<AlertTriangle className="h-6 w-6 text-amber-500" />}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl hover:shadow-2xl border border-blue-100 p-6 sm:p-8 transition-transform duration-300">
              <div className="mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-blue-800 mb-1">Recent Tests</h2>
                <p className="text-gray-500">Latest scheduled tests</p>
              </div>
              {tests.length > 0 ? (
                <div className="space-y-6">
                  {[...tests].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()).slice(0, 6).map((test) => (
                    <div key={test._id || test.id} className="border border-blue-100 rounded-xl p-5 bg-gradient-to-br from-blue-50/60 to-indigo-50/40 shadow-md hover:shadow-lg hover:scale-[1.02] transition-transform">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900 text-base sm:text-lg">{test.title || test.testName}</h3>
                        <Badge className={(Date.now() < new Date(test.startTime).getTime()) ? "bg-primary-blue" : (Date.now() <= new Date(test.startTime).getTime() + (test.duration || 0) * 60000) ? "bg-green-600" : "bg-red-500"}>{(Date.now() < new Date(test.startTime).getTime()) ? "Upcoming" : (Date.now() <= new Date(test.startTime).getTime() + (test.duration || 0) * 60000) ? "Available" : "Expired"}</Badge>
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
          </div>
        </div>
      </div>
    </StudentLayout>
  )
}

interface StatsCardProps {
  title: string
  value: string
  description: string
  icon: React.ReactNode
}

function StatsCard({ title, value, description, icon }: StatsCardProps) {
  return (
    <Card className="group relative overflow-hidden border-0 rounded-2xl bg-white/80 backdrop-blur-md shadow-xl hover:shadow-2xl transform hover:scale-[1.03] transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <CardContent className="p-5 sm:p-6 relative z-10">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-xs sm:text-sm font-medium text-gray-600">{title}</h3>
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 text-primary-blue shadow-sm">{icon}</div>
        </div>
        <div className="space-y-1">
          <p className="text-xl sm:text-2xl font-extrabold text-blue-900">{value}</p>
          <p className="text-xs sm:text-sm text-gray-500">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}

import type React from "react"
import { StudentLayout } from "@/components/student-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar, CheckCircle, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function StudentDashboard() {
  // Sample data
  const upcomingTests = [
    {
      id: "1",
      title: "Data Structures Aptitude Test",
      date: "May 10, 2024",
      time: "10:00 AM",
      duration: "60 minutes",
      status: "upcoming",
    },
    {
      id: "2",
      title: "Algorithms Fundamentals",
      date: "May 15, 2024",
      time: "2:00 PM",
      duration: "90 minutes",
      status: "upcoming",
    },
  ]

  const recentResults = [
    {
      id: "3",
      title: "Programming Basics",
      date: "April 25, 2024",
      score: 85,
      totalQuestions: 30,
      correctAnswers: 26,
      status: "passed",
    },
    {
      id: "4",
      title: "Computer Networks",
      date: "April 15, 2024",
      score: 72,
      totalQuestions: 25,
      correctAnswers: 18,
      status: "passed",
    },
  ]

  return (
    <StudentLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-10">
        <div className="container py-6">
          <h1 className="text-3xl font-extrabold text-blue-900 mb-10 drop-shadow-lg">Student Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            <StatsCard
              title="Upcoming Tests"
              value={upcomingTests.length.toString()}
              description="Tests scheduled for you"
              icon={<Calendar className="h-6 w-6 text-primary-blue" />}
            />
            <StatsCard
              title="Tests Completed"
              value="8"
              description="Total tests taken"
              icon={<CheckCircle className="h-6 w-6 text-green-600" />}
            />
            <StatsCard
              title="Average Score"
              value="78%"
              description="Your performance"
              icon={<AlertTriangle className="h-6 w-6 text-amber-500" />}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Upcoming Tests */}
            <div className="bg-white/90 rounded-2xl shadow-2xl border border-blue-100 p-8">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-blue-800 mb-1">Upcoming Tests</h2>
                <p className="text-gray-500">Tests scheduled for you to attempt</p>
              </div>
              {upcomingTests.length > 0 ? (
                <div className="space-y-6">
                  {upcomingTests.map((test) => (
                    <div key={test.id} className="border border-blue-100 rounded-xl p-5 bg-blue-50/60 shadow-lg hover:scale-[1.02] transition-transform">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">{test.title}</h3>
                        <Badge className="bg-primary-blue">Upcoming</Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-2">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                          <span>{test.date}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-blue-500" />
                          <span>
                            {test.time} • {test.duration}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p>No upcoming tests scheduled</p>
                </div>
              )}
            </div>

            {/* Recent Results */}
            <div className="bg-white/90 rounded-2xl shadow-2xl border border-blue-100 p-8">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-blue-800 mb-1">Recent Results</h2>
                <p className="text-gray-500">Your performance in recent tests</p>
              </div>
              {recentResults.length > 0 ? (
                <div className="space-y-6">
                  {recentResults.map((result) => (
                    <div key={result.id} className="border border-blue-100 rounded-xl p-5 bg-blue-50/60 shadow-lg hover:scale-[1.02] transition-transform">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">{result.title}</h3>
                        <Badge className={result.status === "passed" ? "bg-green-600" : "bg-red-500"}>
                          {result.status === "passed" ? "Passed" : "Failed"}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                          <span>{result.date}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500">Score</p>
                          <p className="text-xl font-bold text-blue-800">{result.score}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Correct Answers</p>
                          <p className="text-xl font-bold text-blue-800">
                            {result.correctAnswers}/{result.totalQuestions}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Button asChild variant="outline" className="w-full hover:bg-blue-100 hover:text-blue-800 font-semibold">
                          <Link href={`/student/results/${result.id}`}>View Details</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p>No test results available</p>
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
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          {icon}
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}

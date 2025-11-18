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
      title: "Quantitive Aptitude Test",
      date: "May 10, 2024",
      time: "10:00 AM",
      duration: "60 minutes",
      status: "upcoming",
    },
     {
      id: "2",
      title: "Verbal Aptitude Test",
      date: "May 10, 2024",
      time: "10:00 AM",
      duration: "60 minutes",
      status: "upcoming",
    },
    {
      id: "3",
      title: "Reasioning Test",
      date: "May 10, 2024",
      time: "10:00 AM",
      duration: "60 minutes",
      status: "upcoming",
    },
  ]

  const recentResults = [
    {
      id: "4",
      title: "Verbal Aptitude Test",
      date: "April 25, 2024",
      score: 85,
      totalQuestions: 30,
      correctAnswers: 26,
      status: "passed",
    },
    {
      id: "5",
      title: "Quantitive Aptitude Test",
      date: "April 15, 2024",
      score: 72,
      totalQuestions: 25,
      correctAnswers: 18,
      status: "passed",
    },
  ]

  return (
    <StudentLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-8 px-4 sm:px-6">
        <div className="container py-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-900 mb-8 drop-shadow-lg">Student Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-8">
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
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl hover:shadow-2xl border border-blue-100 p-6 sm:p-8 transition-transform duration-300">
              <div className="mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-blue-800 mb-1">Upcoming Tests</h2>
                <p className="text-gray-500">Tests scheduled for you to attempt</p>
              </div>
              {upcomingTests.length > 0 ? (
                <div className="space-y-6">
                  {upcomingTests.map((test) => (
                    <div key={test.id} className="border border-blue-100 rounded-xl p-5 bg-gradient-to-br from-blue-50/60 to-indigo-50/40 shadow-md hover:shadow-lg hover:scale-[1.02] transition-transform">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900 text-base sm:text-lg">{test.title}</h3>
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
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl hover:shadow-2xl border border-blue-100 p-6 sm:p-8 transition-transform duration-300">
              <div className="mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-blue-800 mb-1">Recent Results</h2>
                <p className="text-gray-500">Your performance in recent tests</p>
              </div>
              {recentResults.length > 0 ? (
                <div className="space-y-6">
                  {recentResults.map((result) => (
                    <div key={result.id} className="border border-blue-100 rounded-xl p-5 bg-gradient-to-br from-blue-50/60 to-indigo-50/40 shadow-md hover:shadow-lg hover:scale-[1.02] transition-transform">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900 text-base sm:text-lg">{result.title}</h3>
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
                          <p className="text-lg sm:text-xl font-bold text-blue-800">{result.score}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Correct Answers</p>
                          <p className="text-lg sm:text-xl font-bold text-blue-800">
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

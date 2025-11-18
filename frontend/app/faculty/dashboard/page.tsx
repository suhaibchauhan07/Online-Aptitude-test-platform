"use client";

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge as UIBadge } from "@/components/ui/badge"
import { Users, FileText, BarChart2, Clock, Calendar, CheckCircle } from "lucide-react"
import Link from "next/link"
import CreateTestModal from "@/app/components/CreateTestModal"

interface Test {
  id: string;
  title: string;
  class: string;
  date: string;
  time: string;
  duration: string;
  status: "active" | "scheduled";
  studentsAttempted: number;
  totalStudents: number;
}

interface Result {
  id: string;
  title: string;
  class: string;
  date: string;
  averageScore: number;
  passPercentage: number;
  studentsAttempted: number;
  totalStudents: number;
}

export default function FacultyDashboard() {
  const [isCreateTestModalOpen, setIsCreateTestModalOpen] = useState(false)

  // Sample data
  const activeTests = [
    {
      id: "1",
      title: "Data Structures Aptitude Test",
      class: "B.Tech CSE - A",
      date: "May 10, 2024",
      time: "10:00 AM",
      duration: "60 minutes",
      status: "active",
      studentsAttempted: 15,
      totalStudents: 45
    },
    {
      id: "2",
      title: "Algorithms Fundamentals",
      class: "B.Tech CSE - B",
      date: "May 15, 2024",
      time: "2:00 PM",
      duration: "90 minutes",
      status: "scheduled",
      studentsAttempted: 0,
      totalStudents: 50
    }
  ]

  const recentResults = [
    {
      id: "3",
      title: "Programming Basics",
      class: "B.Tech CSE - A",
      date: "April 25, 2024",
      averageScore: 78,
      passPercentage: 92,
      studentsAttempted: 45,
      totalStudents: 45
    },
    {
      id: "4",
      title: "Computer Networks",
      class: "B.Tech CSE - B",
      date: "April 15, 2024",
      averageScore: 72,
      passPercentage: 85,
      studentsAttempted: 48,
      totalStudents: 50
    }
  ]

  return (
    <div className="container py-6 px-4 sm:px-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-6">Faculty Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <StatsCard
          title="Total Students"
          value="245"
          description="Across all classes"
          icon={<Users className="h-5 w-5 text-primary-blue" />}
        />
        <StatsCard
          title="Active Tests"
          value="2"
          description="Currently running"
          icon={<FileText className="h-5 w-5 text-primary-blue" />}
        />
        <StatsCard
          title="Average Score"
          value="76%"
          description="Across all tests"
          icon={<BarChart2 className="h-5 w-5 text-primary-blue" />}
        />
        <StatsCard
          title="Tests Created"
          value="12"
          description="This semester"
          icon={<CheckCircle className="h-5 w-5 text-green-600" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Tests */}
        <Card className="bg-white/80 backdrop-blur-md shadow-xl hover:shadow-2xl transition-transform duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg sm:text-xl">Active Tests</CardTitle>
              <CardDescription className="text-sm">Currently active and scheduled tests</CardDescription>
            </div>
            <Button
              size="sm"
              className="bg-primary-blue hover:bg-blue-700"
              onClick={() => setIsCreateTestModalOpen(true)}
            >
              Create Test
            </Button>
          </CardHeader>
          <CardContent>
            {activeTests.length > 0 ? (
              <div className="space-y-4">
                {activeTests.map((test) => (
                  <div key={test.id} className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-blue-100 p-5 hover:scale-[1.03] hover:shadow-blue-200 transition-all duration-300">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-base sm:text-lg">{test.title}</h3>
                      <UIBadge className={test.status === "active" ? "bg-green-600" : "bg-primary-blue"}>
                        {test.status === "active" ? "Active" : "Scheduled"}
                      </UIBadge>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{test.class}</p>
                    <div className="text-sm text-gray-500 space-y-2">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{test.date}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>
                          {test.time} • {test.duration}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Students Attempted</span>
                        <span className="font-medium">
                          {test.studentsAttempted}/{test.totalStudents}
                        </span>
                      </div>
                      <div className="w-full bg-gradient-to-r from-blue-400 to-blue-700 h-2.5 rounded-full shadow-lg transition-all duration-1000">
                        <div
                          className="bg-primary-blue h-2.5 rounded-full"
                          style={{ width: `${(test.studentsAttempted / test.totalStudents) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button asChild variant="outline" className="w-full">
                        <Link href={`/faculty/tests/${test.id}`}>View Details</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>No active tests</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Results */}
        <Card className="bg-white/80 backdrop-blur-md shadow-xl hover:shadow-2xl transition-transform duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg sm:text-xl">Recent Results</CardTitle>
              <CardDescription className="text-sm">Performance in recent tests</CardDescription>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/faculty/results">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentResults.length > 0 ? (
              <div className="space-y-4">
                {recentResults.map((result) => (
                  <div key={result.id} className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-blue-100 p-5 hover:scale-[1.03] hover:shadow-blue-200 transition-all duration-300">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-base sm:text-lg">{result.title}</h3>
                      <span className="text-sm text-gray-500">{result.date}</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">{result.class}</p>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-500">Average Score</p>
                        <p className="text-xl font-semibold">{result.averageScore}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Pass Rate</p>
                        <p className="text-xl font-semibold">{result.passPercentage}%</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Completion Rate</span>
                        <span className="font-medium">
                          {result.studentsAttempted}/{result.totalStudents}
                        </span>
                      </div>
                      <div className="w-full bg-gradient-to-r from-green-400 to-green-600 h-2.5 rounded-full shadow-lg transition-all duration-1000">
                        <div
                          className="bg-green-600 h-2.5 rounded-full"
                          style={{ width: `${(result.studentsAttempted / result.totalStudents) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button asChild variant="outline" className="w-full">
                        <Link href={`/faculty/results/${result.id}`}>View Details</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BarChart2 className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>No results available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Analytics Preview */}
      <div className="mt-6 px-1">
        <Card className="bg-white/80 backdrop-blur-md shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Performance Analytics</CardTitle>
            <CardDescription className="text-sm">Overview of student performance across tests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed">
              <div className="text-center">
                <BarChart2 className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-500">Analytics charts would be displayed here</p>
                <p className="text-sm text-gray-400 mt-1">
                  Showing average scores, pass rates, and performance trends
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Test Modal */}
      <CreateTestModal
        isOpen={isCreateTestModalOpen}
        onClose={() => setIsCreateTestModalOpen(false)}
        onTestCreated={() => setIsCreateTestModalOpen(false)}
      />
    </div>
  )
}

// AnimatedCounter: simple animated number counter for stats
function AnimatedCounter({ end, duration = 1.2, suffix = "" }: { end: number, duration?: number, suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = end / (duration * 60);
    let frame: number;
    function animate() {
      start += increment;
      if (start < end) {
        setCount(Math.floor(start));
        frame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    }
    animate();
    return () => cancelAnimationFrame(frame);
  }, [end, duration]);
  return <span>{count}{suffix}</span>;
}

function StatsCard({ title, value, description, icon }: {
  title: string
  value: string
  description: string
  icon: React.ReactNode
}) {
  // Extract number and suffix for animation
  const match = value.match(/(\d+)(\D*)/);
  const num = match ? parseInt(match[1]) : 0;
  const suffix = match ? match[2] : "";
  return (
    <Card className="group relative overflow-hidden border-0 rounded-2xl bg-white/80 backdrop-blur-md shadow-xl hover:shadow-2xl transform hover:scale-[1.03] transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-xs sm:text-sm font-medium text-blue-900 drop-shadow">{title}</CardTitle>
        <div className="p-2 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 text-primary-blue shadow-sm">{icon}</div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-2xl sm:text-3xl font-extrabold text-blue-900 mb-1">
          <AnimatedCounter end={num} suffix={suffix} />
        </div>
        <p className="text-xs sm:text-sm text-blue-700 font-medium">{description}</p>
      </CardContent>
    </Card>
  )
}

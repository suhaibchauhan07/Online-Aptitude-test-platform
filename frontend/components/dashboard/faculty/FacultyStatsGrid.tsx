"use client"

import React, { useState, useEffect } from "react"
import { Users, FileText, CheckCircle, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface DashboardStats {
  totalStudents: number;
  activeTests: number;
  testsCreated: number;
  averageScore: number;
}

interface FacultyStatsGridProps {
  stats: DashboardStats;
  loading?: boolean;
}

export default function FacultyStatsGrid({ stats, loading = false }: FacultyStatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title="Total Students"
        value={stats.totalStudents.toString()}
        description="Attempted your tests"
        icon={<Users className="h-6 w-6 text-white" />}
        gradient="from-blue-500 to-blue-600"
        loading={loading}
      />
      <StatsCard
        title="Active Tests"
        value={stats.activeTests.toString()}
        description="Currently running"
        icon={<FileText className="h-6 w-6 text-white" />}
        gradient="from-indigo-500 to-purple-600"
        loading={loading}
      />
      <StatsCard
        title="Tests Created"
        value={stats.testsCreated.toString()}
        description="Total tests managed"
        icon={<CheckCircle className="h-6 w-6 text-white" />}
        gradient="from-emerald-500 to-teal-600"
        loading={loading}
      />
      <StatsCard
        title="Average Score"
        value={`${stats.averageScore}%`}
        description="Across all attempts"
        icon={<TrendingUp className="h-6 w-6 text-white" />}
        gradient="from-orange-500 to-red-600"
        loading={loading}
      />
    </div>
  )
}

function StatsCard({ title, value, description, icon, gradient, loading }: {
  title: string
  value: string
  description: string
  icon: React.ReactNode
  gradient: string
  loading: boolean
}) {
  if (loading) {
    return (
      <Card className="border-none shadow-lg h-full">
        <CardContent className="p-6">
          <Skeleton className="h-12 w-12 rounded-xl mb-4" />
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    )
  }

  // Extract number and suffix for animation
  const match = value.match(/(\d+)(\D*)/);
  const num = match ? parseInt(match[1]) : 0;
  const suffix = match ? match[2] : "";

  return (
    <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden relative group">
      <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500`}>
        <div className={`p-3 rounded-full bg-gradient-to-br ${gradient}`}>
          {icon}
        </div>
      </div>
      
      <CardContent className="p-6 relative z-10">
        <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-md mb-4`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-800 tracking-tight">
             <AnimatedCounter end={num} suffix={suffix} />
          </h3>
          <p className="text-xs text-gray-400 mt-2 font-medium">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function AnimatedCounter({ end, duration = 1.2, suffix = "" }: { end: number, duration?: number, suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = end > 0 ? Math.max(1, end / (duration * 60)) : 0;
    let frame: number;
    
    if (end === 0) {
      setCount(0);
      return;
    }

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

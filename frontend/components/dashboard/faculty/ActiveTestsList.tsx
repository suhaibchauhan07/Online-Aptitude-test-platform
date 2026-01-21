"use client"

import React from "react"
import Link from "next/link"
import { Clock, Calendar, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge as UIBadge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface ActiveTest {
  id: string;
  title: string;
  class: string;
  date: string;
  time: string;
  duration: string;
  status: string;
  studentsAttempted: number;
  totalStudents: number;
}

interface ActiveTestsListProps {
  activeTests: ActiveTest[];
  loading?: boolean;
}

export default function ActiveTestsList({ activeTests, loading = false }: ActiveTestsListProps) {
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
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <div className="space-y-2">
                   <Skeleton className="h-4 w-32" />
                   <Skeleton className="h-4 w-32" />
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
          <Clock className="mr-2 h-5 w-5 text-indigo-600" /> Active Tests
        </h2>
        {activeTests.length > 0 && (
          <Link href="/faculty/tests" className="text-sm text-indigo-600 hover:underline">
            View All
          </Link>
        )}
      </div>
      
      {activeTests.length > 0 ? (
        <div className="space-y-4">
          {activeTests.map((test) => (
            <Card key={test.id} className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300 group relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 group-hover:bg-indigo-600 transition-colors" />
              <CardContent className="p-5 pl-7">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-gray-800 group-hover:text-indigo-700 transition-colors">{test.title}</h3>
                    <p className="text-sm text-gray-500">{test.class}</p>
                  </div>
                  <UIBadge className="bg-green-100 text-green-700 hover:bg-green-200 border-none shadow-sm">
                    Active
                  </UIBadge>
                </div>
                
                <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-2 text-gray-400" />
                    {test.date}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-3.5 w-3.5 mr-2 text-gray-400" />
                    {test.time}
                  </div>
                  <div className="col-span-2 flex items-center">
                    <Users className="h-3.5 w-3.5 mr-2 text-gray-400" />
                    {test.studentsAttempted} attempted / {test.totalStudents} assigned
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <Button asChild variant="outline" size="sm" className="hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200">
                    <Link href={`/faculty/tests/${test.id}`}>View Details</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-gray-50 border-dashed border-2 border-gray-200 shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <div className="p-3 bg-white rounded-full shadow-sm mb-3">
              <Clock className="h-8 w-8 text-gray-300" />
            </div>
            <h3 className="font-medium text-gray-900">No active tests</h3>
            <p className="text-sm text-gray-500 mt-1 mb-4">You don't have any tests running right now.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

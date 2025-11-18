"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import API_BASE_URL from "@/app/config/api"
import { Users, CheckCircle, Calendar } from "lucide-react"
import Link from "next/link"

export default function FacultyStudentResultsPage() {
  const [results, setResults] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${API_BASE_URL}/faculty/student-results`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        if (!res.ok) throw new Error('Failed to load student results')
        const data = await res.json()
        setResults(Array.isArray(data) ? data : [])
      } catch (e) {
        setError('Failed to load student results')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  if (loading) {
    return (
      <div className="container py-10 flex items-center justify-center">
        <div className="text-gray-600">Loading student results...</div>
      </div>
    )
  }

  return (
    <div className="container py-6 px-4 sm:px-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-2">
        <Users className="h-5 w-5 text-primary-blue" />
        <span>Student Results</span>
      </h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 font-medium">{error}</div>
      )}

      {results.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No completed results found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {results.map((r:any)=>{
            const name = r.student?.name || 'Student'
            const roll = r.student?.rollNo || '-'
            const className = r.student?.className || '-'
            const section = r.student?.section || '-'
            const testTitle = r.test?.title || 'Test'
            const marks = `${Number(r.marksObtained)||0}/${Number(r.totalMarks)||0}`
            const percentage = Math.round(Number(r.percentage)||0)
            const dateStr = r.completedAt ? new Date(r.completedAt).toLocaleDateString() : '-'
            return (
              <Card key={r._id} className="bg-white/80 backdrop-blur-md shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex justify-between items-center">
                    <span className="truncate">{name} ({roll})</span>
                    <Badge variant="outline" className="font-bold">{percentage}%</Badge>
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600">{className}{section!=='-'?` - ${section}`:''}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm text-gray-600">{testTitle}</div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-blue-800">Marks: {marks}</span>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">{dateStr}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Completed</span>
                  </div>
                  <div>
                    <Link href={`/faculty/student-results/${r.student?.id || r.studentId}` } className="text-blue-700 font-medium">View Detail</Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
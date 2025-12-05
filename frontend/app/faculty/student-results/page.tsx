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

  const groups = new Map<string, { student: any; tests: any[] }>()
  for (const r of results) {
    const sid = String(r.student?.id || r.studentId || r.student?._id || '')
    if (!sid) continue
    const existing = groups.get(sid) || { student: r.student || r.studentId, tests: [] }
    existing.student = r.student || r.studentId
    existing.tests.push(r)
    groups.set(sid, existing)
  }
  const grouped = Array.from(groups.entries()).map(([sid, g]) => ({ sid, ...g }))

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
          {grouped.map(({ sid, student, tests }) => {
            const name = student?.name || 'Student'
            const roll = student?.rollNo || '-'
            const className = student?.className || '-'
            const section = student?.section || '-'
            const latest = tests[0]
            const latestMarks = latest ? `${Number(latest.marksObtained)||0}/${Number(latest.totalMarks)||0}` : ''
            return (
              <Card key={sid} className="bg-white/80 backdrop-blur-md shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex justify-between items-center">
                    <span className="truncate">{name} ({roll})</span>
                    <Badge variant="outline" className="font-bold">Marks: {latestMarks}</Badge>
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600">{className}{section!=="-"?` - ${section}`:''}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm font-semibold text-gray-700">Tests Given</div>
                  <div className="space-y-2">
                    {tests.map((t:any) => {
                      const testTitle = t.test?.title || 'Test'
                      const marks = `${Number(t.marksObtained)||0}/${Number(t.totalMarks)||0}`
                      const dateStr = t.completedAt ? new Date(t.completedAt).toLocaleDateString() : '-'
                      const testId = t.test?.id || t.test?._id || t.testId
                      return (
                        <div key={t._id} className="p-3 border rounded-md flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{testTitle}</div>
                            <div className="text-xs text-gray-600">Marks: {marks}</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-gray-600">
                              <Calendar className="h-4 w-4" />
                              <span className="text-xs">{dateStr}</span>
                            </div>
                            <Link href={`/faculty/student-results/${sid}/${testId}`} className="text-blue-700 text-xs font-medium">View Detail</Link>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div>
                    <Link href={`/faculty/student-results/${sid}`} className="text-blue-700 font-medium">All Results</Link>
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

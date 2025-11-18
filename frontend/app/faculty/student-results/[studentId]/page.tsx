"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import API_BASE_URL from "@/app/config/api"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function FacultyStudentResultListPage() {
  const params = useParams()
  const studentId = String(params.studentId)
  const [results, setResults] = useState<any[]>([])
  const [student, setStudent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(()=>{
    const run = async()=>{
      try{
        setLoading(true)
        const res = await fetch(`${API_BASE_URL}/faculty/student-results/${studentId}`,{
          headers:{ Authorization: `Bearer ${localStorage.getItem('token')}`}
        })
        if(!res.ok) throw new Error('Failed to load')
        const data = await res.json()
        setResults(Array.isArray(data)?data:[])
        setStudent(data[0]?.studentId || null)
      }catch(e){
        setError('Failed to load results')
      }finally{
        setLoading(false)
      }
    }
    run()
  },[studentId])

  if(loading){
    return <div className="container py-10">Loading...</div>
  }

  return (
    <div className="container py-6 px-4 sm:px-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-6">Student Result Details</h1>
      {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 font-medium">{error}</div>}

      {student && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{student.name} ({student.rollNo})</span>
              <Badge variant="outline">{student.className}</Badge>
            </CardTitle>
          </CardHeader>
        </Card>
      )}

      {results.length === 0 ? (
        <div className="text-gray-600">No results for this student</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {results.map((r:any)=>{
            const marks = `${Number(r.marksObtained)||0}/${Number(r.totalMarks)||0}`
            const percentage = Math.round(Number(r.percentage)||0)
            const title = r.testId?.title || r.testId?.testName || 'Test'
            const testId = r.testId?._id || r.testId
            return (
              <Card key={r._id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{title}</span>
                    <Badge variant="outline">{percentage}%</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="font-medium">Marks: {marks}</div>
                  <Link href={`/faculty/student-results/${studentId}/${testId}`} className="text-blue-700 font-medium">View Detail</Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
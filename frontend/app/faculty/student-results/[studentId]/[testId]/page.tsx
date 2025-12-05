"use client"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import API_BASE_URL from "@/app/config/api"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function FacultyStudentTestDetailPage(){
  const params = useParams()
  const studentId = String(params.studentId)
  const testId = String(params.testId)
  const [result, setResult] = useState<any>(null)
  const [marksMap, setMarksMap] = useState<Map<string, number>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string|null>(null)

  useEffect(()=>{
    const run = async()=>{
      try{
        setLoading(true)
        const res = await fetch(`${API_BASE_URL}/faculty/student-results/${studentId}/tests/${testId}`,{
          headers:{ Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        if(!res.ok) throw new Error('Failed to load')
        const data = await res.json()
        setResult(data)
        try {
          const qRes = await fetch(`${API_BASE_URL}/tests/${testId}/questions`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
          if (qRes.ok) {
            const questions = await qRes.json()
            const map = new Map<string, number>()
            for (const q of questions) {
              const id = String(q._id || q.id)
              map.set(id, Number(q.marks ?? 1))
            }
            setMarksMap(map)
          }
        } catch (_) {}
      }catch(e){
        setError('Failed to load result')
      }finally{
        setLoading(false)
      }
    }
    run()
  },[studentId,testId])

  if(loading){
    return <div className="container py-10">Loading...</div>
  }

  if(error){
    return <div className="container py-10">{error}</div>
  }

  if(!result){
    return <div className="container py-10">No result found</div>
  }

  const title = result.testTitle || 'Test'
  const marks = `${Number(result.marksObtained)||0}/${Number(result.totalMarks)||0}`
  const percentage = Math.round(Number(result.percentage)||0)

  return (
    <div className="container py-6 px-4 sm:px-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{title}</span>
            <Badge variant="outline">Marks: {marks}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="font-medium">Marks: {marks}</div>
          <div className="text-sm text-gray-600">Questions: {result.totalQuestions}</div>
          <div className="text-sm text-gray-600">Correct: {result.correctCount}</div>
          <div className="text-sm text-gray-600">Incorrect: {result.incorrectCount}</div>
          <div className="space-y-2">
            {Array.isArray(result.answers) && result.answers.map((a:any, idx:number)=>{
              const status = a.isCorrect ? 'Correct' : 'Incorrect'
              const qm = Number(a.questionMarks ?? marksMap.get(String(a.questionId)) ?? 1)
              return (
                <div key={idx} className="p-3 border rounded-md flex items-center justify-between">
                  <span className="text-sm">Q{idx+1} ({qm} marks)</span>
                  <span className={a.isCorrect?"text-green-700":"text-red-700"}>{status}</span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { StudentLayout } from "@/components/student-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Clock, AlertTriangle, CheckCircle, MonitorSmartphone, MousePointer2, Ban } from "lucide-react"

export default function TestInstructions({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [test, setTest] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTestDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/student/tests/${params.id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
        if (!response.ok) throw new Error('Failed to fetch test details')
        const data = await response.json()
        setTest(data)
      } catch (err) {
        setError('Failed to fetch test details')
      }
    }
    fetchTestDetails()
  }, [params.id])

  const handleStartTest = () => {
    if (!agreed) return
    setLoading(true)
    setTimeout(() => {
      router.push(`/student/test/${params.id}`)
    }, 1000)
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen"><span>{error}</span></div>
  }
  if (!test) {
    return <div className="flex justify-center items-center min-h-screen"><span>Loading...</span></div>
  }

  return (
    <StudentLayout>
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-6">Test Instructions</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Instructions for {test.testName || test.title}</CardTitle>
                <CardDescription>Please read all instructions carefully before starting the test</CardDescription>
                <div className="mt-2 text-sm text-blue-700 font-semibold">
                  Attempts used: {test.attemptCount} / {test.maxAttempts}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Important</AlertTitle>
                  <AlertDescription>
                    This test requires fullscreen mode and monitors for any attempts to exit fullscreen or switch tabs.
                    Violations may result in test termination.
                  </AlertDescription>
                </Alert>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Test Instructions</h3>
                  <ul className="space-y-3">
                    {test.instructions.map((instruction: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-primary-blue mr-2 mt-0.5 shrink-0" />
                        <span>{instruction}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-3">Technical Requirements</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <MonitorSmartphone className="h-5 w-5 text-primary-blue mr-2 mt-0.5 shrink-0" />
                      <span>Use a desktop or laptop computer for the best experience.</span>
                    </li>
                    <li className="flex items-start">
                      <MousePointer2 className="h-5 w-5 text-primary-blue mr-2 mt-0.5 shrink-0" />
                      <span>Ensure your browser supports fullscreen mode (Chrome, Firefox, Edge recommended).</span>
                    </li>
                    <li className="flex items-start">
                      <Ban className="h-5 w-5 text-primary-blue mr-2 mt-0.5 shrink-0" />
                      <span>Disable browser extensions that might interfere with the test.</span>
                    </li>
                  </ul>
                </div>

                <div className="flex items-start space-x-2 pt-4">
                  <Checkbox id="terms" checked={agreed} onCheckedChange={(checked) => setAgreed(checked as boolean)} />
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I have read and understood all the instructions and agree to follow them.
                  </label>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleStartTest}
                  disabled={!agreed || loading}
                  className="w-full bg-primary-blue hover:bg-blue-700"
                >
                  {loading ? "Preparing Test..." : "Start Test"}
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Test Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Test Name</p>
                  <p className="font-medium">{test.testName || test.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-primary-blue" />
                    <p className="font-medium">{test.duration} min</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Questions</p>
                  <p className="font-medium">{test.questions?.length || 0} questions</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Attempts Used</p>
                  <p className="font-medium">{test.attemptCount} / {test.maxAttempts}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </StudentLayout>
  )
}

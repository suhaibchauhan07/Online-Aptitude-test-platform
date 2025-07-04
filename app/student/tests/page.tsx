"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface Test {
  _id: string
  testName: string
  instructions: string
  startTime: string
  duration: number
  totalMarks: number
}

export default function AvailableTestsPage() {
  const [tests, setTests] = useState<Test[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchAvailableTests = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/student/tests/available", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        if (!response.ok) {
          if (response.status === 401) {
            setError("You are not authorized. Please log in again.");
          } else {
            setError("Failed to fetch available tests");
          }
          setLoading(false);
          return;
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setTests(data);
        } else if (data.status === "success" && Array.isArray(data.data)) {
          setTests(data.data);
        } else {
          setError("No available tests found.");
        }
      } catch (err) {
        setError("Failed to fetch available tests");
      } finally {
        setLoading(false);
      }
    };
    fetchAvailableTests();
  }, []);

  const handleStartTest = async (testId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/student/tests/${testId}/start`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })
      const data = await response.json()
      if (data && data.attemptId) {
        router.push(`/student/test/${testId}`)
      } else {
        setError("Failed to start test")
      }
    } catch (err) {
      setError("Failed to start test")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-blue"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-center">Available Tests</h1>
        {tests.length === 0 ? (
          <div className="text-center text-gray-600">No available tests at the moment.</div>
        ) : (
          <div className="space-y-6">
            {tests.map((test) => (
              <Card key={test._id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold">{test.testName}</h2>
                      <div className="text-sm text-gray-500 mb-2">Duration: {test.duration} min | Total Marks: {test.totalMarks}</div>
                      <div className="text-sm text-gray-700 mb-2">{test.instructions}</div>
                      <div className="text-xs text-gray-400">Starts: {new Date(test.startTime).toLocaleString()}</div>
                    </div>
                    <Button className="bg-primary-blue hover:bg-blue-700" onClick={() => handleStartTest(test._id)}>
                      Start Test
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 
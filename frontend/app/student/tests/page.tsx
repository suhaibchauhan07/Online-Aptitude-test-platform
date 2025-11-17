"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import API_BASE_URL from "@/app/config/api"

interface Test {
  _id: string
  title: string
  description?: string
  instructions?: string
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
        const response = await fetch(`${API_BASE_URL}/student/tests/available`, {
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
      const response = await fetch(`${API_BASE_URL}/student/tests/${testId}/start`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 400) {
          setError(errorData.message || "Sorry, this test is not currently available. Please check the test timing.")
        } else if (response.status === 404) {
          setError("Test not found. Please refresh the page and try again.")
        } else {
          setError("Failed to start test. Please try again later.")
        }
        return
      }
      
      const data = await response.json()
      console.log('Start test response:', data)
      
      // Check if the response has the expected structure
      if (data.status === 'success' && data.data && data.data.attemptId) {
        router.push(`/student/test/${testId}`)
      } else {
        setError("Failed to start test - invalid response from server")
      }
    } catch (err) {
      console.error('Error starting test:', err)
      setError("Network error. Please check your connection and try again.")
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-blue-900 mb-10 drop-shadow-lg text-center">Available Tests</h1>
        {tests.length === 0 ? (
          <div className="text-center text-gray-600">No available tests at the moment.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test) => {
              const now = new Date()
              const startTime = new Date(test.startTime)
              const endTime = new Date(startTime.getTime() + test.duration * 60000)
              const isTestAvailable = now >= startTime && now <= endTime
              const isTestUpcoming = now < startTime
              const isTestExpired = now > endTime
              
              return (
                <div key={test._id} className={`bg-white/90 rounded-2xl shadow-2xl border p-6 flex flex-col transition-transform hover:scale-[1.02] ${
                  isTestAvailable ? 'border-green-200 bg-green-50/30' : 
                  isTestUpcoming ? 'border-yellow-200 bg-yellow-50/30' : 
                  'border-red-200 bg-red-50/30'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl font-bold text-gray-900 flex-1">{test.title}</h2>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ml-2 ${
                      isTestAvailable ? 'bg-green-100 text-green-700' : 
                      isTestUpcoming ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-red-100 text-red-700'
                    }`}>
                      {isTestAvailable ? '🟢 Available' : 
                       isTestUpcoming ? '🟡 Upcoming' : 
                       '🔴 Expired'}
                    </div>
                  </div>
                  
                  {test.instructions && (
                    <div className="mb-4">
                      <div className="flex items-center mb-2">
                        <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20.5C6.753 20.5 2 16.195 2 11.5S6.753 2.5 12 2.5s10 4.305 10 9-4.753 9-10 9z" /></svg>
                        <span className="text-sm font-semibold text-blue-700">Instructions for Students</span>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900 shadow-md whitespace-pre-line">
                        {test.instructions}
                      </div>
                    </div>
                  )}
                  
                  <div className="text-sm text-gray-600 mb-2 font-medium">Duration: {test.duration} min | Total Marks: {test.totalMarks}</div>
                  
                  <div className="text-xs text-gray-500 space-y-1 mb-4">
                    <div>📅 Starts: {new Date(test.startTime).toLocaleString()}</div>
                    <div>⏰ Ends: {new Date(new Date(test.startTime).getTime() + test.duration * 60000).toLocaleString()}</div>
                  </div>
                  
                  <button
                    onClick={() => handleStartTest(test._id)}
                    disabled={!isTestAvailable}
                    className={`mt-auto font-bold py-3 px-6 rounded-xl shadow-lg transition-all text-base focus:outline-none focus:ring-2 w-full ${
                      isTestAvailable 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-blue-800 focus:ring-blue-400' 
                        : isTestUpcoming
                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white cursor-not-allowed opacity-70'
                        : 'bg-gradient-to-r from-red-400 to-red-600 text-white cursor-not-allowed opacity-70'
                    }`}
                  >
                    {isTestAvailable ? 'Start Test' : 
                     isTestUpcoming ? 'Test Not Started' : 
                     'Test Expired'}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
} 
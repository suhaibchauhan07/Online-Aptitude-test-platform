"use client"

import type React from "react"
import { use, useEffect, useMemo, useRef, useState } from "react";

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group" 
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Clock, AlertCircle, GraduationCap, MonitorSmartphone } from "lucide-react"
import Link from "next/link"

interface Question {
  id: string
  text: string
  type: "mcq" | "msq" | "nat"
  options: string[]
  correctAnswer?: string | number | number[]
}

interface Test {
  id: string
  title: string
  questions: Question[]
  duration: number
}

export default function TestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)  // Use use(params) to handle async params 
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [markedForReview, setMarkedForReview] = useState<string[]>([])
  const [timeLeft, setTimeLeft] = useState(3600) // 60 minutes in seconds
  const [isFullscreen, setIsFullscreen] = useState(true)
  const [violations, setViolations] = useState<string[]>([])
  const [showWarning, setShowWarning] = useState(false)
  const [test, setTest] = useState<Test | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch test data
  useEffect(() => {
    const fetchTestData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/student/tests/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })

        if (!response.ok) {
          throw new Error('Failed to fetch test data')
        }

        const data = await response.json()

        // Fetch questions for this test
        const questionsRes = await fetch(`http://localhost:5000/api/student/tests/${id}/questions`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        if (!questionsRes.ok) {
          throw new Error('Failed to fetch test questions')
        }
        const questions = await questionsRes.json()

        setTest({
          ...data,
          questions
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch test data')
      } finally {
        setLoading(false)
      }
    }

    fetchTestData()
  }, [id])

  // Set timer based on test duration
  useEffect(() => {
    if (test && test.duration) {
      setTimeLeft(test.duration * 60)
    }
  }, [test])

  // Format time left as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  // Handle timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmitTest()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Handle fullscreen detection
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement
      setIsFullscreen(isCurrentlyFullscreen)

      if (!isCurrentlyFullscreen) {
        setViolations((prev) => [...prev, `Exited fullscreen at ${new Date().toLocaleTimeString()}`])
        setShowWarning(true)

        // Auto-hide warning after 5 seconds
        setTimeout(() => {
          setShowWarning(false)
        }, 5000)
      }
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)

    // Request fullscreen when component mounts (only if user gesture is available)
    const requestFullscreen = async () => {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen()
        }
      } catch (error) {
        console.error("Couldn't enter fullscreen mode:", error)
        // Don't show error to user, just log it
      }
    }

    // Only request fullscreen if there's a user gesture available
    // This will be handled by the start test button instead

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  // Handle visibility change (tab switching)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        setViolations((prev) => [...prev, `Switched tab/window at ${new Date().toLocaleTimeString()}`])
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  const handleMSQChange = (questionId: string, option: string) => {
    const currentAnswer = answers[questionId] || []

    if (currentAnswer.includes(option)) {
      setAnswers((prev) => ({
        ...prev,
        [questionId]: currentAnswer.filter((opt: string) => opt !== option),
      }))
    } else {
      setAnswers((prev) => ({
        ...prev,
        [questionId]: [...currentAnswer, option],
      }))
    }
  }

  const handleMarkForReview = () => {
    if (test) {
      const questionId = test.questions[currentQuestion].id
      if (markedForReview.includes(questionId)) {
        setMarkedForReview(markedForReview.filter((q) => q !== questionId))
      } else {
        setMarkedForReview([...markedForReview, questionId])
      }
    }
  }

  const handleNextQuestion = () => {
    if (test && currentQuestion < test.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmitTest = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/student/tests/${id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          answers: Object.entries(answers).map(([questionId, answer]) => ({
            questionId,
            selectedAnswer: answer
          })),
          violations,
          timeTaken: 3600 - timeLeft // or your timer logic
        })
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || 'Failed to submit test')
      }

      // Redirect to results page
      router.push(`/student/results/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit test')
    }
  }

  const getQuestionStatusClass = (questionId: string) => {
    if (markedForReview.includes(questionId)) {
      return "bg-amber-100 border-amber-500 text-amber-700"
    }
    if (answers[questionId] !== undefined) {
      return "bg-green-100 border-green-500 text-green-700"
    }
    return "bg-gray-100 border-gray-300 text-gray-700"
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-blue"></div>
      </div>
    )
  }

  if (error || !test) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || 'Failed to load test'}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const question = test.questions[currentQuestion]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-6">
      {/* Main Header */}
      <header className="bg-white/80 shadow-lg rounded-b-2xl border-b border-blue-200 sticky top-0 z-20 flex items-center justify-between px-8 py-4 mb-6">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-9 w-9 text-blue-700 drop-shadow" />
          <h1 className="font-semibold text-2xl md:text-3xl tracking-wide">
            <span className="text-green-600">JMIT</span>
            <span className="text-blue-500"> Online Aptitude Test System</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={async () => {
              try {
                if (document.documentElement.requestFullscreen) {
                  await document.documentElement.requestFullscreen()
                }
              } catch (error) {
                console.error("Couldn't enter fullscreen mode:", error)
              }
            }}
            className="bg-green-100 hover:bg-green-200 px-4 py-2 rounded-full shadow-md border border-green-200 transition-colors duration-200 flex items-center gap-2"
          >
            <MonitorSmartphone className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">Enter Fullscreen</span>
          </button>
          <div className="flex items-center gap-3 bg-blue-100 px-5 py-2 rounded-full shadow-md border border-blue-200">
            <Clock className="h-5 w-5 text-blue-600 mr-2" />
            <span className="font-bold text-lg text-blue-700 tracking-wider">{formatTime(timeLeft)}</span>
          </div>
        </div>
      </header>
      <div className="flex h-[calc(100vh-7rem)]">
        {/* Question navigation sidebar */}
        <aside className="w-20 md:w-64 bg-white/90 border-r border-blue-100 shadow-lg rounded-2xl m-2 p-4 flex flex-col items-center">
          <div className="mb-4 w-full">
            <h2 className="text-sm font-semibold text-blue-600 mb-2 text-center">Question Navigator</h2>
            <div className="grid grid-cols-5 gap-2">
              {test.questions.map((q, index) => (
                <button
                  key={q.id}
                  className={`h-10 w-10 flex items-center justify-center rounded-xl border-2 font-semibold shadow-md transition-all duration-150 hover:scale-105 hover:border-blue-400 ${getQuestionStatusClass(q.id)} ${
                    currentQuestion === index ? "ring-2 ring-blue-400 scale-110" : ""
                  }`}
                  onClick={() => setCurrentQuestion(index)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2 mt-6 w-full">
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
              <span className="text-xs">Answered</span>
            </div>
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-amber-500 mr-2"></div>
              <span className="text-xs">Marked for Review</span>
            </div>
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-gray-300 mr-2"></div>
              <span className="text-xs">Not Answered</span>
            </div>
          </div>
        </aside>
        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-8">
          <Card className="mb-8 shadow-2xl rounded-2xl border-blue-100 bg-white/95">
            <CardContent className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-blue-800 drop-shadow">Question {currentQuestion + 1} of {test.questions.length}</h2>
                <div>
                  {markedForReview.includes(question.id) ? (
                    <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-500">
                      Marked for Review
                    </Badge>
                  ) : null}
                </div>
              </div>
              <div className="mb-8">
                <p className="text-lg font-medium text-gray-800">{question.text}</p>
              </div>
              {/* Question type: MCQ */}
              {question.type === "mcq" && question.options && (
                <RadioGroup
                  value={answers[question.id]?.toString() || ""}
                  onValueChange={(value) => handleAnswerChange(question.id, value)}
                  className="space-y-4"
                >
                  {question.options.map((option, idx) => (
                    <div key={idx} className="flex items-center space-x-3">
                      <RadioGroupItem value={option} id={`option-${question.id}-${idx}`} />
                      <Label htmlFor={`option-${question.id}-${idx}`}>{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
              {/* Question type: MSQ */}
              {question.type === "msq" && question.options && (
                <div className="space-y-4">
                  {question.options.map((option, idx) => (
                    <div key={idx} className="flex items-center space-x-3">
                      <Checkbox
                        id={`msq-option-${question.id}-${idx}`}
                        checked={(answers[question.id] || []).includes(option)}
                        onCheckedChange={() => handleMSQChange(question.id, option)}
                      />
                      <Label htmlFor={`msq-option-${question.id}-${idx}`}>{option}</Label>
                    </div>
                  ))}
                </div>
              )}
              {/* Question type: NAT */}
              {question.type === "nat" && (
                <div className="space-y-2">
                  <Label htmlFor={`nat-answer-${question.id}`}>Your Answer</Label>
                  <Input
                    id={`nat-answer-${question.id}`}
                    value={answers[question.id] || ""}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    placeholder="Enter your answer"
                    className="max-w-xs"
                  />
                </div>
              )}
            </CardContent>
          </Card>
          <div className="flex justify-between">
            <div className="space-x-2">
              <Button variant="outline" onClick={handlePrevQuestion} disabled={currentQuestion === 0}>
                Previous
              </Button>
              <Button
                variant={markedForReview.includes(question.id) ? "default" : "outline"}
                onClick={handleMarkForReview}
                className={markedForReview.includes(question.id) ? "bg-amber-500 hover:bg-amber-600" : ""}
              >
                {markedForReview.includes(question.id) ? "Unmark for Review" : "Mark for Review"}
              </Button>
            </div>
            <div className="space-x-2">
              {currentQuestion < test.questions.length - 1 ? (
                <Button onClick={handleNextQuestion} className="bg-primary-blue hover:bg-blue-700">
                  Save & Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmitTest}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Submit Test
                </Button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function Badge({
  children,
  className,
  variant = "default",
}: {
  children: React.ReactNode
  className?: string
  variant?: "default" | "outline"
}) {
  const baseClasses = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
  const variantClasses = {
    default: "bg-primary-blue text-white",
    outline: "border",
  }

  return <span className={`${baseClasses} ${variantClasses[variant]} ${className || ""}`}>{children}</span>
}

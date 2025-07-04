"use client"

import type React from "react"
import { use } from 'react';

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group" 
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Clock, AlertCircle } from "lucide-react"
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

    // Request fullscreen when component mounts
    const requestFullscreen = async () => {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen()
        }
      } catch (error) {
        console.error("Couldn't enter fullscreen mode:", error)
      }
    }

    requestFullscreen()

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
            answer
          })),
          violations,
          timeTaken: 3600 - timeLeft // Convert remaining time to time taken
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit test')
      }

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
    <div className="min-h-screen bg-gray-50">
      {/* Header with timer */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800">{test.title}</h1>

          <div className="flex items-center gap-4">
            <div className="flex items-center bg-gray-100 px-3 py-1.5 rounded-full">
              <Clock className="h-4 w-4 mr-2 text-primary-blue" />
              <span className="font-medium">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Warning for fullscreen exit */}
      {showWarning && (
        <div className="fixed top-16 inset-x-0 z-50">
          <Alert variant="destructive" className="rounded-none">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>
                You have exited fullscreen mode. This violation has been recorded. Please return to fullscreen mode.
              </span>
              <Button onClick={() => document.documentElement.requestFullscreen()} size="sm" className="ml-2">
                Return to Fullscreen
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Question navigation sidebar */}
        <aside className="w-20 md:w-64 bg-white border-r border-gray-200 overflow-y-auto p-4">
          <div className="mb-4">
            <h2 className="text-sm font-medium text-gray-500 mb-2">Question Navigator</h2>
            <div className="grid grid-cols-5 gap-2">
              {test.questions.map((q, index) => (
                <button
                  key={q.id}
                  className={`h-10 w-10 flex items-center justify-center rounded border font-medium ${getQuestionStatusClass(q.id)} ${
                    currentQuestion === index ? "ring-2 ring-primary-blue" : ""
                  }`}
                  onClick={() => setCurrentQuestion(index)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 mt-6">
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
              <span className="text-sm">Answered</span>
            </div>
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-amber-500 mr-2"></div>
              <span className="text-sm">Marked for Review</span>
            </div>
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-gray-300 mr-2"></div>
              <span className="text-sm">Not Answered</span>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                  Question {currentQuestion + 1} of {test.questions.length}
                </h2>
                <div>
                  {markedForReview.includes(question.id) ? (
                    <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-500">
                      Marked for Review
                    </Badge>
                  ) : null}
                </div>
              </div>

              <div className="mb-6">
                <p className="text-lg">{question.text}</p>
              </div>

              {/* Question type: MCQ */}
              {question.type === "mcq" && question.options && (
                <RadioGroup
                  value={answers[question.id]?.toString() || ""}
                  onValueChange={(value) => handleAnswerChange(question.id, value)}
                  className="space-y-3"
                >
                  {question.options.map((option, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`option-${question.id}-${idx}`} />
                      <Label htmlFor={`option-${question.id}-${idx}`}>{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {/* Question type: MSQ */}
              {question.type === "msq" && question.options && (
                <div className="space-y-3">
                  {question.options.map((option, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
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
                <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                  <Link href={`/student/test/${test.id}`}>Start Test</Link>
                </Button>
              )}
            </div>
          </div>

          {violations.length > 0 && (
            <Alert className="mt-6" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-1">Violations Detected:</div>
                <ul className="list-disc pl-5 text-sm">
                  {violations.map((violation, index) => (
                    <li key={index}>{violation}</li>
                  ))}
                </ul>
                <div className="mt-2 text-sm">Multiple violations may result in automatic test termination.</div>
              </AlertDescription>
            </Alert>
          )}
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

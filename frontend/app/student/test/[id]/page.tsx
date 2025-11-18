"use client"

import { use, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group" 
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Clock, AlertCircle, X, CheckCircle2, AlertTriangle, Flag, Menu } from "lucide-react"
import API_BASE_URL from "@/app/config/api"

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
  const { id } = use(params)
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [markedForReview, setMarkedForReview] = useState<string[]>([])
  const [timeLeft, setTimeLeft] = useState(0)
  const [initialDuration, setInitialDuration] = useState(0)
  const [test, setTest] = useState<Test | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Fetch test data
  useEffect(() => {
    const fetchTestData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/student/tests/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })

        if (!response.ok) {
          throw new Error('Failed to fetch test data')
        }

        const data = await response.json()

        const questionsRes = await fetch(`${API_BASE_URL}/student/tests/${id}/questions`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        if (!questionsRes.ok) {
          throw new Error('Failed to fetch test questions')
        }
        const questions = await questionsRes.json()

        // Handle both direct data and nested data.data structure
        const testData = data.data || data
        const durationInMinutes = testData.duration || data.duration || 60 // Default to 60 minutes if not found
        const durationInSeconds = durationInMinutes * 60

        setTest({
          ...testData,
          questions,
          duration: durationInMinutes
        })
        
        // Set initial duration and time left
        setInitialDuration(durationInSeconds)
        setTimeLeft(durationInSeconds)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch test data')
      } finally {
        setLoading(false)
      }
    }

    fetchTestData()
  }, [id])

  // Format time left as HH:MM:SS
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  // Handle timer - only start when test is loaded and duration is set
  useEffect(() => {
    // Don't start timer if test is not loaded or duration is 0
    if (!test || initialDuration === 0 || timeLeft === 0) {
      return
    }

    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    // Start the timer
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current)
          }
          // Call submit directly to avoid dependency issues
          handleSubmitTest()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [test, initialDuration])

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
      // Stop the timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      const timeTakenInMinutes = initialDuration > 0 
        ? Math.floor((initialDuration - timeLeft) / 60)
        : 0

      const response = await fetch(`${API_BASE_URL}/student/tests/${id}/submit`, {
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
          timeTaken: timeTakenInMinutes
        })
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || 'Failed to submit test')
      }

      router.push(`/student/results/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit test')
    }
  }

  const getQuestionStatus = (questionId: string) => {
    const isAnswered = answers[questionId] !== undefined
    const isMarked = markedForReview.includes(questionId)
    
    if (isAnswered && isMarked) {
      return 'answered-marked'
    } else if (!isAnswered && isMarked) {
      return 'unanswered-marked'
    } else if (isAnswered) {
      return 'answered'
    } else {
      return 'unanswered'
    }
  }

  const getStatusCounts = () => {
    if (!test) return { answered: 0, unanswered: 0, answeredMarked: 0, unansweredMarked: 0 }
    
    let answered = 0
    let unanswered = 0
    let answeredMarked = 0
    let unansweredMarked = 0

    test.questions.forEach((q) => {
      const status = getQuestionStatus(q.id)
      if (status === 'answered') answered++
      else if (status === 'unanswered') unanswered++
      else if (status === 'answered-marked') answeredMarked++
      else if (status === 'unanswered-marked') unansweredMarked++
    })

    return { answered, unanswered, answeredMarked, unansweredMarked }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !test) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || 'Failed to load test'}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const question = test.questions[currentQuestion]
  const statusCounts = getStatusCounts()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex flex-col">
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        .question-badge {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          transform-style: preserve-3d;
        }

        .question-badge:hover {
          transform: translateY(-3px) translateZ(5px) rotateY(5deg);
        }

        .option-item {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          transform-style: preserve-3d;
        }

        .option-item:hover {
          transform: translateX(8px) translateZ(5px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        }

        .question-nav-btn {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          transform-style: preserve-3d;
        }

        .question-nav-btn:hover {
          transform: translateY(-3px) translateZ(5px) scale(1.1);
        }

        .question-nav-btn.active {
          transform: translateY(-2px) translateZ(10px) scale(1.15);
        }
      `}</style>

      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b-2 border-gray-200 shadow-md px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between">
        <div className="animate-slide-in">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent">
            {test.title || "Aptitude Test"}
          </h1>
        </div>
        <div className="flex items-center gap-3 animate-fade-in-up">
          <div className="bg-gradient-to-r from-gray-100 to-gray-50 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl flex items-center gap-3 shadow-md border border-gray-200">
            <Clock className="h-5 w-5 text-blue-600" />
            <span className="text-sm sm:text-base font-semibold text-gray-800">Total time left: {formatTime(timeLeft)}</span>
            <button className="ml-2 text-gray-400 hover:text-gray-600 transition-colors">
              <X className="h-5 w-5" />
          </button>
          </div>
          <button
            className="lg:hidden ml-2 px-3 py-2 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md hover:shadow-lg active:scale-95 transition-all"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open questions"
          >
            <div className="flex items-center gap-2">
              <Menu className="h-5 w-5" />
              <span className="text-sm font-semibold">Questions</span>
            </div>
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-white/80 backdrop-blur-sm p-5 sm:p-8 sm:pl-10">
          <div className="w-full">
            {/* Question Header */}
            <div className="flex items-center gap-3 mb-8 animate-fade-in-up">
              <div className="question-badge flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 border-3 border-yellow-600 shadow-lg">
                <span className="text-white font-bold text-base sm:text-lg">{currentQuestion + 1}</span>
              </div>
              <span className="text-orange-600 font-bold text-xl sm:text-2xl">*</span>
             
            {/* Question Text */}
            <div className="mb-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <p className="text-xl sm:text-2xl md:text-3xl text-gray-600 leading-relaxed font-medium">{question.text}</p>
            </div>
            </div>

            {/* Options */}
              {question.type === "mcq" && question.options && (
                <RadioGroup
                  value={answers[question.id]?.toString() || ""}
                  onValueChange={(value) => handleAnswerChange(question.id, value)}
                className="space-y-4 sm:space-y-5 mb-8 sm:mb-10"
                >
                  {question.options.map((option, idx) => (
                  <div 
                    key={idx} 
                    className="option-item flex items-center space-x-3 sm:space-x-4 p-4 sm:p-5 bg-gradient-to-r from-white to-gray-50/50 hover:from-blue-50 hover:to-indigo-50/50 rounded-xl border-2 border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-lg cursor-pointer"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <RadioGroupItem value={option} id={`option-${question.id}-${idx}`} className="w-5 h-5" />
                    <Label htmlFor={`option-${question.id}-${idx}`} className="flex-1 cursor-pointer text-gray-800 text-base sm:text-lg font-medium">
                      {option}
                    </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {question.type === "msq" && question.options && (
              <div className="space-y-4 sm:space-y-5 mb-8 sm:mb-10">
                  {question.options.map((option, idx) => (
                  <div 
                    key={idx} 
                    className="option-item flex items-center space-x-3 sm:space-x-4 p-4 sm:p-5 bg-gradient-to-r from-white to-gray-50/50 hover:from-blue-50 hover:to-indigo-50/50 rounded-xl border-2 border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-lg cursor-pointer"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                      <Checkbox
                        id={`msq-option-${question.id}-${idx}`}
                        checked={(answers[question.id] || []).includes(option)}
                        onCheckedChange={() => handleMSQChange(question.id, option)}
                      className="w-5 h-5"
                      />
                    <Label htmlFor={`msq-option-${question.id}-${idx}`} className="flex-1 cursor-pointer text-gray-800 text-base sm:text-lg font-medium">
                      {option}
                    </Label>
                    </div>
                  ))}
                </div>
              )}

              {question.type === "nat" && (
              <div className="mb-8 sm:mb-10">
                  <Input
                    id={`nat-answer-${question.id}`}
                    value={answers[question.id] || ""}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    placeholder="Enter your answer"
                  className="w-full max-w-lg text-base sm:text-lg p-3 sm:p-4 border-2 border-gray-300 focus:border-blue-500 rounded-xl"
                  />
                </div>
              )}

            {/* Mark for Review */}
            <div className="flex justify-end animate-fade-in-up mb-6 sm:mb-8" style={{ animationDelay: '0.3s' }}>
              <label className="flex items-center gap-3 cursor-pointer group p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <Checkbox
                  checked={markedForReview.includes(question.id)}
                  onCheckedChange={handleMarkForReview}
                  className="w-5 h-5"
                />
                <span className="text-base font-medium text-gray-700 group-hover:text-blue-600 transition-colors">Mark for Review</span>
              </label>
            </div>
        
            <hr></hr>

            {/* Footer Buttons */}
            <div className="border-t-2 border-gray-200 pt-5 sm:pt-6 mt-6 sm:mt-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white/80 text-sm sm:text-lg font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all group whitespace-nowrap w-full sm:w-auto shadow-sm">
                  <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 group-hover:text-red-600 transition-colors" />
                  Report content
                </button>
                <div className="w-full sm:w-auto flex flex-col gap-3 sm:gap-4">
                  <Button
                    variant="outline"
                    onClick={handleSubmitTest}
                    className="w-full sm:w-auto border-green-500 text-green-700 font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-green-50 hover:text-green-900 transition-all text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                  >
                    Submit Test
                  </Button>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      onClick={handlePrevQuestion}
                      disabled={currentQuestion === 0}
                      className="w-full sm:w-auto border-2 border-blue-400 text-blue-600 hover:bg-blue-50 hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed px-6 sm:px-7 py-2.5 sm:py-3 text-base sm:text-lg font-medium transition-all duration-200"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={handleNextQuestion}
                      className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 sm:px-9 py-2.5 sm:py-3 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    >
                      {currentQuestion < test.questions.length - 1 ? "Save & Next" : "Submit"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <aside
          className={`
            w-full lg:w-[420px] bg-white/95 backdrop-blur-sm border-t-2 lg:border-t-0 lg:border-l-2 border-gray-200 shadow-xl overflow-y-auto
            ${sidebarOpen ? 'fixed inset-0 z-50 lg:static' : 'hidden lg:block'}
          `}
        >
          {sidebarOpen && (
            <div className="absolute inset-0 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)}></div>
          )}
          <div
            className={`absolute right-0 top-0 h-full w-[90%] max-w-sm bg-white/95 backdrop-blur-sm shadow-2xl transform transition-transform duration-300 lg:static lg:translate-x-0 lg:shadow-none lg:bg-transparent ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0`}
            style={{ transformStyle: 'preserve-3d' }}
          >
          <div className="p-5 sm:p-8">
            <div className="flex items-center justify-between lg:hidden mb-3">
              <h3 className="text-lg font-bold text-gray-800">Navigation</h3>
              <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 shadow-sm" onClick={() => setSidebarOpen(false)} aria-label="Close questions">
                <X className="h-5 w-5" />
              </button>
            </div>
            {/* Question Status Summary */}
            <div className="mb-8 space-y-4 bg-gradient-to-br from-gray-50 to-blue-50/30 p-6 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3 text-lg">
                <div className="w-6 h-6 rounded-full bg-blue-600 shadow-sm"></div>
                <span className="text-gray-800 font-medium">{statusCounts.answered} Answered</span>
              </div>
              <div className="flex items-center gap-3 text-lg">
                <div className="w-6 h-6 rounded-full border-2 border-gray-400 bg-white shadow-sm"></div>
                <span className="text-gray-800 font-medium">{statusCounts.unanswered} Unanswered</span>
              </div>
              <div className="flex items-center gap-3 text-lg">
                <div className="relative">
                  <div className="w-6 h-6 rounded-full bg-blue-600 shadow-sm"></div>
                  <CheckCircle2 className="h-5 w-5 text-green-500 fill-green-500 absolute -bottom-0.5 -right-0.5" />
                </div>
                <span className="text-gray-800 font-medium">{statusCounts.answeredMarked} Answered & marked</span>
              </div>
              <div className="flex items-center gap-3 text-lg">
                <div className="relative">
                  <div className="w-6 h-6 rounded-full border-2 border-gray-400 bg-white shadow-sm"></div>
                  <CheckCircle2 className="h-5 w-5 text-green-500 fill-green-500 absolute -bottom-0.5 -right-0.5" />
                </div>
                <span className="text-gray-800 font-medium">{statusCounts.unansweredMarked} Unanswered & marked</span>
              </div>
            </div>

            {/* Question Navigation */}
            <div className="mb-8">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-5">Choose a question</h3>
              <div className="grid grid-cols-6 sm:grid-cols-5 gap-2 sm:gap-3 max-h-[50vh] lg:max-h-none overflow-y-auto pr-1">
                {test.questions.map((q, index) => {
                  const status = getQuestionStatus(q.id)
                  const isCurrent = currentQuestion === index
                  
                  return (
                    <button
                      key={q.id}
                      onClick={() => { setCurrentQuestion(index); if (sidebarOpen) setSidebarOpen(false) }}
                      className={`
                        question-nav-btn relative w-10 h-10 sm:w-14 sm:h-14 rounded-full border-2 font-bold text-base sm:text-lg
                        flex items-center justify-center shadow-md
                        ${
                          isCurrent
                            ? 'bg-white border-blue-600 text-blue-600 ring-4 ring-blue-200 shadow-lg'
                            : status === 'answered'
                            ? 'bg-gradient-to-br from-blue-600 to-blue-700 border-blue-600 text-white shadow-lg'
                            : status === 'answered-marked'
                            ? 'bg-gradient-to-br from-blue-600 to-blue-700 border-blue-600 text-white shadow-lg'
                            : status === 'unanswered-marked'
                            ? 'bg-white border-gray-400 text-gray-700'
                            : 'bg-white border-gray-300 text-gray-700'
                        }
                      `}
                    >
                      <span className={isCurrent ? 'text-blue-600 font-bold' : status === 'answered' || status === 'answered-marked' ? 'text-white font-bold' : 'text-gray-700 font-semibold'}>
                        {index + 1}
                      </span>
                      <span className={`absolute -top-1 -right-1 text-xs sm:text-base font-bold ${isCurrent ? 'text-blue-600' : status === 'answered' || status === 'answered-marked' ? 'text-white' : 'text-gray-700'}`}>*</span>
                      {status === 'answered-marked' && (
                        <CheckCircle2 className="absolute -bottom-0.5 -right-0.5 h-4 w-4 text-green-500 fill-green-500" />
                      )}
                      {status === 'unanswered-marked' && (
                        <CheckCircle2 className="absolute -bottom-0.5 -right-0.5 h-4 w-4 text-green-500 fill-green-500" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Instruction */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-4 sm:p-5 shadow-md">
              <p className="text-base font-medium text-red-700 leading-relaxed">
                Provide a response to the question marked with an asterisk (*), as it is a mandatory requirement.
              </p>
            </div>
          </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

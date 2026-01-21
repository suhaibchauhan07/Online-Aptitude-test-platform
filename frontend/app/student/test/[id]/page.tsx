// Test Details Page
"use client"
import { use, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Clock, AlertCircle, AlertTriangle, Flag, Menu, Maximize } from "lucide-react"
import dynamic from 'next/dynamic'
import { Skeleton } from "@/components/ui/skeleton"

const QuestionOptions = dynamic(() => import('@/components/student/test/QuestionOptions'), {
  loading: () => (
    <div className="space-y-4 sm:space-y-5 mb-8 sm:mb-10">
      <Skeleton className="h-16 w-full rounded-xl" />
      <Skeleton className="h-16 w-full rounded-xl" />
      <Skeleton className="h-16 w-full rounded-xl" />
      <Skeleton className="h-16 w-full rounded-xl" />
    </div>
  ),
  ssr: false
})

const TestSidebar = dynamic(() => import('@/components/student/test/TestSidebar'), {
  loading: () => (
    <aside className="hidden lg:block w-[420px] bg-white border-l-2 border-gray-200 p-8">
      <Skeleton className="h-40 w-full mb-8 rounded-xl" />
      <div className="grid grid-cols-5 gap-3">
        {[...Array(20)].map((_, i) => (
          <Skeleton key={i} className="h-14 w-14 rounded-full" />
        ))}
      </div>
    </aside>
  ),
  ssr: false
})
import API_BASE_URL from "@/app/config/api"
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Question {
  id: string
  text: string
  type: "mcq" | "msq" | "nat"
  options: string[]
  correctAnswer?: string | number | number[]
  marks?: number
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
  const [timerReady, setTimerReady] = useState(false)
  const [test, setTest] = useState<Test | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submittedRef = useRef(false)
  const [attemptId, setAttemptId] = useState<string | null>(null)
  
  // Security & Full Screen State
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [violationCount, setViolationCount] = useState(0)

  // 1. Enter Full Screen Helper
  const enterFullScreen = async () => {
    const element = document.documentElement as any;
    try {
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen();
      } else if (element.msRequestFullscreen) {
        await element.msRequestFullscreen();
      }
      setIsFullScreen(true);
    } catch (err) {
      console.error("Error entering full screen:", err);
      // Fallback for some browsers or if already in full screen
      setIsFullScreen(!!document.fullscreenElement);
    }
  };

  // 2. Violation Handler
  const handleViolation = (reason: string) => {
    if (submittedRef.current) return;

    console.warn(`Violation detected: ${reason}`);
    handleSubmitTest(true);
  };

  // 3. Security Event Listeners
  useEffect(() => {
    if (loading || !test || submittedRef.current) return;

    const handleFullScreenChange = () => {
      const isFull = !!document.fullscreenElement || 
                     !!(document as any).webkitFullscreenElement || 
                     !!(document as any).msFullscreenElement;
      
      setIsFullScreen(isFull);
      if (!isFull && !submittedRef.current) {
        handleViolation("Exited Full Screen");
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && !submittedRef.current) {
        handleViolation("App switched/minimized");
      }
    };

    const handleWindowBlur = () => {
      if (!submittedRef.current && !document.hasFocus()) {
         // Debounce or verify visibility to avoid false positives
         // For strict mode, we count it.
         handleViolation("Window lost focus");
      }
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullScreenChange);
    document.addEventListener("mozfullscreenchange", handleFullScreenChange);
    document.addEventListener("MSFullscreenChange", handleFullScreenChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullScreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullScreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullScreenChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [loading, test]); // Re-bind if loading finishes

  // 4. Back Button & Navigation Guard
  useEffect(() => {
    // Push initial state to trap back button
    window.history.pushState(null, "", window.location.href);

    const handlePopState = (event: PopStateEvent) => {
      // Prevent going back by pushing state again
      window.history.pushState(null, "", window.location.href);
      
      // If test is submitted, force redirect to results
      if (submittedRef.current) {
        router.replace(`/student/results/${id}`);
      } else {
         // Optional: Show warning or just silently block
         console.warn("Back navigation is disabled during test.");
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [id, router]);

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
        
        setInitialDuration(durationInSeconds)
        const durationMs = durationInMinutes * 60 * 1000
        const nowMs = Date.now()
        let startMsCandidate: number | undefined
        const isValidStart = (ts?: number) => {
          if (typeof ts !== 'number' || Number.isNaN(ts)) return false
          // Must be in the past and within the window length (not older than duration)
          return ts <= nowMs && ts >= nowMs - durationMs
        }

        try {
          const availRes = await fetch(`${API_BASE_URL}/student/tests/available`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          })
          if (availRes.ok) {
            const availData = await availRes.json()
            const list = Array.isArray(availData) ? availData : availData?.data
            if (Array.isArray(list)) {
              const match = list.find((t: any) => t._id === id || t.id === id)
              if (match?.startTime) {
                const ts = new Date(match.startTime).getTime()
                if (isValidStart(ts)) startMsCandidate = ts
              }
            }
          }
        } catch (_) {}

        if (!startMsCandidate) {
          const testStart = testData.startTime ? new Date(testData.startTime).getTime() : NaN
          if (isValidStart(testStart)) startMsCandidate = testStart
        }

        if (!startMsCandidate) {
          const lsVal = localStorage.getItem(`testStart:${id}`)
          if (lsVal) {
            const parsed = Number(lsVal)
            if (isValidStart(parsed)) startMsCandidate = parsed
          }
        }

        if (!startMsCandidate) {
          const attemptStart = testData.attemptStartTime ? new Date(testData.attemptStartTime).getTime() : NaN
          const startedAt = testData.startedAt ? new Date(testData.startedAt).getTime() : NaN
          if (isValidStart(attemptStart)) startMsCandidate = attemptStart
          else if (isValidStart(startedAt)) startMsCandidate = startedAt
        }

        if (startMsCandidate && typeof startMsCandidate === 'number') {
          const endMs = startMsCandidate + durationMs
          const rawRemaining = Math.floor((endMs - nowMs) / 1000)
          const remainingSeconds = Math.max(0, Math.min(durationInSeconds, rawRemaining))
          setTimeLeft(remainingSeconds)
          setTimerReady(remainingSeconds > 0)
        } else {
          setTimeLeft(durationInSeconds)
          setTimerReady(durationInSeconds > 0)
        }

        // Ensure an in-progress attempt exists to prevent duplicate submissions
        try {
          const startRes = await fetch(`${API_BASE_URL}/student/tests/${id}/start`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          })
          if (startRes.ok) {
            const startData = await startRes.json()
            const attempt = startData.data || startData
            if (attempt?.attemptId) setAttemptId(attempt.attemptId)
          }
        } catch (_) {}
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch test data')
      } finally {
        setLoading(false)
      }
    }

    fetchTestData()
  }, [id])

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`testAnswers:${id}`)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed && typeof parsed === 'object') {
          setAnswers(parsed)
        }
      }
    } catch (_) {}
  }, [id])

  // Format time left as HH:MM:SS
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  // Handle timer - start when test is loaded and timeLeft initialized
  useEffect(() => {
    if (!test || initialDuration === 0 || !timerReady) {
      return
    }

    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current)
          }
          if (!submittedRef.current) {
            submittedRef.current = true
            handleSubmitTest()
          }
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
  }, [test, initialDuration, timerReady])

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers((prev) => {
      const next = { ...prev, [questionId]: value }
      try { localStorage.setItem(`testAnswers:${id}`, JSON.stringify(next)) } catch (_) {}
      return next
    })
  }

  const handleMSQChange = (questionId: string, option: string) => {
    const currentAnswer = answers[questionId] || []

    if (currentAnswer.includes(option)) {
      setAnswers((prev) => {
        const next = { ...prev, [questionId]: currentAnswer.filter((opt: string) => opt !== option) }
        try { localStorage.setItem(`testAnswers:${id}`, JSON.stringify(next)) } catch (_) {}
        return next
      })
    } else {
      setAnswers((prev) => {
        const next = { ...prev, [questionId]: [...currentAnswer, option] }
        try { localStorage.setItem(`testAnswers:${id}`, JSON.stringify(next)) } catch (_) {}
        return next
      })
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

  const handleSubmitTest = async (isViolation = false) => {
    try {
      if (isSubmitting || submittedRef.current) return
      setIsSubmitting(true)
      submittedRef.current = true
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
          timeTaken: timeTakenInMinutes,
          isViolation: isViolation
        })
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || 'Failed to submit test')
      }

      router.replace(`/student/results/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit test')
    }
    finally {
      setIsSubmitting(false)
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
  const qType = (question?.type || 'mcq').toString().toLowerCase()
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
      <header className="bg-white/95 backdrop-blur-sm border-b-2 border-gray-200 shadow-md px-4 sm:px-8 py-3 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 sticky top-0 z-30">
        <div className="animate-slide-in flex justify-between items-center w-full sm:w-auto">
          <h1 className="text-lg sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent truncate max-w-[200px] sm:max-w-none">
            {test.title || "Aptitude Test"}
          </h1>
          <button
            className="lg:hidden ml-2 px-3 py-2 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md hover:shadow-lg active:scale-95 transition-all sm:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open questions"
          >
            <div className="flex items-center gap-2">
              <Menu className="h-4 w-4" />
              <span className="text-xs font-semibold">Questions</span>
            </div>
          </button>
        </div>
        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 animate-fade-in-up">
          <div className="bg-gradient-to-r from-gray-100 to-gray-50 px-3 py-2 sm:px-5 sm:py-3 rounded-xl flex items-center gap-2 sm:gap-3 shadow-md border border-gray-200 flex-1 sm:flex-none justify-center">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            <span className="text-sm sm:text-base font-semibold text-gray-800 whitespace-nowrap">Time left: {formatTime(timeLeft)}</span>
          </div>
          <button
            className="hidden sm:block lg:hidden ml-2 px-3 py-2 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md hover:shadow-lg active:scale-95 transition-all"
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
              <p className="text-xl sm:text-2xl md:text-3xl text-gray-600 leading-relaxed font-medium">
                {question.text}
                {typeof question.marks === 'number' && (
                  <span className="ml-3 inline-block text-sm sm:text-base font-semibold text-blue-700 bg-blue-100 px-3 py-1 rounded-lg align-middle">
                    Marks: {question.marks}
                  </span>
                )}
              </p>
            </div>
            </div>

            {/* Options */}
            <QuestionOptions
              question={question}
              answers={answers}
              handleAnswerChange={handleAnswerChange}
              handleMSQChange={handleMSQChange}
            />

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
                <div className="w-full sm:w-auto flex flex-col gap-3 sm:gap-4">                 
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
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
                     <Button
                    variant="outline"
                    onClick={() => handleSubmitTest()}
                    className="w-full sm:w-auto border-green-500 text-green-700 font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-green-50 hover:text-green-900 transition-all text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                  >
                    Submit Test
                  </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <TestSidebar
          test={test}
          currentQuestion={currentQuestion}
          setCurrentQuestion={setCurrentQuestion}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          statusCounts={statusCounts}
          getQuestionStatus={getQuestionStatus}
        />
      </div>

      {/* Full Screen Overlay */}
      {!isFullScreen && !loading && !error && test && !submittedRef.current && (
        <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Maximize className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Full Screen Required</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              This test must be taken in full screen mode to ensure exam integrity. 
              Exiting full screen will be recorded as a violation.
            </p>
            <Button 
              onClick={enterFullScreen} 
              size="lg" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-6 text-lg font-semibold shadow-lg hover:shadow-blue-500/30 transition-all"
            >
              Enter Full Screen
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

"use client";
import { use, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Trophy, Award, Star, TrendingUp, Target, Zap, Brain, ChevronLeft, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import API_BASE_URL from "@/app/config/api"
import dynamic from 'next/dynamic';
import { Skeleton } from "@/components/ui/skeleton";

const ResultStatsGrid = dynamic(() => import('@/components/student/ResultStatsGrid'), {
  loading: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-40 rounded-xl" />
      ))}
    </div>
  ),
  ssr: false
});

const QuestionAnalysisList = dynamic(() => import('@/components/student/QuestionAnalysisList'), {
  loading: () => (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-64 rounded-xl" />
      ))}
    </div>
  ),
  ssr: false
});

type Question = { id: string; type: string; correctAnswer: any; marks?: number }

export default function TestResult({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params)
	const [result, setResult] = useState<any>(null);
	const [marksMap, setMarksMap] = useState<Map<string, number>>(new Map());
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [fallback, setFallback] = useState<any | null>(null);

	// Removed the useEffect that blocked back navigation to fix the navigation flow.

	useEffect(() => { 
		const fetchResult = async () => {
			try {
				setLoading(true)
					const response= await fetch(`${API_BASE_URL}/student/tests/${id}/result`, {
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`
					},
                    cache: 'no-store'
				});
				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.message || 'Failed to fetch result');
				}
				const data = await response.json();
				setResult(data);
				try { if (data?.answers && data.answers.length > 0) localStorage.removeItem(`testAnswers:${id}`) } catch (_) {}
				if (!data?.answers || data.answers.length === 0) {
					// Fallback logic only if no answers from backend
                    // If violation, we might not have answers but we should rely on backend result mainly
                    if (data?.isViolation) return; // Don't fallback if it's a violation result
                    
					try {
						const saved = localStorage.getItem(`testAnswers:${id}`)
						if (saved) {
							const localAnswers = JSON.parse(saved)
							const qRes = await fetch(`${API_BASE_URL}/student/tests/${id}/questions`, {
								headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
							})
                            if (qRes.ok) {
                                const questions: Question[] = await qRes.json()
                                const qMap = new Map<string, Question>(questions.map((q) => [String(q.id), q]))
                                const entries = Object.entries(localAnswers as Record<string, any>)
                                const computed = entries.map(([questionId, selected]: [string, any]) => {
                                    const q = qMap.get(String(questionId))
                                    if (!q) return { questionId, selectedAnswer: selected, isCorrect: false, marksObtained: 0 }
                                    let isCorrect = false
                                    if (q.type === 'mcq' || q.type === 'MCQ') {
                                        isCorrect = String(q.correctAnswer) === String(selected)
                                    } else if (q.type === 'msq' || q.type === 'MSQ') {
                                        const ca = Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer]
                                        const sa = Array.isArray(selected) ? selected : [selected]
                                        isCorrect = ca.length === sa.length && ca.every((v: any) => sa.includes(v))
                                    } else if (q.type === 'nat' || q.type === 'NAT') {
                                        const cn = Number(q.correctAnswer)
                                        const sn = Number(selected)
                                        isCorrect = !Number.isNaN(cn) && !Number.isNaN(sn) && cn === sn
                                    }
                                    const perMarks = Number(q?.marks ?? 1)
                                    return { questionId, selectedAnswer: selected, isCorrect, marksObtained: isCorrect ? perMarks : 0 }
                                })
								const totalMarks = questions.reduce((acc: number, q: any) => acc + Number(q?.marks ?? 1), 0)
								const marksObtained = computed.reduce((acc: number, a: any) => acc + a.marksObtained, 0)
								const percentage = totalMarks > 0 ? (marksObtained / totalMarks) * 100 : 0
								setFallback({ answers: computed, totalMarks, marksObtained, percentage })
								try { localStorage.removeItem(`testAnswers:${id}`) } catch (_) {}
							}
						}
					} catch (_) {}
				}
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Failed to fetch result');
			} finally {
				setLoading(false);
			}
		};
		fetchResult();
	}, [id]);

	useEffect(() => {
		const fetchMarks = async () => {
			try {
				const qRes = await fetch(`${API_BASE_URL}/student/tests/${id}/questions`, {
					headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
				});
				if (qRes.ok) {
					const questions: Question[] = await qRes.json();
					const mMap = new Map<string, number>(questions.map((q) => [String(q.id), Number(q.marks ?? 1)]));
					setMarksMap(mMap);
				}
			} catch (_) {}
		};
		if (id) fetchMarks();
	}, [id]);

	const getScoreData = (percentage: number) => {
		if (percentage >= 80) return {
			color: "text-green-600",
			bgColor: "bg-green-50",
            borderColor: "border-green-200",
			icon: <Trophy className="h-8 w-8 text-green-600" />,
			text: "Excellent!",
            badge: "bg-green-100 text-green-700 hover:bg-green-200"
		}
		if (percentage >= 60) return {
			color: "text-blue-600",
			bgColor: "bg-blue-50",
            borderColor: "border-blue-200",
			icon: <Award className="h-8 w-8 text-blue-600" />,
			text: "Good Work!",
            badge: "bg-blue-100 text-blue-700 hover:bg-blue-200"
		}
		if (percentage >= 40) return {
			color: "text-orange-600",
			bgColor: "bg-orange-50",
            borderColor: "border-orange-200",
			icon: <Star className="h-8 w-8 text-orange-600" />,
			text: "Keep Improving!",
            badge: "bg-orange-100 text-orange-700 hover:bg-orange-200"
		}
		return {
			color: "text-red-600",
			bgColor: "bg-red-50",
            borderColor: "border-red-200",
			icon: <TrendingUp className="h-8 w-8 text-red-600" />,
			text: "Practice More!",
            badge: "bg-red-100 text-red-700 hover:bg-red-200"
		}
	}

	// Calculate detailed analytics
	const getAnalyticsData = (result: any) => {
		const answers = result.answers || [];
		const correctCount = result.correctCount || answers.filter((ans: any) => ans.isCorrect).length;
		const incorrectCount = result.incorrectCount || answers.length - correctCount;
		const accuracyRate = result.accuracyRate || (answers.length > 0 ? (correctCount / answers.length) * 100 : 0);
		const avgTimePerQuestion = result.timeTaken ? result.timeTaken / answers.length : 0;
		
		return {
			correctCount,
			incorrectCount,
			accuracyRate,
			avgTimePerQuestion,
			totalQuestions: result.totalQuestions || answers.length
		};
	}

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="flex flex-col items-center space-y-4">
					<div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
					<p className="text-gray-600 font-medium">Loading your results...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
				<Card className="max-w-md w-full border-red-200 shadow-lg">
                    <CardContent className="pt-6 text-center">
						<AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
						<h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Result</h2>
						<p className="text-gray-600 mb-6">{error}</p>
                        <Button asChild variant="outline">
                            <Link href="/student/results">Go Back to Results</Link>
                        </Button>
                    </CardContent>
				</Card>
			</div>
		);
	}

	if (!result) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
				<Card className="max-w-md w-full shadow-lg">
                    <CardContent className="pt-6 text-center">
                        <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">No Result Found</h2>
                        <p className="text-gray-600 mb-6">We couldn't find the result you're looking for.</p>
                        <Button asChild variant="outline">
                            <Link href="/student/results">Go Back to Results</Link>
                        </Button>
                    </CardContent>
				</Card>
			</div>
		);
	}

	const sectionScores = Array.isArray(result.sectionScores) ? result.sectionScores : [];
    const isViolation = result?.isViolation || false;
	const percentage = isViolation ? 0 : (typeof result.percentage === 'number' && result.answers?.length ? Math.round(result.percentage) : Math.round(fallback?.percentage || 0));
	const totalMarks = typeof result.totalMarks === 'number' && result.answers?.length ? result.totalMarks : (fallback?.totalMarks || 0);
	const marksObtained = isViolation ? 0 : (typeof result.marksObtained === 'number' && result.answers?.length ? result.marksObtained : (fallback?.marksObtained || 0));
	const scoreData = getScoreData(percentage);
	const analytics = getAnalyticsData(result.answers?.length ? result : (fallback || { answers: [] }));

	return (
		<div className="min-h-screen bg-gray-50 pb-12 font-sans">
            {/* Header / Nav */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href="/student/results" className="text-gray-500 hover:text-gray-900 transition-colors p-2 -ml-2 rounded-full hover:bg-gray-100">
                            <ChevronLeft className="h-5 w-5" />
                        </Link>
                        <h1 className="text-xl font-bold text-gray-900">Test Analysis</h1>
                    </div>
                    <Badge variant="outline" className="font-mono text-xs">
                        {new Date().toLocaleDateString()}
                    </Badge>
                </div>
            </div>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            {scoreData.text} 
                            {scoreData.icon}
                        </h2>
                        <p className="text-gray-600 mt-1">Here is the detailed analysis of your performance.</p>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                         <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm flex items-center gap-2">
                            <Target className="h-4 w-4 text-blue-500" />
                            <span className="font-semibold text-gray-900">{marksObtained}/{totalMarks}</span>
                            <span className="text-xs text-gray-500 uppercase font-medium">Marks</span>
                         </div>
                         <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm flex items-center gap-2">
                            <Brain className="h-4 w-4 text-purple-500" />
                            <span className="font-semibold text-gray-900">{percentage}%</span>
                            <span className="text-xs text-gray-500 uppercase font-medium">Score</span>
                         </div>
                    </div>
                </div>

                {/* Violation Alert */}
                {result.isViolation && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-4">
                        <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0" />
                        <div>
                            <h3 className="text-lg font-bold text-red-900">Test Violation Detected</h3>
                            <p className="text-red-700 mt-1">You violated the test rules, therefore your test was automatically submitted.</p>
                        </div>
                    </div>
                )}

				{/* Stats Grid */}
				<ResultStatsGrid 
					scoreData={scoreData}
					percentage={percentage}
					marksObtained={marksObtained}
					totalMarks={totalMarks}
					analytics={analytics}
					timeTaken={result.timeTaken || 0}
				/>

				{/* Detailed Question Analysis */}
				{result.answers && result.answers.length > 0 && (
					<QuestionAnalysisList 
						answers={result.answers}
						marksMap={marksMap}
					/>
				)}

				{/* Section Performance */}
				{sectionScores.length > 0 && (
					<Card className="border-0 shadow-sm ring-1 ring-gray-200">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Target className="h-5 w-5 text-blue-600" />
								Section Performance
							</CardTitle>
							<CardDescription>Breakdown by test sections</CardDescription>
						</CardHeader>
						<CardContent className="grid gap-6">
                            {sectionScores.map((section: any, index: number) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-medium text-gray-700">{section.name}</span>
                                        <span className="font-bold text-gray-900">
                                            {Math.round(((section.score || 0) * (section.total || 0)) / 100)}/{section.total || 0}
                                        </span>
                                    </div>
                                    <Progress 
                                        value={section.score || 0} 
                                        className="h-2.5" 
                                        indicatorClassName={
                                            (section.score || 0) >= 80 ? 'bg-green-500' :
                                            (section.score || 0) >= 60 ? 'bg-blue-500' :
                                            (section.score || 0) >= 40 ? 'bg-yellow-500' :
                                            'bg-red-500'
                                        }
                                    />
                                </div>
                            ))}
						</CardContent>
					</Card>
				)}

				{/* Summary & Insights Card */}
				<Card className="border-0 shadow-sm ring-1 ring-gray-200 bg-gradient-to-br from-white to-gray-50/50">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Brain className="h-5 w-5 text-purple-600" />
							Performance Summary
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 text-center">
                                <div className="text-2xl font-bold text-blue-700">{analytics.correctCount}/{analytics.totalQuestions}</div>
                                <div className="text-xs font-medium text-blue-600 uppercase tracking-wide mt-1">Accuracy</div>
							</div>

							<div className="p-4 rounded-xl bg-green-50/50 border border-green-100 text-center">
								<div className="text-2xl font-bold text-green-700">{analytics.correctCount}</div>
								<div className="text-xs font-medium text-green-600 uppercase tracking-wide mt-1">Correct Questions</div>
							</div>

							<div className="p-4 rounded-xl bg-orange-50/50 border border-orange-100 text-center">
								<div className="text-2xl font-bold text-orange-700">{result.timeTaken || 0}m</div>
								<div className="text-xs font-medium text-orange-600 uppercase tracking-wide mt-1">Total Time</div>
							</div>
						</div>

						{result.completedAt && (
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-500 pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>Completed: {new Date(result.completedAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span>Time: {new Date(result.completedAt).toLocaleTimeString()}</span>
                                </div>
                            </div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

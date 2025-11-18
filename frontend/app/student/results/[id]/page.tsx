"use client";
import { useEffect, useState } from "react";
import { StudentLayout } from "@/components/student-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle, Clock, Trophy, Award, Star, TrendingUp, Calendar, Target, Zap, FileText, Brain, Timer, ArrowRight } from "lucide-react";
import API_BASE_URL from "@/app/config/api"
type Question = { id: string; type: string; correctAnswer: any; marks?: number }

export default function TestResult({ params }: { params: { id: string } }) {
	const id = params.id
	const [result, setResult] = useState<any>(null);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [fallback, setFallback] = useState<any | null>(null);

	useEffect(() => { 
		const fetchResult = async () => {
			try {
				setLoading(true)
					const response= await fetch(`${API_BASE_URL}/student/tests/${id}/result`, {
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`
					}
				});
				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.message || 'Failed to fetch result');
				}
				const data = await response.json();
				setResult(data);
				try { if (data?.answers && data.answers.length > 0) localStorage.removeItem(`testAnswers:${id}`) } catch (_) {}
				if (!data?.answers || data.answers.length === 0) {
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

	const getScoreData = (percentage: number) => {
		if (percentage >= 80) return {
			color: "from-green-400 to-emerald-500",
			bgColor: "from-green-50 to-emerald-50",
			icon: <Trophy className="h-6 w-6 text-green-600" />,
			text: "Excellent!",
			border: "border-green-200"
		}
		if (percentage >= 60) return {
			color: "from-blue-400 to-cyan-500",
			bgColor: "from-blue-50 to-cyan-50",
			icon: <Award className="h-6 w-6 text-blue-600" />,
			text: "Good Work!",
			border: "border-blue-200"
		}
		if (percentage >= 40) return {
			color: "from-orange-400 to-yellow-500",
			bgColor: "from-orange-50 to-yellow-50",
			icon: <Star className="h-6 w-6 text-orange-600" />,
			text: "Keep Improving!",
			border: "border-orange-200"
		}
		return {
			color: "from-red-400 to-rose-500",
			bgColor: "from-red-50 to-rose-50",
			icon: <TrendingUp className="h-6 w-6 text-red-600" />,
			text: "Practice More!",
			border: "border-red-200"
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
			<StudentLayout>
				<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
					<div className="container mx-auto py-12 flex items-center justify-center">
						<div className="flex flex-col items-center space-y-4">
							<div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 bg-gradient-to-br from-blue-100 to-indigo-100 p-4 shadow-lg shadow-blue-200/50" style={{ transform: "perspective(1000px) rotateX(10deg)" }}></div>
							<p className="text-gray-700 font-medium text-lg drop-shadow-sm">Loading your results...</p>
						</div>
					</div>
				</div>
			</StudentLayout>
		);
	}

	if (error) {
		return (
			<StudentLayout>
				<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 flex items-center justify-center">
					<div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-red-200" style={{ transform: "perspective(1000px) rotateX(2deg)", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)" }}>
						<AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4 animate-bounce" style={{ filter: "drop-shadow(0 4px 3px rgb(0 0 0 / 0.2))" }} />
						<h2 className="text-xl font-bold text-red-600 mb-2" style={{ textShadow: "0 1px 2px rgba(0, 0, 0, 0.05)" }}>Error Loading Result</h2>
						<p className="text-red-500">{error}</p>
					</div>
				</div>
			</StudentLayout>
		);
	}

	if (!result) {
		return (
			<StudentLayout>
				<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 flex items-center justify-center">
					<div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl" style={{ transform: "perspective(1000px) rotateX(2deg)", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)" }}>
						<div className="animate-pulse">
							<Zap className="h-12 w-12 text-blue-500 mx-auto mb-4" style={{ filter: "drop-shadow(0 4px 3px rgb(0 0 0 / 0.2))" }} />
							<p className="text-gray-600 font-medium" style={{ textShadow: "0 1px 2px rgba(0, 0, 0, 0.05)" }}>No results found...</p>
						</div>
					</div>
				</div>
			</StudentLayout>
		);
	}

	const sectionScores = Array.isArray(result.sectionScores) ? result.sectionScores : [];
	const percentage = typeof result.percentage === 'number' && result.answers?.length ? Math.round(result.percentage) : Math.round(fallback?.percentage || 0);
	const totalMarks = typeof result.totalMarks === 'number' && result.answers?.length ? result.totalMarks : (fallback?.totalMarks || 0);
	const marksObtained = typeof result.marksObtained === 'number' && result.answers?.length ? result.marksObtained : (fallback?.marksObtained || 0);
	const scoreData = getScoreData(percentage);
	const analytics = getAnalyticsData(result.answers?.length ? result : (fallback || { answers: [] }));

	return (
		<StudentLayout>
			<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
				{/* Hero Header */}
				<div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white" style={{ transform: "perspective(1000px) rotateX(2deg)", transformOrigin: "top" }}>
					<div className="absolute inset-0 bg-black/10"></div>
					<div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
					<div className="absolute -bottom-6 left-0 right-0 h-6 bg-gradient-to-t from-transparent to-black/10"></div>
					<div className="relative container mx-auto py-16 px-6">
						<div className="flex items-center space-x-4 mb-4">
							<div className="transform transition-all duration-300 hover:scale-110 hover:rotate-3" style={{ filter: "drop-shadow(0 10px 8px rgb(0 0 0 / 0.2))" }}>
								{scoreData.icon}
							</div>
							<h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent" style={{ textShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}>
								Test Result Analysis
							</h1>
						</div>
						<p className="text-xl text-blue-100 font-medium" style={{ textShadow: "0 2px 4px rgba(0, 0, 0, 0.1)" }}>
							{scoreData.text}
						</p>
						<div className="mt-6 flex items-center space-x-6 text-blue-100">
							<div className="flex items-center space-x-2 transform transition-all duration-300 hover:scale-105 hover:translate-y-[-2px]">
								<CheckCircle className="h-5 w-5" style={{ filter: "drop-shadow(0 2px 2px rgb(0 0 0 / 0.2))" }} />
								<span className="font-medium" style={{ textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)" }}>Score: {percentage}%</span>
							</div>
							<div className="flex items-center space-x-2 transform transition-all duration-300 hover:scale-105 hover:translate-y-[-2px]">
								<Target className="h-5 w-5" style={{ filter: "drop-shadow(0 2px 2px rgb(0 0 0 / 0.2))" }} />
								<span className="font-medium" style={{ textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)" }}>{marksObtained}/{totalMarks} marks</span>
							</div>
							<div className="flex items-center space-x-2 transform transition-all duration-300 hover:scale-105 hover:translate-y-[-2px]">
								<Brain className="h-5 w-5" style={{ filter: "drop-shadow(0 2px 2px rgb(0 0 0 / 0.2))" }} />
								<span className="font-medium" style={{ textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)" }}>Accuracy: {Math.round(analytics.accuracyRate)}%</span>
							</div>
						</div>
					</div>
				</div>

				{/* Main Results Sections */}
				<div className="container mx-auto py-12 px-6 space-y-8">
					{/* Performance Overview Cards */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
						{/* Overall Score Card */}
						<Card className={`group relative overflow-hidden border-0 shadow-xl transform hover:scale-105 transition-all duration-500 hover:-translate-y-2 bg-white/80 backdrop-blur-sm ${scoreData.border}`} style={{ transform: "perspective(1000px) rotateY(2deg)", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}>
							<div className={`absolute inset-0 bg-gradient-to-br ${scoreData.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
							<CardContent className="p-6 relative z-10">
								<div className="flex items-center justify-between">
									<div>
										<div className="flex items-center space-x-2 mb-2">
											<Trophy className="h-5 w-5 text-blue-600 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" style={{ filter: "drop-shadow(0 2px 2px rgb(0 0 0 / 0.2))" }} />
											<span className="text-sm font-medium text-gray-600">Overall Score</span>
										</div>
										<div className="text-3xl font-bold text-gray-800" style={{ textShadow: "0 1px 2px rgba(0, 0, 0, 0.05)" }}>{percentage}%</div>
									</div>
									<div className={`px-3 py-1 rounded-full ${scoreData.color} bg-gradient-to-r text-white text-sm font-bold transform transition-all duration-300 group-hover:scale-105`} style={{ boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" }}>
										{marksObtained}/{totalMarks}
									</div>
								</div>
								<Progress value={percentage} className="mt-4 h-2" />
							</CardContent>
						</Card>

						{/* Correct Answers Card */}
						<Card className="group relative overflow-hidden border-0 shadow-xl transform hover:scale-105 transition-all duration-500 hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-green-200" style={{ transform: "perspective(1000px) rotateY(-2deg)", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}>
							<div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
							<CardContent className="p-6 relative z-10">
								<div className="flex items-center justify-between">
									<div>
										<div className="flex items-center space-x-2 mb-2">
											<CheckCircle className="h-5 w-5 text-green-600 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" style={{ filter: "drop-shadow(0 2px 2px rgb(0 0 0 / 0.2))" }} />
											<span className="text-sm font-medium text-gray-600">Correct Answers</span>
										</div>
										<div className="text-3xl font-bold text-gray-800" style={{ textShadow: "0 1px 2px rgba(0, 0, 0, 0.05)" }}>{analytics.correctCount}</div>
									</div>
									<div className="px-3 py-1 rounded-full bg-green-500 text-white text-sm font-bold transform transition-all duration-300 group-hover:scale-105" style={{ boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" }}>
										{Math.round(analytics.accuracyRate)}%
									</div>
								</div>
								<Progress value={analytics.accuracyRate} className="mt-4 h-2" />
							</CardContent>
						</Card>

						{/* Incorrect Answers Card */}
						<Card className="group relative overflow-hidden border-0 shadow-xl transform hover:scale-105 transition-all duration-500 hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-red-200" style={{ transform: "perspective(1000px) rotateY(2deg)", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}>
							<div className="absolute inset-0 bg-gradient-to-br from-red-50 to-rose-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
							<CardContent className="p-6 relative z-10">
								<div className="flex items-center justify-between">
									<div>
										<div className="flex items-center space-x-2 mb-2">
											<XCircle className="h-5 w-5 text-red-600 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" style={{ filter: "drop-shadow(0 2px 2px rgb(0 0 0 / 0.2))" }} />
											<span className="text-sm font-medium text-gray-600">Incorrect Answers</span>
										</div>
										<div className="text-3xl font-bold text-gray-800" style={{ textShadow: "0 1px 2px rgba(0, 0, 0, 0.05)" }}>{analytics.incorrectCount}</div>
									</div>
									<div className="px-3 py-1 rounded-full bg-red-500 text-white text-sm font-bold transform transition-all duration-300 group-hover:scale-105" style={{ boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" }}>
										Need Practice
									</div>
								</div>
								<Progress value={(analytics.incorrectCount / analytics.totalQuestions) * 100} className="mt-4 h-2" />
							</CardContent>
						</Card>

						{/* Time Performance Card */}
						<Card className="group relative overflow-hidden border-0 shadow-xl transform hover:scale-105 transition-all duration-500 hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-indigo-200" style={{ transform: "perspective(1000px) rotateY(-2deg)", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}>
							<div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
							<CardContent className="p-6 relative z-10">
								<div className="flex items-center justify-between">
									<div>
										<div className="flex items-center space-x-2 mb-2">
											<Timer className="h-5 w-5 text-indigo-600 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" style={{ filter: "drop-shadow(0 2px 2px rgb(0 0 0 / 0.2))" }} />
											<span className="text-sm font-medium text-gray-600">Time Taken</span>
										</div>
										<div className="text-3xl font-bold text-gray-800" style={{ textShadow: "0 1px 2px rgba(0, 0, 0, 0.05)" }}>{result.timeTaken || 0}m</div>
									</div>
									<div className="px-3 py-1 rounded-full bg-indigo-500 text-white text-sm font-bold transform transition-all duration-300 group-hover:scale-105" style={{ boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" }}>
										{Math.round(analytics.avgTimePerQuestion * 60)}s avg
									</div>
								</div>
								<div className="mt-4 text-sm text-gray-600">
									{Math.round(analytics.avgTimePerQuestion)} minutes per question
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Detailed Question Analysis */}
					{result.answers && result.answers.length > 0 && (
						<Card className="group relative overflow-hidden border-0 shadow-2xl bg-white/80 backdrop-blur-sm" style={{ transform: "perspective(1000px) rotateX(1deg)", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}>
							<CardHeader className="relative z-10">
								<CardTitle className="text-3xl font-bold text-gray-800 flex items-center space-x-3">
									<FileText className="h-8 w-8 text-blue-600 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-6" style={{ filter: "drop-shadow(0 4px 3px rgb(0 0 0 / 0.2))" }} />
									<span style={{ textShadow: "0 2px 4px rgba(0, 0, 0, 0.05)" }}>Question-by-Question Analysis</span>
								</CardTitle>
								<CardDescription className="text-lg" style={{ textShadow: "0 1px 2px rgba(0, 0, 0, 0.05)" }}>
									Detailed breakdown of your answers, showing correct answers and areas for improvement
								</CardDescription>
					</CardHeader>
							<CardContent className="space-y-6 relative z-10">
								{result.answers.map((answer: any, index: number) => {
									// For now, we'll use the answer data as available
									// In a complete implementation, you'd fetch question details
									const questionNumber = index + 1;
									const isCorrect = answer.isCorrect;
									const userAnswer = answer.selectedAnswer;
									const marksForThis = answer.marksObtained || 0;
									
									return (
										<div 
											key={answer.questionId || index}
											className={`group/question transform hover:scale-102 transition-all duration-300 p-6 rounded-2xl border-2 backdrop-blur-sm ${
												isCorrect 
													? 'border-green-200 bg-gradient-to-br from-green-50/50 to-emerald-50/50 hover:shadow-green-200' 
													: 'border-red-200 bg-gradient-to-br from-red-50/50 to-rose-50/50 hover:shadow-red-200'
											} shadow-lg hover:shadow-xl`}
											style={{ 
												transform: isCorrect ? "perspective(1000px) rotateY(0.5deg)" : "perspective(1000px) rotateY(-0.5deg)",
												boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
											}}
										>
											<div className="flex items-start justify-between mb-4">
												<div className="flex items-center space-x-3">
													<div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white transform transition-all duration-300 group-hover/question:scale-110 ${
														isCorrect ? 'bg-green-500' : 'bg-red-500'
													}`} style={{ boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" }}>
														{questionNumber}
													</div>
							<div>
														<h4 className="font-bold text-gray-800" style={{ textShadow: "0 1px 2px rgba(0, 0, 0, 0.05)" }}>Question {questionNumber}</h4>
														<p className="text-sm text-gray-600">Marks: {marksForThis}</p>
													</div>
												</div>
												
												<div className="flex items-center space-x-2">
													{isCorrect ? (
														<div className="flex items-center space-x-1 text-green-600">
															<CheckCircle className="h-5 w-5" />
															<span className="font-bold">Correct</span>
														</div>
													) : (
														<div className="flex items-center space-x-1 text-red-600">
															<XCircle className="h-5 w-5" />
															<span className="font-bold">Incorrect</span>
														</div>
													)}
													<Badge variant={isCorrect ? "default" : "destructive"} className="font-bold transform transition-all duration-300 group-hover/question:scale-105">
														{marksForThis} marks
													</Badge>
												</div>
											</div>

											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												<div className="space-y-2">
													<div className="flex items-center space-x-2 text-green-700">
														<CheckCircle className="h-4 w-4" />
														<span className="font-medium">Your Answer:</span>
													</div>
													<div className={`p-3 rounded-lg font-medium ${
														isCorrect 
															? 'bg-green-100 text-green-800 border border-green-300' 
															: 'bg-red-100 text-red-800 border border-red-300'
													}`}>
														{userAnswer || 'No answer provided'}
													</div>
												</div>

												<div className="space-y-2">
													<div className="flex items-center space-x-2 text-blue-700">
														<Target className="h-4 w-4" />
														<span className="font-medium">Status:</span>
													</div>
													<div className={`p-3 rounded-lg font-bold text-center ${
														isCorrect 
															? 'bg-green-100 text-green-900 border border-green-300' 
															: 'bg-red-100 text-red-900 border border-red-300'
													}`}>
														{isCorrect ? '✅ Correct Answer' : '❌ Incorrect Answer'}
													</div>
								</div>
							</div>

											{/* Performance indicator */}
											<div className="mt-4 flex items-center space-x-2">
												<ArrowRight className="h-4 w-4 text-gray-500" />
												<span className="text-sm text-gray-600">
													{isCorrect 
														? `Well done! You earned ${marksForThis} marks.` 
														: `Better luck next time. Focus on this topic for improvement.`
													}
												</span>
											</div>
										</div>
									);
								})}
							</CardContent>
						</Card>
					)}

					{/* Section Performance - if available */}
					{sectionScores.length > 0 && (
						<Card className="group relative overflow-hidden border-0 shadow-2xl bg-white/80 backdrop-blur-sm border-blue-200">
							<CardHeader className="relative z-10">
								<CardTitle className="text-2xl font-bold text-gray-800 flex items-center space-x-3">
									<Target className="h-6 w-6 text-blue-600" />
									<span>Section Performance</span>
								</CardTitle>
								<CardDescription className="text-lg">Performance breakdown by test sections</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6 relative z-10">
									{sectionScores.map((section: any, index: number) => (
									<div key={index} className="group/section transform hover:scale-105 transition-all duration-300 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
										<div className="flex justify-between items-center mb-2">
											<span className="font-bold text-gray-700 flex items-center space-x-2">
												<div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full"></div>
												<span>{section.name}</span>
											</span>
											<span className="text-sm font-bold text-blue-600">
													{section.score}% ({Math.round(((section.score || 0) * (section.total || 0)) / 100)}/{section.total || 0})
												</span>
											</div>
										<div className="h-3 bg-gray-300 rounded-full overflow-hidden shadow-inner group-hover/section:shadow-lg transition-shadow duration-300">
											<div 
												className={`h-full rounded-full bg-gradient-to-r ${
													(section.score || 0) >= 80 ? 'from-green-400 to-emerald-500' :
													(section.score || 0) >= 60 ? 'from-blue-400 to-cyan-500' :
													(section.score || 0) >= 40 ? 'from-orange-400 to-yellow-500' :
													'from-red-400 to-rose-500'
												} transition-all duration-1000 ease-out`}
												style={{ 
													width: `${section.score || 0}%`,
													animationDelay: `${index * 200}ms`
												}}
											></div>
										</div>
										</div>
									))}
							</CardContent>
						</Card>
					)}

					{/* Summary & Insights Card */}
					<Card className="group relative overflow-hidden border-0 shadow-2xl transform hover:scale-[1.02] transition-all duration-500 bg-white/80 backdrop-blur-sm border-purple-200">
						<div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
						<CardHeader className="relative z-10">
							<CardTitle className="text-2xl font-bold text-gray-800 flex items-center space-x-3">
								<Brain className="h-6 w-6 text-purple-600" />
								<span>Performance Summary & Insights</span>
							</CardTitle>
						</CardHeader>
						<CardContent className="relative z-10 space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
								<div className="text-center p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200">
									<div className="text-2xl font-bold text-blue-600 mb-2">{Math.round(analytics.accuracyRate)}%</div>
									<div className="text-sm text-blue-700 font-medium">Accuracy Rate</div>
									<div className="text-xs text-blue-600 mt-1">
										{analytics.accuracyRate >= 80 ? 'Excellent!' : 
										 analytics.accuracyRate >= 60 ? 'Good work!' : 
										 analytics.accuracyRate >= 40 ? 'Keep practicing!' : 'Needs improvement!'}
									</div>
								</div>

								<div className="text-center p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
									<div className="text-2xl font-bold text-green-600 mb-2">{analytics.correctCount}</div>
									<div className="text-sm text-green-700 font-medium">Questions Correct</div>
									<div className="text-xs text-green-600 mt-1">Out of {analytics.totalQuestions} total</div>
								</div>

								<div className="text-center p-4 rounded-xl bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200">
									<div className="text-2xl font-bold text-orange-600 mb-2">{result.timeTaken || 0}m</div>
									<div className="text-sm text-orange-700 font-medium">Time Taken</div>
									<div className="text-xs text-orange-600 mt-1">
										{Math.round(analytics.avgTimePerQuestion)}m per question
									</div>
								</div>
							</div>

							{result.completedAt && (
								<div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
									<div className="flex items-center justify-center space-x-6 text-gray-600">
										<div className="flex items-center space-x-2">
											<Calendar className="h-5 w-5 text-blue-500" />
											<span className="font-medium">
												Completed: {new Date(result.completedAt).toLocaleDateString()}
											</span>
										</div>
										<div className="flex items-center space-x-2">
											<Clock className="h-5 w-5 text-blue-500" />
											<span className="font-medium">
												Time: {new Date(result.completedAt).toLocaleTimeString()}
											</span>
								</div>
							</div>
						</div>
							)}
					</CardContent>
				</Card>
				</div>

				{/* CSS Animations */}
				<style jsx>{`
					@keyframes slideInWidth {
						from {
							width: 0%;
						}
						to {
							width: 100%;
						}
					}
				`}</style>
			</div>
		</StudentLayout>
	);
}

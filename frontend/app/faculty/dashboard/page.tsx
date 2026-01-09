"use client";

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge as UIBadge } from "@/components/ui/badge"
import { Users, FileText, BarChart2, Clock, Calendar, CheckCircle, TrendingUp, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import CreateTestModal from "@/app/components/CreateTestModal"
import API_BASE_URL from "@/app/config/api"

// Interfaces matching backend response
interface DashboardStats {
    totalStudents: number;
    activeTests: number;
    testsCreated: number;
    averageScore: number;
}

interface ActiveTest {
    id: string;
    title: string;
    class: string;
    date: string;
    time: string;
    duration: string;
    status: string;
    studentsAttempted: number;
    totalStudents: number;
}

interface RecentResult {
    id: string;
    testName: string;
    class: string;
    averageScore: number;
    passPercentage: number;
    completionRate: number;
    date: string;
}

interface DashboardData {
    stats: DashboardStats;
    activeTests: ActiveTest[];
    recentResults: RecentResult[];
}

export default function FacultyDashboard() {
    const [isCreateTestModalOpen, setIsCreateTestModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<DashboardData | null>(null);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return; // Or redirect

            const response = await fetch(`${API_BASE_URL}/faculty/dashboard-stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const result = await response.json();
                setData(result);
            } else {
                console.error("Failed to fetch dashboard stats");
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Refresh data when a new test is created
    const handleTestCreated = () => {
        setIsCreateTestModalOpen(false);
        fetchData();
    };

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary-blue" />
            </div>
        );
    }

    const stats = data?.stats || { totalStudents: 0, activeTests: 0, testsCreated: 0, averageScore: 0 };
    const activeTests = data?.activeTests || [];
    const recentResults = data?.recentResults || [];

    return (
        <div className="container py-6 px-4 sm:px-6 space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-600">
                        Faculty Dashboard
                    </h1>
                    <p className="text-gray-500 mt-1">Overview of your tests and student performance</p>
                </div>
                <Button 
                    onClick={() => setIsCreateTestModalOpen(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                >
                    <CheckCircle className="mr-2 h-4 w-4" /> Create New Test
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Students"
                    value={stats.totalStudents.toString()}
                    description="Attempted your tests"
                    icon={<Users className="h-6 w-6 text-white" />}
                    gradient="from-blue-500 to-blue-600"
                />
                <StatsCard
                    title="Active Tests"
                    value={stats.activeTests.toString()}
                    description="Currently running"
                    icon={<FileText className="h-6 w-6 text-white" />}
                    gradient="from-indigo-500 to-purple-600"
                />
                <StatsCard
                    title="Tests Created"
                    value={stats.testsCreated.toString()}
                    description="Total tests managed"
                    icon={<CheckCircle className="h-6 w-6 text-white" />}
                    gradient="from-emerald-500 to-teal-600"
                />
                <StatsCard
                    title="Average Score"
                    value={`${stats.averageScore}%`}
                    description="Across all attempts"
                    icon={<TrendingUp className="h-6 w-6 text-white" />}
                    gradient="from-orange-500 to-red-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Active Tests Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                            <Clock className="mr-2 h-5 w-5 text-indigo-600" /> Active Tests
                        </h2>
                        {activeTests.length > 0 && (
                            <Link href="/faculty/tests" className="text-sm text-indigo-600 from:underline">
                                View All
                            </Link>
                        )}
                    </div>
                    
                    {activeTests.length > 0 ? (
                        <div className="space-y-4">
                            {activeTests.map((test) => (
                                <Card key={test.id} className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300 group">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 group-hover:bg-indigo-600 transition-colors" />
                                    <CardContent className="p-5 pl-7">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="font-bold text-gray-800 group-hover:text-indigo-700 transition-colors">{test.title}</h3>
                                                <p className="text-sm text-gray-500">{test.class}</p>
                                            </div>
                                            <UIBadge className="bg-green-100 text-green-700 hover:bg-green-200 border-none shadow-sm">
                                                Active
                                            </UIBadge>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-600 mb-4">
                                            <div className="flex items-center">
                                                <Calendar className="h-3.5 w-3.5 mr-2 text-gray-400" />
                                                {test.date}
                                            </div>
                                            <div className="flex items-center">
                                                <Clock className="h-3.5 w-3.5 mr-2 text-gray-400" />
                                                {test.time}
                                            </div>
                                            <div className="col-span-2 flex items-center">
                                                <Users className="h-3.5 w-3.5 mr-2 text-gray-400" />
                                                {test.studentsAttempted} attempted / {test.totalStudents} assigned
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-end">
                                            <Button asChild variant="outline" size="sm" className="hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200">
                                                <Link href={`/faculty/tests/${test.id}`}>View Details</Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="bg-gray-50 border-dashed border-2 border-gray-200 shadow-none">
                            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                                <div className="p-3 bg-white rounded-full shadow-sm mb-3">
                                    <Clock className="h-8 w-8 text-gray-300" />
                                </div>
                                <h3 className="font-medium text-gray-900">No active tests</h3>
                                <p className="text-sm text-gray-500 mt-1 mb-4">You don't have any tests running right now.</p>
                                <Button size="sm" onClick={() => setIsCreateTestModalOpen(true)}>Create a Test</Button>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Recent Results Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                            <BarChart2 className="mr-2 h-5 w-5 text-indigo-600" /> Recent Results
                        </h2>
                    
                    </div>

                    {recentResults.length > 0 ? (
                        <div className="space-y-4">
                            {recentResults.map((result) => (
                                <Card key={result.id} className="border-none shadow-md hover:shadow-lg transition-all duration-300">
                                    <CardContent className="p-5">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="min-w-0 flex-1 mr-4">
                                                <h3 className="font-semibold text-gray-800 truncate">{result.testName}</h3>
                                                <p className="text-xs text-gray-500 truncate">{result.class}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs text-gray-500 mb-0.5">Avg Score</div>
                                                <span className={`text-lg font-bold ${result.averageScore >= 40 ? 'text-green-600' : 'text-orange-600'}`}>
                                                    {result.averageScore}%
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100">
                                            <div className="text-center">
                                                <div className="text-xs text-gray-500 mb-1">Pass %</div>
                                                <div className="font-semibold text-gray-700">{result.passPercentage}%</div>
                                            </div>
                                            <div className="text-center border-l border-gray-100">
                                                <div className="text-xs text-gray-500 mb-1">Completion</div>
                                                <div className="font-semibold text-gray-700">{result.completionRate}%</div>
                                            </div>
                                            <div className="text-center border-l border-gray-100">
                                                <div className="text-xs text-gray-500 mb-1">Date</div>
                                                <div className="font-semibold text-gray-700">{result.date}</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="bg-gray-50 border-dashed border-2 border-gray-200 shadow-none">
                            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                                <div className="p-3 bg-white rounded-full shadow-sm mb-3">
                                    <BarChart2 className="h-8 w-8 text-gray-300" />
                                </div>
                                <h3 className="font-medium text-gray-900">No results yet</h3>
                                <p className="text-sm text-gray-500 mt-1">Student results will appear here once they complete tests.</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Create Test Modal */}
            <CreateTestModal
                isOpen={isCreateTestModalOpen}
                onClose={() => setIsCreateTestModalOpen(false)}
                onTestCreated={handleTestCreated}
            />
        </div>
    )
}

// Stats Card Component with enhanced UI
function StatsCard({ title, value, description, icon, gradient }: {
    title: string
    value: string
    description: string
    icon: React.ReactNode
    gradient: string
}) {
    // Extract number and suffix for animation
    const match = value.match(/(\d+)(\D*)/);
    const num = match ? parseInt(match[1]) : 0;
    const suffix = match ? match[2] : "";

    return (
        <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden relative group">
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500`}>
                <div className={`p-3 rounded-full bg-gradient-to-br ${gradient}`}>
                    {icon}
                </div>
            </div>
            
            <CardContent className="p-6 relative z-10">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-md mb-4`}>
                    {icon}
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-gray-800 tracking-tight">
                         <AnimatedCounter end={num} suffix={suffix} />
                    </h3>
                    <p className="text-xs text-gray-400 mt-2 font-medium">{description}</p>
                </div>
            </CardContent>
        </Card>
    )
}

function AnimatedCounter({ end, duration = 1.2, suffix = "" }: { end: number, duration?: number, suffix?: string }) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let start = 0;
        const increment = end > 0 ? Math.max(1, end / (duration * 60)) : 0;
        let frame: number;
        
        if (end === 0) {
            setCount(0);
            return;
        }

        function animate() {
            start += increment;
            if (start < end) {
                setCount(Math.floor(start));
                frame = requestAnimationFrame(animate);
            } else {
                setCount(end);
            }
        }
        animate();
        return () => cancelAnimationFrame(frame);
    }, [end, duration]);
    return <span>{count}{suffix}</span>;
}

"use client";

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2 } from "lucide-react"
import dynamic from "next/dynamic"
import CreateTestModal from "@/app/components/CreateTestModal"
import API_BASE_URL from "@/app/config/api"
import { Skeleton } from "@/components/ui/skeleton"

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

// Lazy load components
const FacultyStatsGrid = dynamic(() => import("@/components/dashboard/faculty/FacultyStatsGrid"), {
    loading: () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
        </div>
    ),
    ssr: false
});

const ActiveTestsList = dynamic(() => import("@/components/dashboard/faculty/ActiveTestsList"), {
    loading: () => <Skeleton className="h-64 rounded-xl" />,
    ssr: false
});

const RecentResultsList = dynamic(() => import("@/components/dashboard/faculty/RecentResultsList"), {
    loading: () => <Skeleton className="h-64 rounded-xl" />,
    ssr: false
});

export default function FacultyDashboard() {
    const [isCreateTestModalOpen, setIsCreateTestModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<DashboardData | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
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
            <FacultyStatsGrid stats={stats} loading={loading} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Active Tests Section */}
                <ActiveTestsList activeTests={activeTests} loading={loading} />

                {/* Recent Results Section */}
                <RecentResultsList recentResults={recentResults} loading={loading} />
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

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, CheckCircle, XCircle, Timer } from "lucide-react";

interface ResultStatsGridProps {
  scoreData: {
    bgColor: string;
    badge: string;
    text: string;
    icon?: React.ReactNode;
  };
  percentage: number;
  marksObtained: number;
  totalMarks: number;
  analytics: {
    correctCount: number;
    incorrectCount: number;
    totalQuestions: number;
    accuracyRate: number;
    avgTimePerQuestion: number;
  };
  timeTaken: number;
}

const ResultStatsGrid: React.FC<ResultStatsGridProps> = ({
  scoreData,
  percentage,
  marksObtained,
  totalMarks,
  analytics,
  timeTaken
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Overall Score Card */}
      <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden ring-1 ring-gray-200">
        <div className={`h-1 w-full ${scoreData.bgColor.replace('bg-', 'bg-gradient-to-r from-').replace('50', '400')} to-gray-400`}></div>
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Trophy className="h-6 w-6 text-blue-600" />
            </div>
            <Badge className={scoreData.badge}>{percentage}%</Badge>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Overall Score</p>
            <h3 className="text-2xl font-bold text-gray-900">{marksObtained}/{totalMarks}</h3>
          </div>
          <Progress value={percentage} className="mt-4 h-1.5" />
        </CardContent>
      </Card>

      {/* Correct Answers Card */}
      <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden ring-1 ring-gray-200">
        <div className="h-1 w-full bg-gradient-to-r from-green-400 to-emerald-500"></div>
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-700">Correct</Badge>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Correct Answers</p>
            <h3 className="text-2xl font-bold text-gray-900">{analytics.correctCount} <span className="text-sm text-gray-400 font-normal">/ {analytics.totalQuestions}</span></h3>
          </div>
          <Progress value={analytics.accuracyRate} className="mt-4 h-1.5 bg-green-100 [&>div]:bg-green-500" />
        </CardContent>
      </Card>

      {/* Incorrect Answers Card */}
      <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden ring-1 ring-gray-200">
        <div className="h-1 w-full bg-gradient-to-r from-red-400 to-rose-500"></div>
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-red-50 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <Badge variant="secondary" className="bg-red-100 text-red-700">Incorrect</Badge>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Incorrect Answers</p>
            <h3 className="text-2xl font-bold text-gray-900">{analytics.incorrectCount} <span className="text-sm text-gray-400 font-normal">/ {analytics.totalQuestions}</span></h3>
          </div>
          <Progress value={analytics.totalQuestions > 0 ? (analytics.incorrectCount / analytics.totalQuestions) * 100 : 0} className="mt-4 h-1.5 bg-red-100 [&>div]:bg-red-500" />
        </CardContent>
      </Card>

      {/* Time Performance Card */}
      <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden ring-1 ring-gray-200">
        <div className="h-1 w-full bg-gradient-to-r from-orange-400 to-yellow-500"></div>
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Timer className="h-6 w-6 text-orange-600" />
            </div>
            <Badge variant="secondary" className="bg-orange-100 text-orange-700">Time</Badge>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Time Taken</p>
            <h3 className="text-2xl font-bold text-gray-900">{timeTaken || 0}m</h3>
          </div>
          <p className="text-xs text-gray-500 mt-4 font-medium">
            {Math.round(analytics.avgTimePerQuestion * 60)}s per question avg
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultStatsGrid;

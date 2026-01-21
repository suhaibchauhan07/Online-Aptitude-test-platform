import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface QuestionAnalysisListProps {
  answers: any[];
  marksMap: Map<string, number>;
}

const QuestionAnalysisList: React.FC<QuestionAnalysisListProps> = ({ answers, marksMap }) => {
  if (!answers || answers.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <FileText className="h-6 w-6 text-gray-400" />
        <h2 className="text-2xl font-bold text-gray-900">Question Analysis</h2>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {answers.map((answer: any, index: number) => {
          const questionNumber = index + 1;
          const isCorrect = answer.isCorrect;
          const userAnswer = answer.selectedAnswer;
          const totalMarksForThis = Number(answer.questionMarks ?? marksMap.get(String(answer.questionId)) ?? 0);
          const marksForThis = answer.marksObtained || 0;
          
          return (
            <Card 
              key={answer.questionId || index}
              className={`border-0 shadow-sm ring-1 ring-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md ${
                isCorrect ? 'bg-white' : 'bg-white'
              }`}
            >
              <div className={`h-full w-1 absolute left-0 top-0 bottom-0 ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <CardContent className="p-6 pl-8 relative">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${
                      isCorrect ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      {questionNumber}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        Question {questionNumber}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge variant={isCorrect ? "default" : "destructive"} className={isCorrect ? "bg-green-100 text-green-700 hover:bg-green-200 border-green-200" : "bg-red-100 text-red-700 hover:bg-red-200 border-red-200"}>
                          {isCorrect ? "Correct" : "Incorrect"}
                        </Badge>
                        <span className="text-sm font-medium text-gray-500">
                          {marksForThis} / {totalMarksForThis} marks
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Your Answer</span>
                    <div className={`flex items-center gap-2 font-medium p-3 rounded-lg border ${
                      isCorrect 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {isCorrect ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                      <span>
                        {Array.isArray(userAnswer) 
                          ? userAnswer.join(", ") 
                          : (userAnswer !== undefined && userAnswer !== null ? String(userAnswer) : "Not Answered")}
                      </span>
                    </div>
                  </div>
                  
                  {!isCorrect && (
                    <div>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Correct Answer</span>
                      <div className="flex items-center gap-2 font-medium text-gray-700 bg-white p-3 rounded-lg border border-gray-200">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>
                          {Array.isArray(answer.correctAnswer)
                            ? answer.correctAnswer.join(", ")
                            : (answer.correctAnswer !== undefined ? String(answer.correctAnswer) : "N/A")}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionAnalysisList;

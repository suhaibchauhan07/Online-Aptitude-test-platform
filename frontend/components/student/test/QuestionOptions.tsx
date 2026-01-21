import React from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Question {
  id: string;
  text: string;
  type: "mcq" | "msq" | "nat";
  options: string[];
  correctAnswer?: string | number | number[];
  marks?: number;
}

interface QuestionOptionsProps {
  question: Question;
  answers: Record<string, any>;
  handleAnswerChange: (questionId: string, value: any) => void;
  handleMSQChange: (questionId: string, option: string) => void;
}

const QuestionOptions: React.FC<QuestionOptionsProps> = ({
  question,
  answers,
  handleAnswerChange,
  handleMSQChange
}) => {
  const qType = (question?.type || 'mcq').toString().toLowerCase();

  if (qType === "mcq" && Array.isArray(question.options)) {
    return (
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
    );
  }

  if (qType === "msq" && Array.isArray(question.options)) {
    return (
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
    );
  }

  if (qType === "nat") {
    return (
      <div className="mb-8 sm:mb-10">
        <Input
          id={`nat-answer-${question.id}`}
          value={answers[question.id] || ""}
          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
          placeholder="Enter your answer"
          className="w-full max-w-lg text-base sm:text-lg p-3 sm:p-4 border-2 border-gray-300 focus:border-blue-500 rounded-xl"
        />
      </div>
    );
  }

  return null;
};

export default QuestionOptions;

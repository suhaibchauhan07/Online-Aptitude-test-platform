import React from 'react';
import { X, CheckCircle2 } from "lucide-react";

interface Question {
  id: string;
  [key: string]: any;
}

interface TestSidebarProps {
  test: { questions: Question[] };
  currentQuestion: number;
  setCurrentQuestion: (index: number) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  statusCounts: {
    answered: number;
    unanswered: number;
    answeredMarked: number;
    unansweredMarked: number;
  };
  getQuestionStatus: (questionId: string) => string;
}

const TestSidebar: React.FC<TestSidebarProps> = ({
  test,
  currentQuestion,
  setCurrentQuestion,
  sidebarOpen,
  setSidebarOpen,
  statusCounts,
  getQuestionStatus
}) => {
  return (
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
        className={`absolute right-0 top-0 h-full w-[90%] max-w-sm bg-white/95 backdrop-blur-sm shadow-2xl transform transition-transform duration-300 lg:static lg:translate-x-0 lg:shadow-none lg:bg-transparent lg:w-full lg:max-w-none ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0`}
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
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-3 max-h-[50vh] lg:max-h-none overflow-y-auto pr-1">
              {test.questions.map((q, index) => {
                const status = getQuestionStatus(q.id);
                const isCurrent = currentQuestion === index;
                
                return (
                  <button
                    key={q.id}
                    onClick={() => { setCurrentQuestion(index); if (sidebarOpen) setSidebarOpen(false); }}
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
  );
};

export default TestSidebar;

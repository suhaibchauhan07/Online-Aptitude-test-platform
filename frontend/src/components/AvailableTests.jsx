import React, { useState, useEffect } from "react";
import axios from "axios";

const AvailableTests = () => {
  const [hasQuestions, setHasQuestions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [testStarted, setTestStarted] = useState(false);
  const [attemptInfo, setAttemptInfo] = useState(null);

  useEffect(() => {
    const checkQuestions = async () => {
      try {
        const response = await axios.get("https://online-aptitude-test-platform-1.onrender.com/api/student/questions", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        setHasQuestions(response.data.length > 0);
        setLoading(false);
      } catch (error) {
        setHasQuestions(false);
        setLoading(false);
      }
    };
    checkQuestions();
  }, []);

  const handleStartTest = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/student/tests/start", {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      // Check for attemptId directly in the response
      const data = response.data;
      if (data && data.attemptId) {
        window.location.href = `/student/test/${data.attemptId}`;
      } else {
        alert("Failed to start test. No attempt ID returned.");
      }
    } catch (error) {
      alert("Failed to start test. Please try again.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (testStarted) {
    return null;
  }

  if (!hasQuestions) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <div className="bg-white/90 p-8 rounded-2xl shadow-2xl border border-blue-100 w-full max-w-md flex flex-col items-center animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span className="text-lg font-semibold text-[#22223b]">Sorry! Test is not available right now.</span>
          </div>
          <button
            onClick={() => window.history.back()}
            className="mt-2 bg-[#0074b7] hover:bg-[#005fa3] text-white font-bold py-2 px-8 rounded-lg shadow-lg focus:ring-2 focus:ring-blue-400 transition-all duration-200 text-lg"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  // Example instructions (replace with your real data as needed)
  const instructions = [
    "Total Questions: 50",
    "Type of Questions: Multiple Choice Questions (MCQ) with four options each. Only one option is correct.",
    "Duration: 60 minutes.",
    "Marking Scheme: Each correct answer carries 1 mark. No negative marking for incorrect answers."
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="bg-white/90 p-10 rounded-2xl shadow-2xl border border-blue-100 w-full max-w-xl hover:scale-[1.02] hover:shadow-blue-200 transition-all animate-fade-in">
        <h2 className="text-3xl font-bold mb-8 text-center text-[#22223b] drop-shadow">Available Tests</h2>
        <div className="mb-8">
          <div className="font-bold text-lg mb-2 text-left text-[#22223b]">Aptitude Test</div>
          <div className="mb-2 text-blue-700 font-semibold flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Instructions for Students
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-blue-900 shadow-md text-sm text-left space-y-2">
            {instructions.map((line, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>{line}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-gray-500 text-sm">
            Duration: 30 min | Total Marks: 50
            <br />
            Starts: 7/5/2025, 8:53:00 PM
          </div>
          <button
            onClick={handleStartTest}
            className="bg-[#0074b7] hover:bg-[#005fa3] text-white font-bold py-3 px-8 rounded-lg shadow-lg focus:ring-2 focus:ring-blue-400 transition-all duration-200 text-lg relative overflow-hidden group"
          >
            Start Test
            <span className="absolute inset-0 bg-white/40 rounded-full pointer-events-none scale-0 group-active:scale-100 transition-transform duration-500"></span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvailableTests; 
"use client"

import React, { useState } from 'react';

const studentTopics = {
  "General Aptitude": [
    "Arithmetic Aptitude",
    "Data Interpretation",
    "Online Aptitude Test",
    "Data Interpretation Test",
  ],
  "Verbal and Reasoning": [
    "Verbal Ability",
    "Logical Reasoning",
    "Verbal Reasoning",
    "Non Verbal Reasoning",
  ],
  "Technical Skills": [
    "C Programming",
    "C++ Programming",
    "Java Programming",
    "Data Structures",
  ],
};

const facultyTopics = {
  "Test Creation & Management": [
    "Creating a New Test",
    "Question Bank Management",
    "Setting Test Duration & Rules",
    "Managing Test Access",
  ],
  "Student Performance Analytics": [
    "Viewing Student Scores",
    "Analyzing Common Mistakes",
    "Generating Performance Reports",
    "Tracking Progress Over Time",
  ],
  "Platform Features": [
    "Using the Grading System",
    "Proctoring Tools Overview",
    "Communicating with Students",
    "Exporting Test Data",
  ],
};

const PracticeQuestions = () => {
  const [userType, setUserType] = useState('student');

  const topics = userType === 'student' ? studentTopics : facultyTopics;

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800">Practice Questions</h2>
          <p className="text-gray-600">Aptitude questions and answers for your placement interviews and competitive exams!</p>
        </div>

        <div className="flex justify-center mb-8 gap-4">
          <button
            onClick={() => setUserType('student')}
            className={`py-2 px-6 rounded-lg font-semibold transition-all ${userType === 'student' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 border'}`}>
            For Students
          </button>
          <button
            onClick={() => setUserType('faculty')}
            className={`py-2 px-6 rounded-lg font-semibold transition-all ${userType === 'faculty' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 border'}`}>
            For Faculty
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.entries(topics).map(([category, topicList]) => (
            <div key={category} className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-xl font-bold text-green-600 mb-4">{category}</h3>
              <ul>
                {topicList.map((topic) => (
                  <li key={topic} className="flex items-center text-gray-700 mb-2">
                    <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    {topic}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PracticeQuestions;
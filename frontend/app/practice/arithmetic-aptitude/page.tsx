"use client"

import React, { useState, useEffect } from 'react';
import { Folder } from 'lucide-react';
import Link from 'next/link';

const topics = [
  'Problems on Trains',
  'Height and Distance',
  'Simple Interest',
  'Profit and Loss',
  'Percentage',
  'Calendar',
  'Average',
  'Volume and Surface Area',
  'Numbers',
  'Problems on H.C.F and L.C.M',
  'Simplification',
  'Surds and Indices',
  'Chain Rule',
  'Boats and Streams',
  'Time and Distance',
  'Time and Work',
  'Compound Interest',
  'Partnership',
  'Problems on Ages',
  'Clock',
  'Area',
  'Permutation and Combination',
  'Problems on Numbers',
  'Decimal Fraction',
  'Square Root and Cube Root',
  'Ratio and Proportion',
  'Pipes and Cistern',
  'Alligation or Mixture',
  'Mensuration',
  'Probability',
  'True Discount',
];

const ArithmeticAptitudePage: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <style jsx global>{`
        .topic-item {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          transform-style: preserve-3d;
        }

        .topic-item:hover {
          transform: translateY(-5px) translateZ(10px) rotateX(2deg);
        }

        .folder-icon {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .topic-item:hover .folder-icon {
          transform: scale(1.2) rotate(5deg) translateZ(5px);
        }

        .breadcrumb-item {
          transition: all 0.2s ease;
        }

        .breadcrumb-item:hover {
          transform: translateY(-2px);
        }
      `}</style>
      
      <div className="max-w-7xl mx-auto">
        <header className={`mb-8 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3 animate-float">
            Arithmetic Aptitude
          </h1>
          <p className="text-gray-700 mt-2 text-lg">Practice arithmetic aptitude questions and improve your skills for placement interviews and competitive exams!</p>
          <nav className="mt-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg px-6 py-3 inline-block border border-gray-200/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center space-x-2 text-sm">
                <Link href="/" className="breadcrumb-item text-gray-700 hover:text-blue-600 font-medium">
                  Home
                </Link>
                <span className="text-gray-400">»</span>
                <Link href="/practice" className="breadcrumb-item text-gray-700 hover:text-blue-600 font-medium">
                  Aptitude
                </Link>
                <span className="text-gray-400">»</span>
                <span className="text-green-600 font-semibold">List of Topics</span>
              </div>
            </div>
          </nav>
        </header>
        
        <main className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/50 relative overflow-hidden">
          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-transparent pointer-events-none"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            {topics.map((topic, index) => (
              <Link
                key={index}
                href="#"
                className="topic-item flex items-center group relative px-4 py-3 rounded-xl bg-gradient-to-r from-white to-gray-50/50 border border-gray-200/50 hover:border-blue-300/50 hover:shadow-lg"
                style={{
                  animation: isVisible ? `fade-in-up 0.6s ease-out ${index * 0.03}s forwards` : 'none',
                  opacity: isVisible ? 1 : 0,
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Hover effect background */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <Folder 
                  className="folder-icon w-6 h-6 mr-4 text-yellow-500 group-hover:text-yellow-600 drop-shadow-sm"
                  fill="currentColor"
                />
                <span className="relative z-10 text-gray-700 group-hover:text-blue-600 font-medium transition-colors duration-300">
                  {topic}
                </span>
                
                {/* Arrow indicator on hover */}
                <span className="ml-auto text-blue-500 opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                  →
                </span>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ArithmeticAptitudePage;

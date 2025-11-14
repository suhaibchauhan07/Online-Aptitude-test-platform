"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, Brain, Newspaper, Briefcase, Wrench, Code } from 'lucide-react';

interface PracticeCardProps {
  title: string;
  links: { name: string; href: string }[];
  index: number;
  isVisible: boolean;
  icon: React.ReactNode;
}

const practiceData = [
  {
    title: 'General Aptitude',
    links: [
      { name: 'Arithmetic Aptitude', href: '/practice/arithmetic-aptitude' },
      { name: 'Data Interpretation', href: '#' },
      { name: 'Online Aptitude Test', href: '#' },
      { name: 'Data Interpretation Test', href: '#' }
    ],
    icon: <BookOpen className="w-6 h-6" />
  },
  {
    title: 'Verbal and Reasoning',
    links: [
      { name: 'Verbal Ability', href: '#' },
      { name: 'Logical Reasoning', href: '#' },
      { name: 'Verbal Reasoning', href: '#' },
      { name: 'Non Verbal Reasoning', href: '#' } 
    ],
    icon: <Brain className="w-6 h-6" />
  },
  {
    title: 'Current Affairs & GK',
    links: [
      { name: 'Current Affairs', href: '#' },
      { name: 'Basic General Knowledge', href: '#' },
      { name: 'General Science', href: '#' },
      { name: 'Read more...', href: '#' }
    ],
    icon: <Newspaper className="w-6 h-6" />
  },
  {
    title: 'Interview',
    links: [
      { name: 'Placement Papers', href: '#' },
      { name: 'Group Discussion', href: '#' },
      { name: 'HR Interview', href: '#' },
      { name: 'Read more...', href: '#' }
    ],
    icon: <Briefcase className="w-6 h-6" />
  },
  {
    title: 'Engineering',
    links: [
      { name: 'Mechanical Engineering', href: '#' },
      { name: 'Civil Engineering', href: '#' },
      { name: 'ECE, EEE, CSE', href: '#' },
      { name: 'Chemical Engineering', href: '#' }
    ],
    icon: <Wrench className="w-6 h-6" />
  },
  {
    title: 'Programming',
    links: [
      { name: 'C Programming', href: '#' },
      { name: 'C++ Programming', href: '#' },
      { name: 'C# Programming', href: '#' },
      { name: 'Java Programming', href: '#' }
    ],
    icon: <Code className="w-6 h-6" />
  },
];

const PracticeCard: React.FC<PracticeCardProps> = ({ title, links, index, isVisible, icon }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="practice-card group relative bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden"
      style={{
        animation: isVisible ? `fade-in-up 0.6s ease-out ${index * 0.1}s forwards` : 'none',
        opacity: isVisible ? 1 : 0,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Animated gradient background on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative z-10">
        {/* Icon and Title */}
        <div className="flex items-center mb-4">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 text-blue-600 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
            {icon}
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ml-3 group-hover:scale-105 transition-transform duration-300">
            {title}
          </h3>
        </div>
        
        {/* Links */}
        <ul className="space-y-2">
          {links.map((link, linkIndex) => (
            <li key={linkIndex}>
              <Link 
                href={link.href} 
                className="link-item flex items-center text-gray-700 hover:text-blue-600 transition-all duration-300 py-1.5 px-2 rounded-lg hover:bg-blue-50/50 group/link"
              >
                <span className="mr-2 text-blue-500 group-hover/link:translate-x-1 transition-transform duration-300">›</span>
                <span className="flex-1 group-hover/link:translate-x-1 transition-transform duration-300">{link.name}</span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover/link:opacity-100 transform translate-x-[-10px] group-hover/link:translate-x-0 transition-all duration-300 text-blue-500" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const PracticePage: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <style jsx global>{`
        .practice-card {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          transform-style: preserve-3d;
        }

        .practice-card:hover {
          transform: translateY(-8px) translateZ(20px) rotateX(2deg) rotateY(-1deg);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(59, 130, 246, 0.1);
        }

        .link-item {
          position: relative;
        }

        .link-item::before {
          content: '';
          position: absolute;
          left: 0;
          bottom: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(to right, #3b82f6, #8b5cf6);
          transition: width 0.3s ease;
        }

        .link-item:hover::before {
          width: 100%;
        }
      `}</style>
      
      <div className="max-w-7xl mx-auto">
        <header className={`mb-10 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4 animate-float">
            Welcome to JMIT Online Aptitude Test System!
          </h1>
          <p className="text-gray-700 mt-3 text-lg md:text-xl max-w-3xl">
            Aptitude questions and answers for your placement interviews and competitive exams!
          </p>
        </header>
        
        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {practiceData.map((item, index) => (
            <PracticeCard 
              key={index} 
              title={item.title}
              links={item.links}
              index={index}
              isVisible={isVisible}
              icon={item.icon}
            />
          ))}
        </main>
      </div>
    </div>
  );
};

export default PracticePage;

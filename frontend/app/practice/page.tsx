"use client"
import React from 'react';
import Link from 'next/link';

interface PracticeCardProps {
  title: string;
  links: { name: string; href: string }[];
}

const practiceData = [
  {
    title: 'General Aptitude',
    links: [
      { name: 'Arithmetic Aptitude', href: '/practice/arithmetic-aptitude' },
      { name: 'Data Interpretation', href: '#' },
      { name: 'Online Aptitude Test', href: '#' },
      { name: 'Data Interpretation Test', href: '#' }
    ]
  },
  {
    title: 'Verbal and Reasoning',
    links: [
      { name: 'Verbal Ability', href: '#' },
      { name: 'Logical Reasoning', href: '#' },
      { name: 'Verbal Reasoning', href: '#' },
      { name: 'Non Verbal Reasoning', href: '#' }
    ]
  },
  {
    title: 'Current Affairs & GK',
    links: [
      { name: 'Current Affairs', href: '#' },
      { name: 'Basic General Knowledge', href: '#' },
      { name: 'General Science', href: '#' },
      { name: 'Read more...', href: '#' }
    ]
  },
  {
    title: 'Interview',
    links: [
      { name: 'Placement Papers', href: '#' },
      { name: 'Group Discussion', href: '#' },
      { name: 'HR Interview', href: '#' },
      { name: 'Read more...', href: '#' }
    ]
  },
  {
    title: 'Engineering',
    links: [
      { name: 'Mechanical Engineering', href: '#' },
      { name: 'Civil Engineering', href: '#' },
      { name: 'ECE, EEE, CSE', href: '#' },
      { name: 'Chemical Engineering', href: '#' }
    ]
  },
  {
    title: 'Programming',
    links: [
      { name: 'C Programming', href: '#' },
      { name: 'C++ Programming', href: '#' },
      { name: 'C# Programming', href: '#' },
      { name: 'Java Programming', href: '#' }
    ]
  },
];

const PracticeCard: React.FC<PracticeCardProps> = ({ title, links }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h3 className="text-lg font-semibold text-blue-600 mb-4">{title}</h3>
    <ul>
      {links.map((link, index) => (
        <li key={index} className="mb-2">
          <Link href={link.href} className="text-gray-700 hover:text-blue-600 flex items-center">
            <span className="mr-2">›</span>{link.name}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

const PracticePage: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-blue-600"> Welcome to JMIT Online Test!</h1>
          <p className="text-gray-600 mt-2">Aptitude questions and answers for your placement interviews and competitive exams!</p>
        </header>
        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {practiceData.map((item, index) => (
            <PracticeCard key={index} {...item} />
          ))}
        </main>
      </div>
    </div>
  );
};

export default PracticePage;
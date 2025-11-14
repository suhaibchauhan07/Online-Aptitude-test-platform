"use client"

import React from 'react';

interface PracticeCardProps {
  title: string;
  links: string[];
}

const arithmeticData = [
  {
    title: 'Numbers',
    links: ['Problems on Numbers', 'Problems on H.C.F and L.C.M', 'Decimal Fraction', 'Simplification'],
  },
  {
    title: 'Algebra',
    links: ['Surds and Indices', 'Chain Rule', 'Square Root and Cube Root', 'Problems on Ages'],
  },
  {
    title: 'Arithmetic',
    links: ['Percentage', 'Profit and Loss', 'Ratio and Proportion', 'Partnership'],
  },
  {
    title: 'Geometry',
    links: ['Area', 'Volume and Surface Area', 'Mensuration', 'Pipes and Cistern'],
  },
  {
    title: 'Time & Distance',
    links: ['Time and Work', 'Time and Distance', 'Problems on Trains', 'Boats and Streams'],
  },
  {
    title: 'Data',
    links: ['Average', 'Permutation and Combination', 'Probability', 'True Discount'],
  },
];

const PracticeCard: React.FC<PracticeCardProps> = ({ title, links }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h3 className="text-lg font-semibold text-blue-600 mb-4">{title}</h3>
    <ul>
      {links.map((link, index) => (
        <li key={index} className="mb-2">
          <a href="#" className="text-gray-700 hover:text-blue-600 flex items-center">
            <span className="mr-2">›</span>{link}
          </a>
        </li>
      ))}
    </ul>
  </div>
);

const ArithmeticAptitudePage: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-blue-600">Arithmetic Aptitude</h1>
          <p className="text-gray-600 mt-2">Practice arithmetic aptitude questions and improve your skills for placement interviews and competitive exams!</p>
        </header>
        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {arithmeticData.map((item, index) => (
            <PracticeCard key={index} {...item} />
          ))}
        </main>
      </div>
    </div>
  );
};

export default ArithmeticAptitudePage;
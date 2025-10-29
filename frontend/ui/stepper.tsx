import React from 'react';

interface StepperProps {
  steps: string[];
  activeStep: number;
}

export const Stepper: React.FC<StepperProps> = ({ steps, activeStep }) => {
  return (
    <div className="flex items-center justify-center mb-6">
      {steps.map((step, idx) => (
        <React.Fragment key={step}>
          <div className={`flex flex-col items-center ${idx === activeStep ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
            <div className={`rounded-full w-8 h-8 flex items-center justify-center border-2 ${idx === activeStep ? 'border-blue-600 bg-blue-100' : 'border-gray-300 bg-white'}`}>{idx + 1}</div>
            <span className="text-xs mt-1">{step}</span>
          </div>
          {idx < steps.length - 1 && <div className="w-8 h-0.5 bg-gray-300 mx-2" />}
        </React.Fragment>
      ))}
    </div>
  );
};

export default Stepper; 
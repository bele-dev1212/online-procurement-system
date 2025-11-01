import React from 'react';
import './ProgressStepper.css';

const ProgressStepper = ({ steps, currentStep }) => {
  return (
    <div className="progress-stepper">
      {steps.map((step, index) => (
        <div key={step.number} className="step-item">
          <div className={`step-number ${step.number === currentStep ? 'active' : step.number < currentStep ? 'completed' : ''}`}>
            {step.number < currentStep ? '✓' : step.number}
          </div>
          <div className="step-info">
            <span className="step-title">{step.title}</span>
          </div>
          {index < steps.length - 1 && (
            <div className={`step-connector ${step.number < currentStep ? 'completed' : ''}`}></div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProgressStepper;

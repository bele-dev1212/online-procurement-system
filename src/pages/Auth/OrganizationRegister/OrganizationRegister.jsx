import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrganizationRegister } from './hooks/useOrganizationRegister';
import ProgressStepper from './components/ProgressStepper';
import OrganizationInfoForm from './components/OrganizationInfoForm';
import AdminInfoForm from './components/AdminInfoForm';
import TermsAcceptance from './components/TermsAcceptance';
import './OrganizationRegister.css';

const OrganizationRegister = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const { formData, updateFormData, submitRegistration, loading, error } = useOrganizationRegister();

  const steps = [
    { number: 1, title: 'Organization Info' },
    { number: 2, title: 'Admin Details' },
    { number: 3, title: 'Terms & Conditions' }
  ];

  const handleNext = async () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      const success = await submitRegistration();
      if (success) {
        navigate('/verify-email', { 
          state: { email: formData.admin.email } 
        });
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <OrganizationInfoForm data={formData} onChange={updateFormData} />;
      case 2:
        return <AdminInfoForm data={formData} onChange={updateFormData} />;
      case 3:
        return <TermsAcceptance data={formData} onChange={updateFormData} />;
      default:
        return null;
    }
  };

  return (
    <div className="organization-register">
      <div className="register-container">
        <div className="register-header">
          <h1>Create Your Organization</h1>
          <p>Set up your company account on ፈጣን ግዢ</p>
        </div>

        <ProgressStepper steps={steps} currentStep={currentStep} />

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="step-content">
          {renderStep()}
        </div>

        <div className="step-actions">
          {currentStep > 1 && (
            <button onClick={handleBack} className="btn btn-secondary" disabled={loading}>
              Back
            </button>
          )}
          <button onClick={handleNext} className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating Account...' : currentStep === 3 ? 'Create Organization' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrganizationRegister;

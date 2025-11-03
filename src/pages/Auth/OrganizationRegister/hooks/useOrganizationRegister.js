import { useState } from 'react';

export const useOrganizationRegister = () => {
  const [formData, setFormData] = useState({
    organization: {
      name: '',
      industry: '',
      size: '',
      contactEmail: '',
      address: '',
      phone: '',
      website: ''
    },
    admin: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      position: '',
      phone: ''
    },
    terms: {
      acceptedTerms: false,
      acceptedPrivacy: false,
      newsletter: false
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateFormData = (section, data) => {
    setFormData(prev => ({
      ...prev,
      [section]: data
    }));
  };

  const validateForm = () => {
    // Organization validation
    if (!formData.organization.name.trim()) {
      return 'Company name is required';
    }
    if (!formData.organization.industry) {
      return 'Industry is required';
    }
    if (!formData.organization.size) {
      return 'Company size is required';
    }

    // Admin validation
    if (!formData.admin.firstName.trim()) {
      return 'First name is required';
    }
    if (!formData.admin.lastName.trim()) {
      return 'Last name is required';
    }
    if (!formData.admin.email.trim()) {
      return 'Email is required';
    }
    if (!formData.admin.password) {
      return 'Password is required';
    }
    if (formData.admin.password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!formData.admin.position.trim()) {
      return 'Position is required';
    }

    // Terms validation
    if (!formData.terms.acceptedTerms) {
      return 'You must accept the Terms of Service';
    }
    if (!formData.terms.acceptedPrivacy) {
      return 'You must accept the Privacy Policy';
    }

    return null;
  };

  const submitRegistration = async () => {
    console.log('Starting registration...');
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return false;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Sending registration data:', formData);
      
      const response = await fetch('/api/organizations/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('Registration response status:', response.status);
      
      const result = await response.json();
      console.log('Registration result:', result);

      if (!response.ok) {
        throw new Error(result.message || 'Registration failed');
      }

      // Registration successful
      console.log('Registration successful!');
      return true;

    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    updateFormData,
    submitRegistration,
    loading,
    error
  };
};

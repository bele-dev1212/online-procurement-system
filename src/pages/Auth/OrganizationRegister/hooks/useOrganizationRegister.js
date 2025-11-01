import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useOrganizationRegister = () => {
  const navigate = useNavigate();
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
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return false;
    }

    setLoading(true);
    setError('');

    try {
      // Real backend API call
      const response = await fetch('http://localhost:5000/api/organizations/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Registration failed');
      }

      // Store token and user data in localStorage
      if (result.data?.token) {
        localStorage.setItem('auth_token', result.data.token);
        localStorage.setItem('user_data', JSON.stringify(result.data.user));
        localStorage.setItem('organization_data', JSON.stringify(result.data.organization));
      }

      console.log('Registration successful:', result);

      // Navigate to login page on success
      navigate('/login');
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
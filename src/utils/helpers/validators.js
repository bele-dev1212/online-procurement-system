/**
 * Validation Utilities
 * Comprehensive validation functions for forms and data
 */

import { VALIDATION_CONSTANTS } from '../constants/appConstants';

/**
 * Common Validation Patterns
 */
export const validatePurchaseOrder = (data) => {
  const errors = {};
  if (!data.supplierId) errors.supplierId = 'Supplier is required';
  if (!data.deliveryDate) errors.deliveryDate = 'Delivery date is required';
  if (!data.lineItems || data.lineItems.length === 0) errors.lineItems = 'At least one line item is required';
  return errors;
};
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s\-()]{10,15}$/,
  URL: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
  ZIP_CODE: /^\d{5}(-\d{4})?$/,
  CURRENCY: /^\d+(\.\d{1,2})?$/,
  PERCENTAGE: /^(100(\.0{1,2})?|[1-9]?\d(\.\d{1,2})?)$/,
  ALPHA_NUMERIC: /^[a-zA-Z0-9\s]+$/,
  ALPHA_ONLY: /^[a-zA-Z\s]+$/,
  NUMERIC: /^\d+$/,
  DECIMAL: /^\d+(\.\d+)?$/,
  DATE: /^\d{4}-\d{2}-\d{2}$/,
  TIME: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
  CREDIT_CARD: /^\d{13,19}$/,
  CVV: /^\d{3,4}$/,
  EXPIRY_DATE: /^(0[1-9]|1[0-2])\/([0-9]{2})$/,
};

/**
 * Basic Validators
 */
export const BasicValidators = {
  // Required field validation
  required: (value, fieldName = 'This field') => {
    if (value === null || value === undefined || value === '') {
      return `${fieldName} is required`;
    }
    
    if (Array.isArray(value) && value.length === 0) {
      return `${fieldName} is required`;
    }
    
    return null;
  },

  // Minimum length validation
  minLength: (value, min, fieldName = 'This field') => {
    if (value && value.length < min) {
      return `${fieldName} must be at least ${min} characters`;
    }
    return null;
  },

  // Maximum length validation
  maxLength: (value, max, fieldName = 'This field') => {
    if (value && value.length > max) {
      return `${fieldName} must be less than ${max} characters`;
    }
    return null;
  },

  // Exact length validation
  exactLength: (value, length, fieldName = 'This field') => {
    if (value && value.length !== length) {
      return `${fieldName} must be exactly ${length} characters`;
    }
    return null;
  },

  // Email validation
  email: (value, fieldName = 'Email') => {
    if (value && !VALIDATION_PATTERNS.EMAIL.test(value)) {
      return `${fieldName} must be a valid email address`;
    }
    return null;
  },

  // Phone number validation
  phone: (value, fieldName = 'Phone number') => {
    if (value && !VALIDATION_PATTERNS.PHONE.test(value.replace(/\s/g, ''))) {
      return `${fieldName} must be a valid phone number`;
    }
    return null;
  },

  // URL validation
  url: (value, fieldName = 'URL') => {
    if (value && !VALIDATION_PATTERNS.URL.test(value)) {
      return `${fieldName} must be a valid URL`;
    }
    return null;
  },

  // Numeric validation
  numeric: (value, fieldName = 'This field') => {
    if (value && isNaN(Number(value))) {
      return `${fieldName} must be a number`;
    }
    return null;
  },

  // Integer validation
  integer: (value, fieldName = 'This field') => {
    if (value && (!Number.isInteger(Number(value)) || value.includes('.'))) {
      return `${fieldName} must be a whole number`;
    }
    return null;
  },

  // Decimal validation
  decimal: (value, decimalPlaces = 2, fieldName = 'This field') => {
    if (value) {
      const decimalRegex = new RegExp(`^\\d+(\\.\\d{1,${decimalPlaces}})?$`);
      if (!decimalRegex.test(value)) {
        return `${fieldName} must be a number with up to ${decimalPlaces} decimal places`;
      }
    }
    return null;
  },

  // Minimum value validation
  minValue: (value, min, fieldName = 'This field') => {
    const numValue = Number(value);
    if (value && !isNaN(numValue) && numValue < min) {
      return `${fieldName} must be at least ${min}`;
    }
    return null;
  },

  // Maximum value validation
  maxValue: (value, max, fieldName = 'This field') => {
    const numValue = Number(value);
    if (value && !isNaN(numValue) && numValue > max) {
      return `${fieldName} must be less than or equal to ${max}`;
    }
    return null;
  },

  // Range validation
  range: (value, min, max, fieldName = 'This field') => {
    const numValue = Number(value);
    if (value && (!isNaN(numValue) && (numValue < min || numValue > max))) {
      return `${fieldName} must be between ${min} and ${max}`;
    }
    return null;
  },

  // Pattern validation
  pattern: (value, pattern, message, fieldName = 'This field') => {
    if (value && !pattern.test(value)) {
      return message || `${fieldName} format is invalid`;
    }
    return null;
  },

  // Array validation
  array: (value, minItems = 0, maxItems = null, fieldName = 'This field') => {
    if (!Array.isArray(value)) {
      return `${fieldName} must be an array`;
    }

    if (value.length < minItems) {
      return `${fieldName} must have at least ${minItems} items`;
    }

    if (maxItems !== null && value.length > maxItems) {
      return `${fieldName} must have no more than ${maxItems} items`;
    }

    return null;
  },

  // Date validation
  date: (value, fieldName = 'Date') => {
    if (value) {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return `${fieldName} must be a valid date`;
      }
    }
    return null;
  },

  // Future date validation
  futureDate: (value, fieldName = 'Date') => {
    if (value) {
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (date < today) {
        return `${fieldName} must be in the future`;
      }
    }
    return null;
  },

  // Past date validation
  pastDate: (value, fieldName = 'Date') => {
    if (value) {
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (date > today) {
        return `${fieldName} must be in the past`;
      }
    }
    return null;
  },

  // Date range validation
  dateRange: (startDate, endDate, fieldNames = ['Start date', 'End date']) => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start > end) {
        return `${fieldNames[1]} must be after ${fieldNames[0]}`;
      }
    }
    return null;
  },
};

/**
 * Business Logic Validators
 */
export const BusinessValidators = {
  // Purchase order amount validation
  purchaseOrderAmount: (amount, userRole, approvalThresholds) => {
    const numAmount = Number(amount);
    
    if (isNaN(numAmount)) {
      return 'Amount must be a valid number';
    }

    if (numAmount <= 0) {
      return 'Amount must be greater than 0';
    }

    // Check if amount exceeds user's approval limit
    const userLimit = approvalThresholds[userRole];
    if (userLimit && numAmount > userLimit) {
      return `Amount exceeds your approval limit of ${userLimit}. Requires higher approval.`;
    }

    return null;
  },

  // Inventory stock validation
  inventoryStock: (currentStock, requestedQuantity, fieldName = 'Quantity') => {
    const stock = Number(currentStock);
    const quantity = Number(requestedQuantity);

    if (isNaN(stock) || isNaN(quantity)) {
      return 'Invalid stock or quantity values';
    }

    if (quantity <= 0) {
      return `${fieldName} must be greater than 0`;
    }

    if (quantity > stock) {
      return `Insufficient stock. Only ${stock} items available`;
    }

    return null;
  },

  // Bid amount validation
  bidAmount: (amount, budget, fieldName = 'Bid amount') => {
    const bidAmount = Number(amount);
    const budgetAmount = Number(budget);

    if (isNaN(bidAmount) || isNaN(budgetAmount)) {
      return 'Invalid amount values';
    }

    if (bidAmount <= 0) {
      return `${fieldName} must be greater than 0`;
    }

    if (bidAmount > budgetAmount) {
      return `${fieldName} exceeds available budget of ${budgetAmount}`;
    }

    return null;
  },

  // Supplier rating validation
  supplierRating: (rating, fieldName = 'Rating') => {
    const numRating = Number(rating);

    if (isNaN(numRating)) {
      return `${fieldName} must be a number`;
    }

    if (numRating < 1 || numRating > 5) {
      return `${fieldName} must be between 1 and 5`;
    }

    return null;
  },

  // Password strength validation
  password: (password, fieldName = 'Password') => {
    const errors = [];

    if (!password) {
      return `${fieldName} is required`;
    }

    if (password.length < VALIDATION_CONSTANTS.PASSWORD.MIN_LENGTH) {
      errors.push(`at least ${VALIDATION_CONSTANTS.PASSWORD.MIN_LENGTH} characters`);
    }

    if (VALIDATION_CONSTANTS.PASSWORD.REQUIRE_UPPERCASE && !/(?=.*[A-Z])/.test(password)) {
      errors.push('one uppercase letter');
    }

    if (VALIDATION_CONSTANTS.PASSWORD.REQUIRE_LOWERCASE && !/(?=.*[a-z])/.test(password)) {
      errors.push('one lowercase letter');
    }

    if (VALIDATION_CONSTANTS.PASSWORD.REQUIRE_NUMBERS && !/(?=.*\d)/.test(password)) {
      errors.push('one number');
    }

    if (VALIDATION_CONSTANTS.PASSWORD.REQUIRE_SYMBOLS && !/(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/.test(password)) {
      errors.push('one special character');
    }

    if (errors.length > 0) {
      return `${fieldName} must contain ${errors.join(', ')}`;
    }

    return null;
  },

  // Password confirmation validation
  confirmPassword: (password, confirmPassword) => {
    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }
    return null;
  },

  // File validation
  file: (file, options = {}) => {
    const {
      allowedExtensions = VALIDATION_CONSTANTS.FILES.ALLOWED_EXTENSIONS,
      maxSize = VALIDATION_CONSTANTS.FILES.MAX_FILE_SIZE,
      maxFiles = VALIDATION_CONSTANTS.FILES.MAX_FILES_PER_UPLOAD,
    } = options;

    if (!file) {
      return 'File is required';
    }

    // Handle multiple files
    const files = Array.isArray(file) ? file : [file];
    
    if (files.length > maxFiles) {
      return `Maximum ${maxFiles} files allowed`;
    }

    for (const singleFile of files) {
      // Check file size
      if (singleFile.size > maxSize) {
        return `File size must be less than ${maxSize / 1024 / 1024}MB`;
      }

      // Check file extension
      const fileExtension = '.' + singleFile.name.split('.').pop().toLowerCase();
      if (!allowedExtensions.includes(fileExtension)) {
        return `File type not allowed. Allowed types: ${allowedExtensions.join(', ')}`;
      }
    }

    return null;
  },

  // Credit card validation
  creditCard: (cardNumber, fieldName = 'Credit card') => {
    if (!cardNumber) {
      return `${fieldName} is required`;
    }

    // Remove spaces and dashes
    const cleaned = cardNumber.replace(/[\s-]/g, '');

    if (!VALIDATION_PATTERNS.CREDIT_CARD.test(cleaned)) {
      return `${fieldName} must be a valid card number`;
    }

    // Luhn algorithm check
    let sum = 0;
    let isEven = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned.charAt(i), 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    if (sum % 10 !== 0) {
      return `${fieldName} is not a valid card number`;
    }

    return null;
  },

  // CVV validation
  cvv: (cvv, fieldName = 'CVV') => {
    if (!cvv) {
      return `${fieldName} is required`;
    }

    if (!VALIDATION_PATTERNS.CVV.test(cvv)) {
      return `${fieldName} must be 3 or 4 digits`;
    }

    return null;
  },

  // Expiry date validation
  expiryDate: (expiry, fieldName = 'Expiry date') => {
    if (!expiry) {
      return `${fieldName} is required`;
    }

    if (!VALIDATION_PATTERNS.EXPIRY_DATE.test(expiry)) {
      return `${fieldName} must be in MM/YY format`;
    }

    const [month, year] = expiry.split('/');
    const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
    const currentDate = new Date();
    const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    if (expiryDate < currentMonth) {
      return `${fieldName} must be in the future`;
    }

    return null;
  },
};

/**
 * Validation Helper Functions
 */
export const ValidationHelpers = {
  // Run multiple validators
  validate: (value, validators, fieldName = 'This field') => {
    if (!Array.isArray(validators)) {
      validators = [validators];
    }

    for (const validator of validators) {
      const error = validator(value, fieldName);
      if (error) {
        return error;
      }
    }

    return null;
  },

  // Validate form fields
  validateForm: (formData, validationRules) => {
    const errors = {};

    for (const [fieldName, validators] of Object.entries(validationRules)) {
      const value = formData[fieldName];
      const error = ValidationHelpers.validate(value, validators, fieldName);
      
      if (error) {
        errors[fieldName] = error;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },

  // Async validation (for API checks)
  asyncValidate: async (value, asyncValidator, fieldName = 'This field') => {
    try {
      const error = await asyncValidator(value, fieldName);
      return error;
    } catch (error) {
      return `Validation failed: ${error.message}`;
    }
  },

  // Conditional validation
  conditional: (condition, validator) => {
    return (value, fieldName) => {
      if (condition(value)) {
        return validator(value, fieldName);
      }
      return null;
    };
  },

  // Custom validator creator
  createValidator: (validateFn, errorMessage) => {
    return (value, fieldName = 'This field') => {
      if (!validateFn(value)) {
        return errorMessage || `${fieldName} is invalid`;
      }
      return null;
    };
  },

  // Debounced validation (for real-time validation)
  debounced: (validator, delay = 300) => {
    let timeoutId;

    return (value, fieldName) => {
      return new Promise((resolve) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          const error = validator(value, fieldName);
          resolve(error);
        }, delay);
      });
    };
  },
};

/**
 * Common Validation Schemas
 */
export const ValidationSchemas = {
  // User registration schema - FIXED VERSION
  USER_REGISTRATION: {
    firstName: [
      (value) => BasicValidators.required(value, 'First name'),
      (value) => BasicValidators.minLength(value, 2, 'First name'),
      (value) => BasicValidators.maxLength(value, VALIDATION_CONSTANTS?.TEXT_LIMITS?.NAME || 50, 'First name'),
    ],
    lastName: [
      (value) => BasicValidators.required(value, 'Last name'),
      (value) => BasicValidators.minLength(value, 2, 'Last name'),
      (value) => BasicValidators.maxLength(value, VALIDATION_CONSTANTS?.TEXT_LIMITS?.NAME || 50, 'Last name'),
    ],
    email: [
      (value) => BasicValidators.required(value, 'Email'),
      (value) => BasicValidators.email(value, 'Email'),
    ],
    password: [
      (value) => BasicValidators.required(value, 'Password'),
      (value) => BusinessValidators.password(value, 'Password'),
    ],
    confirmPassword: [
      (value) => BasicValidators.required(value, 'Confirm password'),
      (_value, _fieldName) => {
        // This will be handled in the registerValidation function
        return null;
      },
    ],
  },

  // Purchase order schema
  PURCHASE_ORDER: {
    supplierId: [(value) => BasicValidators.required(value, 'Supplier')],
    items: [
      (value) => BasicValidators.required(value, 'Items'),
      (value) => BasicValidators.array(value, 1, null, 'Items'),
    ],
    deliveryDate: [
      (value) => BasicValidators.required(value, 'Delivery date'),
      (value) => BasicValidators.futureDate(value, 'Delivery date'),
    ],
    totalAmount: [
      (value) => BasicValidators.required(value, 'Total amount'),
      (value) => BasicValidators.numeric(value, 'Total amount'),
      (value) => BasicValidators.minValue(value, 0.01, 'Total amount'),
    ],
  },

  // Supplier schema
  SUPPLIER: {
    name: [
      (value) => BasicValidators.required(value, 'Supplier name'),
      (value) => BasicValidators.minLength(value, 2, 'Supplier name'),
      (value) => BasicValidators.maxLength(value, VALIDATION_CONSTANTS?.TEXT_LIMITS?.NAME || 50, 'Supplier name'),
    ],
    email: [
      (value) => BasicValidators.required(value, 'Email'),
      (value) => BasicValidators.email(value, 'Email'),
    ],
    phone: [
      (value) => BasicValidators.required(value, 'Phone number'),
      (value) => BasicValidators.phone(value, 'Phone number'),
    ],
    address: [(value) => BasicValidators.required(value, 'Address')],
    category: [(value) => BasicValidators.required(value, 'Category')],
  },

  // Product schema
  PRODUCT: {
    name: [
      (value) => BasicValidators.required(value, 'Product name'),
      (value) => BasicValidators.minLength(value, 2, 'Product name'),
      (value) => BasicValidators.maxLength(value, VALIDATION_CONSTANTS?.TEXT_LIMITS?.NAME || 50, 'Product name'),
    ],
    sku: [(value) => BasicValidators.required(value, 'SKU')],
    category: [(value) => BasicValidators.required(value, 'Category')],
    price: [
      (value) => BasicValidators.required(value, 'Price'),
      (value) => BasicValidators.numeric(value, 'Price'),
      (value) => BasicValidators.minValue(value, 0, 'Price'),
    ],
    stock: [
      (value) => BasicValidators.required(value, 'Stock'),
      (value) => BasicValidators.integer(value, 'Stock'),
      (value) => BasicValidators.minValue(value, 0, 'Stock'),
    ],
  },
};

/**
 * Registration form validation - FIXED VERSION
 */
export const registerValidation = (formData) => {
  const errors = {};

  // First name validation
  const firstNameError = ValidationHelpers.validate(
    formData.firstName,
    ValidationSchemas.USER_REGISTRATION.firstName,
    'First name'
  );
  if (firstNameError) errors.firstName = firstNameError;

  // Last name validation
  const lastNameError = ValidationHelpers.validate(
    formData.lastName,
    ValidationSchemas.USER_REGISTRATION.lastName,
    'Last name'
  );
  if (lastNameError) errors.lastName = lastNameError;

  // Email validation
  const emailError = ValidationHelpers.validate(
    formData.email,
    ValidationSchemas.USER_REGISTRATION.email,
    'Email'
  );
  if (emailError) errors.email = emailError;

  // Password validation
  const passwordError = ValidationHelpers.validate(
    formData.password,
    ValidationSchemas.USER_REGISTRATION.password,
    'Password'
  );
  if (passwordError) errors.password = passwordError;

  // Confirm password validation - FIXED
  if (!formData.confirmPassword) {
    errors.confirmPassword = 'Confirm password is required';
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Export all validators
 */
export default {
  patterns: VALIDATION_PATTERNS,
  basic: BasicValidators,
  business: BusinessValidators,
  helpers: ValidationHelpers,
  schemas: ValidationSchemas,
  registerValidation,

  // Convenience methods
  validateField: (value, rules, fieldName) => {
    return ValidationHelpers.validate(value, rules, fieldName);
  },

  validateFormData: (formData, schema) => {
    return ValidationHelpers.validateForm(formData, schema);
  },

  createSchema: (fieldRules) => {
    return fieldRules;
  },
};
// Validation rules and utilities
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  email?: boolean;
  url?: boolean;
  custom?: (value: any) => string | null;
}

export interface ValidationErrors {
  [key: string]: string;
}

// Common validation patterns
export const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  url: /^https?:\/\/.+/,
  phone: /^\+?[\d\s\-\(\)]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  username: /^[a-zA-Z0-9_]{3,20}$/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/
};

// Validation functions
export const validators = {
  required: (value: any): string | null => {
    if (value === null || value === undefined || value === '') {
      return 'This field is required';
    }
    return null;
  },

  minLength: (value: string, min: number): string | null => {
    if (value && value.length < min) {
      return `Must be at least ${min} characters long`;
    }
    return null;
  },

  maxLength: (value: string, max: number): string | null => {
    if (value && value.length > max) {
      return `Must be no more than ${max} characters long`;
    }
    return null;
  },

  min: (value: number, min: number): string | null => {
    if (value !== null && value !== undefined && value < min) {
      return `Must be at least ${min}`;
    }
    return null;
  },

  max: (value: number, max: number): string | null => {
    if (value !== null && value !== undefined && value > max) {
      return `Must be no more than ${max}`;
    }
    return null;
  },

  pattern: (value: string, pattern: RegExp, message?: string): string | null => {
    if (value && !pattern.test(value)) {
      return message || 'Invalid format';
    }
    return null;
  },

  email: (value: string): string | null => {
    if (value && !patterns.email.test(value)) {
      return 'Please enter a valid email address';
    }
    return null;
  },

  url: (value: string): string | null => {
    if (value && !patterns.url.test(value)) {
      return 'Please enter a valid URL';
    }
    return null;
  }
};

// Sanitization functions
export const sanitizers = {
  trim: (value: string): string => {
    return value?.trim() || '';
  },

  toLowerCase: (value: string): string => {
    return value?.toLowerCase() || '';
  },

  toUpperCase: (value: string): string => {
    return value?.toUpperCase() || '';
  },

  removeSpaces: (value: string): string => {
    return value?.replace(/\s/g, '') || '';
  },

  escapeHtml: (value: string): string => {
    if (!value) return '';
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  },

  sanitizeEmail: (value: string): string => {
    return sanitizers.trim(sanitizers.toLowerCase(value));
  },

  sanitizeString: (value: string): string => {
    return sanitizers.trim(value);
  }
};

// Main validation function
export const validateForm = (
  data: Record<string, any>,
  rules: Record<string, ValidationRule>
): ValidationErrors => {
  const errors: ValidationErrors = {};

  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field];
    let error: string | null = null;

    // Required validation
    if (rule.required) {
      error = validators.required(value);
      if (error) {
        errors[field] = error;
        continue;
      }
    }

    // Skip other validations if value is empty and not required
    if (!value && !rule.required) {
      continue;
    }

    // String validations
    if (typeof value === 'string') {
      if (rule.minLength !== undefined) {
        error = validators.minLength(value, rule.minLength);
        if (error) {
          errors[field] = error;
          continue;
        }
      }

      if (rule.maxLength !== undefined) {
        error = validators.maxLength(value, rule.maxLength);
        if (error) {
          errors[field] = error;
          continue;
        }
      }

      if (rule.pattern) {
        error = validators.pattern(value, rule.pattern);
        if (error) {
          errors[field] = error;
          continue;
        }
      }

      if (rule.email) {
        error = validators.email(value);
        if (error) {
          errors[field] = error;
          continue;
        }
      }

      if (rule.url) {
        error = validators.url(value);
        if (error) {
          errors[field] = error;
          continue;
        }
      }
    }

    // Number validations
    if (typeof value === 'number') {
      if (rule.min !== undefined) {
        error = validators.min(value, rule.min);
        if (error) {
          errors[field] = error;
          continue;
        }
      }

      if (rule.max !== undefined) {
        error = validators.max(value, rule.max);
        if (error) {
          errors[field] = error;
          continue;
        }
      }
    }

    // Custom validation
    if (rule.custom) {
      error = rule.custom(value);
      if (error) {
        errors[field] = error;
        continue;
      }
    }
  }

  return errors;
};

// Common validation rules
export const validationRules = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 50
  },

  email: {
    required: true,
    email: true,
    maxLength: 100
  },

  password: {
    required: true,
    minLength: 6,
    maxLength: 100
  },

  confirmPassword: {
    required: true,
    minLength: 6,
    maxLength: 100
  },

  phone: {
    pattern: patterns.phone,
    maxLength: 20
  },

  url: {
    url: true,
    maxLength: 500
  },

  username: {
    required: true,
    pattern: patterns.username,
    minLength: 3,
    maxLength: 20
  },

  slug: {
    pattern: patterns.slug,
    minLength: 3,
    maxLength: 50
  }
};

// Form validation hook
export const useFormValidation = <T extends Record<string, any>>(
  initialData: T,
  rules: Record<keyof T, ValidationRule>
) => {
  const [data, setData] = useState<T>(initialData);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>);

  const validate = (field?: keyof T): boolean => {
    if (field) {
      const fieldRules = { [field]: rules[field] };
      const fieldData = { [field]: data[field] };
      const fieldErrors = validateForm(fieldData, fieldRules);
      
      setErrors(prev => ({
        ...prev,
        [field]: fieldErrors[field] || ''
      }));
      
      return !fieldErrors[field];
    } else {
      const allErrors = validateForm(data, rules);
      setErrors(allErrors);
      return Object.keys(allErrors).length === 0;
    }
  };

  const setValue = (field: keyof T, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field as string]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
    }
  };

  const setTouchedField = (field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const isValid = Object.keys(errors).length === 0;
  const isFieldValid = (field: keyof T) => !errors[field as string];
  const isFieldTouched = (field: keyof T) => touched[field];

  return {
    data,
    errors,
    touched,
    setValue,
    setTouchedField,
    validate,
    isValid,
    isFieldValid,
    isFieldTouched
  };
};

// React hook for form validation
import { useState } from 'react';

// Export sanitization functions for use in forms
export const sanitizeEmail = sanitizers.sanitizeEmail;
export const sanitizeString = sanitizers.sanitizeString;
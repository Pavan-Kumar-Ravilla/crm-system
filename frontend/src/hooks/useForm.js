import { useState, useCallback } from 'react';

export const useForm = (initialValues = {}, validationSchema = null) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [errors]);

  const setFieldTouched = useCallback((name, isTouched = true) => {
    setTouched(prev => ({ ...prev, [name]: isTouched }));
  }, []);

  const validateField = useCallback(async (name, value) => {
    if (!validationSchema) return null;

    try {
      await validationSchema.validateAt(name, { [name]: value });
      return null;
    } catch (error) {
      return error.message;
    }
  }, [validationSchema]);

  const validateForm = useCallback(async () => {
    if (!validationSchema) return {};

    try {
      await validationSchema.validate(values, { abortEarly: false });
      return {};
    } catch (error) {
      const validationErrors = {};
      error.inner.forEach(err => {
        validationErrors[err.path] = err.message;
      });
      return validationErrors;
    }
  }, [validationSchema, values]);

  const handleChange = useCallback(async (name, value) => {
    setValue(name, value);
    
    if (touched[name]) {
      const error = await validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [setValue, touched, validateField]);

  const handleBlur = useCallback(async (name) => {
    setFieldTouched(name, true);
    const error = await validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [setFieldTouched, validateField, values]);

  const handleSubmit = useCallback(async (onSubmit) => {
    setIsSubmitting(true);
    
    try {
      const validationErrors = await validateForm();
      
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setTouched(Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
        return;
      }

      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, values]);

  const reset = useCallback((newValues = initialValues) => {
    setValues(newValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const isValid = Object.keys(errors).length === 0 && Object.values(errors).every(error => !error);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    setValue,
    setFieldTouched,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    validateField,
    validateForm
  };
};
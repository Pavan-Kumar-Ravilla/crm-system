import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

const DynamicForm = ({
  fields = [],
  schema,
  defaultValues = {},
  onSubmit,
  isLoading = false,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  onCancel,
  className = '',
  layout = 'vertical'
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch
  } = useForm({
    resolver: schema ? yupResolver(schema) : undefined,
    defaultValues,
    mode: 'onChange'
  });

  const watchedValues = watch();

  const renderField = (field) => {
    const { name, type, label, placeholder, options, required, disabled, rules, dependencies } = field;
    
    // Check if field should be shown based on dependencies
    if (dependencies && !dependencies.every(dep => {
      const { field: depField, value: depValue, condition = 'equals' } = dep;
      const currentValue = watchedValues[depField];
      
      switch (condition) {
        case 'equals':
          return currentValue === depValue;
        case 'not_equals':
          return currentValue !== depValue;
        case 'contains':
          return Array.isArray(currentValue) && currentValue.includes(depValue);
        default:
          return true;
      }
    })) {
      return null;
    }

    const fieldProps = {
      label,
      placeholder,
      required,
      disabled,
      error: errors[name]?.message
    };

    switch (type) {
      case 'text':
      case 'email':
      case 'password':
      case 'number':
      case 'tel':
      case 'url':
        return (
          <Controller
            key={name}
            name={name}
            control={control}
            rules={rules}
            render={({ field: { onChange, value, ...fieldRest } }) => (
              <Input
                {...fieldProps}
                {...fieldRest}
                type={type}
                value={value || ''}
                onChange={onChange}
              />
            )}
          />
        );

      case 'textarea':
        return (
          <Controller
            key={name}
            name={name}
            control={control}
            rules={rules}
            render={({ field: { onChange, value, ...fieldRest } }) => (
              <div>
                {label && (
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                )}
                <textarea
                  {...fieldRest}
                  placeholder={placeholder}
                  value={value || ''}
                  onChange={onChange}
                  disabled={disabled}
                  rows={field.rows || 3}
                  className={`
                    block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none transition-colors duration-200
                    ${errors[name] 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                    }
                    ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
                  `}
                />
                {errors[name] && (
                  <p className="mt-1 text-sm text-red-600">{errors[name].message}</p>
                )}
              </div>
            )}
          />
        );

      case 'select':
        return (
          <Controller
            key={name}
            name={name}
            control={control}
            rules={rules}
            render={({ field: { onChange, value, ...fieldRest } }) => (
              <Select
                {...fieldProps}
                {...fieldRest}
                options={options || []}
                value={value || ''}
                onChange={onChange}
              />
            )}
          />
        );

      case 'checkbox':
        return (
          <Controller
            key={name}
            name={name}
            control={control}
            rules={rules}
            render={({ field: { onChange, value, ...fieldRest } }) => (
              <div className="flex items-center">
                <input
                  {...fieldRest}
                  type="checkbox"
                  checked={value || false}
                  onChange={(e) => onChange(e.target.checked)}
                  disabled={disabled}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label className="ml-2 text-sm text-gray-700">
                  {label}
                  {required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {errors[name] && (
                  <p className="ml-2 text-sm text-red-600">{errors[name].message}</p>
                )}
              </div>
            )}
          />
        );

      case 'radio':
        return (
          <Controller
            key={name}
            name={name}
            control={control}
            rules={rules}
            render={({ field: { onChange, value, ...fieldRest } }) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {label}
                  {required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <div className="space-y-2">
                  {options?.map((option) => (
                    <div key={option.value} className="flex items-center">
                      <input
                        {...fieldRest}
                        type="radio"
                        value={option.value}
                        checked={value === option.value}
                        onChange={() => onChange(option.value)}
                        disabled={disabled}
                        className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                      />
                      <label className="ml-2 text-sm text-gray-700">
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
                {errors[name] && (
                  <p className="mt-1 text-sm text-red-600">{errors[name].message}</p>
                )}
              </div>
            )}
          />
        );

      case 'date':
        return (
          <Controller
            key={name}
            name={name}
            control={control}
            rules={rules}
            render={({ field: { onChange, value, ...fieldRest } }) => (
              <Input
                {...fieldProps}
                {...fieldRest}
                type="date"
                value={value ? value.split('T')[0] : ''}
                onChange={onChange}
              />
            )}
          />
        );

      case 'file':
        return (
          <Controller
            key={name}
            name={name}
            control={control}
            rules={rules}
            render={({ field: { onChange, value, ...fieldRest } }) => (
              <div>
                {label && (
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                )}
                <input
                  {...fieldRest}
                  type="file"
                  onChange={(e) => onChange(e.target.files)}
                  disabled={disabled}
                  accept={field.accept}
                  multiple={field.multiple}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
                {errors[name] && (
                  <p className="mt-1 text-sm text-red-600">{errors[name].message}</p>
                )}
              </div>
            )}
          />
        );

      default:
        return null;
    }
  };

  const layoutClasses = {
    vertical: 'space-y-4',
    horizontal: 'grid grid-cols-1 md:grid-cols-2 gap-4',
    inline: 'flex flex-wrap gap-4'
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={className}>
      <div className={layoutClasses[layout]}>
        {fields.map((field) => renderField(field))}
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting || isLoading}
          >
            {cancelLabel}
          </Button>
        )}
        
        <Button
          type="submit"
          isLoading={isSubmitting || isLoading}
          disabled={isSubmitting || isLoading}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default DynamicForm;
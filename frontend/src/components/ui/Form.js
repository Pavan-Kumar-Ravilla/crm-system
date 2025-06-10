import React from 'react';
import { useForm } from 'react-hook-form';
import classNames from 'classnames';
import Input from './Input';
import Button from './Button';

const FormField = ({ field, register, errors, watch }) => {
  const { name, type, label, placeholder, required, options, validation, ...props } = field;
  const error = errors[name]?.message;

  switch (type) {
    case 'text':
    case 'email':
    case 'password':
    case 'number':
    case 'tel':
      return (
        <Input
          type={type}
          label={label}
          placeholder={placeholder}
          required={required}
          error={error}
          {...register(name, validation)}
          {...props}
        />
      );

    case 'textarea':
      return (
        <div className="space-y-1">
          <label className="block text-sm font-medium text-salesforce-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <textarea
            className={classNames(
              'block w-full rounded-md border-salesforce-gray-300 shadow-sm',
              'focus:border-salesforce-blue-500 focus:ring-salesforce-blue-500 focus:ring-1',
              'placeholder-salesforce-gray-400',
              {
                'border-red-300 focus:border-red-500 focus:ring-red-500': error,
              }
            )}
            placeholder={placeholder}
            rows={4}
            {...register(name, validation)}
            {...props}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      );

    case 'select':
      return (
        <div className="space-y-1">
          <label className="block text-sm font-medium text-salesforce-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <select
            className={classNames(
              'block w-full rounded-md border-salesforce-gray-300 shadow-sm',
              'focus:border-salesforce-blue-500 focus:ring-salesforce-blue-500 focus:ring-1',
              {
                'border-red-300 focus:border-red-500 focus:ring-red-500': error,
              }
            )}
            {...register(name, validation)}
            {...props}
          >
            <option value="">Select {label}</option>
            {options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      );

    case 'checkbox':
      return (
        <div className="flex items-center">
          <input
            type="checkbox"
            className="rounded border-salesforce-gray-300 text-salesforce-blue-600 focus:ring-salesforce-blue-500"
            {...register(name, validation)}
            {...props}
          />
          <label className="ml-2 text-sm text-salesforce-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        </div>
      );

    case 'radio':
      return (
        <div className="space-y-1">
          <label className="block text-sm font-medium text-salesforce-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <div className="space-y-2">
            {options?.map((option) => (
              <div key={option.value} className="flex items-center">
                <input
                  type="radio"
                  value={option.value}
                  className="text-salesforce-blue-600 focus:ring-salesforce-blue-500"
                  {...register(name, validation)}
                  {...props}
                />
                <label className="ml-2 text-sm text-salesforce-gray-700">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      );

    case 'date':
      return (
        <Input
          type="date"
          label={label}
          placeholder={placeholder}
          required={required}
          error={error}
          {...register(name, validation)}
          {...props}
        />
      );

    default:
      return null;
  }
};

const Form = ({
  fields = [],
  onSubmit,
  defaultValues = {},
  className,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  onCancel,
  loading = false,
  showCancelButton = false,
  layout = 'vertical',
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm({
    defaultValues,
  });

  const layoutClasses = {
    vertical: 'space-y-6',
    horizontal: 'grid grid-cols-1 md:grid-cols-2 gap-6',
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={classNames('space-y-6', className)}
    >
      <div className={layoutClasses[layout]}>
        {fields.map((field) => (
          <FormField
            key={field.name}
            field={field}
            register={register}
            errors={errors}
            watch={watch}
          />
        ))}
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t border-salesforce-gray-200">
        {showCancelButton && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel || (() => reset())}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
        )}
        <Button
          type="submit"
          loading={loading}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default Form;
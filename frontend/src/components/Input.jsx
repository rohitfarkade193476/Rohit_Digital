import React, { forwardRef } from 'react';
const Input = forwardRef(function Input({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  error = '',
  required = false,
  className = '',
   ...props
}, ref) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <input
       ref={ref}
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`px-3 py-2 rounded-lg border text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
          error
            ? 'border-red-400 bg-red-50 text-red-900 placeholder-red-300'
            : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400 hover:border-gray-400'
        }`}
        {...props}
      />

      {error && (
        <p className="text-xs text-red-500 mt-0.5">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;

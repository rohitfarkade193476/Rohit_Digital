import React from 'react';

/**
 * Input.jsx
 * Reusable input component — works in two modes:
 *
 * 1. Controlled (plain React state):
 *    <Input id="x" value={val} onChange={handler} error="..." />
 *
 * 2. React Hook Form (register spread):
 *    <Input id="x" {...register('fieldName')} error={errors.fieldName?.message} />
 *
 * Props:
 *  - id          : unique HTML id (required for label association)
 *  - label       : visible label text
 *  - type        : input type (default: 'text')
 *  - error       : error message string
 *  - required    : boolean — shows red asterisk on label (default: false)
 *  - className   : extra Tailwind classes on the wrapper div
 *  - ...rest     : any other props (value, onChange, onBlur, ref, name, etc.)
 *                  forwarded directly to <input> — supports RHF register()
 */
const Input = React.forwardRef(function Input(
  {
    id,
    label,
    type = 'text',
    error = '',
    required = false,
    className = '',
    ...rest
  },
  ref
) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <input
        ref={ref}
        id={id}
        type={type}
        {...rest}
        className={`px-3 py-2 rounded-lg border text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
          error
            ? 'border-red-400 bg-red-50 text-red-900 placeholder-red-300'
            : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400 hover:border-gray-400'
        }`}
      />

      {error && (
        <p className="text-xs text-red-500 mt-0.5">{error}</p>
      )}
    </div>
  );
});

export default Input;

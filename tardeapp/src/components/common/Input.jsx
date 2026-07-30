// =============================================================================
// INPUT — Reusable text input component
// Supports: label, helper text, error state, left/right adornments.
// =============================================================================

import { forwardRef } from 'react';

/**
 * Input component — accessible, with label, error, and adornment support.
 *
 * @param {Object} props
 * @param {string} props.id - Must be unique on page for label association
 * @param {string} [props.label]
 * @param {string} [props.helperText]
 * @param {string} [props.error]
 * @param {React.ReactNode} [props.leftAdornment]
 * @param {React.ReactNode} [props.rightAdornment]
 * @param {string} [props.className]
 * @param {React.InputHTMLAttributes} props - All native input props forwarded
 */
const Input = forwardRef(function Input(
  {
    id,
    label,
    helperText,
    error,
    leftAdornment,
    rightAdornment,
    className = '',
    ...rest
  },
  ref
) {
  const hasError = Boolean(error);

  return (
    <div className={`input-wrapper${hasError ? ' input-wrapper--error' : ''} ${className}`}>
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
        </label>
      )}

      <div className="input-field-wrapper">
        {leftAdornment && (
          <span className="input-adornment input-adornment--left" aria-hidden="true">
            {leftAdornment}
          </span>
        )}

        <input
          ref={ref}
          id={id}
          className="input-field"
          aria-invalid={hasError}
          aria-describedby={
            hasError ? `${id}-error` : helperText ? `${id}-helper` : undefined
          }
          data-testid={rest['data-testid'] ?? `input-${id}`}
          {...rest}
        />

        {rightAdornment && (
          <span className="input-adornment input-adornment--right" aria-hidden="true">
            {rightAdornment}
          </span>
        )}
      </div>

      {hasError && (
        <p id={`${id}-error`} className="input-error" role="alert">
          {error}
        </p>
      )}
      {!hasError && helperText && (
        <p id={`${id}-helper`} className="input-helper">
          {helperText}
        </p>
      )}
    </div>
  );
});

export default Input;

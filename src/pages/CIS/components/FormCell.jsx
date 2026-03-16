// src/components/FormCell.jsx
import React from "react";

function FormCell({
  label,
  className = "",
  children,
  isRequired = false,
  isError = false,
  errorMessage = "",
}) {
  return (
    <div className={`form-cell ${className} ${isError ? "error" : ""}`}>
      {label && (
        <label className={isError ? "error-label" : ""}>
          {label}
          {isRequired && <span className="required">*</span>}
        </label>
      )}
      {children}
      {errorMessage && <span className="error-message">{errorMessage}</span>}
    </div>
  );
}

export default FormCell;

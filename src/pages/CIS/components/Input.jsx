// src/components/Input.jsx
import React from "react";

function Input({
  type = "text",
  placeholder = "",
  inputMode = "text",
  pattern = "",
  className = "",
  value,
  onChange,
}) {
  return (
    <input
      {...(value !== undefined && { value })}
      {...(onChange && { onChange })}
      type={type}
      placeholder={placeholder}
      className={className}
      inputMode={inputMode}
      pattern={pattern}
    />
  );
}

export default Input;

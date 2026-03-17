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
      type={type}
      placeholder={placeholder}
      className={className}
      inputMode={inputMode}
      pattern={pattern}
      value={value ?? ""}
      onChange={onChange || (() => {})}
    />
  );
}

export default Input;
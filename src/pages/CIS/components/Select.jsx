// src/components/Select.jsx
import React from "react";

function Select({ options = [], value, onChange, className = "" }) {
  return (
    <select value={value} onChange={onChange} className={className}>
      <option value="">Select</option>
      {options.map((opt, idx) => (
        <option key={idx} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

export default Select;

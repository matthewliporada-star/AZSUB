import React from "react";

function Textarea({ rows = 3, placeholder, value, onChange }) {
  return (
    <textarea 
      rows={rows} 
      placeholder={placeholder || ""}
      value={value || ""}
      onChange={onChange}
    />
  );
}

export default Textarea;
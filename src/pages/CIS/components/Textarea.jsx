import React from "react";

function Textarea({ rows = 3, placeholder }) {
  return <textarea rows={rows} placeholder={placeholder || ""}></textarea>;
}

export default Textarea;
// src/components/TableHeader.jsx
import React from "react";

function TableHeader({ spans = [] }) {
  return (
    <div className="table-header">
      {spans.map((span, i) => (
        <div key={i} className="table-cell">
          {span.text}
        </div>
      ))}
    </div>
  );
}

export default TableHeader;
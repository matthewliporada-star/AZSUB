import React from "react";

function TableRow({ children, cells = [], isEven = false }) {
  return (
    <div className={`table-row ${isEven ? "" : ""}`}>
      {cells.map((cell, idx) => (
        <div key={idx} className="table-cell" style={cell.style || {}}>
          {cell.content}
        </div>
      ))}
      {children}
    </div>
  );
}

export default TableRow;
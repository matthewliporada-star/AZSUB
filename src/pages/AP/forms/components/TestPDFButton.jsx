import React from "react";

const TestPDFButton = ({ onTest }) => (
  <button
    type="button"
    onClick={onTest}
    className="test-pdf-btn"
    style={{
      marginRight: "10px",
      backgroundColor: "#ffc107",
      color: "#000",
      padding: "10px 15px",
      border: "none",
      borderRadius: "8px",
      fontWeight: "600",
      cursor: "pointer",
    }}
    title="See PDF field names"
  >
    See PDF Fields
  </button>
);

export default TestPDFButton;

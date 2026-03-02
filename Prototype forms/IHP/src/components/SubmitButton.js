import React from "react";

const SubmitButton = () => (
  <button
    type="submit"
    className="btn-success"
    style={{
      padding: "12px 24px",
      backgroundColor: "#28a745",
      color: "white",
      border: "none",
      borderRadius: "8px",
      fontWeight: "600",
      cursor: "pointer",
    }}
  >
    Submit Application
  </button>
);

export default SubmitButton;

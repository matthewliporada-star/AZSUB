import React from "react";

const ResetButton = () => {
  const handleReset = () => {
    if (
      window.confirm(
        "Are you sure you want to reset the form? All data will be lost.",
      )
    ) {
      window.location.reload();
    }
  };

  return (
    <button
      type="button"
      className="btn-secondary"
      onClick={handleReset}
      style={{
        padding: "10px 20px",
        backgroundColor: "#6c757d",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
      }}
    >
      Reset Form
    </button>
  );
};

export default ResetButton;

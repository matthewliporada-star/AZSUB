import React, { useState } from "react";

const PDFButton = ({ onGenerate }) => {
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("Generate PDF");

  const handleClick = async () => {
    setLoading(true);
    setText("Generating...");

    try {
      await onGenerate();
      setText("PDF Generated!");
      setTimeout(() => {
        setText("Generate PDF");
        setLoading(false);
      }, 2000);
    } catch (error) {
      setText("Failed - Try Again");
      setTimeout(() => {
        setText("Generate PDF");
        setLoading(false);
      }, 3000);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="pdf-generate-btn"
      style={{
        marginRight: "10px",
        backgroundColor: "#003266",
        color: "white",
        padding: "12px 24px",
        border: "none",
        borderRadius: "8px",
        fontWeight: "600",
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.7 : 1,
      }}
    >
      {text}
    </button>
  );
};

export default PDFButton;

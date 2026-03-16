function Notice() {
  return (
    <div className="notice">
      <svg
        className="notice-icon"
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <span>
        Kindly ensure each section is fully completed.
        <span className="sep"> | </span>
        If not applicable, indicate <strong>N/A</strong>.
        <span className="sep"> | </span>
        Convert all monetary amounts to <strong>USD</strong>.
        <span className="sep"> | </span>
        Fields highlighted in <strong style={{ color: "red" }}>red</strong> require supporting documents.
      </span>
    </div>
  );
}

export default Notice;
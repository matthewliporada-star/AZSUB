import { useState, useEffect } from "react";

function Header() {
  const [date, setDate] = useState("");

  useEffect(() => {
    const d = new Date();
    setDate(
      d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    );
  }, []);

  return (
    <div className="header">
      <div className="header-accent"></div>
      <div className="header-inner">
        <div className="header-left">
          <div className="header-logo">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(184,146,42,0.9)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
              <line x1="9" y1="12" x2="15" y2="12" />
              <line x1="9" y1="16" x2="13" y2="16" />
            </svg>
          </div>
          <div className="header-title">
            <h1>Client Information Sheet</h1>
            <p className="header-subtitle">
              Secure Coverage Assessment · All information treated with strict
              confidentiality
            </p>
            <p>
              Complete every section fully for comprehensive insurance
              evaluation.
            </p>
          </div>
        </div>
        <div className="header-meta">
          <div className="header-badge insurance-badge">CIS Form</div>
          <div className="header-date">{date}</div>
        </div>
      </div>
    </div>
  );
}

export default Header;

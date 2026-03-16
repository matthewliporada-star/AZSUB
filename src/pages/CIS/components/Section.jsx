import React from "react";

function Section({
  number,
  title,
  description = "",
  children,
  isTable = false,
}) {
  return (
    <div className="section">
      <div className="section-header">
        <div className="section-num">{number}</div>
        <span className="section-title">{title}</span>
        {description && <p className="section-description">{description}</p>}
      </div>
      <div
        className={isTable ? "section-body section-body-table" : "section-body"}
      >
        {children}
      </div>
    </div>
  );
}

export default Section;

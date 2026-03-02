import React from "react";

const FormSection = ({ title, children }) => (
  <div className="inner-card">
    <h3 className="section-title">{title}</h3>
    {children}
  </div>
);

export default FormSection;

import React from "react";

const CurrentInsuranceSection = ({ data, onChange }) => (
  <>
    <h4 style={{ marginTop: "20px", color: "#003266" }}>
      Current Health Insurance
    </h4>
    <div className="form-grid">
      <FormInput
        label="Current insurance provider"
        value={data.provider}
        onChange={(v) => onChange("provider", v)}
      />
      <FormInput
        type="date"
        label="Policy Effective Date"
        value={data.effectiveDate}
        onChange={(v) => onChange("effectiveDate", v)}
      />
      <FormInput
        label="Policy Number"
        value={data.policyNumber}
        onChange={(v) => onChange("policyNumber", v)}
      />
    </div>
  </>
);

const FormInput = ({ label, type = "text", value, onChange }) => (
  <div className="form-group">
    <label>{label}</label>
    <input
      type={type}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export default CurrentInsuranceSection;

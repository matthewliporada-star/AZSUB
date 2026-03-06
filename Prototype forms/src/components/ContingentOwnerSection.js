import React from "react";

const ContingentOwnerSection = ({ data, onChange }) => (
  <>
    <h4 style={{ marginTop: "20px", color: "#003266" }}>
      Contingent Owner upon death of Applicant Owner
    </h4>
    <div className="form-grid">
      <FormInput
        label="Last Name"
        value={data.lastName}
        onChange={(v) => onChange("contingentOwner", "lastName", v)}
      />
      <FormInput
        label="First Name"
        value={data.firstName}
        onChange={(v) => onChange("contingentOwner", "firstName", v)}
      />
      <FormInput
        label="Middle Name"
        value={data.middleName}
        onChange={(v) => onChange("contingentOwner", "middleName", v)}
      />
      <FormInput
        label="Suffix"
        value={data.suffix}
        onChange={(v) => onChange("contingentOwner", "suffix", v)}
      />
    </div>
    <div className="form-grid">
      <FormInput
        type="date"
        label="Date of Birth"
        value={data.dob}
        onChange={(v) => onChange("contingentOwner", "dob", v)}
      />
      <FormInput
        label="Relationship to Proposed Insured"
        value={data.relationship}
        onChange={(v) => onChange("contingentOwner", "relationship", v)}
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

export default ContingentOwnerSection;

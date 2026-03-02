import React from "react";

const ContactSection = ({ data, onChange }) => (
  <>
    <h4 style={{ marginTop: "20px", color: "#395998" }}>Contact Information</h4>
    <div className="form-grid">
      <FormInput
        label="Primary Contact No."
        required
        value={data.primaryContact}
        onChange={(v) => onChange("contactInformation", "primaryContact", v)}
      />
      <FormInput
        label="Secondary Contact No."
        value={data.secondaryContact}
        onChange={(v) => onChange("contactInformation", "secondaryContact", v)}
      />
      <FormInput
        type="email"
        label="Email"
        required
        value={data.email}
        onChange={(v) => onChange("contactInformation", "email", v)}
      />
    </div>
  </>
);

const FormInput = ({ label, type = "text", required, value, onChange }) => (
  <div className="form-group">
    <label>
      {label}
      {required && <span className="required">*</span>}
    </label>
    <input
      type={type}
      required={required}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export default ContactSection;

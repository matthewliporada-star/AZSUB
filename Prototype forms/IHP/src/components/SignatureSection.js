import React from "react";

const SignatureSection = ({ data, onChange, onNestedChange }) => {
  // Format the full name of the applicant owner in ALL CAPS (for display purposes only)
  const getApplicantFullName = () => {
    const { lastName, firstName, middleName, suffix } = data;
    const middleInitial = middleName ? ` ${middleName.charAt(0)}.` : "";
    const suffixValue = suffix ? ` ${suffix}` : "";

    return `${firstName || ""}${middleInitial} ${lastName || ""}${suffixValue}`
      .trim()
      .toUpperCase();
  };

  return (
    <>
      {/* Material Fact Disclosure from PDF */}
      <div
        style={{
          backgroundColor: "#fff3cd",
          border: "1px solid #ffeeba",
          padding: "15px",
          marginBottom: "25px",
          borderRadius: "5px",
          color: "#856404",
        }}
      >
        <p style={{ margin: 0, fontSize: "14px", lineHeight: "1.5" }}>
          <strong>IMPORTANT:</strong> If a material fact is not disclosed in
          this application, any policy issued may not be valid. This includes
          information that you may have provided to the financial advisor but
          was not included in the application. If in doubt as to whether a fact
          is material, you are advised to disclose it. Please check to ensure
          you are fully satisfied with the information declared in this
          application.
        </p>
      </div>

      {/* Financial Advisor Section */}
      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: "5px",
          padding: "20px",
          marginBottom: "25px",
          backgroundColor: "#f0f7ff",
        }}
      >
        <h4 style={{ color: "#395998", marginBottom: "20px" }}>
          Financial Advisor Declaration
        </h4>

        <div style={{ marginBottom: "15px" }}>
          <FormInput
            label="Signature over Printed Name of Financial Advisor"
            required
            value={data.financialAdvisor?.signature}
            onChange={(v) => onNestedChange("financialAdvisor", "signature", v)}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <FormInput
            label="Code"
            required
            value={data.financialAdvisor?.code}
            onChange={(v) => onNestedChange("financialAdvisor", "code", v)}
            placeholder="Enter advisor code"
          />
        </div>
      </div>

      {/* Applicant Owner Signature Section - Now with fillable input */}
      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: "5px",
          padding: "20px",
          marginBottom: "25px",
          backgroundColor: "#ffffff",
        }}
      >
        <h4 style={{ color: "#003266", marginBottom: "20px" }}>
          Applicant Owner Declaration and Signature
        </h4>

        <p
          style={{
            marginBottom: "20px",
            fontSize: "14px",
            fontStyle: "italic",
          }}
        >
          I certify that I have truly and accurately recorded all information,
          have seen the original proofs of identification and affirm that the
          photocopies attached to the application are faithful reproductions of
          the originals, and have issued and given Applicant Owner a Provisional
          Receipt for the amount of payment that accompanies the application.
        </p>

        <p
          style={{
            marginBottom: "20px",
            fontSize: "14px",
            fontStyle: "italic",
          }}
        >
          I have personally presented and explained the product and its
          benefits, have verified the identity of the Proposed Insured and/or
          Applicant Owner against the identification documents presented, have
          interviewed them before the application is submitted and have
          personally witnessed the Proposed Insured and/or Applicant Owner and
          Dependent signing the application.
        </p>

        <div className="form-grid">
          <FormInput
            label="Signature over Printed Name of Applicant Owner"
            required
            value={data.applicantSignature}
            onChange={(v) => onChange("applicantSignature", v)}
            placeholder="Enter signature over printed name"
            // Removed readOnly prop to make it fillable
          />
          <FormInput
            type="date"
            label="Date"
            required
            value={data.applicantDate}
            onChange={(v) => onChange("applicantDate", v)}
          />
        </div>

        {/* Optional: Display the formatted name as a reference */}
        <div style={{ marginTop: "10px", fontSize: "12px", color: "#666" }}>
          <em>Applicant name from form: {getApplicantFullName()}</em>
        </div>
      </div>

      {/* Proposed Insured Signature Section */}
      {data.proposedInsured?.sameAsApplicant === false && (
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "5px",
            padding: "20px",
            marginBottom: "25px",
            backgroundColor: "#ffffff",
          }}
        >
          <h4 style={{ color: "#003266", marginBottom: "20px" }}>
            Proposed Insured Declaration and Signature
          </h4>

          <p
            style={{
              marginBottom: "10px",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            if other than Proposed Insured
          </p>

          <div className="form-grid">
            <FormInput
              label="Signature over Printed Name of Proposed Insured"
              required
              value={data.proposedInsured?.signature}
              onChange={(v) =>
                onNestedChange("proposedInsured", "signature", v)
              }
              placeholder="Enter signature over printed name"
            />
            <FormInput
              type="date"
              label="Date"
              required
              value={data.proposedInsured?.signatureDate}
              onChange={(v) =>
                onNestedChange("proposedInsured", "signatureDate", v)
              }
            />
          </div>

          {/* Optional: Display the formatted name as a reference */}
          <div style={{ marginTop: "10px", fontSize: "12px", color: "#666" }}>
            <em>
              Proposed insured name from form:{" "}
              {getProposedInsuredFullName(data)}
            </em>
          </div>
        </div>
      )}
    </>
  );
};

// Helper function to get Proposed Insured full name in ALL CAPS
const getProposedInsuredFullName = (data) => {
  const { lastName, firstName, middleName, suffix } =
    data.proposedInsured || {};
  const middleInitial = middleName ? ` ${middleName.charAt(0)}.` : "";
  const suffixValue = suffix ? ` ${suffix}` : "";

  return `${firstName || ""}${middleInitial} ${lastName || ""}${suffixValue}`
    .trim()
    .toUpperCase();
};

const FormInput = ({
  label,
  type = "text",
  required,
  value,
  onChange,
  placeholder,
  readOnly = false,
}) => (
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
      placeholder={placeholder || ""}
      readOnly={readOnly}
      style={readOnly ? { backgroundColor: "#f5f5f5", cursor: "default" } : {}}
    />
  </div>
);

export default SignatureSection;

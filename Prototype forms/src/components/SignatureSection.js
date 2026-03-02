import React from "react";

const SignatureSection = ({ data, onChange, onNestedChange }) => (
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
        <strong>IMPORTANT:</strong> If a material fact is not disclosed in this
        application, any policy issued may not be valid. This includes
        information that you may have provided to the financial advisor but was
        not included in the application. If in doubt as to whether a fact is
        material, you are advised to disclose it. Please check to ensure you are
        fully satisfied with the information declared in this application.
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

      <div>
        <FormInput
          label="Signed in the Philippines on Date (mm/dd/yyyy)"
          type="date"
          required
          value={data.financialAdvisor?.signedDate}
          onChange={(v) => onNestedChange("financialAdvisor", "signedDate", v)}
        />
      </div>
    </div>

    {/* Applicant Owner Signature Section */}
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: "5px",
        padding: "20px",
        marginBottom: "25px",
        backgroundColor: "#ffffff",
      }}
    >
      <h4 style={{ color: "#395998", marginBottom: "20px" }}>
        Applicant Owner Declaration and Signature
      </h4>

      <p
        style={{ marginBottom: "20px", fontSize: "14px", fontStyle: "italic" }}
      >
        I certify that I have truly and accurately recorded all information,
        have seen the original proofs of identification and affirm that the
        photocopies attached to the application are faithful reproductions of
        the originals, and have issued and given Applicant Owner a Provisional
        Receipt for the amount of payment that accompanies the application.
      </p>

      <p
        style={{ marginBottom: "20px", fontSize: "14px", fontStyle: "italic" }}
      >
        I have personally presented and explained the product and its benefits,
        have verified the identity of the Proposed Insured and/or Applicant
        Owner against the identification documents presented, have interviewed
        them before the application is submitted and have personally witnessed
        the Proposed Insured and/or Applicant Owner and Dependent signing the
        application.
      </p>

      <div className="form-grid">
        <FormInput
          label="Signature over Printed Name of Applicant Owner"
          required
          value={data.applicantSignature}
          onChange={(v) => onChange("applicantSignature", v)}
        />
        <FormInput
          type="date"
          label="Date"
          required
          value={data.applicantDate}
          onChange={(v) => onChange("applicantDate", v)}
        />
      </div>
    </div>

    {/* Proposed Insured Signature Section - Only if different from Applicant Owner */}
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
        <h4 style={{ color: "#395998", marginBottom: "20px" }}>
          Proposed Insured Declaration and Signature
        </h4>

        <p
          style={{ marginBottom: "10px", fontSize: "14px", fontWeight: "bold" }}
        >
          if other than Proposed Insured
        </p>

        <div className="form-grid">
          <FormInput
            label="Signature over Printed Name of Proposed Insured"
            required
            value={data.proposedInsured?.signature}
            onChange={(v) => onNestedChange("proposedInsured", "signature", v)}
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
      </div>
    )}

    {/* Authorized Representative Section */}
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: "5px",
        padding: "20px",
        marginBottom: "25px",
        backgroundColor: "#ffffff",
      }}
    >
      <h4 style={{ color: "#395998", marginBottom: "15px" }}>
        Authorized Representative (Optional)
      </h4>
      <p style={{ marginBottom: "20px", fontSize: "14px" }}>
        <strong>TO: ALLIANZ PNB LIFE INSURANCE, INC.</strong> - This is to
        authorize the following to receive my Policy Contract on my behalf:
      </p>

      <div className="form-grid">
        <FormInput
          label="Complete Name of Authorized Representative"
          value={data.authorizedRepresentative?.name}
          onChange={(v) =>
            onNestedChange("authorizedRepresentative", "name", v)
          }
        />
        <FormInput
          label="Relationship to Policy Owner"
          value={data.authorizedRepresentative?.relationship}
          onChange={(v) =>
            onNestedChange("authorizedRepresentative", "relationship", v)
          }
        />
      </div>

      <div className="form-grid">
        <FormInput
          label="Signature over Printed Name"
          value={data.authorizedRepresentative?.signature}
          onChange={(v) =>
            onNestedChange("authorizedRepresentative", "signature", v)
          }
        />
        <FormInput
          type="date"
          label="Date"
          value={data.authorizedRepresentative?.date}
          onChange={(v) =>
            onNestedChange("authorizedRepresentative", "date", v)
          }
        />
      </div>
    </div>

    <PolicyReceiptSection data={data.policyReceipt} onChange={onNestedChange} />
  </>
);

const PolicyReceiptSection = ({ data, onChange }) => (
  <div
    style={{
      border: "1px solid #e5e7eb",
      borderRadius: "5px",
      padding: "20px",
      backgroundColor: "#f8fafc",
      marginBottom: "20px",
    }}
  >
    <h4 style={{ color: "#395998", marginBottom: "15px" }}>
      IF TO BE RECEIVED BY AUTHORIZED REPRESENTATIVE
    </h4>
    <div
      style={{
        backgroundColor: "#e6f3ff",
        padding: "15px",
        borderRadius: "5px",
        marginBottom: "20px",
      }}
    >
      <p style={{ margin: 0, fontSize: "14px", lineHeight: "1.5" }}>
        I acknowledge receipt of Policy No. _______________ I declare that I am
        authorized to receive this policy contract for the address/policy owner,
        and undertake to immediately endorse the said policy contract to the
        addressee/policy owner as soon as possible.
      </p>
    </div>

    <div className="form-grid">
      <FormInput
        label="Policy No."
        value={data?.policyNo}
        onChange={(v) => onChange("policyReceipt", "policyNo", v)}
        placeholder="Enter policy number"
      />
      <FormInput
        label="Signature over Printed Name"
        value={data?.signature}
        onChange={(v) => onChange("policyReceipt", "signature", v)}
      />
    </div>

    <div className="form-grid">
      <FormInput
        type="date"
        label="Date"
        value={data?.date}
        onChange={(v) => onChange("policyReceipt", "date", v)}
      />
      <FormInput
        type="time"
        label="Time Received"
        value={data?.time}
        onChange={(v) => onChange("policyReceipt", "time", v)}
      />
    </div>
  </div>
);

const FormInput = ({
  label,
  type = "text",
  required,
  value,
  onChange,
  placeholder,
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
    />
  </div>
);

export default SignatureSection;

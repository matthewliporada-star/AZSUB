import React from "react";

const AuthorizationSection = ({ data, onChange }) => (
  <>
    {/* Information Sharing Authorization */}
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
        Authorization and Consent
      </h4>

      <ol
        style={{ marginBottom: "20px", paddingLeft: "20px", lineHeight: "1.6" }}
      >
        <li>
          Any physician, clinic, insurance company or other insurance industry
          association, institution or person that has any record of me and/or
          the proposed insured named in this application, may release or give to
          Allianz PNB Life Insurance, Inc. or its authorized representative, any
          and all information about me and/or the proposed insured named in this
          application;
        </li>
        <li>
          I, may be subjected to HIV testing for the purpose of underwriting
          this application or the coverage related to the insurance policy, if
          issued;
        </li>
        <li>
          A personal investigation on me may be conducted by a duly authorized
          investigation agency which will provide any applicable information
          concerning my character, general reputation, personal characteristic,
          mode of living, health and financial status through personal
          interviews with friends, neighbours and associates.
        </li>
        <li>
          Any information collected and held by Allianz PNB Life Insurance, Inc.
          may be released and/or disclosed to its affiliated companies and
          agents, other insurance companies and their affiliates and any medical
          information sharing facility of the insurance industry for any
          legitimate purpose, including but not limited to underwriting and
          administration of insurance coverage and claims;
        </li>
        <li>
          A photocopy (or similar copy) of this authorization shall be valid as
          the original. This authorization is in connection with my application
          for insurance only.
        </li>
      </ol>

      <div
        style={{ marginTop: "20px", textAlign: "right", fontStyle: "italic" }}
      >
        <p>TO: ALLIANZ PNB LIFE INSURANCE, INC.</p>
      </div>
    </div>

    {/* Authorized Representative Section - Moved from SignatureSection */}
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
        Authorized Representative
      </h4>
      <p style={{ marginBottom: "20px", fontSize: "14px" }}>
        <strong>TO: ALLIANZ PNB LIFE INSURANCE, INC.</strong> - This is to
        authorize the following to receive my Policy Contract on my behalf:
      </p>

      <div className="form-grid">
        <FormInput
          label="Complete Name of Authorized Representative:"
          subtitle="Last Name, First Name Middle Name"
          value={data.authorizedRepresentative?.name}
          onChange={(v) => onChange("authorizedRepresentative", "name", v)}
        />
        <FormInput
          label="Relationship to Policy Owner"
          value={data.authorizedRepresentative?.relationship}
          onChange={(v) =>
            onChange("authorizedRepresentative", "relationship", v)
          }
        />
      </div>

      <div className="form-grid">
        <FormInput
          label="Signature over Printed Name"
          value={data.authorizedRepresentative?.signature}
          onChange={(v) => onChange("authorizedRepresentative", "signature", v)}
        />
        <FormInput
          type="date"
          label="Date"
          value={data.authorizedRepresentative?.date}
          onChange={(v) => onChange("authorizedRepresentative", "date", v)}
        />
      </div>

      <div
        style={{
          marginTop: "15px",
          padding: "10px",
          backgroundColor: "#f8f9fa",
          borderRadius: "5px",
          fontSize: "13px",
          color: "#666",
        }}
      >
        <p style={{ margin: 0 }}>
          <strong>Note:</strong> Authorized representative should present a
          valid ID to the courier before receiving the policy contract.
        </p>
      </div>
    </div>

    {/* Policy Receipt Section - Moved from SignatureSection */}
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
          I acknowledge receipt of Policy No. _______________ I declare that I
          am authorized to receive this policy contract for the address/policy
          owner, and undertake to immediately endorse the said policy contract
          to the addressee/policy owner as soon as possible.
        </p>
      </div>

      <div className="form-grid">
        <FormInput
          label="Policy No."
          value={data.policyReceipt?.policyNo}
          onChange={(v) => onChange("policyReceipt", "policyNo", v)}
          placeholder="Enter policy number"
        />
        <FormInput
          label="Signature over Printed Name"
          value={data.policyReceipt?.signature}
          onChange={(v) => onChange("policyReceipt", "signature", v)}
        />
      </div>

      <div className="form-grid">
        <FormInput
          type="date"
          label="Date"
          value={data.policyReceipt?.date}
          onChange={(v) => onChange("policyReceipt", "date", v)}
        />
        <FormInput
          type="time"
          label="Time Received"
          value={data.policyReceipt?.time}
          onChange={(v) => onChange("policyReceipt", "time", v)}
        />
      </div>
    </div>
  </>
);

const FormInput = ({
  label,
  subtitle,
  type = "text",
  value,
  onChange,
  placeholder,
}) => (
  <div className="form-group">
    <label>
      {label}
      {subtitle && (
        <span style={{ fontSize: "12px", color: "#666", display: "block" }}>
          {subtitle}
        </span>
      )}
    </label>
    <input
      type={type}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || ""}
    />
  </div>
);

export default AuthorizationSection;

import React from "react";

const AuthorizationSection = ({ data, onChange }) => {
  const handleChange = (field, value) => {
    onChange("attestation", field, value);
  };

  const handleRemoteChange = (field, value) => {
    onChange("remoteCommunication", field, value);
  };

  // Helper function to format date for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    } catch {
      return dateString;
    }
  };

  return (
    <>
      {/* Information Sharing Authorization */}
      <InfoSharingBox />

      {/* Authorized Representative Section */}
      <AuthorizedRepSection
        repData={data.authorizedRepresentative}
        onChange={onChange}
      />

      {/* Policy Receipt Section */}
      <PolicyReceiptSection
        receiptData={data.policyReceipt}
        onChange={onChange}
      />

      {/* INTERMEDIARY ATTESTATION */}
      <AttestationBox title="ATTESTATION OF THE INTERMEDIARY">
        <p
          style={{
            fontStyle: "italic",
            marginBottom: "20px",
            lineHeight: "1.6",
          }}
        >
          "I certify that I have truly and accurately recorded all information,
          have seen the original proofs of identification and affirm that the
          photocopies attached to the application are faithful reproductions of
          the originals, and have issued and given Applicant Owner a Provisional
          Receipt for the amount of payment that accompanies the application."
        </p>

        <p
          style={{
            fontStyle: "italic",
            marginBottom: "25px",
            lineHeight: "1.6",
          }}
        >
          "I have personally presented and explained the product and its
          benefits, have verified the identity of the Proposed Insured and/or
          Applicant Owner against the identification documents presented, have
          interviewed them before the application is submitted and have
          personally witnessed the Proposed Insured and/or Applicant Owner and
          Dependent signing the application."
        </p>

        <div className="form-grid">
          <FormInput
            label="Name of Intermediary"
            value={data.attestation?.intermediaryName || ""}
            onChange={(v) => handleChange("intermediaryName", v)}
            placeholder="Full name of intermediary"
          />
          <FormInput
            type="date"
            label="Date"
            value={data.attestation?.intermediaryDate || ""}
            onChange={(v) => handleChange("intermediaryDate", v)}
          />
        </div>

        {/* REMOTE COMMUNICATION FOR INTERMEDIARY - HIWA-HIWALAY SA UI, IISA SA PDF */}
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            backgroundColor: "#f8f9fa",
            borderRadius: "5px",
            border: "1px solid #e5e7eb",
          }}
        >
          <h6 style={{ color: "#395998", marginTop: 0, marginBottom: "10px" }}>
            Remote Communication (Intermediary)
          </h6>

          <div className="form-grid">
            <FormInput
              type="date"
              label="Date of Remote Communication"
              value={data.remoteCommunication?.intermediaryDate || ""}
              onChange={(v) => handleRemoteChange("intermediaryDate", v)}
            />
            <FormInput
              label="Mode of Remote Communication"
              value={data.remoteCommunication?.intermediaryMode || ""}
              onChange={(v) => handleRemoteChange("intermediaryMode", v)}
              placeholder="e.g., Video Call, Phone Call, Email"
            />
          </div>

          {/* Preview kung ano ang mapupunta sa PDF */}
          <div
            style={{
              marginTop: "10px",
              padding: "8px",
              backgroundColor: "#e8f4fd",
              borderRadius: "4px",
            }}
          >
            <small style={{ color: "#003266", fontWeight: "bold" }}>
              PDF Preview (rc1):{" "}
            </small>
            <small style={{ color: "#003266" }}>
              {data.remoteCommunication?.intermediaryDate ||
              data.remoteCommunication?.intermediaryMode
                ? `${formatDateForDisplay(data.remoteCommunication?.intermediaryDate || "")} ${data.remoteCommunication?.intermediaryMode ? `- ${data.remoteCommunication?.intermediaryMode}` : ""}`.trim()
                : "—"}
            </small>
          </div>
        </div>

        {/* Name of Client */}
        <div style={{ marginTop: "20px" }}>
          <FormInput
            label="Name of Client (Applicant Owner)"
            value={data.attestation?.clientName || ""}
            onChange={(v) => handleChange("clientName", v)}
            placeholder="Full name of applicant"
          />
        </div>
      </AttestationBox>

      {/* CLIENT ATTESTATION */}
      <AttestationBox title="ATTESTATION OF THE CLIENT">
        {/* REMOTE COMMUNICATION FOR CLIENT - HIWA-HIWALAY SA UI, IISA SA PDF */}
        <div
          style={{
            marginBottom: "20px",
            padding: "15px",
            backgroundColor: "#f8f9fa",
            borderRadius: "5px",
            border: "1px solid #e5e7eb",
          }}
        >
          <h6 style={{ color: "#395998", marginTop: 0, marginBottom: "10px" }}>
            Remote Communication (Client)
          </h6>

          <div className="form-grid">
            <FormInput
              label="Application No."
              value={data.remoteCommunication?.applicationNo || ""}
              onChange={(v) => handleRemoteChange("applicationNo", v)}
              placeholder="Application number"
            />
            <FormInput
              label="Name of Product (Plan)"
              value={data.remoteCommunication?.productName || ""}
              onChange={(v) => handleRemoteChange("productName", v)}
              placeholder="Product/Plan name"
            />
          </div>

          <div className="form-grid">
            <FormInput
              type="date"
              label="Date of Remote Communication"
              value={data.remoteCommunication?.date || ""}
              onChange={(v) => handleRemoteChange("date", v)}
            />
            <FormInput
              label="Mode of Remote Communication"
              value={data.remoteCommunication?.mode || ""}
              onChange={(v) => handleRemoteChange("mode", v)}
              placeholder="e.g., Video Call, Phone Call, Email"
            />
          </div>

          {/* Preview kung ano ang mapupunta sa PDF */}
          <div
            style={{
              marginTop: "10px",
              padding: "8px",
              backgroundColor: "#e8f4fd",
              borderRadius: "4px",
            }}
          >
            <small style={{ color: "#003266", fontWeight: "bold" }}>
              PDF Preview (rc2):{" "}
            </small>
            <small style={{ color: "#003266" }}>
              {data.remoteCommunication?.date || data.remoteCommunication?.mode
                ? `${formatDateForDisplay(data.remoteCommunication?.date || "")} ${data.remoteCommunication?.mode ? `- ${data.remoteCommunication?.mode}` : ""}`.trim()
                : "—"}
            </small>
          </div>
        </div>

        {/* Client Signature Section */}
        <ClientSignatureSection
          clientName={data.attestation?.clientName}
          clientDate={data.attestation?.clientDate}
          onClientChange={handleChange}
          intermediaryName={data.attestation?.intermediaryName}
        />
      </AttestationBox>
    </>
  );
};

// ========== SUB-COMPONENTS ==========

const InfoSharingBox = () => (
  <div
    style={{
      border: "1px solid #e5e7eb",
      borderRadius: "5px",
      padding: "20px",
      marginBottom: "25px",
      backgroundColor: "#ffffff",
    }}
  >
    <h4 style={{ color: "#003266", marginBottom: "15px" }}>
      Authorization and Consent
    </h4>

    <ol
      style={{ marginBottom: "20px", paddingLeft: "20px", lineHeight: "1.6" }}
    >
      <li>
        Any physician, clinic, insurance company or other insurance industry
        association, institution or person that has any record of me and/or the
        proposed insured named in this application, may release or give to
        Allianz PNB Life Insurance, Inc. or its authorized representative, any
        and all information about me and/or the proposed insured named in this
        application;
      </li>
      <li>
        I, may be subjected to HIV testing for the purpose of underwriting this
        application or the coverage related to the insurance policy, if issued;
      </li>
      <li>
        A personal investigation on me may be conducted by a duly authorized
        investigation agency which will provide any applicable information
        concerning my character, general reputation, personal characteristic,
        mode of living, health and financial status through personal interviews
        with friends, neighbours and associates.
      </li>
      <li>
        Any information collected and held by Allianz PNB Life Insurance, Inc.
        may be released and/or disclosed to its affiliated companies and agents,
        other insurance companies and their affiliates and any medical
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

    <div style={{ marginTop: "20px", textAlign: "right", fontStyle: "italic" }}>
      <p>TO: ALLIANZ PNB LIFE INSURANCE, INC.</p>
    </div>
  </div>
);

const AttestationBox = ({ title, children }) => (
  <div
    style={{
      marginBottom: "30px",
      padding: "20px",
      backgroundColor: "#ffffff",
      borderRadius: "8px",
      border: "1px solid #e5e7eb",
    }}
  >
    <h5
      style={{
        color: "#003266",
        marginTop: 0,
        marginBottom: "15px",
        fontSize: "16px",
        borderBottom: "2px solid #003266",
        paddingBottom: "10px",
      }}
    >
      {title}
    </h5>
    {children}
  </div>
);

const ClientSignatureSection = ({
  clientName,
  clientDate,
  onClientChange,
  intermediaryName,
}) => (
  <div
    style={{
      marginTop: "20px",
      padding: "20px",
      border: "1px solid #e5e7eb",
      borderRadius: "5px",
      backgroundColor: "#f8f9fa",
    }}
  >
    <p style={{ fontWeight: "bold", marginBottom: "15px" }}>
      I have discussed with <u>{intermediaryName || "_________________"}</u>{" "}
      (Intermediary) through remote means of communication and attest and
      certify the following:
    </p>
    <ol
      style={{ marginBottom: "20px", paddingLeft: "20px", lineHeight: "1.8" }}
    >
      <li>
        That I intend to secure an insurance policy through the Intermediary who
        explained the features of the product and its benefits, illustrations,
        of the Plan including applicable riders to me.
      </li>
      <li>
        That the details/declarations stated in the filled out Application Form
        are correct and based on the information and/or authentic documents
        provided by me. I personally filled out the application form and/or
        authorized the Intermediary to fill out the details of the Application
        Form on my behalf.
      </li>
      <li>
        That I am currently in the Philippines and agree to be bound by the
        declarations in the said Application Form.
      </li>
      <li>
        That I understand that the integrity and security of this email cannot
        be guaranteed over the internet, and that I will send email
        communications only to the correct official email address of my
        Intermediary.
      </li>
    </ol>

    <div className="form-grid">
      <FormInput
        label="Name of Applicant Owner"
        value={clientName || ""}
        onChange={(v) => onClientChange("clientName", v)}
        placeholder="Full name of applicant"
      />
      <FormInput
        type="date"
        label="Date"
        value={clientDate || ""}
        onChange={(v) => onClientChange("clientDate", v)}
      />
    </div>
  </div>
);

const AuthorizedRepSection = ({ repData, onChange }) => (
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
        value={repData?.name}
        onChange={(v) => onChange("authorizedRepresentative", "name", v)}
      />
      <FormInput
        label="Relationship to Policy Owner"
        value={repData?.relationship}
        onChange={(v) =>
          onChange("authorizedRepresentative", "relationship", v)
        }
      />
    </div>

    <div className="form-grid">
      <FormInput
        label="Signature over Printed Name"
        value={repData?.signature}
        onChange={(v) => onChange("authorizedRepresentative", "signature", v)}
      />
      <FormInput
        type="date"
        label="Date"
        value={repData?.date}
        onChange={(v) => onChange("authorizedRepresentative", "date", v)}
      />
    </div>

    <Note text="Authorized representative should present a valid ID to the courier before receiving the policy contract." />
  </div>
);

const PolicyReceiptSection = ({ receiptData, onChange }) => (
  <div
    style={{
      border: "1px solid #e5e7eb",
      borderRadius: "5px",
      padding: "20px",
      backgroundColor: "#ffffff",
      marginBottom: "25px",
    }}
  >
    <h4 style={{ color: "#395998", marginBottom: "15px" }}>
      IF TO BE RECEIVED BY AUTHORIZED REPRESENTATIVE
    </h4>

    <Notice message="I acknowledge receipt of Policy No. _______________ I declare that I am authorized to receive this policy contract for the address/policy owner, and undertake to immediately endorse the said policy contract to the addressee/policy owner as soon as possible." />

    <div className="form-grid">
      <FormInput
        label="Policy No."
        value={receiptData?.policyNo}
        onChange={(v) => onChange("policyReceipt", "policyNo", v)}
        placeholder="Enter policy number"
      />
      <FormInput
        label="Signature over Printed Name"
        value={receiptData?.signature}
        onChange={(v) => onChange("policyReceipt", "signature", v)}
      />
    </div>

    <div className="form-grid">
      <FormInput
        type="date"
        label="Date"
        value={receiptData?.date}
        onChange={(v) => onChange("policyReceipt", "date", v)}
      />
      <FormInput
        type="time"
        label="Time Received"
        value={receiptData?.time}
        onChange={(v) => onChange("policyReceipt", "time", v)}
      />
    </div>
  </div>
);

// ========== HELPER COMPONENTS ==========

const FormInput = ({
  label,
  subtitle,
  type = "text",
  value,
  onChange,
  placeholder,
  readOnly = false,
  note,
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
      readOnly={readOnly}
      style={
        readOnly ? { backgroundColor: "#f0f0f0", cursor: "not-allowed" } : {}
      }
    />
    {note && (
      <small
        style={{
          color: "#666",
          fontSize: "11px",
          display: "block",
          marginTop: "4px",
        }}
      >
        {note}
      </small>
    )}
  </div>
);

const Note = ({ text }) => (
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
      <strong>Note:</strong> {text}
    </p>
  </div>
);

const Notice = ({ message }) => (
  <div
    style={{
      backgroundColor: "#f8f9fa",
      padding: "15px",
      borderRadius: "5px",
      marginBottom: "20px",
      border: "1px solid #e5e7eb",
    }}
  >
    <p style={{ margin: 0, fontSize: "14px", lineHeight: "1.5" }}>{message}</p>
  </div>
);

export default AuthorizationSection;

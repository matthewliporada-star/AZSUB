import React from "react";

const PlanInfoSection = ({ data, onChange }) => {
  const handleChange = (field, value) => {
    onChange((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <div className="form-grid">
        <FormInput label="Base Plan" value="Alianz Well" readOnly disabled />
        <FormInput
          label="Amount Insured"
          value="100,000,000"
          readOnly
          disabled
        />
        <FormInput
          label="Amount of Payment Deposit"
          value={data.amountOfPaymentDeposit}
          onChange={(v) => handleChange("amountOfPaymentDeposit", v)}
        />
      </div>

      <div className="form-grid">
        <FormSelect
          label="Deductible"
          value={data.deductible}
          onChange={(v) => handleChange("deductible", v)}
          options={[
            { value: "", label: "Select Deductible" },
            { value: "None", label: "None" },
            { value: "50000", label: "₱50,000.00" },
          ]}
        />
        <FormInput
          label="Co Payment"
          value={data.coPayment}
          onChange={(v) => handleChange("coPayment", v)}
        />
        <FormInput
          label="Commencement of Cover Note"
          type="date"
          value={data.commencementOfCoverNote}
          onChange={(v) => handleChange("commencementOfCoverNote", v)}
        />
      </div>

      <FormSelect
        label="Area of Cover"
        value={data.areaOfCover}
        onChange={(v) => handleChange("areaOfCover", v)}
        options={[
          { value: "", label: "Select Area of Cover" },
          { value: "Worldwide", label: "Worldwide" },
          {
            value: "Worldwide excluding USA",
            label: "Worldwide excluding USA",
          },
        ]}
      />

      <h4 style={{ marginTop: "20px", color: "#003266" }}>Payment Details</h4>
      <div className="form-grid">
        <FormSelect
          label="Mode of Payment"
          value={data.modeOfPayment}
          onChange={(v) => handleChange("modeOfPayment", v)}
          options={[
            { value: "", label: "Select Mode" },
            { value: "Monthly", label: "Monthly" },
            { value: "Quarterly", label: "Quarterly" },
            { value: "SemiAnnual", label: "Semi Annual" },
            { value: "Annual", label: "Annual" },
          ]}
        />
        <FormSelect
          label="Payment Scheme"
          value={data.paymentScheme}
          onChange={(v) => handleChange("paymentScheme", v)}
          options={[
            { value: "", label: "Select Scheme" },
            { value: "Cash/Check", label: "Cash/Check" },
            { value: "Credit Card", label: "Credit Card" },
            { value: "Debit Card", label: "Debit Card" },
            { value: "Auto Debit", label: "Auto Debit" },
          ]}
        />
      </div>
    </>
  );
};

const FormInput = ({
  label,
  type = "text",
  value,
  onChange,
  readOnly,
  disabled,
}) => (
  <div className="form-group">
    <label>{label}</label>
    <input
      type={type}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      readOnly={readOnly}
      disabled={disabled}
      style={
        readOnly || disabled
          ? { backgroundColor: "#f5f5f5", cursor: "not-allowed" }
          : {}
      }
    />
  </div>
);

const FormSelect = ({ label, value, onChange, options }) => (
  <div className="form-group">
    <label>{label}</label>
    <select value={value || ""} onChange={(e) => onChange(e.target.value)}>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

export default PlanInfoSection;

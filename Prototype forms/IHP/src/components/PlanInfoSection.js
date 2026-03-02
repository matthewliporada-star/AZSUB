import React from "react";

const PlanInfoSection = ({ data, onChange }) => {
  const handleChange = (field, value) => {
    onChange((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <div className="form-grid">
        <FormInput
          label="Base Plan"
          value={data.basePlan}
          onChange={(v) => handleChange("basePlan", v)}
        />
        <FormInput
          label="Amount Insured"
          value={data.amountInsured}
          onChange={(v) => handleChange("amountInsured", v)}
        />
        <FormInput
          label="Amount of Payment Deposit"
          value={data.amountOfPaymentDeposit}
          onChange={(v) => handleChange("amountOfPaymentDeposit", v)}
        />
      </div>

      <div className="form-grid">
        <FormInput
          label="Deductible"
          value={data.deductible}
          onChange={(v) => handleChange("deductible", v)}
        />
        <FormInput
          label="Co Payment"
          value={data.coPayment}
          onChange={(v) => handleChange("coPayment", v)}
        />
        <FormInput
          label="Commencement of Cover Note"
          value={data.commencementOfCoverNote}
          onChange={(v) => handleChange("commencementOfCoverNote", v)}
        />
      </div>

      <FormInput
        label="Area of Cover"
        value={data.areaOfCover}
        onChange={(v) => handleChange("areaOfCover", v)}
      />

      <h4 style={{ marginTop: "20px", color: "#395998" }}>Payment Details</h4>
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

const FormInput = ({ label, value, onChange }) => (
  <div className="form-group">
    <label>{label}</label>
    <input
      type="text"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
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

import React from "react";

const ProposedInsuredSection = ({ data, onChange }) => {
  const handleChange = (field, value) => {
    onChange("proposedInsured", field, value);
  };

  const handleNestedChange = (parent, field, value) => {
    onChange(`proposedInsured.${parent}`, field, value);
  };

  return (
    <>
      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <input
            type="checkbox"
            checked={data.sameAsApplicant}
            onChange={(e) => handleChange("sameAsApplicant", e.target.checked)}
          />
          <span>Same as Applicant Owner</span>
        </label>
      </div>

      {!data.sameAsApplicant && (
        <>
          <div className="form-grid">
            <FormInput
              label="Last Name"
              value={data.lastName}
              onChange={(v) => handleChange("lastName", v)}
            />
            <FormInput
              label="First Name"
              value={data.firstName}
              onChange={(v) => handleChange("firstName", v)}
            />
            <FormInput
              label="Middle Name"
              value={data.middleName}
              onChange={(v) => handleChange("middleName", v)}
            />
            <FormInput
              label="Suffix"
              value={data.suffix}
              onChange={(v) => handleChange("suffix", v)}
            />
          </div>

          <div className="form-grid">
            <FormInput
              label="Place of Birth"
              value={data.placeOfBirth}
              onChange={(v) => handleChange("placeOfBirth", v)}
            />
            <FormInput
              label="Nationality"
              value={data.nationality}
              onChange={(v) => handleChange("nationality", v)}
            />
          </div>

          <div className="form-grid">
            <FormInput
              type="date"
              label="Date of Birth"
              value={data.dob}
              onChange={(v) => handleChange("dob", v)}
            />
            <FormSelect
              label="Gender"
              value={data.gender}
              onChange={(v) => handleChange("gender", v)}
              options={[
                { value: "", label: "Select" },
                { value: "Male", label: "Male" },
                { value: "Female", label: "Female" },
              ]}
            />
            <FormSelect
              label="Civil Status"
              value={data.civilStatus}
              onChange={(v) => handleChange("civilStatus", v)}
              options={[
                { value: "", label: "Select" },
                { value: "Single", label: "Single" },
                { value: "Married", label: "Married" },
                { value: "Widowed", label: "Widowed" },
                { value: "Divorced", label: "Divorced" },
                { value: "Separated", label: "Separated" },
                { value: "Annulled", label: "Annulled" },
              ]}
            />
          </div>

          <div className="form-grid">
            <FormInput
              label="Country of Residence"
              value={data.countryOfResidence}
              onChange={(v) => handleChange("countryOfResidence", v)}
            />
            <FormInput
              type="number"
              label="Duration of Stay (Months)"
              value={data.durationOfStay}
              onChange={(v) => handleChange("durationOfStay", v)}
            />
            <FormInput
              label="TIN / SSS / GSIS No."
              value={data.tin}
              onChange={(v) => handleChange("tin", v)}
            />
          </div>

          <h4 style={{ marginTop: "20px", color: "#003266" }}>
            Present Address
          </h4>
          <AddressForm
            data={data.presentAddress}
            onChange={(f, v) => handleNestedChange("presentAddress", f, v)}
          />

          <h4 style={{ marginTop: "20px", color: "#003266" }}>
            Work Information
          </h4>
          <WorkInfoForm
            data={data.workInformation}
            onChange={(f, v) => handleNestedChange("workInformation", f, v)}
          />

          <h4 style={{ marginTop: "20px", color: "#003266" }}>
            Relationship and Current Insurance
          </h4>
          <div className="form-grid">
            <FormInput
              label="Relationship of Owner to Proposed Insured"
              value={data.relationshipToOwner}
              onChange={(v) => handleChange("relationshipToOwner", v)}
            />
          </div>

          <h5 style={{ color: "#666", marginTop: "15px" }}>
            Details of any current domestic or international health insurance
          </h5>
          <div className="form-grid">
            <FormInput
              label="Current insurance provider"
              value={data.currentInsurance?.provider}
              onChange={(v) =>
                handleNestedChange("currentInsurance", "provider", v)
              }
            />
            <FormInput
              type="date"
              label="Policy Effective Date"
              value={data.currentInsurance?.effectiveDate}
              onChange={(v) =>
                handleNestedChange("currentInsurance", "effectiveDate", v)
              }
            />
            <FormInput
              label="Policy Number"
              value={data.currentInsurance?.policyNumber}
              onChange={(v) =>
                handleNestedChange("currentInsurance", "policyNumber", v)
              }
            />
          </div>
        </>
      )}
    </>
  );
};

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

const AddressForm = ({ data, onChange }) => (
  <div className="form-grid">
    <FormInput
      label="Unit/Building Name"
      value={data.unitBuilding}
      onChange={(v) => onChange("unitBuilding", v)}
    />
    <FormInput
      label="Lot/Block No./Street Name"
      value={data.lotBlockStreet}
      onChange={(v) => onChange("lotBlockStreet", v)}
    />
    <FormInput
      label="Barangay/Subdivision"
      value={data.barangaySubdivision}
      onChange={(v) => onChange("barangaySubdivision", v)}
    />
    <FormInput
      label="City/Municipality"
      value={data.cityMunicipality}
      onChange={(v) => onChange("cityMunicipality", v)}
    />
    <FormInput
      label="Province"
      value={data.province}
      onChange={(v) => onChange("province", v)}
    />
    <FormInput
      label="Country"
      value={data.country}
      onChange={(v) => onChange("country", v)}
    />
    <FormInput
      label="Zip Code"
      value={data.zipCode}
      onChange={(v) => onChange("zipCode", v)}
    />
  </div>
);

const WorkInfoForm = ({ data, onChange }) => (
  <div className="form-grid">
    <FormInput
      type="number"
      label="Estimated Annual Income"
      value={data.estimatedAnnualIncome}
      onChange={(v) => onChange("estimatedAnnualIncome", v)}
    />
    <FormInput
      label="Occupation"
      value={data.occupation}
      onChange={(v) => onChange("occupation", v)}
    />
    <FormInput
      label="Employer"
      value={data.employer}
      onChange={(v) => onChange("employer", v)}
    />
    <FormInput
      label="Nature of Business"
      value={data.natureOfBusiness}
      onChange={(v) => onChange("natureOfBusiness", v)}
    />
  </div>
);

export default ProposedInsuredSection;

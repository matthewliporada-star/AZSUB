import React from "react";

const WorkInformationSection = ({ data, onChange }) => (
  <>
    <h4 style={{ marginTop: "20px", color: "#003266" }}>Work Information</h4>

    <div className="form-grid">
      <FormInput
        label="Unit/Building Name"
        value={data.unitBuilding}
        onChange={(v) => onChange("workInformation", "unitBuilding", v)}
      />
      <FormInput
        label="Lot/Block No./Street Name"
        value={data.lotBlockStreet}
        onChange={(v) => onChange("workInformation", "lotBlockStreet", v)}
      />
    </div>

    <div className="form-grid">
      <FormInput
        label="Barangay/Subdivision"
        value={data.barangaySubdivision}
        onChange={(v) => onChange("workInformation", "barangaySubdivision", v)}
      />
      <FormInput
        label="City/Municipality"
        value={data.cityMunicipality}
        onChange={(v) => onChange("workInformation", "cityMunicipality", v)}
      />
    </div>

    <div className="form-grid">
      <FormInput
        label="Province"
        value={data.province}
        onChange={(v) => onChange("workInformation", "province", v)}
      />
      <FormInput
        label="Country"
        value={data.country}
        onChange={(v) => onChange("workInformation", "country", v)}
      />
      <FormInput
        label="Zip Code"
        value={data.zipCode}
        onChange={(v) => onChange("workInformation", "zipCode", v)}
      />
    </div>

    <div className="form-grid">
      <FormInput
        type="number"
        label="Estimated Annual Income"
        value={data.estimatedAnnualIncome}
        onChange={(v) =>
          onChange("workInformation", "estimatedAnnualIncome", v)
        }
      />
      <FormInput
        label="Occupation"
        value={data.occupation}
        onChange={(v) => onChange("workInformation", "occupation", v)}
      />
    </div>

    <div className="form-grid">
      <FormInput
        label="Employer"
        value={data.employer}
        onChange={(v) => onChange("workInformation", "employer", v)}
      />
      <FormInput
        label="Nature of Business"
        value={data.natureOfBusiness}
        onChange={(v) => onChange("workInformation", "natureOfBusiness", v)}
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

export default WorkInformationSection;

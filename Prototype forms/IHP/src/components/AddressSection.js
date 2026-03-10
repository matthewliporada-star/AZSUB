import React from "react";

const AddressSection = ({ title, prefix, data, onChange }) => (
  <>
    <h4 style={{ marginTop: "20px", color: "#003266" }}>{title}</h4>
    <div className="form-grid">
      <FormInput
        label="Unit/Building Name"
        value={data.unitBuilding}
        onChange={(v) => onChange(prefix, "unitBuilding", v)}
      />
      <FormInput
        label="Lot/Block No./Street Name"
        value={data.lotBlockStreet}
        onChange={(v) => onChange(prefix, "lotBlockStreet", v)}
      />
      <FormInput
        label="Barangay/Subdivision"
        value={data.barangaySubdivision}
        onChange={(v) => onChange(prefix, "barangaySubdivision", v)}
      />
    </div>
    <div className="form-grid">
      <FormInput
        label="City/Municipality"
        value={data.cityMunicipality}
        onChange={(v) => onChange(prefix, "cityMunicipality", v)}
      />
      <FormInput
        label="Province"
        value={data.province}
        onChange={(v) => onChange(prefix, "province", v)}
      />
      <FormInput
        label="Country"
        value={data.country}
        onChange={(v) => onChange(prefix, "country", v)}
      />
      <FormInput
        label="Zip Code"
        value={data.zipCode}
        onChange={(v) => onChange(prefix, "zipCode", v)}
      />
    </div>
  </>
);

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

export default AddressSection;

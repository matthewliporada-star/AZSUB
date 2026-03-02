import React from "react";

const DependentSection = ({
  dependents,
  onDependentChange,
  onAdd,
  onRemove,
}) => {
  const handleChange = (index, field, value) => {
    onDependentChange(index, field, value);
  };

  const handleAddressChange = (index, field, value) => {
    onDependentChange(index, `presentAddress.${field}`, value);
  };

  const handleWorkInfoChange = (index, field, value) => {
    onDependentChange(index, `workInformation.${field}`, value);
  };

  return (
    <>
      {dependents.map((dep, index) => (
        <div
          key={dep.id}
          style={{
            marginBottom: "30px",
            padding: "20px",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            backgroundColor: index % 2 === 0 ? "#fff" : "#fafafa",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
              paddingBottom: "10px",
              borderBottom: "2px solid #395998",
            }}
          >
            <h4 style={{ color: "#395998", margin: 0, fontSize: "18px" }}>
              Dependent {index + 1}
            </h4>
            {dependents.length > 1 && (
              <button
                type="button"
                onClick={() => onRemove(dep.id)}
                style={{
                  background: "#dc3545",
                  color: "white",
                  padding: "6px 16px",
                  fontSize: "14px",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                Remove Dependent
              </button>
            )}
          </div>

          {/* Personal Information */}
          <h5
            style={{ color: "#395998", marginBottom: "15px", fontSize: "16px" }}
          >
            Personal Information
          </h5>

          <div className="form-grid">
            <FormInput
              label="Last Name"
              value={dep.lastName}
              onChange={(v) => handleChange(index, "lastName", v)}
            />
            <FormInput
              label="First Name"
              value={dep.firstName}
              onChange={(v) => handleChange(index, "firstName", v)}
            />
            <FormInput
              label="Middle Name"
              value={dep.middleName}
              onChange={(v) => handleChange(index, "middleName", v)}
            />
            <FormInput
              label="Suffix"
              value={dep.suffix}
              onChange={(v) => handleChange(index, "suffix", v)}
              placeholder="Jr., Sr., III, etc."
            />
          </div>

          <FormInput
            label="Other Legal Name (if any)"
            value={dep.otherLegalName}
            onChange={(v) => handleChange(index, "otherLegalName", v)}
          />

          <div className="form-grid">
            <FormInput
              type="date"
              label="Date of Birth"
              value={dep.dob}
              onChange={(v) => handleChange(index, "dob", v)}
            />
            <FormSelect
              label="Gender"
              value={dep.gender}
              onChange={(v) => handleChange(index, "gender", v)}
              options={genderOptions}
            />
            <FormSelect
              label="Civil Status"
              value={dep.civilStatus}
              onChange={(v) => handleChange(index, "civilStatus", v)}
              options={civilStatusOptions}
            />
          </div>

          <div className="form-grid">
            <FormInput
              label="Place of Birth"
              value={dep.placeOfBirth}
              onChange={(v) => handleChange(index, "placeOfBirth", v)}
              placeholder="City/Municipality, Province, Country"
            />
            <FormInput
              label="Nationality"
              value={dep.nationality}
              onChange={(v) => handleChange(index, "nationality", v)}
            />
            <FormInput
              label="Country of Residence"
              value={dep.countryOfResidence}
              onChange={(v) => handleChange(index, "countryOfResidence", v)}
            />
          </div>

          <div className="form-grid">
            <FormInput
              type="number"
              label="Duration of Stay (Months)"
              value={dep.durationOfStay}
              onChange={(v) => handleChange(index, "durationOfStay", v)}
            />
            <FormInput
              label="TIN / SSS / GSIS No."
              value={dep.tin}
              onChange={(v) => handleChange(index, "tin", v)}
            />
            <FormInput
              label="Relationship to Applicant"
              value={dep.relationship}
              onChange={(v) => handleChange(index, "relationship", v)}
            />
          </div>

          {/* Present Address Section */}
          <h5
            style={{
              color: "#395998",
              marginTop: "25px",
              marginBottom: "15px",
              fontSize: "16px",
            }}
          >
            Present Address
          </h5>

          <div className="form-grid">
            <FormInput
              label="Unit/Building Name"
              value={dep.presentAddress?.unitBuilding || ""}
              onChange={(v) => handleAddressChange(index, "unitBuilding", v)}
            />
            <FormInput
              label="Lot/Block No./Street Name"
              value={dep.presentAddress?.lotBlockStreet || ""}
              onChange={(v) => handleAddressChange(index, "lotBlockStreet", v)}
            />
            <FormInput
              label="Barangay/Subdivision"
              value={dep.presentAddress?.barangaySubdivision || ""}
              onChange={(v) =>
                handleAddressChange(index, "barangaySubdivision", v)
              }
            />
          </div>

          <div className="form-grid">
            <FormInput
              label="City/Municipality"
              value={dep.presentAddress?.cityMunicipality || ""}
              onChange={(v) =>
                handleAddressChange(index, "cityMunicipality", v)
              }
            />
            <FormInput
              label="Province"
              value={dep.presentAddress?.province || ""}
              onChange={(v) => handleAddressChange(index, "province", v)}
            />
            <FormInput
              label="Country"
              value={dep.presentAddress?.country || "Philippines"}
              onChange={(v) => handleAddressChange(index, "country", v)}
            />
            <FormInput
              label="Zip Code"
              value={dep.presentAddress?.zipCode || ""}
              onChange={(v) => handleAddressChange(index, "zipCode", v)}
            />
          </div>

          {/* Work Information Section */}
          <h5
            style={{
              color: "#395998",
              marginTop: "25px",
              marginBottom: "15px",
              fontSize: "16px",
            }}
          >
            Work Information
          </h5>

          <div className="form-grid">
            <FormInput
              label="Unit/Building Name"
              value={dep.workInformation?.unitBuilding || ""}
              onChange={(v) => handleWorkInfoChange(index, "unitBuilding", v)}
            />
            <FormInput
              label="Lot/Block No./Street Name"
              value={dep.workInformation?.lotBlockStreet || ""}
              onChange={(v) => handleWorkInfoChange(index, "lotBlockStreet", v)}
            />
            <FormInput
              label="Barangay/Subdivision"
              value={dep.workInformation?.barangaySubdivision || ""}
              onChange={(v) =>
                handleWorkInfoChange(index, "barangaySubdivision", v)
              }
            />
          </div>

          <div className="form-grid">
            <FormInput
              label="City/Municipality"
              value={dep.workInformation?.cityMunicipality || ""}
              onChange={(v) =>
                handleWorkInfoChange(index, "cityMunicipality", v)
              }
            />
            <FormInput
              label="Province"
              value={dep.workInformation?.province || ""}
              onChange={(v) => handleWorkInfoChange(index, "province", v)}
            />
            <FormInput
              label="Country"
              value={dep.workInformation?.country || "Philippines"}
              onChange={(v) => handleWorkInfoChange(index, "country", v)}
            />
            <FormInput
              label="Zip Code"
              value={dep.workInformation?.zipCode || ""}
              onChange={(v) => handleWorkInfoChange(index, "zipCode", v)}
            />
          </div>

          <div className="form-grid">
            <FormInput
              type="number"
              label="Estimated Annual Income"
              value={dep.workInformation?.estimatedAnnualIncome || ""}
              onChange={(v) =>
                handleWorkInfoChange(index, "estimatedAnnualIncome", v)
              }
            />
            <FormInput
              label="Occupation"
              value={dep.workInformation?.occupation || ""}
              onChange={(v) => handleWorkInfoChange(index, "occupation", v)}
            />
          </div>

          <div className="form-grid">
            <FormInput
              label="Employer"
              value={dep.workInformation?.employer || ""}
              onChange={(v) => handleWorkInfoChange(index, "employer", v)}
            />
            <FormInput
              label="Nature of Business"
              value={dep.workInformation?.natureOfBusiness || ""}
              onChange={(v) =>
                handleWorkInfoChange(index, "natureOfBusiness", v)
              }
            />
          </div>

          {/* Current Health Insurance */}
          <h5
            style={{
              color: "#395998",
              marginTop: "25px",
              marginBottom: "15px",
              fontSize: "16px",
            }}
          >
            Current Health Insurance
          </h5>

          <div className="form-grid">
            <FormInput
              label="Insurance Provider"
              value={dep.currentInsurance?.provider || ""}
              onChange={(v) =>
                handleChange(index, "currentInsurance.provider", v)
              }
            />
            <FormInput
              type="date"
              label="Policy Effective Date"
              value={dep.currentInsurance?.effectiveDate || ""}
              onChange={(v) =>
                handleChange(index, "currentInsurance.effectiveDate", v)
              }
            />
            <FormInput
              label="Policy Number"
              value={dep.currentInsurance?.policyNumber || ""}
              onChange={(v) =>
                handleChange(index, "currentInsurance.policyNumber", v)
              }
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={onAdd}
        style={{
          background: "#395998",
          color: "white",
          padding: "12px 24px",
          marginTop: "20px",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: "500",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
        }}
      >
        <span style={{ fontSize: "20px" }}>+</span> Add Dependent
      </button>
    </>
  );
};

// Helper components
const FormInput = ({ label, type = "text", value, onChange, placeholder }) => (
  <div className="form-group">
    <label>{label}</label>
    <input
      type={type}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || ""}
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

const genderOptions = [
  { value: "", label: "Select" },
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
];

const civilStatusOptions = [
  { value: "", label: "Select" },
  { value: "Single", label: "Single" },
  { value: "Married", label: "Married" },
  { value: "Widowed", label: "Widowed" },
  { value: "Divorced", label: "Divorced" },
  { value: "Separated", label: "Separated" },
  { value: "Annulled", label: "Annulled" },
];

export default DependentSection;

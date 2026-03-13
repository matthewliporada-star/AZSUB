import React from "react";
import "../CIS.css";

function PersonalInformation({ personalInfo, setPersonalInfo }) {
  const handlePersonalInfoChange = (field, value) =>
    setPersonalInfo((prev) => ({ ...prev, [field]: value }));

  const handleNestedChange = (section, field, value) =>
    setPersonalInfo((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) return "";
    const part1 = digits.slice(0, 3);
    const part2 = digits.slice(3, 6);
    const part3 = digits.slice(6, 10);
    const rest = digits.slice(10);
    return rest ? `${part1}-${part2}-${part3} ${rest}` : `${part1}-${part2}-${part3}`;
  };

  const addressConfigs = [
    { key: "residence_address", label: "Residence Address (Please provide complete address)" },
    { key: "previous_residence", label: "Previous Residence and dates resided (if any, please provide complete address)" },
    { key: "provide_information", label: "Provide information for any current secondary residence and previous primary and secondary residences you have had in the past 10 years" },
    { key: "permanent_address", label: "Permanent Address (Please provide complete address)" },
  ];

  return (
    <div className="form-box personal-info-section">
      <h3 className="section-title">Personal Information</h3>

      {/* Full Name & Father's Name */}
      <div className="form-grid-2">
        <div className="input-group">
          <label>Full name of Mr. /Mrs.</label>
          <input className="box-input" value={personalInfo.full_name} onChange={(e) => handlePersonalInfoChange("full_name", e.target.value)} />
        </div>
        <div className="input-group">
          <label>Father's Name</label>
          <input className="box-input" value={personalInfo.fathers_name} onChange={(e) => handlePersonalInfoChange("fathers_name", e.target.value)} />
        </div>
      </div>

      {/* Mobile & Email */}
      <div className="form-grid-2">
        <div className="input-group">
          <label>Mobile No.</label>
          <input type="tel" className="box-input" value={personalInfo.mobile_no} onChange={(e) => handlePersonalInfoChange("mobile_no", formatPhone(e.target.value))} />
        </div>
        <div className="input-group">
          <label>Email Address</label>
          <input type="email" className="box-input" value={personalInfo.email} onChange={(e) => handlePersonalInfoChange("email", e.target.value)} />
        </div>
      </div>

      {/* Address Mapping */}
      {addressConfigs.map(({ key: addrKey, label: labelText }) => (
        <React.Fragment key={addrKey}>
          <div className="input-group address-group-box">
            <label className="section-subtitle-label">{labelText}</label>
            
            {/* Address Grid - Permanent address is simplified, others are 3-column grids */}
            <div className={addrKey === "permanent_address" ? "permanent-address-layout" : "form-grid-3 address-subgrid"}>
              <input 
                placeholder="Address" 
                className={`box-input ${addrKey !== "permanent_address" ? "grid-col-span-2" : ""}`} 
                value={personalInfo[addrKey].address || ""} 
                onChange={(e) => handleNestedChange(addrKey, "address", e.target.value)} 
              />
              
              {addrKey !== "permanent_address" && (
                <>
                  <input placeholder="Country" className="box-input" value={personalInfo[addrKey].country || ""} onChange={(e) => handleNestedChange(addrKey, "country", e.target.value)} />
                  <input placeholder="City" className="box-input" value={personalInfo[addrKey].city || ""} onChange={(e) => handleNestedChange(addrKey, "city", e.target.value)} />
                  <input placeholder="Postal Code" className="box-input" value={personalInfo[addrKey].postal_code || ""} onChange={(e) => handleNestedChange(addrKey, "postal_code", e.target.value)} />
                  {["previous_residence", "provide_information"].includes(addrKey) && (
                    <input type="text" placeholder="Dates Resided" className="box-input" value={personalInfo[addrKey].dates || ""} onChange={(e) => handleNestedChange(addrKey, "dates", e.target.value)} />
                  )}
                </>
              )}
            </div>
          </div>

          {/* This renders specifically OUTSIDE the container after Residence Address */}
          {addrKey === "residence_address" && (
            <div className="input-group mt-3 mb-4 duration-field-container">
              <label>How long have you lived at your current address & in current country?</label>
              <input
                className="box-input"
                placeholder="e.g. 5 Years"
                value={personalInfo.duration_at_address || ""}
                onChange={(e) => handlePersonalInfoChange("duration_at_address", e.target.value)}
              />
            </div>
          )}
        </React.Fragment>
      ))}

      {/* Bottom Information */}
      <div className="form-grid-2 mt-4">
        <div className="input-group">
          <label>Tax Residency Information</label>
          <input className="box-input" value={personalInfo.tax_residency_info} onChange={(e) => handlePersonalInfoChange("tax_residency_info", e.target.value)} />
        </div>
        <div className="input-group">
          <label>TIN / SSN Number</label>
          <input className="box-input" value={personalInfo.tin_ssn} onChange={(e) => handlePersonalInfoChange("tin_ssn", e.target.value)} />
        </div>
      </div>

      <div className="form-grid-2">
        <div className="input-group">
          <label>List Countries of Citizenship</label>
          <input className="box-input" value={personalInfo.citizenship} onChange={(e) => handlePersonalInfoChange("citizenship", e.target.value)} />
        </div>
        <div className="input-group">
          <label>Hobbies and Activities</label>
          <input className="box-input" value={personalInfo.hobbies} onChange={(e) => handlePersonalInfoChange("hobbies", e.target.value)} />
        </div>
      </div>
    </div>
  );
}

export default PersonalInformation;
// BusinessEmployment.jsx
import React, { useState } from "react";
import "../CIS.css";

const BusinessEmployment = () => {
  // ✅ Internal state
  const [employment, setEmployment] = useState({
    businessName: "",
    nature: "",
    duties: "",
    businessType: "",
    ownership: "",
    address: "",
    website: "",
    telephone: "",
    incorporationDate: "",
    previousExperience: "",
  });

  // ✅ Internal handler
  const handleEmploymentChange = (field, value) => {
    setEmployment((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="employment-section">
      <div className="form-box">
        <h3 className="section-title">Business / Employment Information</h3>
        <div className="form-grid-2">

          <div className="input-group">
            <label>Name of Business</label>
            <input
              type="text"
              className="box-input"
              value={employment.businessName}
              onChange={(e) => handleEmploymentChange("businessName", e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Nature of Business</label>
            <input
              type="text"
              className="box-input"
              value={employment.nature}
              onChange={(e) => handleEmploymentChange("nature", e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Occupation / Duties</label>
            <input
              type="text"
              className="box-input"
              value={employment.duties}
              onChange={(e) => handleEmploymentChange("duties", e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>
              Type of Business (Employment / Sole Proprietor / LLC / PJSC / Offshore / Partnership)
            </label>
            <input
              type="text"
              className="box-input"
              value={employment.businessType}
              onChange={(e) => handleEmploymentChange("businessType", e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Percentage of Ownership</label>
            <input
              type="number"
              className="box-input"
              value={employment.ownership}
              onChange={(e) => handleEmploymentChange("ownership", e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Business Address (City, Country, Postal Code)</label>
            <input
              type="text"
              className="box-input"
              value={employment.address}
              onChange={(e) => handleEmploymentChange("address", e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Website</label>
            <input
              type="text"
              className="box-input"
              value={employment.website}
              onChange={(e) => handleEmploymentChange("website", e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Business Telephone</label>
            <input
              type="text"
              className="box-input"
              value={employment.telephone}
              onChange={(e) => handleEmploymentChange("telephone", e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Date of Incorporation</label>
            <input
              type="date"
              className="box-input"
              value={employment.incorporationDate}
              onChange={(e) => handleEmploymentChange("incorporationDate", e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>
              Previous Work Experience (Last 15 years) – Kindly specify role, organization name and years
            </label>
            <textarea
              className="box-input"
              rows="3"
              value={employment.previousExperience}
              onChange={(e) => handleEmploymentChange("previousExperience", e.target.value)}
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export default BusinessEmployment;
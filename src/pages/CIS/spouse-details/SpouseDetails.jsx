// src/pages/CIS/spouse-details/SpouseDetails.jsx
import React from "react";
import "../CIS.css";

const SpouseDetails = ({ spouse, handleSpouseChange }) => {
  return (
    <div className="spouse-section">
      <div className="form-box">
        <h3 className="section-title">Spouse Details</h3>

        <div className="form-grid-2">

          <div className="input-group">
            <label>Name</label>
            <input
              type="text"
              className="box-input"
              value={spouse.name || ""}
              onChange={(e) => handleSpouseChange("name", e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Relationship</label>
            <input
              type="text"
              className="box-input"
              value={spouse.relationship || ""}
              onChange={(e) => handleSpouseChange("relationship", e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Contact Number</label>
            <input
              type="text"
              className="box-input"
              value={spouse.contact || ""}
              onChange={(e) => handleSpouseChange("contact", e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              className="box-input"
              value={spouse.email || ""}
              onChange={(e) => handleSpouseChange("email", e.target.value)}
            />
          </div>

          {/* Current Address */}
          <div className="input-group">
            <label>Current Residential Address</label>
            <input
              type="text"
              className="box-input"
              value={spouse.currentAddress || ""}
              onChange={(e) => handleSpouseChange("currentAddress", e.target.value)}
            />
          </div>

          <div className="form-grid-3 spouse-address-grid">
            <div className="input-group">
              <label>City</label>
              <input
                type="text"
                className="box-input"
                value={spouse.currentCity || ""}
                onChange={(e) => handleSpouseChange("currentCity", e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>Country</label>
              <input
                type="text"
                className="box-input"
                value={spouse.currentCountry || ""}
                onChange={(e) => handleSpouseChange("currentCountry", e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>Postal Code</label>
              <input
                type="text"
                className="box-input"
                value={spouse.currentPostal || ""}
                onChange={(e) => handleSpouseChange("currentPostal", e.target.value)}
              />
            </div>
          </div>

          {/* Permanent Address */}
          <div className="input-group">
            <label>Permanent Address</label>
            <input
              type="text"
              className="box-input"
              value={spouse.permanentAddress || ""}
              onChange={(e) => handleSpouseChange("permanentAddress", e.target.value)}
            />
          </div>

          <div className="form-grid-3 spouse-address-grid">
            <div className="input-group">
              <label>City</label>
              <input
                type="text"
                className="box-input"
                value={spouse.permanentCity || ""}
                onChange={(e) => handleSpouseChange("permanentCity", e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>Country</label>
              <input
                type="text"
                className="box-input"
                value={spouse.permanentCountry || ""}
                onChange={(e) => handleSpouseChange("permanentCountry", e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>Postal Code</label>
              <input
                type="text"
                className="box-input"
                value={spouse.permanentPostal || ""}
                onChange={(e) => handleSpouseChange("permanentPostal", e.target.value)}
              />
            </div>
          </div>

          {/* Other details */}
          <div className="input-group">
            <label>Nationality</label>
            <input
              type="text"
              className="box-input"
              value={spouse.nationality || ""}
              onChange={(e) => handleSpouseChange("nationality", e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Date of Birth</label>
            <input
              type="date"
              className="box-input"
              value={spouse.dob || ""}
              onChange={(e) => handleSpouseChange("dob", e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Country of Residence</label>
            <input
              type="text"
              className="box-input"
              value={spouse.countryResidence || ""}
              onChange={(e) => handleSpouseChange("countryResidence", e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Smoking Status</label>
            <input
              type="text"
              className="box-input"
              value={spouse.smokingStatus || ""}
              onChange={(e) => handleSpouseChange("smokingStatus", e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Employment Details / Role / Company Name</label>
            <textarea
              className="box-input"
              rows="3"
              value={spouse.employmentDetails || ""}
              onChange={(e) => handleSpouseChange("employmentDetails", e.target.value)}
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export default SpouseDetails;
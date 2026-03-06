// src/pages/CIS/spouse-details/SpouseDetails.jsx
import React from "react";


const SpouseDetails = ({ spouse, handleSpouseChange }) => {
  return (
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

        {/* Repeat similar pattern for the rest of your inputs */}
      </div>
    </div>
  );
};

export default SpouseDetails; // ✅ default export
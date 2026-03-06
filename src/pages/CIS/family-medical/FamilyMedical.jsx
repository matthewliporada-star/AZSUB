import React, { useState } from "react";
import "../CIS.css";

function FamilyMedical({ familyHistory = {}, handleFamilyChange = () => {} }) {
  const [members, setMembers] = useState([
    { id: 1, relationship: "Father", name: "", age: "", medicalHistory: "", currentHealth: "" },
    { id: 2, relationship: "Mother", name: "", age: "", medicalHistory: "", currentHealth: "" },
    { id: 3, relationship: "Spouse", name: "", age: "", medicalHistory: "", currentHealth: "" },
  ]);

  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const emptyRow = (relationship) => ({
    id: Date.now(),
    relationship,
    name: "",
    age: "",
    medicalHistory: "",
    currentHealth: "",
  });

  const handleMemberChange = (index, field, value) => {
    const updated = [...members];
    updated[index][field] = value;
    setMembers(updated);
    handleFamilyChange("members", updated);
  };

  const addMember = (relationship) => {
    setMembers((prev) => [...prev, emptyRow(relationship)]);
    setShowModal(false);
  };

  const toggleDeleteMode = () => {
    if (deleteMode && selectedRows.length > 0) {
      const updated = members.filter((_, i) => !selectedRows.includes(i));
      setMembers(updated);
      handleFamilyChange("members", updated);
      setSelectedRows([]);
    }
    setDeleteMode(!deleteMode);
  };

  return (
    <div className="family-medical-section">
      <div className="form-box">
        <h3 className="section-title">Family Medical History</h3>

        {/* COMPACT GRID */}
        <div className="family-compact-grid">
          {members.map((member, index) => (
            <div key={member.id} className="family-compact-card">
              {/* Relationship + Checkbox when delete mode */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h4 className="compact-title">{member.relationship}</h4>
                {deleteMode && (
                  <label className="custom-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(index)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedRows((prev) => [...prev, index]);
                        else setSelectedRows((prev) => prev.filter((i) => i !== index));
                      }}
                    />
                    <span className="checkmark"></span>
                  </label>
                )}
              </div>

              {/* Member fields */}
              <div className="compact-field">
                <input
                  type="text"
                  className="small-input"
                  placeholder=" "
                  value={member.name}
                  onChange={(e) => handleMemberChange(index, "name", e.target.value)}
                />
                <label>Name</label>
              </div>

              <div className="compact-field">
                <input
                  type="text"
                  className="small-input"
                  placeholder=" "
                  value={member.age}
                  onChange={(e) => handleMemberChange(index, "age", e.target.value)}
                />
                <label>Age</label>
              </div>

              <div className="compact-field">
                <input
                  type="text"
                  className="small-input"
                  placeholder=" "
                  value={member.medicalHistory}
                  onChange={(e) => handleMemberChange(index, "medicalHistory", e.target.value)}
                />
                <label>Medical History</label>
              </div>

              <div className="compact-field">
                <input
                  type="text"
                  className="small-input"
                  placeholder=" "
                  value={member.currentHealth}
                  onChange={(e) => handleMemberChange(index, "currentHealth", e.target.value)}
                />
                <label>Current Health</label>
              </div>
            </div>
          ))}
        </div>

        {/* ADD / DELETE ROW BUTTONS */}
        <div className="add-row-container">
          <button type="button" className="btn-travel-add" onClick={() => setShowModal(true)}>
            + Add Row
          </button>

          <button type="button" className="btn-travel-delete" onClick={toggleDeleteMode}>
            {deleteMode ? "Confirm Delete" : "Delete Row"}
          </button>
        </div>

        {/* MODAL FOR ADDING ROW */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h4>Select Relationship to Add</h4>

              <div className="modal-buttons">
                {["Father", "Mother", "Spouse", "Brother", "Sister"].map((rel) => (
                  <button key={rel} type="button" className="modal-btn" onClick={() => addMember(rel)}>
                    {rel}
                  </button>
                ))}
              </div>

              <button type="button" className="modal-cancel" onClick={() => setShowModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FamilyMedical;
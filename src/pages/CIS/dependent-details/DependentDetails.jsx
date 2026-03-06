// src/pages/CIS/dependent-details/DependentDetails.jsx
import React, { useState } from "react";
import "../CIS.css";

const DependentDetails = () => {
  const [dependents, setDependents] = useState([
    { name: "", relation: "", nationality: "", dob: "" },
  ]);

  const [showDeleteBtns, setShowDeleteBtns] = useState(false);

  const handleDependentsChange = (index, field, value) => {
    const newDependents = [...dependents];
    newDependents[index][field] = value;
    setDependents(newDependents);
  };

  const addDependent = () => {
    setDependents([
      ...dependents,
      { name: "", relation: "", nationality: "", dob: "" },
    ]);
  };

  const removeDependent = (index) => {
    const newDependents = [...dependents];
    newDependents.splice(index, 1);
    setDependents(newDependents);
  };

  return (
    <div className="dependent-section">
      <div className="form-box">
        <h3 className="section-title">Dependent Details</h3>

        {dependents.map((dep, index) => (
          <div key={index} className="form-grid-2 dependent-entry">
            {/* Show "×" only if toggle is active */}
            {showDeleteBtns && dependents.length > 1 && (
              <button
                type="button"
                className="remove-dependent-btn"
                onClick={() => removeDependent(index)}
              >
                ×
              </button>
            )}

            <div className="input-group">
              <label>Dependent Name {index + 1}</label>
              <input
                type="text"
                className="box-input"
                value={dep.name}
                onChange={(e) =>
                  handleDependentsChange(index, "name", e.target.value)
                }
              />
            </div>

            <div className="input-group">
              <label>Relationship</label>
              <input
                type="text"
                className="box-input"
                value={dep.relation}
                onChange={(e) =>
                  handleDependentsChange(index, "relation", e.target.value)
                }
              />
            </div>

            <div className="input-group">
              <label>Nationality</label>
              <input
                type="text"
                className="box-input"
                value={dep.nationality}
                onChange={(e) =>
                  handleDependentsChange(index, "nationality", e.target.value)
                }
              />
            </div>

            <div className="input-group">
              <label>Date of Birth</label>
              <input
                type="date"
                className="box-input"
                value={dep.dob}
                onChange={(e) =>
                  handleDependentsChange(index, "dob", e.target.value)
                }
              />
            </div>
          </div>
        ))}

        {/* Add & Delete buttons side by side */}
        <div className="dependent-actions">
          <button type="button" onClick={addDependent} className="add-btn">
            + Add Dependent
          </button>
          {dependents.length > 1 && (
            <button
              type="button"
              onClick={() => setShowDeleteBtns(!showDeleteBtns)}
              className="delete-btn"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DependentDetails;
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
        <h3 className="dependent-section-title">Dependent Details</h3>

        {dependents.map((dep, index) => (
          <div key={index} className="dependent-entry">
            {showDeleteBtns && dependents.length > 1 && (
              <button
                type="button"
                className="remove-dependent-btn"
                onClick={() => removeDependent(index)}
              >
                ×
              </button>
            )}

            <div className="dependent-form-grid-2">
              <div className="dependent-input-group">
                <label className="dependent-label">
                  Dependent Name {index + 1}
                </label>
                <input
                  type="text"
                  className="dependent-input"
                  value={dep.name}
                  onChange={(e) =>
                    handleDependentsChange(index, "name", e.target.value)
                  }
                />
              </div>

              <div className="dependent-input-group">
                <label className="dependent-label">Relationship</label>
                <input
                  type="text"
                  className="dependent-input"
                  value={dep.relation}
                  onChange={(e) =>
                    handleDependentsChange(index, "relation", e.target.value)
                  }
                />
              </div>

              <div className="dependent-input-group">
                <label className="dependent-label">Nationality</label>
                <input
                  type="text"
                  className="dependent-input"
                  value={dep.nationality}
                  onChange={(e) =>
                    handleDependentsChange(index, "nationality", e.target.value)
                  }
                />
              </div>

              <div className="dependent-input-group">
                <label className="dependent-label">Date of Birth</label>
                <input
                  type="date"
                  className="dependent-input"
                  value={dep.dob}
                  onChange={(e) =>
                    handleDependentsChange(index, "dob", e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        ))}

        <div className="dependent-actions">
          <button type="button" className="add-btn" onClick={addDependent}>
            + Add Dependent
          </button>

          <button
            type="button"
            className="delete-dependent-btn"
            onClick={() => setShowDeleteBtns(!showDeleteBtns)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DependentDetails;

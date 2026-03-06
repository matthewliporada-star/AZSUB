import React from "react";


const DependentDetails = ({ dependents, handleDependentsChange }) => {
  // Ensure dependents is always an array
  const depArray = Array.isArray(dependents) ? dependents : [];

  return (
    <div className="form-box">
      <h3 className="section-title">Dependent Details</h3>

      {depArray.length === 0 && <p>No dependents added yet.</p>}

      {depArray.map((dep, index) => (
        <div key={index} className="form-grid-2">
          <div className="input-group">
            <label>Dependent Name {index + 1}</label>
            <input
              type="text"
              className="box-input"
              value={dep.name || ""}
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
              value={dep.relation || ""}
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
              value={dep.nationality || ""}
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
              value={dep.dob || ""}
              onChange={(e) =>
                handleDependentsChange(index, "dob", e.target.value)
              }
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default DependentDetails;
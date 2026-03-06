import React from "react";
import "../CIS.css";

function PersonalMedical({ medical, handleMedicalChange }) {
  const defaultMedical = {
    majorIllness: "",
    illnessDetails: "",
    underMedication: "",
    medicationDetails: "",
    weight: "",
    height: "",
    exercise: "",
    healthDisorders: "",
    medicationsTaken: "",
    familyPhysician: "",
    physicianAddress: "",
    physicianContact: "",
    yearsAttended: "",
    lastVisited: "",
  };

  const m = { ...defaultMedical, ...medical };

  return (
    <div className="personal-medical-section">
      <div className="form-box">
        <h3 className="section-title">Personal Medical Details</h3>

        <div className="form-grid-2">
          {/* Weight */}
          <div className="input-group long-label">
            <label>Weight</label>
            <input
              type="text"
              className="box-input"
              value={m.weight}
              onChange={(e) => handleMedicalChange("weight", e.target.value)}
            />
          </div>

          {/* Height */}
          <div className="input-group long-label">
            <label>Height</label>
            <input
              type="text"
              className="box-input"
              value={m.height}
              onChange={(e) => handleMedicalChange("height", e.target.value)}
            />
          </div>

          {/* Exercise */}
          <div className="input-group long-label">
            <label>
              Do you exercise?{" "}
              <span className="label-parenthesis">
                (If Yes, please give details)
              </span>
            </label>
            <input
              type="text"
              className="box-input"
              value={m.exercise}
              onChange={(e) => handleMedicalChange("exercise", e.target.value)}
            />
          </div>

          {/* Health Disorders */}
          <div className="input-group long-label">
            <label>
              Any health disorders{" "}
              <span className="label-parenthesis">
                (Please provide full details with the last medical report)
              </span>
            </label>
            <input
              type="text"
              className="box-input"
              value={m.healthDisorders}
              onChange={(e) =>
                handleMedicalChange("healthDisorders", e.target.value)
              }
            />
          </div>

          {/* Medications Taken */}
          <div className="input-group long-label">
            <label>
              Any medication taken{" "}
              <span className="label-parenthesis">(Please specify)</span>
            </label>
            <input
              type="text"
              className="box-input"
              value={m.medicationsTaken}
              onChange={(e) =>
                handleMedicalChange("medicationsTaken", e.target.value)
              }
            />
          </div>

          {/* Family Physician */}
          <div className="input-group long-label">
            <label>Family Physician</label>
            <input
              type="text"
              className="box-input"
              value={m.familyPhysician}
              onChange={(e) =>
                handleMedicalChange("familyPhysician", e.target.value)
              }
            />
          </div>

          {/* Physician Address */}
          <div className="input-group long-label">
            <label>Physician Address:</label>
            <input
              type="text"
              className="box-input"
              value={m.physicianAddress}
              onChange={(e) =>
                handleMedicalChange("physicianAddress", e.target.value)
              }
            />
          </div>

          {/* Physician Contact */}
          <div className="input-group long-label">
            <label>Telephone no.</label>
            <input
              type="tel"
              className="box-input"
              value={m.physicianContact}
              onChange={(e) => {
                const numbersOnly = e.target.value.replace(/[^0-9]/g, "");
                handleMedicalChange("physicianContact", numbersOnly);
              }}
              inputMode="numeric"
              pattern="[0-9]*"
            />
          </div>

          {/* Years Attended */}
          <div className="input-group long-label">
            <label>No. of years attended</label>
            <input
              type="text"
              className="box-input"
              value={m.yearsAttended}
              onChange={(e) =>
                handleMedicalChange("yearsAttended", e.target.value)
              }
            />
          </div>

          {/* Last Visited */}
          <div className="input-group long-label">
            <label>Last visited (date & reason)</label>
            <input
              type="text"
              className="box-input"
              value={m.lastVisited}
              onChange={(e) =>
                handleMedicalChange("lastVisited", e.target.value)
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PersonalMedical;

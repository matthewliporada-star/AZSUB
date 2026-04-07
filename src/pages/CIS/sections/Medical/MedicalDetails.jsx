import React, { useEffect, useState } from "react";
import Section from "../../components/Section";
import FormRow from "../../components/FormRow";
import FormCell from "../../components/FormCell";
import Input from "../../components/Input";
import Textarea from "../../components/Textarea";
import { useForm } from "../../context/FormContext";

export default function MedicalDetails() {
  const { formData, setFormData, updateFormData } = useForm();

  const familyMembers = [
    "Father",
    "Mother",
    "Brother",
    "Sister",
    "Brother 1",
    "Sister 1",
    "Spouse",
    "Uncle",
    "Aunt",
    "Grandparent",
    "Cousin",
    "Other",
  ];

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newFamilyMember, setNewFamilyMember] = useState({
    relationship: "Father",
    name: "",
    age: "",
    medicalHistory: "",
    healthStatus: "",
  });

  const handleChange = (key) => (e) => {
    console.log(`Updating medical.${key} to:`, e.target.value);
    updateFormData("medical", key, e.target.value);
  };

  // Get medical data from formData
  const medical = formData.medical || {};
  const familyMedicalHistory = formData.familyMedicalHistory || [];

  const updateFamilyMember = (index, field, value) => {
    console.log(`Updating family member ${index}, field ${field} to:`, value);
    updateFormData("familyMedicalHistory", { index, field }, value);
  };

  const openAddMemberModal = () => {
    setNewFamilyMember({
      relationship: "Father",
      name: "",
      age: "",
      medicalHistory: "",
      healthStatus: "",
    });
    setIsAddModalOpen(true);
  };

  const handleNewMemberChange = (field) => (e) => {
    setNewFamilyMember((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const saveNewFamilyMember = () => {
    setFormData((prev) => ({
      ...prev,
      familyMedicalHistory: [
        ...(prev.familyMedicalHistory || []),
        {
          relationship: newFamilyMember.relationship || "Other",
          name: newFamilyMember.name,
          age: newFamilyMember.age,
          medicalHistory: newFamilyMember.medicalHistory,
          healthStatus: newFamilyMember.healthStatus,
        },
      ],
    }));
    setIsAddModalOpen(false);
  };

  const closeAddMemberModal = () => {
    setIsAddModalOpen(false);
  };

  const removeFamilyMember = (index) => {
    setFormData((prev) => ({
      ...prev,
      familyMedicalHistory: (prev.familyMedicalHistory || []).filter(
        (_, idx) => idx !== index,
      ),
    }));
  };

  // Debug logging
  useEffect(() => {
    console.log("MedicalDetails - Family History Data:", familyMedicalHistory);
  }, [familyMedicalHistory]);

  return (
    <Section
      number={4}
      title="Personal Medical Details and Family Medical History"
    >
      <style>{`
        .family-medical-table-wrapper {
          margin: 20px 0;
          overflow-x: auto;
        }
        .family-medical-table {
          width: 100%;
          border-collapse: collapse;
          background: var(--white);
        }
        .family-medical-table th {
          background: var(--navy);
          color: white;
          padding: 12px;
          text-align: left;
          font-size: 12px;
          font-weight: 600;
          border: 1px solid var(--border);
        }
        .family-medical-table td {
          padding: 8px;
          border: 1px solid var(--border);
          background: var(--white);
        }
        .family-medical-table input {
          width: 100%;
          padding: 8px;
          border: 1px solid var(--border-dark);
          border-radius: 4px;
          background: var(--input-bg);
          color: var(--text);
          font-size: 12px;
          font-family: inherit;
          box-sizing: border-box;
        }
        .family-medical-table input:focus {
          outline: none;
          border-color: var(--gold);
          box-shadow: 0 0 0 2px rgba(184, 146, 42, 0.2);
        }
        .family-medical-table input:hover {
          border-color: var(--gold);
        }
        .family-medical-table .relationship-cell {
          font-weight: 600;
          color: var(--text);
          background: var(--tbl-head);
        }
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.45);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          padding: 20px;
        }
        .modal-card {
          width: min(560px, 100%);
          background: var(--white);
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
          padding: 28px;
          position: relative;
        }
        .modal-card h3 {
          margin: 0 0 16px;
          font-size: 20px;
          color: var(--navy);
        }
        .modal-card .modal-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }
        .modal-card .modal-row.full {
          grid-column: 1 / -1;
        }
        .modal-card label {
          display: block;
          margin-bottom: 6px;
          font-size: 12px;
          font-weight: 600;
          color: var(--text);
        }
        .modal-card input,
        .modal-card select,
        .modal-card textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid var(--border-dark);
          border-radius: 6px;
          background: var(--input-bg);
          font: inherit;
          font-size: 13px;
          color: var(--text);
        }
        .modal-card textarea {
          min-height: 72px;
          resize: vertical;
        }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 12px;
        }
        .modal-actions button {
          min-width: 110px;
          padding: 10px 14px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-weight: 600;
        }
        .modal-actions .cancel-btn {
          background: #f0f0f0;
          color: var(--text);
        }
        .modal-actions .save-btn {
          background: var(--gold);
          color: #111;
        }
      `}</style>

      <div className="sub-header">Personal Medical Details</div>

      <FormRow>
        <FormCell label="Weight">
          <Input
            value={medical.weight || ""}
            onChange={handleChange("weight")}
            placeholder="Enter weight"
          />
        </FormCell>
        <FormCell label="Height">
          <Input
            value={medical.height || ""}
            onChange={handleChange("height")}
            placeholder="Enter height"
          />
        </FormCell>
      </FormRow>

      <FormRow>
        <FormCell
          className="cell-full"
          label="Do you exercise? If Yes, please give details"
        >
          <Input
            value={medical.exercise || ""}
            onChange={handleChange("exercise")}
            placeholder="e.g., Running 3x per week"
          />
        </FormCell>
      </FormRow>

      <FormRow>
        <FormCell
          className="cell-full"
          isRed
          label="Any health disorders (Please provide full details)"
        >
          <Textarea
            rows={2}
            value={medical.disorders || ""}
            onChange={handleChange("disorders")}
            placeholder="Describe any health disorders..."
          />
        </FormCell>
      </FormRow>

      <FormRow>
        <FormCell className="cell-full" isRed label="Any medication taken">
          <Input
            value={medical.medication || ""}
            onChange={handleChange("medication")}
            placeholder="List any medications"
          />
        </FormCell>
      </FormRow>

      <FormRow>
        <FormCell className="cell-2" label="Family Physician">
          <Input
            value={medical.familyPhysician || ""}
            onChange={handleChange("familyPhysician")}
            placeholder="Doctor's name"
          />
        </FormCell>
        <FormCell className="cell-2" label="Physician Address">
          <Input
            value={medical.physicianAddress || ""}
            onChange={handleChange("physicianAddress")}
            placeholder="Doctor's address"
          />
        </FormCell>
      </FormRow>

      <FormRow>
        <FormCell label="Telephone No.">
          <Input
            value={medical.physicianPhone || ""}
            onChange={handleChange("physicianPhone")}
            placeholder="Phone number"
          />
        </FormCell>
        <FormCell label="No. of Years Attended">
          <Input
            value={medical.yearsAttended || ""}
            onChange={handleChange("yearsAttended")}
            placeholder="Years"
          />
        </FormCell>
        <FormCell className="cell-2" label="Last Visited (Date & Reason)">
          <Input
            value={medical.lastVisit || ""}
            onChange={handleChange("lastVisit")}
            placeholder="Date and reason"
          />
        </FormCell>
      </FormRow>

      <div className="sub-header-row">
        <div className="sub-header">Family Medical History</div>
        <button
          type="button"
          className="add-row-btn"
          onClick={openAddMemberModal}
        >
          + Add Family Member
        </button>
      </div>

      <div className="family-medical-table-wrapper">
        <table className="family-medical-table">
          <thead>
            <tr>
              <th style={{ width: "140px" }}>Relationship</th>
              <th>Name</th>
              <th style={{ width: "80px" }}>Age</th>
              <th>Medical History</th>
              <th>Current Health Status</th>
              <th style={{ width: "110px" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {familyMedicalHistory.map((memberData, idx) => {
              const relationship = memberData.relationship || "";
              return (
                <tr key={idx}>
                  <td className="relationship-cell">
                    <span>{relationship || "Relationship"}</span>
                  </td>
                  <td>
                    <input
                      type="text"
                      value={memberData.name || ""}
                      onChange={(e) =>
                        updateFamilyMember(idx, "name", e.target.value)
                      }
                      placeholder="Name"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={memberData.age || ""}
                      onChange={(e) =>
                        updateFamilyMember(idx, "age", e.target.value)
                      }
                      placeholder="Age"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={memberData.medicalHistory || ""}
                      onChange={(e) =>
                        updateFamilyMember(
                          idx,
                          "medicalHistory",
                          e.target.value,
                        )
                      }
                      placeholder="Medical conditions"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={memberData.healthStatus || ""}
                      onChange={(e) =>
                        updateFamilyMember(idx, "healthStatus", e.target.value)
                      }
                      placeholder="Current health status"
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="remove-row-btn"
                      onClick={() => removeFamilyMember(idx)}
                      disabled={familyMedicalHistory.length <= 1}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isAddModalOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h3>Add Family Member</h3>
            <div className="modal-row">
              <label htmlFor="relationship-select">Relationship</label>
              <select
                id="relationship-select"
                value={newFamilyMember.relationship}
                onChange={handleNewMemberChange("relationship")}
              >
                {familyMembers.map((relationship) => (
                  <option key={relationship} value={relationship}>
                    {relationship}
                  </option>
                ))}
              </select>
            </div>
            <div className="modal-row">
              <div>
                <label htmlFor="family-member-name">Name</label>
                <input
                  id="family-member-name"
                  type="text"
                  value={newFamilyMember.name}
                  onChange={handleNewMemberChange("name")}
                  placeholder="Enter name"
                />
              </div>
              <div>
                <label htmlFor="family-member-age">Age</label>
                <input
                  id="family-member-age"
                  type="text"
                  value={newFamilyMember.age}
                  onChange={handleNewMemberChange("age")}
                  placeholder="Enter age"
                />
              </div>
            </div>
            <div className="modal-row full">
              <label htmlFor="family-member-medical">Medical History</label>
              <textarea
                id="family-member-medical"
                value={newFamilyMember.medicalHistory}
                onChange={handleNewMemberChange("medicalHistory")}
                placeholder="Describe medical conditions"
              />
            </div>
            <div className="modal-row full">
              <label htmlFor="family-member-health">
                Current Health Status
              </label>
              <textarea
                id="family-member-health"
                value={newFamilyMember.healthStatus}
                onChange={handleNewMemberChange("healthStatus")}
                placeholder="Describe current health status"
              />
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={closeAddMemberModal}
              >
                Cancel
              </button>
              <button
                type="button"
                className="save-btn"
                onClick={saveNewFamilyMember}
              >
                Save Member
              </button>
            </div>
          </div>
        </div>
      )}
    </Section>
  );
}

import React, { useEffect } from "react";
import Section from "../../components/Section";
import FormRow from "../../components/FormRow";
import FormCell from "../../components/FormCell";
import Input from "../../components/Input";
import Textarea from "../../components/Textarea";
import { useForm } from "../../context/FormContext";

export default function MedicalDetails() {
  const { formData, updateFormData } = useForm();

  const familyMembers = [
    "Father",
    "Mother",
    "Brother",
    "Sister",
    "Brother 1",
    "Sister 1",
    "Spouse",
  ];

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

      <div className="sub-header">Family Medical History</div>

      <div className="family-medical-table-wrapper">
        <table className="family-medical-table">
          <thead>
            <tr>
              <th style={{ width: "140px" }}>Relationship</th>
              <th>Name</th>
              <th style={{ width: "80px" }}>Age</th>
              <th>Medical History</th>
              <th>Current Health Status</th>
            </tr>
          </thead>
          <tbody>
            {familyMembers.map((member, idx) => {
              const memberData = familyMedicalHistory[idx] || {};
              return (
                <tr key={idx}>
                  <td className="relationship-cell">{member}</td>
                  <td>
                    <input
                      type="text"
                      value={memberData.name || ""}
                      onChange={(e) =>
                        updateFamilyMember(idx, "name", e.target.value)
                      }
                      placeholder={`${member}'s name`}
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
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

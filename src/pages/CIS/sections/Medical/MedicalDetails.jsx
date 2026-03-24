import React, { useEffect } from "react";
import Section from "../../components/Section";
import FormRow from "../../components/FormRow";
import FormCell from "../../components/FormCell";
import Input from "../../components/Input";
import Textarea from "../../components/Textarea";
import TableHeader from "../../components/TableHeader";
import TableRow from "../../components/TableRow";
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

  const handleFamilyChange = (index, field) => (e) => {
    const updatedHistory = [...formData.familyMedicalHistory];
    if (!updatedHistory[index]) {
      updatedHistory[index] = {
        relationship: familyMembers[index],
        name: "",
        age: "",
        medicalHistory: "",
        healthStatus: "",
      };
    }
    updatedHistory[index][field] = e.target.value;
    updateFormData("familyMedicalHistory", updatedHistory);
  };

  const gridLayout = "140px 1.2fr 70px 1.8fr 1.5fr";

  // Get medical data from formData
  const medical = formData.medical || {};

  // Debug: Log medical data on each render
  useEffect(() => {
    console.log("MedicalDetails - Current medical data:", medical);
  }, [medical]);

  

  return (
    <Section
      number={4}
      title="Personal Medical Details and Family Medical History"
    >
      <style>{`
        .medical-table-container .table-header,
        .medical-table-container .table-row {
          display: grid !important;
          grid-template-columns: ${gridLayout} !important;
          width: 100% !important;
          padding: 0 !important;
          align-items: stretch;
        }
        .medical-table-container .table-header span,
        .medical-table-container .table-cell {
          flex: none !important;
          width: auto !important;
          display: flex;
          align-items: center;
          padding: 10px 12px !important;
          border-right: 1px solid var(--border) !important;
          box-sizing: border-box;
          min-height: 42px;
        }
      `}</style>

      <div className="sub-header">Personal Medical Details</div>

      <FormRow>
        <FormCell label="Weight">
          <Input
            value={medical.weight || ""}
            onChange={handleChange("weight")}
          />
        </FormCell>
        <FormCell label="Height">
          <Input
            value={medical.height || ""}
            onChange={handleChange("height")}
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
          />
        </FormCell>
      </FormRow>

      <FormRow>
        <FormCell className="cell-full" isRed label="Any medication taken">
          <Input
            value={medical.medication || ""}
            onChange={handleChange("medication")}
          />
        </FormCell>
      </FormRow>

      <FormRow>
        <FormCell className="cell-2" label="Family Physician">
          <Input
            value={medical.familyPhysician || ""}
            onChange={handleChange("familyPhysician")}
          />
        </FormCell>
        <FormCell className="cell-2" label="Physician Address">
          <Input
            value={medical.physicianAddress || ""}
            onChange={handleChange("physicianAddress")}
          />
        </FormCell>
      </FormRow>

      <FormRow>
        <FormCell label="Telephone No.">
          <Input
            value={medical.physicianPhone || ""}
            onChange={handleChange("physicianPhone")}
          />
        </FormCell>
        <FormCell label="No. of Years Attended">
          <Input
            value={medical.yearsAttended || ""}
            onChange={handleChange("yearsAttended")}
          />
        </FormCell>
        <FormCell className="cell-2" label="Last Visited (Date & Reason)">
          <Input
            value={medical.lastVisit || ""}
            onChange={handleChange("lastVisit")}
          />
        </FormCell>
      </FormRow>

      <div className="sub-header">Family Medical History</div>
      <div className="medical-table-container">
        <TableHeader
          spans={[
            { text: "Relationship" },
            { text: "Name" },
            { text: "Age" },
            { text: "Medical History" },
            { text: "Current Health Status" },
          ]}
        />
        {familyMembers.map((member, idx) => {
          const memberData = formData.familyMedicalHistory?.[idx] || {};
          return (
            <TableRow
              key={idx}
              cells={[
                { content: <span className="rel-label">{member}</span> },
                {
                  content: (
                    <Input
                      value={memberData.name || ""}
                      onChange={(e) => {
                        const updatedHistory = [
                          ...formData.familyMedicalHistory,
                        ];
                        if (!updatedHistory[idx]) {
                          updatedHistory[idx] = {
                            relationship: member,
                            name: "",
                            age: "",
                            medicalHistory: "",
                            healthStatus: "",
                          };
                        }
                        updatedHistory[idx].name = e.target.value;
                        updateFormData("familyMedicalHistory", updatedHistory);
                      }}
                    />
                  ),
                },
                {
                  content: (
                    <Input
                      value={memberData.age || ""}
                      onChange={(e) => {
                        const updatedHistory = [
                          ...formData.familyMedicalHistory,
                        ];
                        if (!updatedHistory[idx]) {
                          updatedHistory[idx] = {
                            relationship: member,
                            name: "",
                            age: "",
                            medicalHistory: "",
                            healthStatus: "",
                          };
                        }
                        updatedHistory[idx].age = e.target.value;
                        updateFormData("familyMedicalHistory", updatedHistory);
                      }}
                    />
                  ),
                },
                {
                  content: (
                    <Input
                      value={memberData.medicalHistory || ""}
                      onChange={(e) => {
                        const updatedHistory = [
                          ...formData.familyMedicalHistory,
                        ];
                        if (!updatedHistory[idx]) {
                          updatedHistory[idx] = {
                            relationship: member,
                            name: "",
                            age: "",
                            medicalHistory: "",
                            healthStatus: "",
                          };
                        }
                        updatedHistory[idx].medicalHistory = e.target.value;
                        updateFormData("familyMedicalHistory", updatedHistory);
                      }}
                    />
                  ),
                },
                {
                  content: (
                    <Input
                      value={memberData.healthStatus || ""}
                      onChange={(e) => {
                        const updatedHistory = [
                          ...formData.familyMedicalHistory,
                        ];
                        if (!updatedHistory[idx]) {
                          updatedHistory[idx] = {
                            relationship: member,
                            name: "",
                            age: "",
                            medicalHistory: "",
                            healthStatus: "",
                          };
                        }
                        updatedHistory[idx].healthStatus = e.target.value;
                        updateFormData("familyMedicalHistory", updatedHistory);
                      }}
                    />
                  ),
                },
              ]}
            />
          );
        })}
      </div>
    </Section>
  );
}

import React from "react";
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
    updateFormData(key, e.target.value);
  };

  const handleFamilyChange = (member, field) => (e) => {
    const memberKey = member.replace(/\s+/g, "");
    updateFormData(`family_${memberKey}_${field}`, e.target.value);
  };

  const gridLayout = "140px 1.2fr 70px 1.8fr 1.5fr";

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
            value={formData.weight || ""}
            onChange={handleChange("weight")}
          />
        </FormCell>
        <FormCell label="Height">
          <Input
            value={formData.height || ""}
            onChange={handleChange("height")}
          />
        </FormCell>
      </FormRow>

      <FormRow>
        <FormCell
          className="cell-full"
          label="Do you exercise? If Yes, please give details"
        >
          {/* UPDATED KEY: exercise_details */}
          <Input
            value={formData.exercise_details || ""}
            onChange={handleChange("exercise_details")}
          />
        </FormCell>
      </FormRow>

      <FormRow>
        <FormCell
          className="cell-full"
          isRed
          label="Any health disorders (Please provide full details)"
        >
          {/* UPDATED KEY: health_disorders (This was the issue) */}
          <Textarea
            rows={2}
            value={formData.health_disorders || ""}
            onChange={handleChange("health_disorders")}
          />
        </FormCell>
      </FormRow>

      <FormRow>
        <FormCell className="cell-full" isRed label="Any medication taken">
          <Input
            value={formData.medications || ""}
            onChange={handleChange("medications")}
          />
        </FormCell>
      </FormRow>

      <FormRow>
        <FormCell className="cell-2" label="Family Physician">
          <Input
            value={formData.physician_name || ""}
            onChange={handleChange("physician_name")}
          />
        </FormCell>
        <FormCell className="cell-2" label="Physician Address">
          <Input
            value={formData.physician_address || ""}
            onChange={handleChange("physician_address")}
          />
        </FormCell>
      </FormRow>

      <FormRow>
        <FormCell label="Telephone No.">
          <Input
            value={formData.physician_phone || ""}
            onChange={handleChange("physician_phone")}
          />
        </FormCell>
        <FormCell label="No. of Years Attended">
          <Input
            value={formData.years_attended || ""}
            onChange={handleChange("years_attended")}
          />
        </FormCell>
        <FormCell className="cell-2" label="Last Visited (Date & Reason)">
          <Input
            value={formData.last_visit_details || ""}
            onChange={handleChange("last_visit_details")}
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
        {familyMembers.map((member, idx) => (
          <TableRow
            key={idx}
            cells={[
              { content: <span className="rel-label">{member}</span> },
              {
                content: (
                  <Input
                    value={
                      formData[`family_${member.replace(/\s+/g, "")}_name`] ||
                      ""
                    }
                    onChange={handleFamilyChange(member, "name")}
                  />
                ),
              },
              {
                content: (
                  <Input
                    value={
                      formData[`family_${member.replace(/\s+/g, "")}_age`] || ""
                    }
                    onChange={handleFamilyChange(member, "age")}
                  />
                ),
              },
              {
                content: (
                  <Input
                    value={
                      formData[
                        `family_${member.replace(/\s+/g, "")}_history`
                      ] || ""
                    }
                    onChange={handleFamilyChange(member, "history")}
                  />
                ),
              },
              {
                content: (
                  <Input
                    value={
                      formData[`family_${member.replace(/\s+/g, "")}_status`] ||
                      ""
                    }
                    onChange={handleFamilyChange(member, "status")}
                  />
                ),
              },
            ]}
          />
        ))}
      </div>
    </Section>
  );
}

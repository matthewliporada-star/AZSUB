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

  // Helper for family table to keep keys clean
  const handleFamilyChange = (member, field) => (e) => {
    updateFormData(
      `family_${member.replace(/\s+/g, "")}_${field}`,
      e.target.value,
    );
  };

  return (
    <Section
      number={4}
      title="Personal Medical Details and Family Medical History"
    >
      <div className="sub-header">Personal Medical Details</div>
      <FormRow>
        <FormCell label="Weight">
          <Input
            placeholder="e.g. 75 kg"
            value={formData.weight || ""}
            onChange={handleChange("weight")}
          />
        </FormCell>
        <FormCell label="Height">
          <Input
            placeholder="e.g. 175 cm"
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
          <Input
            value={formData.exerciseDetails || ""}
            onChange={handleChange("exerciseDetails")}
          />
        </FormCell>
      </FormRow>
      <FormRow>
        <FormCell
          className="cell-full"
          isRed
          label="Any health disorders — Full details"
        >
          <Textarea
            rows={2}
            value={formData.healthDisorders || ""}
            onChange={handleChange("healthDisorders")}
          />
        </FormCell>
      </FormRow>
      <FormRow>
        <FormCell
          className="cell-full"
          isRed
          label="Any medication taken — Please specify"
        >
          <Input
            value={formData.medications || ""}
            onChange={handleChange("medications")}
          />
        </FormCell>
      </FormRow>
      <FormRow>
        <FormCell
          className="cell-2"
          label="Family Physician / Last Visited Doctor"
        >
          <Input
            value={formData.physicianName || ""}
            onChange={handleChange("physicianName")}
          />
        </FormCell>
        <FormCell className="cell-2" label="Physician Address">
          <Input
            value={formData.physicianAddress || ""}
            onChange={handleChange("physicianAddress")}
          />
        </FormCell>
      </FormRow>
      <FormRow>
        <FormCell label="Telephone No.">
          <Input
            type="tel"
            value={formData.physicianPhone || ""}
            onChange={handleChange("physicianPhone")}
          />
        </FormCell>
        <FormCell label="No. of Years Attended">
          <Input
            value={formData.yearsAttended || ""}
            onChange={handleChange("yearsAttended")}
          />
        </FormCell>
        <FormCell className="cell-2" label="Last Visited (Date & Reason)">
          <Input
            placeholder="DD-MM-YYYY / Reason"
            value={formData.lastVisitDetails || ""}
            onChange={handleChange("lastVisitDetails")}
          />
        </FormCell>
      </FormRow>

      <div className="sub-header">Family Medical History</div>
      <TableHeader
        spans={[
          { text: "Relationship", style: { flex: "0.8" } },
          { text: "Name" },
          { text: "Age", style: { flex: "0.5" } },
          { text: "Medical History", style: { flex: "1.5" } },
          { text: "Current Health Status" },
        ]}
      />
      {familyMembers.map((member, idx) => (
        <TableRow
          key={idx}
          cells={[
            {
              content: <span className="rel-label">{member}</span>,
              style: { flex: "0.8" },
            },
            {
              content: (
                <Input
                  value={
                    formData[`family_${member.replace(/\s+/g, "")}_name`] || ""
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
              style: { flex: "0.5" },
            },
            {
              content: (
                <Input
                  value={
                    formData[`family_${member.replace(/\s+/g, "")}_history`] ||
                    ""
                  }
                  onChange={handleFamilyChange(member, "history")}
                />
              ),
              style: { flex: "1.5" },
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
    </Section>
  );
}

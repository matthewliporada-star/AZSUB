import React from "react";
import Section from "../../components/Section";
import FormRow from "../../components/FormRow";
import FormCell from "../../components/FormCell";
import Input from "../../components/Input";
import Textarea from "../../components/Textarea";
import TableHeader from "../../components/TableHeader";
import TableRow from "../../components/TableRow";

export default function MedicalDetails() {
  const familyMembers = [
    "Father",
    "Mother",
    "Brother",
    "Sister",
    "Brother 1",
    "Sister 1",
    "Spouse",
  ];
  return (
    <Section
      number={4}
      title="Personal Medical Details and Family Medical History"
    >
      <div className="sub-header">Personal Medical Details</div>
      <FormRow>
        <FormCell label="Weight">
          <Input placeholder="e.g. 75 kg" />
        </FormCell>
        <FormCell label="Height">
          <Input placeholder="e.g. 175 cm" />
        </FormCell>
      </FormRow>
      <FormRow>
        <FormCell
          className="cell-full"
          label="Do you exercise? If Yes, please give details"
        >
          <Input />
        </FormCell>
      </FormRow>
      <FormRow>
        <FormCell
          className="cell-full"
          isRed
          label="Any health disorders — Please provide full details with last medical report"
        >
          <Textarea rows={2} />
        </FormCell>
      </FormRow>
      <FormRow>
        <FormCell
          className="cell-full"
          isRed
          label="Any medication taken — Please specify"
        >
          <Input />
        </FormCell>
      </FormRow>
      <FormRow>
        <FormCell
          className="cell-2"
          label="Name of Family Physician / Last Visited Doctor or Specialist"
        >
          <Input />
        </FormCell>
        <FormCell className="cell-2" label="Physician Address">
          <Input />
        </FormCell>
      </FormRow>
      <FormRow>
        <FormCell label="Telephone No.">
          <Input type="tel" />
        </FormCell>
        <FormCell label="No. of Years Attended">
          <Input />
        </FormCell>
        <FormCell className="cell-2" label="Last Visited (Date & Reason)">
          <Input placeholder="DD-MM-YYYY / Reason" />
        </FormCell>
      </FormRow>
      <div className="sub-header">
        {" "}
        Family Medical History (mention all family members){" "}
      </div>
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
            { content: <Input /> },
            { content: <Input />, style: { flex: "0.5" } },
            { content: <Input />, style: { flex: "1.5" } },
            { content: <Input /> },
          ]}
        />
      ))}
    </Section>
  );
}

import React from "react";
import Section from "../../components/Section";
import TableHeader from "../../components/TableHeader";
import TableRow from "../../components/TableRow";
import Input from "../../components/Input";
import Select from "../../components/Select";

export default function PolicyBeneficiary() {
  const rows = 3;
  return (
    <Section number={11} title="Policy Beneficiary" isTable>
      <div className="table-header">
        <span style={{ flex: "1.5" }}>Name</span>
        <span>Primary or Contingent</span>
        <span style={{ flex: "1.5" }}>Relationship to Proposed Insured</span>
        <span>Date of Birth</span>
        <span>Passport No.</span>
        <span>Allocated Share (%)</span>
      </div>
      {[...Array(rows)].map((_, idx) => (
        <TableRow
          key={idx}
          cells={[
            { content: <Input />, style: { flex: "1.5" } },
            { content: <Select options={["Primary", "Contingent"]} /> },

            { content: <Input />, style: { flex: "1.5" } },
            { content: <Input placeholder="DD-MM-YYYY" /> },
            { content: <Input /> },
            { content: <Input placeholder="%" /> },
          ]}
        />
      ))}
    </Section>
  );
}

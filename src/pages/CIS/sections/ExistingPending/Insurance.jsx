import React from "react";
import Section from "../../components/Section";
import TableHeader from "../../components/TableHeader";
import TableRow from "../../components/TableRow";
import Input from "../../components/Input";
import Select from "../../components/Select";

export default function Insurance() {
  const rows = 3;
  return (
    <Section number={5} title="Existing or Pending Insurance" isTable>
      <div className="table-wrap">
        <TableHeader
          spans={[
            { text: "Name of Insurance Co." },
            { text: "Type of Insurance" },
            { text: "Country & Year of Issue" },
            { text: "Amount of Cover" },
            { text: "Premium" },
          ]}
        />
        {[...Array(rows)].map((_, idx) => (
          <TableRow
            key={idx}
            cells={[
              { content: <Input /> },
              { content: <Input /> },
              { content: <Input /> },
              { content: <Input /> },
              { content: <Input /> },
            ]}
          />
        ))}
      </div>
    </Section>
  );
}

// sections/TravelDetails.jsx
import React from "react";
import Section from "../../components/Section";
import Input from "../../components/Input";
import TableHeader from "../../components/TableHeader";
import TableRow from "../../components/TableRow";

export default function TravelDetails() {
  const rows = 3;
  return (
    <Section number={2} title="Travel Details" isTable>
      <div className="table-wrap">
        <TableHeader
          spans={[
            { text: "Country" },
            { text: "City" },
            { text: "Length of Stay" },
            { text: "Frequency" },
            { text: "Date of Travel" },
            { text: "Reason" },
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
              { content: <Input /> },
            ]}
          />
        ))}
      </div>
    </Section>
  );
}
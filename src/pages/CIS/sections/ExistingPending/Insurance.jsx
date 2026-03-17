import React from "react";
import Section from "../../components/Section";
import TableHeader from "../../components/TableHeader";
import TableRow from "../../components/TableRow";
import Input from "../../components/Input";
import { useForm } from "../../context/FormContext";

export default function Insurance() {
  const { formData, updateFormData } = useForm();
  const rows = 3;

  const handleTableChange = (rowIdx, field) => (e) => {
    updateFormData(`insurance_${field}_${rowIdx}`, e.target.value);
  };

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
              {
                content: (
                  <Input
                    value={formData[`insurance_company_${idx}`]}
                    onChange={handleTableChange(idx, "company")}
                  />
                ),
              },
              {
                content: (
                  <Input
                    value={formData[`insurance_type_${idx}`]}
                    onChange={handleTableChange(idx, "type")}
                  />
                ),
              },
              {
                content: (
                  <Input
                    value={formData[`insurance_year_${idx}`]}
                    onChange={handleTableChange(idx, "year")}
                  />
                ),
              },
              {
                content: (
                  <Input
                    value={formData[`insurance_cover_${idx}`]}
                    onChange={handleTableChange(idx, "cover")}
                  />
                ),
              },
              {
                content: (
                  <Input
                    value={formData[`insurance_premium_${idx}`]}
                    onChange={handleTableChange(idx, "premium")}
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

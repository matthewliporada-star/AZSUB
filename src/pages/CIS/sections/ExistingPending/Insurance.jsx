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
    const newInsurance = [...(formData.insurance || [])];
    if (!newInsurance[rowIdx]) {
      newInsurance[rowIdx] = {};
    }
    newInsurance[rowIdx][field] = e.target.value;
    updateFormData("insurance", newInsurance);
  };

  const insurance = formData.insurance || [];

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
                    value={insurance[idx]?.company || ""}
                    onChange={handleTableChange(idx, "company")}
                  />
                ),
              },
              {
                content: (
                  <Input
                    value={insurance[idx]?.type || ""}
                    onChange={handleTableChange(idx, "type")}
                  />
                ),
              },
              {
                content: (
                  <Input
                    value={insurance[idx]?.countryYear || ""}
                    onChange={handleTableChange(idx, "countryYear")}
                  />
                ),
              },
              {
                content: (
                  <Input
                    value={insurance[idx]?.amount || ""}
                    onChange={handleTableChange(idx, "amount")}
                  />
                ),
              },
              {
                content: (
                  <Input
                    value={insurance[idx]?.premium || ""}
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

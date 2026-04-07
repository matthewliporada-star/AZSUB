import React from "react";
import Section from "../../components/Section";
import TableHeader from "../../components/TableHeader";
import TableRow from "../../components/TableRow";
import Input from "../../components/Input";
import { useForm } from "../../context/FormContext";

export default function Insurance() {
  const { formData, setFormData, updateFormData } = useForm();
  const insurance = formData.insurance || [];

  const handleTableChange = (rowIdx, field) => (e) => {
    updateFormData("insurance", { index: rowIdx, field }, e.target.value);
  };

  const addRow = () => {
    setFormData((prev) => ({
      ...prev,
      insurance: [
        ...(prev.insurance || []),
        {
          company: "",
          type: "",
          countryYear: "",
          amount: "",
          premium: "",
        },
      ],
    }));
  };

  const removeRow = (rowIdx) => {
    setFormData((prev) => ({
      ...prev,
      insurance: (prev.insurance || []).filter((_, index) => index !== rowIdx),
    }));
  };

  return (
    <Section
      number={5}
      title="Existing or Pending Insurance"
      isTable
      action={
        <button type="button" className="add-row-btn" onClick={addRow}>
          + Add Insurance
        </button>
      }
    >
      <div className="table-wrap">
        <TableHeader
          spans={[
            { text: "Name of Insurance Co." },
            { text: "Type of Insurance" },
            { text: "Country & Year of Issue" },
            { text: "Amount of Cover" },
            { text: "Premium" },
            { text: "Action" },
          ]}
        />
        {insurance.map((row, idx) => (
          <TableRow
            key={idx}
            cells={[
              {
                content: (
                  <Input
                    value={row.company || ""}
                    onChange={handleTableChange(idx, "company")}
                  />
                ),
              },
              {
                content: (
                  <Input
                    value={row.type || ""}
                    onChange={handleTableChange(idx, "type")}
                  />
                ),
              },
              {
                content: (
                  <Input
                    value={row.countryYear || ""}
                    onChange={handleTableChange(idx, "countryYear")}
                  />
                ),
              },
              {
                content: (
                  <Input
                    value={row.amount || ""}
                    onChange={handleTableChange(idx, "amount")}
                  />
                ),
              },
              {
                content: (
                  <Input
                    value={row.premium || ""}
                    onChange={handleTableChange(idx, "premium")}
                  />
                ),
              },
              {
                content: (
                  <button
                    type="button"
                    className="remove-row-btn"
                    onClick={() => removeRow(idx)}
                    disabled={insurance.length <= 1}
                  >
                    Remove
                  </button>
                ),
              },
            ]}
          />
        ))}
      </div>
    </Section>
  );
}

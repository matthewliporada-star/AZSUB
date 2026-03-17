import React from "react";
import Section from "../../components/Section";
import TableRow from "../../components/TableRow";
import Input from "../../components/Input";
import Select from "../../components/Select";
import { useForm } from "../../context/FormContext";

export default function PolicyBeneficiary() {
  const { formData, updateFormData } = useForm();
  const rows = 3;

  const handleChange = (key, val) => updateFormData(key, val);

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
            {
              content: (
                <Input
                  value={formData[`bene_${idx}_name`] || ""}
                  onChange={(e) =>
                    handleChange(`bene_${idx}_name`, e.target.value)
                  }
                />
              ),
              style: { flex: "1.5" },
            },
            {
              content: (
                <Select
                  options={["Primary", "Contingent"]}
                  value={formData[`bene_${idx}_type`] || ""}
                  onChange={(e) =>
                    handleChange(`bene_${idx}_type`, e.target.value)
                  }
                />
              ),
            },
            {
              content: (
                <Input
                  value={formData[`bene_${idx}_rel`] || ""}
                  onChange={(e) =>
                    handleChange(`bene_${idx}_rel`, e.target.value)
                  }
                />
              ),
              style: { flex: "1.5" },
            },
            {
              content: (
                <Input
                  placeholder="DD-MM-YYYY"
                  value={formData[`bene_${idx}_dob`] || ""}
                  onChange={(e) =>
                    handleChange(`bene_${idx}_dob`, e.target.value)
                  }
                />
              ),
            },
            {
              content: (
                <Input
                  value={formData[`bene_${idx}_passport`] || ""}
                  onChange={(e) =>
                    handleChange(`bene_${idx}_passport`, e.target.value)
                  }
                />
              ),
            },
            {
              content: (
                <Input
                  placeholder="%"
                  value={formData[`bene_${idx}_share`] || ""}
                  onChange={(e) =>
                    handleChange(`bene_${idx}_share`, e.target.value)
                  }
                />
              ),
            },
          ]}
        />
      ))}
    </Section>
  );
}

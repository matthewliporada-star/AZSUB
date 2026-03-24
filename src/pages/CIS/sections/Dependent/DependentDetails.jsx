import React from "react";
import Section from "../../components/Section";
import FormRow from "../../components/FormRow";
import FormCell from "../../components/FormCell";
import Input from "../../components/Input";
import { useForm } from "../../context/FormContext";

export default function DependentDetails() {
  const { formData, updateFormData } = useForm();
  const dependents = formData.dependentDetails || [];

  const handleChange = (idx, field, value) => {
    const newDependents = [...dependents];
    if (!newDependents[idx]) {
      newDependents[idx] = {};
    }
    newDependents[idx][field] = value;
    updateFormData("dependentDetails", newDependents);
  };

  return (
    <Section number={13} title="Dependent Details">
      {[0, 1].map((num) => {
        const dep = dependents[num] || {};
        return (
          <React.Fragment key={num}>
            <div className="sub-header">Dependent {num + 1}</div>
            <FormRow>
              <FormCell className="cell-2" label={`Dependent Name`}>
                <Input
                  value={dep.name || ""}
                  onChange={(e) => handleChange(num, "name", e.target.value)}
                />
              </FormCell>
              <FormCell label="Relationship">
                <Input
                  value={dep.relationship || ""}
                  onChange={(e) =>
                    handleChange(num, "relationship", e.target.value)
                  }
                />
              </FormCell>
            </FormRow>
            <FormRow>
              <FormCell label="Nationality">
                <Input
                  value={dep.nationality || ""}
                  onChange={(e) =>
                    handleChange(num, "nationality", e.target.value)
                  }
                />
              </FormCell>
              <FormCell label="Date of Birth">
                <Input
                  placeholder="DD-MM-YYYY"
                  value={dep.dateOfBirth || ""}
                  onChange={(e) =>
                    handleChange(num, "dateOfBirth", e.target.value)
                  }
                />
              </FormCell>
            </FormRow>
          </React.Fragment>
        );
      })}
    </Section>
  );
}

import React from "react";
import Section from "../../components/Section";
import FormRow from "../../components/FormRow";
import FormCell from "../../components/FormCell";
import Input from "../../components/Input";
import { useForm } from "../../context/FormContext";

export default function DependentDetails() {
  const { formData, setFormData, updateFormData } = useForm();
  const dependents = formData.dependentDetails || [];

  const handleChange = (idx, field, value) => {
    updateFormData("dependentDetails", { index: idx, field }, value);
  };

  const addDependent = () => {
    setFormData((prev) => ({
      ...prev,
      dependentDetails: [
        ...(prev.dependentDetails || []),
        {
          name: "",
          relationship: "",
          nationality: "",
          dateOfBirth: "",
        },
      ],
    }));
  };

  const removeDependent = (idx) => {
    setFormData((prev) => ({
      ...prev,
      dependentDetails: (prev.dependentDetails || []).filter(
        (_, index) => index !== idx,
      ),
    }));
  };

  return (
    <Section
      number={13}
      title="Dependent Details"
      action={
        <button type="button" className="add-row-btn" onClick={addDependent}>
          + Add Dependent
        </button>
      }
    >
      {dependents.map((dep, num) => (
        <React.Fragment key={num}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            <div className="sub-header">Dependent {num + 1}</div>
            {dependents.length > 1 && (
              <button
                type="button"
                className="remove-row-btn"
                onClick={() => removeDependent(num)}
              >
                Remove
              </button>
            )}
          </div>
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
      ))}
    </Section>
  );
}

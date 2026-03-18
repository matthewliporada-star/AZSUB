import React from "react";
import Section from "../../components/Section";
import FormRow from "../../components/FormRow";
import FormCell from "../../components/FormCell";
import Input from "../../components/Input";
import { useForm } from "../../context/FormContext";

export default function DependentDetails() {
  const { formData, updateFormData } = useForm();
  const handleChange = (key) => (e) => updateFormData(key, e.target.value);

  return (
    <Section number={13} title="Dependent Details">
      {[1, 2].map((num) => (
        <React.Fragment key={num}>
          <div className="sub-header">Dependent {num}</div>

          <FormRow>
            <FormCell className="cell-2" label={`Dependent Name ${num}`}>
              <Input
                value={formData[`dep_${num}_name`] || ""}
                onChange={handleChange(`dep_${num}_name`)}
              />
            </FormCell>
            <FormCell label="Relationship">
              <Input
                value={formData[`dep_${num}_rel`] || ""}
                onChange={handleChange(`dep_${num}_rel`)}
              />
            </FormCell>
          </FormRow>

          <FormRow>
            <FormCell label="Nationality">
              <Input
                value={formData[`dep_${num}_nat`] || ""}
                onChange={handleChange(`dep_${num}_nat`)}
              />
            </FormCell>
            <FormCell label="Date of Birth">
              <Input
                placeholder="DD-MM-YYYY"
                value={formData[`dep_${num}_dob`] || ""}
                onChange={handleChange(`dep_${num}_dob`)}
              />
            </FormCell>
            {/* Email FormCell removed from here */}
          </FormRow>
        </React.Fragment>
      ))}
    </Section>
  );
}

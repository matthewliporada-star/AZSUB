import React from "react";
import Section from "../../components/Section";
import FormRow from "../../components/FormRow";
import FormCell from "../../components/FormCell";
import Input from "../../components/Input";
import Select from "../../components/Select";
import { useForm } from "../../context/FormContext";

export default function SmokingAlcohol() {
  const { formData, updateFormData } = useForm();

  const handleChange = (key) => (e) => {
    updateFormData("habits", key, e.target.value);
  };

  const h = formData.habits;

  // Map the PDF values to dropdown options if needed
  const getSmokerStatus = (value) => {
    if (value === "A" || value === "Smoker") return "Smoker";
    if (value === "B" || value === "Non-Smoker") return "Non-Smoker";
    return value || "";
  };

  return (
    <Section number={3} title="Smoking and Alcohol Consumption Habits">
      <FormRow>
        <FormCell className="cell-2" label="Smoker Status">
          <Select
            options={["", "Smoker", "Non-Smoker"]}
            value={getSmokerStatus(h.smokerStatus)}
            onChange={handleChange("smokerStatus")}
          />
        </FormCell>
        <FormCell
          className="cell-2"
          label="If Smoker — how many cigarettes/day?"
        >
          <Input
            value={h.cigarettesPerDay || ""}
            onChange={handleChange("cigarettesPerDay")}
            placeholder="e.g., 10"
          />
        </FormCell>
      </FormRow>
      <FormRow>
        <FormCell
          className="cell-full"
          label="If Non-Smoker — Smoking earlier? If yes, since when"
        >
          <Input
            value={h.previousSmokingHistory || ""}
            onChange={handleChange("previousSmokingHistory")}
            placeholder="e.g., Quit in 2020"
          />
        </FormCell>
      </FormRow>
      <FormRow>
        <FormCell label="Alcohol Type">
          <Input
            placeholder="e.g. Wine, Beer"
            value={h.alcoholType || ""}
            onChange={handleChange("alcoholType")}
          />
        </FormCell>
        <FormCell label="Measurement">
          <Input
            placeholder="e.g. Units/glasses"
            value={h.alcoholMeasurement || ""}
            onChange={handleChange("alcoholMeasurement")}
          />
        </FormCell>
        <FormCell label="Frequency">
          <Input
            placeholder="e.g. Daily, Weekly"
            value={h.alcoholFrequency || ""}
            onChange={handleChange("alcoholFrequency")}
          />
        </FormCell>
      </FormRow>
    </Section>
  );
}

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
    updateFormData(key, e.target.value);
  };

  return (
    <Section number={3} title="Smoking and Alcohol Consumption Habits">
      <FormRow>
        <FormCell className="cell-2" label="Smoker Status">
          <Select
            options={["", "Smoker", "Non-Smoker"]}
            value={formData.smokerStatus || ""}
            onChange={handleChange("smokerStatus")}
          />
        </FormCell>
        <FormCell
          className="cell-2"
          label="If Smoker — how many cigarettes/day?"
        >
          <Input
            value={formData.cigarettesPerDay || ""}
            onChange={handleChange("cigarettesPerDay")}
          />
        </FormCell>
      </FormRow>
      <FormRow>
        <FormCell
          className="cell-full"
          label="If Non-Smoker — Smoking earlier? If yes, since when"
        >
          <Input
            value={formData.previousSmokingHistory || ""}
            onChange={handleChange("previousSmokingHistory")}
          />
        </FormCell>
      </FormRow>
      <FormRow>
        <FormCell label="Alcohol Consumption - Type">
          <Input
            placeholder="e.g. Wine, Beer"
            value={formData.alcoholType || ""}
            onChange={handleChange("alcoholType")}
          />
        </FormCell>
        <FormCell label="Alcohol Consumption - Measurement">
          <Input
            placeholder="e.g. Units/glasses"
            value={formData.alcoholMeasurement || ""}
            onChange={handleChange("alcoholMeasurement")}
          />
        </FormCell>
        <FormCell label="Alcohol Consumption - Frequency">
          <Input
            placeholder="e.g. Daily, Weekly"
            value={formData.alcoholFrequency || ""}
            onChange={handleChange("alcoholFrequency")}
          />
        </FormCell>
      </FormRow>
    </Section>
  );
}

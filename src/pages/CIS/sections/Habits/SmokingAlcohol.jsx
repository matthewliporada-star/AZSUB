import React from "react";
import Section from "../../components/Section";
import FormRow from "../../components/FormRow";
import FormCell from "../../components/FormCell";
import Input from "../../components/Input";
import Select from "../../components/Select";

export default function SmokingAlcohol() {
  return (
    <Section number={3} title="Smoking and Alcohol Consumption Habits">
      <FormRow>
        <FormCell className="cell-2" label="Smoker Status">
          <Select options={["Smoker", "Non-Smoker"]} />
        </FormCell>
        <FormCell
          className="cell-2"
          label="If Smoker — how many cigarettes/day?"
        >
          <Input />
        </FormCell>
      </FormRow>
      <FormRow>
        <FormCell
          className="cell-full"
          label="If Non-Smoker — Smoking earlier? If yes, since when"
        >
          <Input />
        </FormCell>
      </FormRow>
      <FormRow>
        <FormCell label="Alcohol Type">
          <Input placeholder="e.g. Wine, Beer" />
        </FormCell>
        <FormCell label="Measurement">
          <Input placeholder="e.g. Units/glasses" />
        </FormCell>
        <FormCell label="Frequency">
          <Input placeholder="e.g. Daily, Weekly" />
        </FormCell>
      </FormRow>
    </Section>
  );
}

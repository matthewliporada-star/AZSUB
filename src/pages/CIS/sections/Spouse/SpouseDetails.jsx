import React from "react";
import Section from "../../components/Section";
import FormRow from "../../components/FormRow";
import FormCell from "../../components/FormCell";
import Input from "../../components/Input";
import Select from "../../components/Select";

export default function SpouseDetails() {
  return (
    <Section number={12} title="Spouse Details">
      <FormRow>
        <FormCell className="cell-full" label="Name">
          <Input />
        </FormCell>
      </FormRow>
      <FormRow>
        <FormCell label="Relationship">
          <Input />
        </FormCell>
        <FormCell label="Nationality">
          <Input />
        </FormCell>
        <FormCell label="Date of Birth">
          <Input placeholder="DD-MM-YYYY" />
        </FormCell>
      </FormRow>
      <FormRow>
        <FormCell className="cell-2" label="Contact Number">
          <Input type="tel" />
        </FormCell>
        <FormCell className="cell-2" label="Email Address">
          <Input type="email" />
        </FormCell>
      </FormRow>
      <FormRow>
        <FormCell className="cell-3" label="Current Residential Address">
          <Input />
        </FormCell>
        <FormCell label="City">
          <Input />
        </FormCell>
        <FormCell label="Country">
          <Input />
        </FormCell>
        <FormCell label="Postal Code">
          <Input />
        </FormCell>
        <FormCell label="Country of Residence">
          <Input />
        </FormCell>
      </FormRow>
      <FormRow>
        <FormCell className="cell-3" label="Permanent Address">
          <Input />
        </FormCell>
        <FormCell label="City">
          <Input />
        </FormCell>
        <FormCell label="Country">
          <Input />
        </FormCell>
        <FormCell label="Postal Code">
          <Input />
        </FormCell>
      </FormRow>
      <FormRow>
        <FormCell label="Smoking Status">
          <Select options={["Smoker", "Non-Smoker"]} />
        </FormCell>
        <FormCell className="cell-2" label="Employment Role">
          <Input />
        </FormCell>
        <FormCell className="cell-2" label="Company Name">
          <Input />
        </FormCell>
      </FormRow>
    </Section>
  );
}

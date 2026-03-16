import React from "react";
import Section from "../../components/Section";
import FormRow from "../../components/FormRow";
import FormCell from "../../components/FormCell";
import Input from "../../components/Input";

export default function DependentDetails() {
  return (
    <Section number={13} title="Dependent Details">
      <div className="sub-header">Dependent 1</div>
      <FormRow>
        <FormCell className="cell-2" label="Dependent Name 1">
          <Input />
        </FormCell>
        <FormCell label="Relationship">
          <Input />
        </FormCell>
      </FormRow>
      <FormRow>
        <FormCell label="Nationality">
          <Input />
        </FormCell>
        <FormCell label="Date of Birth">
          <Input placeholder="DD-MM-YYYY" />
        </FormCell>
        <FormCell className="cell-2" label="Email Address">
          <Input type="email" />
        </FormCell>
      </FormRow>
      <div className="sub-header">Dependent 2</div>
      <FormRow>
        <FormCell className="cell-2" label="Dependent Name 2">
          <Input />
        </FormCell>
        <FormCell label="Relationship">
          <Input />
        </FormCell>
      </FormRow>
      <FormRow>
        <FormCell label="Nationality">
          <Input />
        </FormCell>
        <FormCell label="Date of Birth">
          <Input placeholder="DD-MM-YYYY" />
        </FormCell>
        <FormCell className="cell-2" label="Email Address">
          <Input type="email" />
        </FormCell>
      </FormRow>
    </Section>
  );
}

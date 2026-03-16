import React from "react";
import Section from "../../components/Section";
import FormRow from "../../components/FormRow";
import FormCell from "../../components/FormCell";
import Input from "../../components/Input";

export default function PersonalInformation() {
  return (
    <Section number={1} title="Personal Information">
      <FormRow>
        <FormCell className="cell-full" label="Full Name of Mr./Mrs.">
          <Input placeholder="Full legal name" />
        </FormCell>
      </FormRow>
      <FormRow>
        <FormCell className="cell-full" label="Father's Name">
          <Input />
        </FormCell>
      </FormRow>
      <FormRow>
        <FormCell className="cell-2" label="Mobile No.">
          <Input type="tel" placeholder="+1 000 000 0000" />
        </FormCell>
        <FormCell className="cell-2" label="Email">
          <Input type="email" placeholder="email@example.com" />
        </FormCell>
      </FormRow>
      <FormRow>
        <FormCell className="cell-3" isRed label="Residence Address">
          <Input placeholder="Street address" />
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
        <FormCell className="cell-full" label="How long have you lived at your current address & in current country?">
          <Input />
        </FormCell>
      </FormRow>
      <FormRow>
        <FormCell className="cell-3" isRed label="Previous Residence">
          <Input placeholder="Complete address" />
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
        <FormCell label="Dates Resided">
          <Input placeholder="DD-MM-YY" />
        </FormCell>
      </FormRow>
      <FormRow>
        <FormCell className="cell-3" label="Secondary / Other Residence (past 10 yrs)">
          <Input placeholder="Complete address" />
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
        <FormCell label="Dates Resided">
          <Input placeholder="DD-MM-YY" />
        </FormCell>
      </FormRow>
      <FormRow>
        <FormCell className="cell-full" label="Permanent Address">
          <Input />
        </FormCell>
      </FormRow>
      <FormRow>
        <FormCell label="Tax Residency Information">
          <Input />
        </FormCell>
        <FormCell label="TIN / SSN Number">
          <Input />
        </FormCell>
        <FormCell className="cell-2" label="List Countries of Citizenship">
          <Input />
        </FormCell>
      </FormRow>
      <FormRow>
        <FormCell className="cell-full" label="Hobbies and Activities">
          <Input />
        </FormCell>
      </FormRow>
    </Section>
  );
}
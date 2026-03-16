import React from "react";
import Section from "../../components/Section";
import FormRow from "../../components/FormRow";
import FormCell from "../../components/FormCell";
import Input from "../../components/Input";
import Select from "../../components/Select";

export default function BankDetails() {
  return (
    <Section number={10} title="Bank Details (Payor Details)">
      <FormRow>
        <FormCell className="cell-2" label="Bank's Name">
          <Input />
        </FormCell>
        <FormCell className="cell-2" label="How long is the account held?">
          <Input />
        </FormCell>
      </FormRow>
      <FormRow>
        <FormCell className="cell-full" label="Complete Address">
          <Input />
        </FormCell>
      </FormRow>
      <FormRow>
        <FormCell className="cell-2" label="IBAN Number">
          <Input />
        </FormCell>
        <FormCell className="cell-2" label="Account Number">
          <Input />
        </FormCell>
      </FormRow>
      <FormRow>
        <FormCell className="cell-2" label="Relationship with the Payor">
          <Input />
        </FormCell>
        <FormCell
          className="cell-2"
          label="Reference Contact (Name / Contact No.)"
        >
          <Input />
        </FormCell>
      </FormRow>
      <FormRow>
        <FormCell className="cell-full" label="Email Address">
          <Input type="email" />
        </FormCell>
      </FormRow>
    </Section>
  );
}

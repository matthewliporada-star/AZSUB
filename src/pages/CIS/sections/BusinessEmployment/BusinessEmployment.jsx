// BusinessEmployment.jsx
import React from "react";
import Section from "../../components/Section";
import FormRow from "../../components/FormRow";
import FormCell from "../../components/FormCell";
import Input from "../../components/Input";
import Select from "../../components/Select";

function BusinessEmployment() {
  return (
    <Section number={6} title="Business / Employment Information">
      <FormRow>
        <FormCell className="cell-2" label="Name of Business">
          <Input />
        </FormCell>
        <FormCell className="cell-2" label="Nature of Business">
          <Input />
        </FormCell>
      </FormRow>

      <FormRow>
        <FormCell className="cell-2" label="Occupation / Duties">
          <Input />
        </FormCell>
        <FormCell className="cell-2" label="Type of Business">
          <Select
            options={[
              "Employment",
              "Sole Proprietor",
              "LLC",
              "PJSC",
              "Offshore",
              "Partnership",
            ]}
          />
        </FormCell>
      </FormRow>

      <FormRow>
        <FormCell label="Percentage of Ownership">
          <Input />
        </FormCell>
        <FormCell className="cell-2" label="Business Address">
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
        <FormCell label="Website">
          <Input type="url" />
        </FormCell>
        <FormCell label="Business Telephone">
          <Input type="tel" />
        </FormCell>
        <FormCell label="Date of Incorporation">
          <Input placeholder="DD-MM-YYYY" />
        </FormCell>
      </FormRow>

      <FormRow>
        <FormCell
          className="cell-full"
          isRed
          label="Previous Work Experience (last 15 years) — role, organization, years"
        >
          <Input placeholder="1. Role | Organization | Years&#10;2. Role | Organization | Years" />
        </FormCell>
      </FormRow>
    </Section>
  );
}

export default BusinessEmployment;
import React from "react";
import Section from "../../components/Section";
import FormRow from "../../components/FormRow";
import FormCell from "../../components/FormCell";
import Input from "../../components/Input";
import { useForm } from "../../context/FormContext";

export default function BankDetails() {
  const { formData, updateFormData } = useForm();

  const handleChange = (key) => (e) => {
    updateFormData(key, e.target.value);
  };

  return (
    <Section number={10} title="Bank Details (Payor Details)">
      <FormRow>
        <FormCell className="cell-2" label="Bank's Name">
          <Input
            value={formData.bankName || ""}
            onChange={handleChange("bankName")}
          />
        </FormCell>
        <FormCell className="cell-2" label="How long is the account held?">
          <Input
            value={formData.accountTenure || ""}
            onChange={handleChange("accountTenure")}
          />
        </FormCell>
      </FormRow>
      <FormRow>
        <FormCell className="cell-full" label="Complete Address">
          <Input
            value={formData.bankAddress || ""}
            onChange={handleChange("bankAddress")}
          />
        </FormCell>
      </FormRow>
      <FormRow>
        <FormCell className="cell-2" label="IBAN Number">
          <Input
            value={formData.bankIban || ""}
            onChange={handleChange("bankIban")}
          />
        </FormCell>
        <FormCell className="cell-2" label="Account Number">
          <Input
            value={formData.bankAccountNumber || ""}
            onChange={handleChange("bankAccountNumber")}
          />
        </FormCell>
      </FormRow>
      <FormRow>
        <FormCell className="cell-2" label="Relationship with the Payor">
          <Input
            value={formData.payorRelationship || ""}
            onChange={handleChange("payorRelationship")}
          />
        </FormCell>
        <FormCell
          className="cell-2"
          label="Reference Contact (Name / Contact No.)"
        >
          <Input
            value={formData.bankReference || ""}
            onChange={handleChange("bankReference")}
          />
        </FormCell>
      </FormRow>
      <FormRow>
        <FormCell className="cell-full" label="Email Address">
          <Input
            type="email"
            value={formData.bankEmail || ""}
            onChange={handleChange("bankEmail")}
          />
        </FormCell>
      </FormRow>
    </Section>
  );
}

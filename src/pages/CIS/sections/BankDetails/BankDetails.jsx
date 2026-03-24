import React from "react";
import Section from "../../components/Section";
import FormRow from "../../components/FormRow";
import FormCell from "../../components/FormCell";
import Input from "../../components/Input";
import { useForm } from "../../context/FormContext";

export default function BankDetails() {
  const { formData, updateFormData } = useForm();
  const bankDetails = formData.bankDetails || {};

  const handleChange = (key) => (e) => {
    updateFormData("bankDetails", key, e.target.value);
  };

  return (
    <Section number={10} title="Bank Details (Payor Details)">
      <FormRow>
        <FormCell className="cell-2" label="Bank's Name">
          <Input
            value={bankDetails.bankName || ""}
            onChange={handleChange("bankName")}
          />
        </FormCell>
        <FormCell className="cell-2" label="How long is the account held?">
          <Input
            value={bankDetails.accountHeld || ""}
            onChange={handleChange("accountHeld")}
          />
        </FormCell>
      </FormRow>
      <FormRow>
        <FormCell className="cell-full" label="Complete Address">
          <Input
            value={bankDetails.address || ""}
            onChange={handleChange("address")}
          />
        </FormCell>
      </FormRow>
      <FormRow>
        <FormCell className="cell-2" label="IBAN Number">
          <Input
            value={bankDetails.iban || ""}
            onChange={handleChange("iban")}
          />
        </FormCell>
        <FormCell className="cell-2" label="Account Number">
          <Input
            value={bankDetails.accountNumber || ""}
            onChange={handleChange("accountNumber")}
          />
        </FormCell>
      </FormRow>
      <FormRow>
        <FormCell className="cell-2" label="Relationship with the Payor">
          <Input
            value={bankDetails.relationship || ""}
            onChange={handleChange("relationship")}
          />
        </FormCell>
        <FormCell
          className="cell-2"
          label="Reference Contact (Name / Contact No.)"
        >
          <Input
            value={bankDetails.referenceContact || ""}
            onChange={handleChange("referenceContact")}
          />
        </FormCell>
      </FormRow>
      <FormRow>
        <FormCell className="cell-full" label="Email Address">
          <Input
            type="email"
            value={bankDetails.email || ""}
            onChange={handleChange("email")}
          />
        </FormCell>
      </FormRow>
    </Section>
  );
}

import React from "react";
import Section from "../../components/Section";
import FormRow from "../../components/FormRow";
import FormCell from "../../components/FormCell";
import Input from "../../components/Input";
import { useForm } from "../../context/FormContext";

export default function PersonalInformation() {
  const { formData, updateFormData } = useForm();

  // Helper to reduce repetitive code
  const handleChange = (key) => (e) => {
    updateFormData(key, e.target.value);
  };

  return (
    <Section number={1} title="Personal Information">
      <FormRow>
        <FormCell className="cell-full" label="Full Name of Mr./Mrs.">
          <Input
            placeholder="Full legal name"
            value={formData.fullName}
            onChange={handleChange("fullName")}
          />
        </FormCell>
      </FormRow>

      <FormRow>
        <FormCell className="cell-full" label="Father's Name">
          <Input
            value={formData.fathersName}
            onChange={handleChange("fathersName")}
          />
        </FormCell>
      </FormRow>

      <FormRow>
        <FormCell className="cell-2" label="Mobile No.">
          <Input
            type="tel"
            placeholder="+1 000 000 0000"
            value={formData.mobileNo}
            onChange={handleChange("mobileNo")}
          />
        </FormCell>
        <FormCell className="cell-2" label="Email">
          <Input
            type="email"
            placeholder="email@example.com"
            value={formData.email}
            onChange={handleChange("email")}
          />
        </FormCell>
      </FormRow>

      <FormRow>
        <FormCell className="cell-3" isRed label="Residence Address">
          <Input
            placeholder="Street address"
            value={formData.residenceAddress}
            onChange={handleChange("residenceAddress")}
          />
        </FormCell>
        <FormCell label="City">
          <Input
            value={formData.residenceCity}
            onChange={handleChange("residenceCity")}
          />
        </FormCell>
        <FormCell label="Country">
          <Input
            value={formData.residenceCountry}
            onChange={handleChange("residenceCountry")}
          />
        </FormCell>
        <FormCell label="Postal Code">
          <Input
            value={formData.residenceZip}
            onChange={handleChange("residenceZip")}
          />
        </FormCell>
      </FormRow>

      <FormRow>
        <FormCell
          className="cell-full"
          label="How long have you lived at your current address?"
        >
          <Input
            value={formData.residenceDuration}
            onChange={handleChange("residenceDuration")}
          />
        </FormCell>
      </FormRow>

      <FormRow>
        <FormCell label="Tax Residency Information">
          <Input
            value={formData.taxResidency}
            onChange={handleChange("taxResidency")}
          />
        </FormCell>
        <FormCell label="TIN / SSN Number">
          <Input value={formData.tinSsn} onChange={handleChange("tinSsn")} />
        </FormCell>
        <FormCell className="cell-2" label="List Countries of Citizenship">
          <Input
            value={formData.citizenship}
            onChange={handleChange("citizenship")}
          />
        </FormCell>
      </FormRow>

      <FormRow>
        <FormCell className="cell-full" label="Hobbies and Activities">
          <Input value={formData.hobbies} onChange={handleChange("hobbies")} />
        </FormCell>
      </FormRow>
    </Section>
  );
}

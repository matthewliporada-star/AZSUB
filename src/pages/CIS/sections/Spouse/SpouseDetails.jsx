import React from "react";
import Section from "../../components/Section";
import FormRow from "../../components/FormRow";
import FormCell from "../../components/FormCell";
import Input from "../../components/Input";
import Select from "../../components/Select";
import { useForm } from "../../context/FormContext";

export default function SpouseDetails() {
  const { formData, updateFormData } = useForm();
  const handleChange = (key) => (e) => updateFormData(key, e.target.value);

  return (
    <Section number={12} title="Spouse Details">
      <FormRow>
        <FormCell className="cell-full" label="Name">
          <Input
            value={formData.spouse_name || ""}
            onChange={handleChange("spouse_name")}
          />
        </FormCell>
      </FormRow>
      <FormRow>
        <FormCell label="Relationship">
          <Input
            value={formData.spouse_rel || ""}
            onChange={handleChange("spouse_rel")}
          />
        </FormCell>
        <FormCell label="Nationality">
          <Input
            value={formData.spouse_nat || ""}
            onChange={handleChange("spouse_nat")}
          />
        </FormCell>
        <FormCell label="Date of Birth">
          <Input
            placeholder="DD-MM-YYYY"
            value={formData.spouse_dob || ""}
            onChange={handleChange("spouse_dob")}
          />
        </FormCell>
      </FormRow>
      <FormRow>
        <FormCell className="cell-2" label="Contact Number">
          <Input
            type="tel"
            value={formData.spouse_phone || ""}
            onChange={handleChange("spouse_phone")}
          />
        </FormCell>
        <FormCell className="cell-2" label="Email Address">
          <Input
            type="email"
            value={formData.spouse_email || ""}
            onChange={handleChange("spouse_email")}
          />
        </FormCell>
      </FormRow>
      <FormRow>
        <FormCell className="cell-3" label="Current Residential Address">
          <Input
            value={formData.spouse_res_addr || ""}
            onChange={handleChange("spouse_res_addr")}
          />
        </FormCell>
        <FormCell label="City">
          <Input
            value={formData.spouse_res_city || ""}
            onChange={handleChange("spouse_res_city")}
          />
        </FormCell>
        <FormCell label="Country">
          <Input
            value={formData.spouse_res_country || ""}
            onChange={handleChange("spouse_res_country")}
          />
        </FormCell>
        <FormCell label="Postal Code">
          <Input
            value={formData.spouse_res_zip || ""}
            onChange={handleChange("spouse_res_zip")}
          />
        </FormCell>
        <FormCell label="Country of Residence">
          <Input
            value={formData.spouse_res_residency || ""}
            onChange={handleChange("spouse_res_residency")}
          />
        </FormCell>
      </FormRow>
      <FormRow>
        <FormCell label="Smoking Status">
          <Select
            options={["Smoker", "Non-Smoker"]}
            value={formData.spouse_smoking || ""}
            onChange={handleChange("spouse_smoking")}
          />
        </FormCell>
        <FormCell className="cell-2" label="Employment Role">
          <Input
            value={formData.spouse_job || ""}
            onChange={handleChange("spouse_job")}
          />
        </FormCell>
        <FormCell className="cell-2" label="Company Name">
          <Input
            value={formData.spouse_company || ""}
            onChange={handleChange("spouse_company")}
          />
        </FormCell>
      </FormRow>
    </Section>
  );
}

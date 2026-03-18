import React from "react";
import Section from "../../components/Section";
import FormRow from "../../components/FormRow";
import FormCell from "../../components/FormCell";
import Input from "../../components/Input";
import Select from "../../components/Select";
import { useForm } from "../../context/FormContext";

function BusinessEmployment() {
  const { formData, updateFormData } = useForm();

  const handleChange = (key) => (e) => {
    updateFormData(key, e.target.value);
  };

  return (
    <Section number={6} title="Business / Employment Information">
      <FormRow>
        <FormCell className="cell-2" label="Name of Business">
          <Input
            value={formData.businessName || ""}
            onChange={handleChange("businessName")}
          />
        </FormCell>
        <FormCell className="cell-2" label="Nature of Business">
          <Input
            value={formData.businessNature || ""}
            onChange={handleChange("businessNature")}
          />
        </FormCell>
      </FormRow>

      <FormRow>
        <FormCell className="cell-2" label="Occupation / Duties">
          <Input
            value={formData.occupation || ""}
            onChange={handleChange("occupation")}
          />
        </FormCell>
        <FormCell className="cell-2" label="Type of Business">
          <Select
            options={[
              "",
              "Employment",
              "Sole Proprietor",
              "LLC",
              "PJSC",
              "Offshore",
              "Partnership",
            ]}
            value={formData.businessType || ""}
            onChange={handleChange("businessType")}
          />
        </FormCell>
      </FormRow>

      <FormRow>
        <FormCell label="Percentage of Ownership">
          <Input
            value={formData.ownershipPercent || ""}
            onChange={handleChange("ownershipPercent")}
          />
        </FormCell>
        <FormCell className="cell-2" label="Business Address">
          <Input
            value={formData.businessAddress || ""}
            onChange={handleChange("businessAddress")}
          />
        </FormCell>
        <FormCell label="City">
          <Input
            value={formData.businessCity || ""}
            onChange={handleChange("businessCity")}
          />
        </FormCell>
        <FormCell label="Country">
          <Input
            value={formData.businessCountry || ""}
            onChange={handleChange("businessCountry")}
          />
        </FormCell>
        <FormCell label="Postal Code">
          <Input
            value={formData.businessZip || ""}
            onChange={handleChange("businessZip")}
          />
        </FormCell>
      </FormRow>

      <FormRow>
        <FormCell label="Website">
          <Input
            type="url"
            value={formData.businessWebsite || ""}
            onChange={handleChange("businessWebsite")}
          />
        </FormCell>
        <FormCell label="Business Telephone">
          <Input
            type="tel"
            value={formData.businessPhone || ""}
            onChange={handleChange("businessPhone")}
          />
        </FormCell>
        <FormCell label="Date of Incorporation">
          <Input
            placeholder="DD-MM-YYYY"
            value={formData.incorporationDate || ""}
            onChange={handleChange("incorporationDate")}
          />
        </FormCell>
      </FormRow>

      <FormRow>
        <FormCell
          className="cell-full"
          isRed
          label="Previous Work Experience (last 15 years). Kindly specify role, organization name and years"
        >
          <Input
            placeholder="1. Role | Organization | Years"
            value={formData.previousExperience || ""}
            onChange={handleChange("previousExperience")}
          />
        </FormCell>
      </FormRow>
    </Section>
  );
}

export default BusinessEmployment;

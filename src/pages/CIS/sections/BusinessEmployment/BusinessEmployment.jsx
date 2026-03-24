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
    updateFormData("businessEmployment", key, e.target.value);
  };

  const business = formData.businessEmployment || {};

  return (
    <Section number={6} title="Business / Employment Information">
      <FormRow>
        <FormCell className="cell-2" label="Name of Business">
          <Input
            value={business.businessName || ""}
            onChange={handleChange("businessName")}
          />
        </FormCell>
        <FormCell className="cell-2" label="Nature of Business">
          <Input
            value={business.natureOfBusiness || ""}
            onChange={handleChange("natureOfBusiness")}
          />
        </FormCell>
      </FormRow>

      <FormRow>
        <FormCell className="cell-2" label="Occupation / Duties">
          <Input
            value={business.occupation || ""}
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
            value={business.businessType || ""}
            onChange={handleChange("businessType")}
          />
        </FormCell>
      </FormRow>

      <FormRow>
        <FormCell label="Percentage of Ownership">
          <Input
            value={business.ownership || ""}
            onChange={handleChange("ownership")}
          />
        </FormCell>
        <FormCell className="cell-2" label="Business Address">
          <Input
            value={business.businessAddress || ""}
            onChange={handleChange("businessAddress")}
          />
        </FormCell>
        <FormCell label="City">
          <Input value={business.city || ""} onChange={handleChange("city")} />
        </FormCell>
        <FormCell label="Country">
          <Input
            value={business.country || ""}
            onChange={handleChange("country")}
          />
        </FormCell>
        <FormCell label="Postal Code">
          <Input
            value={business.postalCode || ""}
            onChange={handleChange("postalCode")}
          />
        </FormCell>
      </FormRow>

      <FormRow>
        <FormCell label="Website">
          <Input
            type="url"
            value={business.website || ""}
            onChange={handleChange("website")}
          />
        </FormCell>
        <FormCell label="Business Telephone">
          <Input
            type="tel"
            value={business.telephone || ""}
            onChange={handleChange("telephone")}
          />
        </FormCell>
        <FormCell label="Date of Incorporation">
          <Input
            placeholder="DD-MM-YYYY"
            value={business.incorporationDate || ""}
            onChange={handleChange("incorporationDate")}
          />
        </FormCell>
      </FormRow>

      <FormRow>
        <FormCell
          className="cell-full"
          isRed
          label="Previous Work Experience (last 15 years)"
        >
          <Input
            placeholder="1. Role | Organization | Years"
            value={business.workExperience || ""}
            onChange={handleChange("workExperience")}
          />
        </FormCell>
      </FormRow>
    </Section>
  );
}

export default BusinessEmployment;

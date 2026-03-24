import React from "react";
import Section from "../../components/Section";
import FormRow from "../../components/FormRow";
import FormCell from "../../components/FormCell";
import Input from "../../components/Input";
import Select from "../../components/Select";
import { useForm } from "../../context/FormContext";

export default function SpouseDetails() {
  const { formData, updateFormData } = useForm();
  const spouse = formData.spouseDetails || {};

  const handleChange = (key) => (e) => {
    updateFormData("spouseDetails", key, e.target.value);
  };

  // Smoking status options - exactly matching PDF values
  const smokingOptions = ["", "Smoker", "Non-smoker"];

  return (
    <Section number={12} title="Spouse Details">
      <FormRow>
        <FormCell className="cell-full" label="Name">
          <Input value={spouse.name || ""} onChange={handleChange("name")} />
        </FormCell>
      </FormRow>
      <FormRow>
        <FormCell label="Relationship">
          <Input
            value={spouse.relationship || ""}
            onChange={handleChange("relationship")}
          />
        </FormCell>
        <FormCell label="Nationality">
          <Input
            value={spouse.nationality || ""}
            onChange={handleChange("nationality")}
          />
        </FormCell>
        <FormCell label="Date of Birth">
          <Input
            placeholder="DD-MM-YYYY"
            value={spouse.dateOfBirth || ""}
            onChange={handleChange("dateOfBirth")}
          />
        </FormCell>
      </FormRow>
      <FormRow>
        <FormCell className="cell-2" label="Contact Number">
          <Input
            type="tel"
            value={spouse.contactNumber || ""}
            onChange={handleChange("contactNumber")}
          />
        </FormCell>
        <FormCell className="cell-2" label="Email Address">
          <Input
            type="email"
            value={spouse.email || ""}
            onChange={handleChange("email")}
          />
        </FormCell>
      </FormRow>
      <FormRow>
        <FormCell className="cell-3" label="Current Residential Address">
          <Input
            value={spouse.currentAddress || ""}
            onChange={handleChange("currentAddress")}
          />
        </FormCell>
        <FormCell label="City">
          <Input value={spouse.city || ""} onChange={handleChange("city")} />
        </FormCell>
        <FormCell label="Country">
          <Input
            value={spouse.country || ""}
            onChange={handleChange("country")}
          />
        </FormCell>
        <FormCell label="Postal Code">
          <Input
            value={spouse.postalCode || ""}
            onChange={handleChange("postalCode")}
          />
        </FormCell>
        <FormCell label="Country of Residence">
          <Input
            value={spouse.countryOfResidence || ""}
            onChange={handleChange("countryOfResidence")}
          />
        </FormCell>
      </FormRow>
      <FormRow>
        <FormCell label="Smoking Status">
          <Select
            options={smokingOptions}
            value={spouse.smokingStatus || ""}
            onChange={handleChange("smokingStatus")}
            placeholder="Select smoking status"
          />
        </FormCell>
        <FormCell className="cell-2" label="Employment Role">
          <Input
            value={spouse.employmentRole || ""}
            onChange={handleChange("employmentRole")}
          />
        </FormCell>
        <FormCell className="cell-2" label="Company Name">
          <Input
            value={spouse.companyName || ""}
            onChange={handleChange("companyName")}
          />
        </FormCell>
      </FormRow>
    </Section>
  );
}

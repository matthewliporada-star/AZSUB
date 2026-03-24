import React from "react";
import Section from "../../components/Section";
import FormRow from "../../components/FormRow";
import FormCell from "../../components/FormCell";
import Input from "../../components/Input";
import { useForm } from "../../context/FormContext";

export default function PersonalInformation() {
  const { formData, updateFormData } = useForm();

  const handleChange = (key) => (e) => {
    updateFormData("personalInformation", key, e.target.value);
  };

  const pi = formData.personalInformation;

  return (
    <Section number={1} title="Personal Information">
      <FormRow>
        <FormCell className="cell-full" label="Full Name of Mr./Mrs.">
          <Input
            placeholder="Full legal name"
            value={pi.fullName || ""}
            onChange={handleChange("fullName")}
          />
        </FormCell>
      </FormRow>

      <FormRow>
        <FormCell className="cell-full" label="Father's Name">
          <Input
            value={pi.fatherName || ""}
            onChange={handleChange("fatherName")}
          />
        </FormCell>
      </FormRow>

      <FormRow>
        <FormCell className="cell-2" label="Mobile No.">
          <Input
            type="tel"
            placeholder="+1 000 000 0000"
            value={pi.mobile || ""}
            onChange={handleChange("mobile")}
          />
        </FormCell>
        <FormCell className="cell-2" label="Email">
          <Input
            type="email"
            placeholder="email@example.com"
            value={pi.email || ""}
            onChange={handleChange("email")}
          />
        </FormCell>
      </FormRow>

      {/* CURRENT RESIDENCE */}
      <h3 className="section-subtitle">Current Residence</h3>
      <FormRow>
        <FormCell className="cell-3" isRed label="Residence Address">
          <Input
            placeholder="Street address"
            value={pi.currentAddress || ""}
            onChange={handleChange("currentAddress")}
          />
        </FormCell>
        <FormCell label="City">
          <Input
            value={pi.currentCity || ""}
            onChange={handleChange("currentCity")}
          />
        </FormCell>
        <FormCell label="Country">
          <Input
            value={pi.currentCountry || ""}
            onChange={handleChange("currentCountry")}
          />
        </FormCell>
        <FormCell label="Postal Code">
          <Input
            value={pi.currentPostalCode || ""}
            onChange={handleChange("currentPostalCode")}
          />
        </FormCell>
      </FormRow>

      <FormRow>
        <FormCell
          className="cell-full"
          label="How long have you lived at your current address?"
        >
          <Input
            value={pi.currentAddressDuration || ""}
            onChange={handleChange("currentAddressDuration")}
          />
        </FormCell>
      </FormRow>

      {/* PREVIOUS RESIDENCE */}
      <h3 className="section-subtitle">Previous Residence</h3>
      <FormRow>
        <FormCell className="cell-3" label="Previous Residence and dates resided">
          <Input
            placeholder="Previous street address"
            value={pi.previousAddress || ""}
            onChange={handleChange("previousAddress")}
          />
        </FormCell>
        <FormCell label="City">
          <Input
            value={pi.previousCity || ""}
            onChange={handleChange("previousCity")}
          />
        </FormCell>
        <FormCell label="Country">
          <Input
            value={pi.previousCountry || ""}
            onChange={handleChange("previousCountry")}
          />
        </FormCell>
        <FormCell label="Postal Code">
          <Input
            value={pi.previousPostalCode || ""}
            onChange={handleChange("previousPostalCode")}
          />
        </FormCell>
      </FormRow>

      <FormRow>
        <FormCell className="cell-full" label="Dates resided (DD-MM-YY)">
          <Input
            placeholder="e.g., 01-01-2020 to 12-31-2022"
            value={pi.previousDates || ""}
            onChange={handleChange("previousDates")}
          />
        </FormCell>
      </FormRow>

      {/* SECONDARY/OTHER RESIDENCE */}
      <h3 className="section-subtitle">Secondary/Other Residence (if any)</h3>
      <FormRow>
        <FormCell className="cell-3" label="Provide information for any current secondary residence and previous primary and secondary residences you have had in the past 10 years">
          <Input
            placeholder="Secondary address"
            value={pi.secondaryAddress || ""}
            onChange={handleChange("secondaryAddress")}
          />
        </FormCell>
        <FormCell label="City">
          <Input
            value={pi.secondaryCity || ""}
            onChange={handleChange("secondaryCity")}
          />
        </FormCell>
        <FormCell label="Country">
          <Input
            value={pi.secondaryCountry || ""}
            onChange={handleChange("secondaryCountry")}
          />
        </FormCell>
        <FormCell label="Postal Code">
          <Input
            value={pi.secondaryPostalCode || ""}
            onChange={handleChange("secondaryPostalCode")}
          />
        </FormCell>
      </FormRow>

      <FormRow>
        <FormCell className="cell-full" label="Dates resided (DD-MM-YY)">
          <Input
            placeholder="e.g., 01-01-2018 to 12-31-2019"
            value={pi.secondaryDates || ""}
            onChange={handleChange("secondaryDates")}
          />
        </FormCell>
      </FormRow>

      {/* OTHER INFORMATION */}
      <FormRow>
        <FormCell
          className="cell-full"
          label="Permanent Address (if different)"
        >
          <Input
            value={pi.permanentAddress || ""}
            onChange={handleChange("permanentAddress")}
          />
        </FormCell>
      </FormRow>

      <FormRow>
        <FormCell label="Tax Residency Information">
          <Input
            value={pi.taxResidency || ""}
            onChange={handleChange("taxResidency")}
          />
        </FormCell>
        <FormCell label="TIN / SSN Number">
          <Input value={pi.tinSsn || ""} onChange={handleChange("tinSsn")} />
        </FormCell>
        <FormCell className="cell-2" label="List Countries of Citizenship">
          <Input
            value={pi.citizenship || ""}
            onChange={handleChange("citizenship")}
          />
        </FormCell>
      </FormRow>

      <FormRow>
        <FormCell className="cell-full" label="Hobbies and Activities">
          <Input value={pi.hobbies || ""} onChange={handleChange("hobbies")} />
        </FormCell>
      </FormRow>
    </Section>
  );
}

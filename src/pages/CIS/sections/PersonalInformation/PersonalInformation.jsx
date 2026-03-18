import React from "react";
import Section from "../../components/Section";
import FormRow from "../../components/FormRow";
import FormCell from "../../components/FormCell";
import Input from "../../components/Input";
import { useForm } from "../../context/FormContext";

export default function PersonalInformation() {
  const { formData, updateFormData } = useForm();

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

      {/* Current Residence */}
      <FormRow>
        <FormCell
          className="cell-3"
          isRed
          label=" Residence Address(Please provide complete address)"
        >
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

      {/* NEW: Previous Residence and Dates */}
      <FormRow>
        <FormCell
          className="cell-3"
          label="Previous Residence and dates resided (if any, please provide complete address)"
        >
          <Input
            placeholder="Street address"
            value={formData.prevResidenceComplete}
            onChange={handleChange("prevResidenceComplete")}
          />
        </FormCell>
        <FormCell label="City">
          <Input
            value={formData.prevResidenceCity}
            onChange={handleChange("prevResidenceCity")}
          />
        </FormCell>
        <FormCell label="Country">
          <Input
            value={formData.prevResidenceCountry}
            onChange={handleChange("prevResidenceCountry")}
          />
        </FormCell>
        <FormCell label="Postal Code">
          <Input
            value={formData.prevResidenceZip}
            onChange={handleChange("prevResidenceZip")}
          />
        </FormCell>
      </FormRow>

      <FormRow>
        <FormCell
          className="cell-2"
          label="Dates resided at the residence (DD-MM-YY)"
        >
          <Input
            placeholder="DD-MM-YY to DD-MM-YY"
            value={formData.prevResidenceDatesResided}
            onChange={handleChange("prevResidenceDatesResided")}
          />
        </FormCell>
      </FormRow>

      <FormRow>
        <FormCell
          className="cell-2"
          label="How long have you lived at your current address & in current country ??"
        >
          <Input
            value={formData.residenceDuration}
            onChange={handleChange("residenceDuration")}
          />
        </FormCell>
      </FormRow>

      {/* Previous/Secondary Residences (Past 10 Years) */}
      {/* Previous/Secondary Residences (Past 10 Years) */}
      <FormRow>
        <FormCell
          className="cell-3"
          label="Provide information for any current secondary residence and previous primary and secondary residences you have had in the past 10 years (Complete Address)"
        >
          <Input
            placeholder="Street address"
            value={formData.previousResidenceAddress}
            onChange={handleChange("previousResidenceAddress")}
          />
        </FormCell>
        <FormCell label="City">
          <Input
            value={formData.permanentCity}
            onChange={handleChange("permanentCity")}
          />
        </FormCell>
        <FormCell label="Country">
          <Input
            value={formData.permanentCountry}
            onChange={handleChange("permanentCountry")}
          />
        </FormCell>
        <FormCell label="Postal Code">
          <Input
            value={formData.permanentZip}
            onChange={handleChange("permanentZip")}
          />
        </FormCell>
      </FormRow>

      <FormRow>
        <FormCell
          className="cell-2"
          label="Dates Resided (DD-MM-YY to DD-MM-YY)"
        >
          <Input
            placeholder="01-01-15 to 01-01-20"
            value={formData.previousResidenceDates}
            onChange={handleChange("previousResidenceDates")}
          />
        </FormCell>
      </FormRow>

      {/* Permanent Address */}
      <FormRow>
        <FormCell className="cell-3" label="Permanent Address">
          <Input
            placeholder="Street address"
            value={formData.permanentAddress}
            onChange={handleChange("permanentAddress")}
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

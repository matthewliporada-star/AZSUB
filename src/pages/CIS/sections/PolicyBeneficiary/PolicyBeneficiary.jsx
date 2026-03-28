import React from "react";
import Section from "../../components/Section";
import Input from "../../components/Input";
import Select from "../../components/Select";
import { useForm } from "../../context/FormContext";

export default function PolicyBeneficiary() {
  const { formData, updateFormData } = useForm();
  const policyBeneficiary = formData.policyBeneficiary || [];

  const handleChange = (idx, field, value) => {
    const newBeneficiaries = [...policyBeneficiary];
    if (!newBeneficiaries[idx]) {
      newBeneficiaries[idx] = {};
    }
    newBeneficiaries[idx][field] = value;
    updateFormData("policyBeneficiary", newBeneficiaries);
  };

  const addRow = () => {
    const newBeneficiaries = [...policyBeneficiary, {}];
    updateFormData("policyBeneficiary", newBeneficiaries);
  };

  const removeRow = (idx) => {
    const newBeneficiaries = policyBeneficiary.filter(
      (_, index) => index !== idx,
    );
    updateFormData("policyBeneficiary", newBeneficiaries);
  };

  return (
    <Section number={11} title="Policy Beneficiary" isTable>
      <div className="table-wrap">
        <div className="table-header">
          <span>Name</span>
          <span>Primary or Contingent</span>
          <span>Relationship to Proposed Insured</span>
          <span>Date of Birth</span>
          <span>Passport No.</span>
          <span>Allocated Share (%)</span>
          <span>Action</span>
        </div>

        {policyBeneficiary.map((bene, idx) => {
          return (
            <div key={idx} className="table-row">
              <div className="table-cell">
                <Input
                  value={bene.name || ""}
                  onChange={(e) => handleChange(idx, "name", e.target.value)}
                />
              </div>
              <div className="table-cell">
                <Select
                  options={["", "Primary", "Contingent"]}
                  value={bene.type || ""}
                  onChange={(e) => handleChange(idx, "type", e.target.value)}
                />
              </div>
              <div className="table-cell">
                <Input
                  value={bene.relationship || ""}
                  onChange={(e) =>
                    handleChange(idx, "relationship", e.target.value)
                  }
                />
              </div>
              <div className="table-cell">
                <Input
                  placeholder="DD-MM-YYYY"
                  value={bene.dateOfBirth || ""}
                  onChange={(e) =>
                    handleChange(idx, "dateOfBirth", e.target.value)
                  }
                />
              </div>
              <div className="table-cell">
                <Input
                  value={bene.passportNo || ""}
                  onChange={(e) =>
                    handleChange(idx, "passportNo", e.target.value)
                  }
                />
              </div>
              <div className="table-cell">
                <Input
                  placeholder="%"
                  value={bene.share || ""}
                  onChange={(e) => handleChange(idx, "share", e.target.value)}
                />
              </div>
              <div className="table-cell">
                <button
                  type="button"
                  onClick={() => removeRow(idx)}
                  className="remove-row-btn"
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}

        <div className="add-row-container">
          <button type="button" onClick={addRow} className="add-row-btn">
            + Add Beneficiary
          </button>
        </div>
      </div>
    </Section>
  );
}

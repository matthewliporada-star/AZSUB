import React from "react";


const PolicyBeneficiary = ({ beneficiary = {}, handleBeneficiaryChange }) => {
  return (
    <div className="form-box">
      <h3 className="section-title">Policy Beneficiary</h3>

      <div className="form-grid-2">
        <div className="input-group">
          <label>Name</label>
          <input
            type="text"
            className="box-input"
            value={beneficiary.name || ""}
            onChange={(e) =>
              handleBeneficiaryChange("name", e.target.value)
            }
          />
        </div>

        <div className="input-group">
          <label>Relation</label>
          <input
            type="text"
            className="box-input"
            value={beneficiary.relation || ""}
            onChange={(e) =>
              handleBeneficiaryChange("relation", e.target.value)
            }
          />
        </div>

        <div className="input-group">
          <label>Share (%)</label>
          <input
            type="number"
            className="box-input"
            value={beneficiary.sharePercent || ""}
            onChange={(e) =>
              handleBeneficiaryChange("sharePercent", e.target.value)
            }
          />
        </div>
      </div>
    </div>
  );
};

export default PolicyBeneficiary;
import React from "react";
import "../CIS.css";

function ExistingOrPending({ insurance = [], handleInsuranceChange = () => {} }) {
  // ✅ Controlled inputs: no internal state

  // Handle change for a specific row
  const handleRowChange = (index, field, value) => {
    const updated = [...insurance];
    updated[index][field] = value;
    handleInsuranceChange(updated);
  };

  // Add new insurance row
  const addRow = () => {
    handleInsuranceChange([
      ...insurance,
      { companyName: "", type: "", countryYear: "", amount: "", premium: "" },
    ]);
  };

  // Delete last insurance row
  const deleteRow = () => {
    if (insurance.length > 1) {
      handleInsuranceChange(insurance.slice(0, insurance.length - 1));
    }
  };

  return (
    <div className="existing-section">
      <div className="form-box">
        <h3 className="section-title">Existing or Pending Insurance</h3>

        {insurance.map((ins, index) => (
          <div key={index} className="form-grid-2">
            <div className="input-group">
              <label>Name of Insurance Co.</label>
              <input
                type="text"
                className="box-input"
                value={ins.companyName}
                onChange={(e) =>
                  handleRowChange(index, "companyName", e.target.value)
                }
                autoComplete="off"
              />
            </div>

            <div className="input-group">
              <label>Type of Insurance</label>
              <input
                type="text"
                className="box-input"
                value={ins.type}
                onChange={(e) => handleRowChange(index, "type", e.target.value)}
                autoComplete="off"
              />
            </div>

            <div className="input-group">
              <label>Country and Year of Issue</label>
              <input
                type="text"
                className="box-input"
                placeholder="e.g., Philippines - 2022"
                value={ins.countryYear}
                onChange={(e) =>
                  handleRowChange(index, "countryYear", e.target.value)
                }
                autoComplete="off"
              />
            </div>

            <div className="input-group">
              <label>Amount of Cover</label>
              <input
                type="number"
                className="box-input"
                value={ins.amount}
                onChange={(e) =>
                  handleRowChange(index, "amount", e.target.value)
                }
                autoComplete="off"
              />
            </div>

            <div className="input-group">
              <label>Premium</label>
              <input
                type="number"
                className="box-input"
                value={ins.premium}
                onChange={(e) =>
                  handleRowChange(index, "premium", e.target.value)
                }
                autoComplete="off"
              />
            </div>
          </div>
        ))}

        <div className="adds-deletes-container-cis">
          <button type="button" className="btn-add-member-cis" onClick={addRow}>
            Add Insurance
          </button>

          <button
            type="button"
            className="btn-delete-member-cis"
            onClick={deleteRow}
          >
            Delete Last
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExistingOrPending;
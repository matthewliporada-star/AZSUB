import React, { useState } from "react";
import "../CIS.css";

const PolicyBeneficiary = () => {
  const [beneficiaries, setBeneficiaries] = useState([
    {
      id: Date.now(),
      name: "",
      type: "",
      relationship: "",
      dob: "",
      passport: "",
      share: "",
    },
  ]);

  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  const handleChange = (index, field, value) => {
    const updated = [...beneficiaries];
    updated[index][field] = value;
    setBeneficiaries(updated);
  };

  const addRow = () => {
    setBeneficiaries([
      ...beneficiaries,
      {
        id: Date.now(),
        name: "",
        type: "",
        relationship: "",
        dob: "",
        passport: "",
        share: "",
      },
    ]);
  };

  const toggleDelete = () => {
    if (deleteMode && selectedRows.length > 0) {
      setBeneficiaries(
        beneficiaries.filter((_, i) => !selectedRows.includes(i)),
      );
      setSelectedRows([]);
    }
    setDeleteMode(!deleteMode);
  };

  return (
    <div class="policy-beneficiary-section module-box">
      <h2 class="section-title">Policy Beneficiary</h2>

      <div className="table-container">
        <table className="income-table">
          <thead>
            <tr>
              <th className="delete-col">Select</th>
              <th>Name</th>
              <th>Primary / Contingent</th>
              <th>Relationship</th>
              <th>Date of Birth</th>
              <th>Passport No.</th>
              <th>Allocated Share (%)</th>
            </tr>
          </thead>

          <tbody>
            {beneficiaries.map((b, i) => (
              <tr key={b.id}>
                <td className="delete-col">
                  {deleteMode && (
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(i)}
                      onChange={(e) => {
                        if (e.target.checked)
                          setSelectedRows([...selectedRows, i]);
                        else
                          setSelectedRows(
                            selectedRows.filter((index) => index !== i),
                          );
                      }}
                    />
                  )}
                </td>

                <td>
                  <input
                    type="text"
                    className="box-input"
                    value={b.name}
                    onChange={(e) => handleChange(i, "name", e.target.value)}
                  />
                </td>

                <td>
                  <select
                    className="box-input"
                    value={b.type}
                    onChange={(e) => handleChange(i, "type", e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="Primary">Primary</option>
                    <option value="Contingent">Contingent</option>
                  </select>
                </td>

                <td>
                  <input
                    type="text"
                    className="box-input"
                    value={b.relationship}
                    onChange={(e) =>
                      handleChange(i, "relationship", e.target.value)
                    }
                  />
                </td>

                <td>
                  <input
                    type="date"
                    className="box-input"
                    value={b.dob}
                    onChange={(e) => handleChange(i, "dob", e.target.value)}
                  />
                </td>

                <td>
                  <input
                    type="text"
                    className="box-input"
                    value={b.passport}
                    onChange={(e) =>
                      handleChange(i, "passport", e.target.value)
                    }
                  />
                </td>

                <td>
                  <input
                    type="number"
                    className="box-input"
                    value={b.share}
                    onChange={(e) => handleChange(i, "share", e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Buttons */}
      <div className="form-buttons">
        {!deleteMode && (
          <button type="button" className="btn-travel-add" onClick={addRow}>
            + Add Beneficiary
          </button>
        )}
        <button
          type="button"
          className="btn-travel-delete"
          onClick={toggleDelete}
        >
          {deleteMode ? "Confirm Delete" : "Delete"}
        </button>
      </div>
    </div>
  );
};

export default PolicyBeneficiary;

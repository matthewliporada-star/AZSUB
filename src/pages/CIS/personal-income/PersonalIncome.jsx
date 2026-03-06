import React, { useState } from "react";
import "../CIS.css";
function PersonalIncome() {
  // Income state
  const [income, setIncome] = useState({
    salary: { frequency: "", self: "", spouse: "" },
    bonus: { frequency: "", self: "", spouse: "" },
    investment: { frequency: "", self: "", spouse: "" },
    interest: { frequency: "", self: "", spouse: "" },
    dividends: { frequency: "", self: "", spouse: "" },
    rental: { frequency: "", self: "", spouse: "" },
    other: { frequency: "", self: "", spouse: "" },
  });

  // Expenditure & disposable income state
  const [expenditure, setExpenditure] = useState({
    totalExpenditure: { frequency: "", self: "", spouse: "" },
    estimatedDisposable: { frequency: "", self: "", spouse: "" },
  });

  // Handlers
  const handleIncomeChange = (type, field, value) => {
    setIncome((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value,
      },
    }));
  };

  const handleExpenditureChange = (type, field, value) => {
    setExpenditure((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value,
      },
    }));
  };

  // Calculations
  const calculateJoint = (data, type) =>
    Number(data[type].self || 0) + Number(data[type].spouse || 0);

  const calculateTotal = (field) =>
    Object.keys(income).reduce((acc, key) => acc + Number(income[key][field] || 0), 0);

  const calculateExpenditureJoint = (type) =>
    calculateJoint(expenditure, type);

  // Table rows
  const incomeRows = [
    { key: "salary", label: "Income/Salary" },
    { key: "bonus", label: "Bonus" },
    { key: "investment", label: "Investment Income" },
    { key: "interest", label: "Interest" },
    { key: "dividends", label: "Dividends" },
    { key: "rental", label: "Rental Income" },
    { key: "other", label: "Other Income Source" },
  ];

  const expenditureRows = [
    { key: "totalExpenditure", label: "Total Monthly Expenditure" },
    { key: "estimatedDisposable", label: "Estimated Monthly Disposable Income" },
  ];

  return (
    <div className="income-section">
      <div className="form-box">
        <h3 className="section-title">Personal Income Statement</h3>

        {/* Income Table */}
        <table className="income-table">
          <thead>
            <tr>
              <th>Income Source</th>
              <th>Frequency</th>
              <th>Self</th>
              <th>Spouse</th>
              <th>Joint</th>
            </tr>
          </thead>
          <tbody>
            {incomeRows.map((row) => (
              <tr key={row.key}>
                <td>{row.label}</td>
                <td>
                  <select
                    value={income[row.key].frequency}
                    onChange={(e) =>
                      handleIncomeChange(row.key, "frequency", e.target.value)
                    }
                  >
                    <option value="">Select</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Annual">Annual</option>
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    value={income[row.key].self}
                    onChange={(e) =>
                      handleIncomeChange(row.key, "self", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={income[row.key].spouse}
                    onChange={(e) =>
                      handleIncomeChange(row.key, "spouse", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={calculateJoint(income, row.key)}
                    readOnly
                  />
                </td>
              </tr>
            ))}

            <tr>
              <td><b>Total Income</b></td>
              <td></td>
              <td><b>{calculateTotal("self")}</b></td>
              <td><b>{calculateTotal("spouse")}</b></td>
              <td><b>{calculateTotal("self") + calculateTotal("spouse")}</b></td>
            </tr>
          </tbody>
        </table>

        {/* Expenditure & Disposable Income Table */}
        <h3 className="section-title" style={{ marginTop: "20px" }}>
          Personal Income Statement
        </h3>
        <table className="income-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Frequency</th>
              <th>Self</th>
              <th>Spouse</th>
              <th>Joint</th>
            </tr>
          </thead>
          <tbody>
            {expenditureRows.map((row) => (
              <tr key={row.key}>
                <td>{row.label}</td>
                <td>
                  <select
                    value={expenditure[row.key].frequency}
                    onChange={(e) =>
                      handleExpenditureChange(row.key, "frequency", e.target.value)
                    }
                  >
                    <option value="">Select</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Annual">Annual</option>
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    value={expenditure[row.key].self}
                    onChange={(e) =>
                      handleExpenditureChange(row.key, "self", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={expenditure[row.key].spouse}
                    onChange={(e) =>
                      handleExpenditureChange(row.key, "spouse", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={calculateExpenditureJoint(row.key)}
                    readOnly
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </div>
  );
}

export default PersonalIncome;
import React, { useState } from "react";
import "../CIS.css";

function AssetsLiabilities() {
  const assetRows = [
    "Cash",
    "Savings",
    "Stocks and Bonds",
    "Personal/Residential Property",
    "Investment Property",
    "Real Estate",
    "Other Parental Property",
    "Vehicle",
    "Funds/Unit Trusts",
    "Pensions",
    "Business Shareholding",
    "Net Business Interest",
    "Company Name, Share 1",
    "Company Name, Share 2",
    "Other (Please specify)",
  ];

  const liabilityRows = [
    "Personal Loans",
    "Margin Account",
    "Residential Mortgage(s)",
    "Loan Guarantees",
    "Investment Property Mortgage(s)",
    "Business Loans/security",
    "Other (Please specify)",
  ];

  const [assets, setAssets] = useState(
    assetRows.reduce((acc, key) => {
      acc[key] = { currentYear: "", lastYear: "" };
      return acc;
    }, {}),
  );

  const [liabilities, setLiabilities] = useState(
    liabilityRows.reduce((acc, key) => {
      acc[key] = { currentYear: "", lastYear: "" };
      return acc;
    }, {}),
  );

  const handleAssetChange = (key, field, value) => {
    setAssets((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  const handleLiabilityChange = (key, field, value) => {
    setLiabilities((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  const calculateTotalAssets = (field) =>
    Object.entries(assets).reduce((sum, [key, item]) => {
      // Only sum numeric fields
      if (!isNaN(item[field])) {
        return sum + Number(item[field] || 0);
      }
      return sum;
    }, 0);

  const calculateTotalLiabilities = (field) =>
    Object.entries(liabilities).reduce((sum, [key, item]) => {
      if (!isNaN(item[field])) {
        return sum + Number(item[field] || 0);
      }
      return sum;
    }, 0);

  const calculateNetWorth = (field) =>
    calculateTotalAssets(field) - calculateTotalLiabilities(field);

  // Fields that should be text
  const textFields = [
    "Company Name, Share 1",
    "Company Name, Share 2",
    "Other (Please specify)",
  ];

  return (
    <div className="assets-liabilities-section cis-page-wrapper">
      {/* Assets Table */}
      <div className="form-box">
        <h3 className="section-title">Assets</h3>
        <table className="income-table">
          <thead>
            <tr>
              <th>Assets / Type</th>
              <th>Current Year</th>
              <th>Last Year</th>
            </tr>
          </thead>
          <tbody>
            {assetRows.map((row) => (
              <tr key={row}>
                <td>{row}</td>
                <td>
                  <input
                    type={textFields.includes(row) ? "text" : "number"}
                    className="box-input"
                    value={assets[row].currentYear}
                    onChange={(e) =>
                      handleAssetChange(row, "currentYear", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type={textFields.includes(row) ? "text" : "number"}
                    className="box-input"
                    value={assets[row].lastYear}
                    onChange={(e) =>
                      handleAssetChange(row, "lastYear", e.target.value)
                    }
                  />
                </td>
              </tr>
            ))}
            <tr>
              <td>
                <b>Total Assets</b>
              </td>
              <td>
                <b>{calculateTotalAssets("currentYear")}</b>
              </td>
              <td>
                <b>{calculateTotalAssets("lastYear")}</b>
              </td>
            </tr>
            <tr>
              <td>
                <b>Net Assets (Assets − Liabilities)</b>
              </td>
              <td>
                <b>{calculateNetWorth("currentYear")}</b>
              </td>
              <td>
                <b>{calculateNetWorth("lastYear")}</b>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Liabilities Table */}
      <div className="form-box" style={{ marginTop: "50px" }}>
        <h3 className="section-title">Liabilities</h3>
        <table className="income-table">
          <thead>
            <tr>
              <th>Liabilities / Type</th>
              <th>Current Year</th>
              <th>Last Year</th>
            </tr>
          </thead>
          <tbody>
            {liabilityRows.map((row) => (
              <tr key={row}>
                <td>{row}</td>
                <td>
                  <input
                    type={textFields.includes(row) ? "text" : "number"}
                    className="box-input"
                    value={liabilities[row].currentYear}
                    onChange={(e) =>
                      handleLiabilityChange(row, "currentYear", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type={textFields.includes(row) ? "text" : "number"}
                    className="box-input"
                    value={liabilities[row].lastYear}
                    onChange={(e) =>
                      handleLiabilityChange(row, "lastYear", e.target.value)
                    }
                  />
                </td>
              </tr>
            ))}
            <tr>
              <td>
                <b>Total Liabilities</b>
              </td>
              <td>
                <b>{calculateTotalLiabilities("currentYear")}</b>
              </td>
              <td>
                <b>{calculateTotalLiabilities("lastYear")}</b>
              </td>
            </tr>
            <tr>
              <td>
                <b>Total Net Worth</b>
              </td>
              <td>
                <b>{calculateNetWorth("currentYear")}</b>
              </td>
              <td>
                <b>{calculateNetWorth("lastYear")}</b>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AssetsLiabilities;

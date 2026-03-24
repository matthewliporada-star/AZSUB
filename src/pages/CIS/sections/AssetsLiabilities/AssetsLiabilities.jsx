import React, { useMemo } from "react";
import Section from "../../components/Section";
import Input from "../../components/Input";
import { useForm } from "../../context/FormContext";

export default function AssetsLiabilities() {
  const { formData, updateFormData } = useForm();

  const assets = [
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
  ];

  const liabilities = [
    "Personal Loans",
    "Margin Account",
    "Residential Mortgage(s)",
    "Loan Guarantees",
    "Investment Property Mortgage(s)",
    "Business Loans/security",
    "Other (Please specify)",
  ];

  const assetsLiabilities = formData.assetsLiabilities || {};

  const handleUpdate = (key, value) => {
    updateFormData("assetsLiabilities", key, value);
  };

  // Memoized calculations
  const calculations = useMemo(() => {
    let assetsCurr = 0,
      assetsLast = 0;
    let liabilitiesCurr = 0,
      liabilitiesLast = 0;

    // Sum all assets (12 assets)
    assets.forEach((_, idx) => {
      assetsCurr += parseFloat(assetsLiabilities[`asset_${idx}_curr`]) || 0;
      assetsLast += parseFloat(assetsLiabilities[`asset_${idx}_last`]) || 0;
    });

    // Sum all liabilities (7 liabilities - ALL numeric)
    liabilities.forEach((_, idx) => {
      liabilitiesCurr += parseFloat(assetsLiabilities[`liab_${idx}_curr`]) || 0;
      liabilitiesLast += parseFloat(assetsLiabilities[`liab_${idx}_last`]) || 0;
    });

    return {
      assetsCurr: assetsCurr.toFixed(2),
      assetsLast: assetsLast.toFixed(2),
      liabilitiesCurr: liabilitiesCurr.toFixed(2),
      liabilitiesLast: liabilitiesLast.toFixed(2),
      netCurr: (assetsCurr - liabilitiesCurr).toFixed(2),
      netLast: (assetsLast - liabilitiesLast).toFixed(2),
    };
  }, [assetsLiabilities]);

  return (
    <Section number={8} title="Assets and Liabilities" isTable>
      <div className="table-wrap">
        {/* Assets Header */}
        <div className="table-header">
          <span>Assets</span>
          <span>Current Year</span>
          <span>Last Year</span>
        </div>

        {/* Assets Rows - ALL NUMERIC */}
        {assets.map((asset, idx) => (
          <div key={`asset-${idx}`} className="table-row">
            <div className="table-cell">
              <span className="asset-label">{asset}</span>
            </div>
            <div className="table-cell">
              <Input
                value={assetsLiabilities[`asset_${idx}_curr`] || ""}
                onChange={(e) =>
                  handleUpdate(`asset_${idx}_curr`, e.target.value)
                }
                placeholder="0.00"
              />
            </div>
            <div className="table-cell">
              <Input
                value={assetsLiabilities[`asset_${idx}_last`] || ""}
                onChange={(e) =>
                  handleUpdate(`asset_${idx}_last`, e.target.value)
                }
                placeholder="0.00"
              />
            </div>
          </div>
        ))}

        {/* Business Names Section (Asset side) */}
        <div className="table-row">
          <div className="table-cell">
            <span className="asset-label">Company Name, Share</span>
          </div>
          <div className="table-cell" colSpan="2">
            <Input
              value={assetsLiabilities.businessName1 || ""}
              onChange={(e) => handleUpdate("businessName1", e.target.value)}
              placeholder="1. Business name"
            />
          </div>
        </div>

        <div className="table-row">
          <div className="table-cell">
            <span className="asset-label"></span>
          </div>
          <div className="table-cell" colSpan="2">
            <Input
              value={assetsLiabilities.businessName2 || ""}
              onChange={(e) => handleUpdate("businessName2", e.target.value)}
              placeholder="2. Business name"
            />
          </div>
        </div>

        <div className="table-row">
          <div className="table-cell">
            <span className="asset-label"></span>
          </div>
          <div className="table-cell" colSpan="2">
            <Input
              value={assetsLiabilities.businessOther || ""}
              onChange={(e) => handleUpdate("businessOther", e.target.value)}
              placeholder="Other (Please specify)"
            />
          </div>
        </div>

        {/* Total Assets Row */}
        <div className="table-row row-gold">
          <div className="table-cell">
            <strong>Total Assets</strong>
          </div>
          <div className="table-cell">
            <Input value={calculations.assetsCurr} readOnly />
          </div>
          <div className="table-cell">
            <Input value={calculations.assetsLast} readOnly />
          </div>
        </div>

        {/* Spacing before Liabilities */}
        <div style={{ height: "20px" }}></div>

        {/* Liabilities Header */}
        <div className="table-header">
          <span>Liabilities</span>
          <span>Current Year</span>
          <span>Last Year</span>
        </div>

        {/* Liabilities Rows - ALL NUMERIC (including Business Loans/security) */}
        {liabilities.map((liability, idx) => (
          <div key={`liab-${idx}`} className="table-row">
            <div className="table-cell">
              <span className="asset-label">{liability}</span>
            </div>
            <div className="table-cell">
              <Input
                value={assetsLiabilities[`liab_${idx}_curr`] || ""}
                onChange={(e) =>
                  handleUpdate(`liab_${idx}_curr`, e.target.value)
                }
                placeholder="0.00"
              />
            </div>
            <div className="table-cell">
              <Input
                value={assetsLiabilities[`liab_${idx}_last`] || ""}
                onChange={(e) =>
                  handleUpdate(`liab_${idx}_last`, e.target.value)
                }
                placeholder="0.00"
              />
            </div>
          </div>
        ))}

        {/* Total Liabilities Row */}
        <div className="table-row row-gold">
          <div className="table-cell">
            <strong>Total Liabilities</strong>
          </div>
          <div className="table-cell">
            <Input value={calculations.liabilitiesCurr} readOnly />
          </div>
          <div className="table-cell">
            <Input value={calculations.liabilitiesLast} readOnly />
          </div>
        </div>

        {/* Total Net Worth Row */}
        <div className="table-row row-gold">
          <div className="table-cell">
            <strong>Total Net Worth</strong>
          </div>
          <div className="table-cell">
            <Input value={calculations.netCurr} readOnly />
          </div>
          <div className="table-cell">
            <Input value={calculations.netLast} readOnly />
          </div>
        </div>
      </div>
    </Section>
  );
}

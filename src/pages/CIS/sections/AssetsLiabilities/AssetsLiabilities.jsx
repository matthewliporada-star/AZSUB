import React, { useMemo } from "react";
import Section from "../../components/Section";
import FormRow from "../../components/FormRow";
import FormCell from "../../components/FormCell";
import Input from "../../components/Input";
import TableRow from "../../components/TableRow";
import { useForm } from "../../context/FormContext";

export default function AssetsLiabilities() {
  const { formData, updateFormData } = useForm();
  
  const assets = [
    "Cash", "Savings", "Stocks and Bonds", "Personal Property", 
    "Investment Property", "Real Estate", "Other Parental Property", 
    "Vehicle", "Funds", "Pensions", "Business Shareholding", "Net Business Interest"
  ];
  
  const liabilities = [
    "Personal Loans", "Margin Account", "Residential Mortgage(s)", 
    "Loan Guarantees", "Investment Property Mortgage(s)", "Business Loans"
  ];

  // Helper for input updates
  const handleUpdate = (key, val) => updateFormData(key, val);

  // Big Math: Memoized calculations for Assets, Liabilities, and Net Worth
  const calculations = useMemo(() => {
    const sum = (list, prefix) => {
      let curr = 0, last = 0;
      list.forEach((_, i) => {
        curr += parseFloat(formData[`${prefix}_${i}_curr`]) || 0;
        last += parseFloat(formData[`${prefix}_${i}_last`]) || 0;
      });
      return { curr, last };
    };

    const assetTotals = sum(assets, "asset");
    const liabTotals = sum(liabilities, "liab");

    return {
      assets: assetTotals,
      liabs: liabTotals,
      netCurr: (assetTotals.curr - liabTotals.curr).toFixed(2),
      netLast: (assetTotals.last - liabTotals.last).toFixed(2)
    };
  }, [formData]);

  return (
    <Section number={8} title="Assets and Liabilities" isTable>
      {/* Assets Table Loop */}
      <div className="table-header">
        <span style={{ flex: "1.5" }}>Assets</span>
        <span>Current Year</span>
        <span>Last Year</span>
        <span>Joint</span>
      </div>
      
      {assets.map((asset, idx) => (
        <TableRow key={idx} cells={[
          { content: <span className="asset-label">{asset}</span>, style: { flex: "1.5" } },
          { content: <Input value={formData[`asset_${idx}_curr`] || ""} onChange={(e) => handleUpdate(`asset_${idx}_curr`, e.target.value)} /> },
          { content: <Input value={formData[`asset_${idx}_last`] || ""} onChange={(e) => handleUpdate(`asset_${idx}_last`, e.target.value)} /> },
          { content: <Input value={(parseFloat(formData[`asset_${idx}_curr`] || 0) + parseFloat(formData[`asset_${idx}_last`] || 0)).toFixed(2)} readOnly /> }
        ]} />
      ))}

      {/* Calculations / Gold Rows */}
      <FormRow className="row-gold">
        <FormCell style={{ flex: "1.5" }} label="Total Assets" />
        <FormCell><Input value={calculations.assets.curr.toFixed(2)} readOnly /></FormCell>
        <FormCell><Input value={calculations.assets.last.toFixed(2)} readOnly /></FormCell>
        <FormCell><Input value={(calculations.assets.curr + calculations.assets.last).toFixed(2)} readOnly /></FormCell>
      </FormRow>

      {/* Total Net Worth */}
      <FormRow className="row-gold">
        <FormCell style={{ flex: "1.5" }} label="Total Net Worth" />
        <FormCell><Input value={calculations.netCurr} readOnly /></FormCell>
        <FormCell><Input value={calculations.netLast} readOnly /></FormCell>
        <FormCell><Input value={(parseFloat(calculations.netCurr) + parseFloat(calculations.netLast)).toFixed(2)} readOnly /></FormCell>
      </FormRow>
    </Section>
  );
}
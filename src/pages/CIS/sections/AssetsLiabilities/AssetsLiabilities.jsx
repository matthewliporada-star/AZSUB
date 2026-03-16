import React, { useState, useCallback } from "react";
import Section from "../../components/Section";
import FormRow from "../../components/FormRow";
import FormCell from "../../components/FormCell";
import Input from "../../components/Input";
import TableRow from "../../components/TableRow";

export default function AssetsLiabilities() {
  const numAssets = 12; // assets list
  const numLiab = 6; // liabilities list
  const initialAssetData = Array(numAssets + 2)
    .fill()
    .map(() => ({
      // +2 company rows
      current: "",
      last: "",
      joint: "",
    }));
  const initialLiabData = Array(numLiab + 1)
    .fill()
    .map(() => ({
      // +1 other row
      current: "",
      last: "",
      joint: "",
    }));

  const [assetData, setAssetData] = useState(initialAssetData);
  const [liabData, setLiabData] = useState(initialLiabData);
  const [totals, setTotals] = useState({
    assetsCurrent: "",
    assetsLast: "",
    assetsJoint: "",
    liabCurrent: "",
    liabLast: "",
    liabJoint: "",
    netCurrent: "",
    netLast: "",
    netJoint: "",
  });

  const updateAssetValue = useCallback(
    (rowIdx, field, value) => {
      setAssetData((prev) => {
        const newData = [...prev];
        newData[rowIdx][field] = value;

        if (field !== "joint") {
          const currentNum = parseFloat(newData[rowIdx].current) || 0;
          const lastNum = parseFloat(newData[rowIdx].last) || 0;
          newData[rowIdx].joint = (currentNum + lastNum).toFixed(2);
        }

        // Sum totals
        let totalCurrent = 0,
          totalLast = 0;
        for (let i = 0; i < numAssets + 2; i++) {
          totalCurrent += parseFloat(newData[i].current) || 0;
          totalLast += parseFloat(newData[i].last) || 0;
        }

        setTotals((prevTotals) => ({
          ...prevTotals,
          assetsCurrent: totalCurrent.toFixed(2),
          assetsLast: totalLast.toFixed(2),
          assetsJoint: (totalCurrent + totalLast).toFixed(2),
        }));

        return newData;
      });
    },
    [numAssets],
  );

  const updateLiabValue = useCallback(
    (rowIdx, field, value) => {
      setLiabData((prev) => {
        const newData = [...prev];
        newData[rowIdx][field] = value;

        if (field !== "joint") {
          const currentNum = parseFloat(newData[rowIdx].current) || 0;
          const lastNum = parseFloat(newData[rowIdx].last) || 0;
          newData[rowIdx].joint = (currentNum + lastNum).toFixed(2);
        }

        // Sum totals
        let totalCurrent = 0,
          totalLast = 0;
        for (let i = 0; i < numLiab + 1; i++) {
          totalCurrent += parseFloat(newData[i].current) || 0;
          totalLast += parseFloat(newData[i].last) || 0;
        }

        setTotals((prevTotals) => {
          const assetsCurrentNum = parseFloat(prevTotals.assetsCurrent) || 0;
          const assetsLastNum = parseFloat(prevTotals.assetsLast) || 0;
          const netCurrent = assetsCurrentNum - totalCurrent;
          const netLast = assetsLastNum - totalLast;
          const netJoint = netCurrent + netLast;

          return {
            ...prevTotals,
            liabCurrent: totalCurrent.toFixed(2),
            liabLast: totalLast.toFixed(2),
            liabJoint: (totalCurrent + totalLast).toFixed(2),
            netCurrent: netCurrent.toFixed(2),
            netLast: netLast.toFixed(2),
            netJoint: netJoint.toFixed(2),
          };
        });

        return newData;
      });
    },
    [numLiab],
  );

  const assets = [
    "Cash",
    "Savings",
    "Stocks and Bonds",
    "Personal / Residential Property",
    "Investment Property",
    "Real Estate",
    "Other Parental Property",
    "Vehicle",
    "Funds / Unit Trusts",
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
    "Business Loans / Security",
  ];

  return (
    <Section number={8} title="Assets and Liabilities" isTable>
      <div className="table-header">
        <span style={{ flex: "1.5" }}>Assets</span>
        <span>Current Year (USD)</span>
        <span>Last Year (USD)</span>
        <span style={{ flex: "1" }}>Joint (USD)</span>
      </div>
      {assets.map((asset, idx) => (
        <TableRow
          key={idx}
          cells={[
            {
              content: (
                <span style={{ fontSize: "11.5px", color: "var(--muted)" }}>
                  {asset}
                </span>
              ),
              style: { flex: "1.5" },
            },
            {
              content: (
                <Input
                  placeholder="0.00"
                  value={assetData[idx].current}
                  onChange={(e) =>
                    updateAssetValue(idx, "current", e.target.value)
                  }
                />
              ),
            },
            {
              content: (
                <Input
                  placeholder="0.00"
                  value={assetData[idx].last}
                  onChange={(e) =>
                    updateAssetValue(idx, "last", e.target.value)
                  }
                />
              ),
            },
            {
              content: (
                <Input placeholder="0.00" value={assetData[idx].joint} />
              ),
            },
          ]}
        />
      ))}
      <FormRow>
        <FormCell style={{ flex: "1.5" }} label="Company Name & Share (1)">
          <Input />
        </FormCell>
        <FormCell>
          <Input
            placeholder="0.00"
            value={assetData[numAssets].current}
            onChange={(e) =>
              updateAssetValue(numAssets, "current", e.target.value)
            }
          />
        </FormCell>
        <FormCell>
          <Input
            placeholder="0.00"
            value={assetData[numAssets].last}
            onChange={(e) =>
              updateAssetValue(numAssets, "last", e.target.value)
            }
          />
        </FormCell>
        <FormCell>
          <Input placeholder="0.00" value={assetData[numAssets].joint} />
        </FormCell>
      </FormRow>
      <FormRow>
        <FormCell style={{ flex: "1.5" }} label="Company Name & Share (2)">
          <Input />
        </FormCell>
        <FormCell>
          <Input
            placeholder="0.00"
            value={assetData[numAssets + 1].current}
            onChange={(e) =>
              updateAssetValue(numAssets + 1, "current", e.target.value)
            }
          />
        </FormCell>
        <FormCell>
          <Input
            placeholder="0.00"
            value={assetData[numAssets + 1].last}
            onChange={(e) =>
              updateAssetValue(numAssets + 1, "last", e.target.value)
            }
          />
        </FormCell>
        <FormCell>
          <Input placeholder="0.00" value={assetData[numAssets + 1].joint} />
        </FormCell>
      </FormRow>
      <FormRow>
        <FormCell className="cell-full" isRed label="Other (Please specify)">
          <Input />
        </FormCell>
      </FormRow>
      <FormRow className="row-gold">
        <FormCell style={{ flex: "1.5" }} label="Total Assets"></FormCell>
        <FormCell className="cell-2">
          <Input placeholder="0.00" value={totals.assetsCurrent} />
        </FormCell>
        <FormCell className="cell-2">
          <Input placeholder="0.00" value={totals.assetsLast} />
        </FormCell>
        <FormCell className="cell-2">
          <Input placeholder="0.00" value={totals.assetsJoint} />
        </FormCell>
      </FormRow>
      <FormRow className="row-gold">
        <FormCell
          style={{ flex: "1.5" }}
          label="Net Assets (Assets − Liabilities)"
        ></FormCell>
        <FormCell>
          <Input placeholder="0.00" value={totals.netCurrent} />
        </FormCell>
        <FormCell>
          <Input placeholder="0.00" value={totals.netLast} />
        </FormCell>
        <FormCell>
          <Input placeholder="0.00" value={totals.netJoint} />
        </FormCell>
      </FormRow>
      <div className="table-header" style={{ marginTop: "1px" }}>
        <span style={{ flex: "1.5" }}>Liabilities</span>
        <span>Current Year (USD)</span>
        <span>Last Year (USD)</span>
        <span style={{ flex: "1" }}>Joint (USD)</span>
      </div>
      {liabilities.map((liability, idx) => (
        <TableRow
          key={idx}
          cells={[
            {
              content: (
                <span style={{ fontSize: "11.5px", color: "var(--muted)" }}>
                  {liability}
                </span>
              ),
              style: { flex: "1.5" },
            },
            {
              content: (
                <Input
                  placeholder="0.00"
                  value={liabData[idx].current}
                  onChange={(e) =>
                    updateLiabValue(idx, "current", e.target.value)
                  }
                />
              ),
            },
            {
              content: (
                <Input
                  placeholder="0.00"
                  value={liabData[idx].last}
                  onChange={(e) => updateLiabValue(idx, "last", e.target.value)}
                />
              ),
            },
            {
              content: <Input placeholder="0.00" value={liabData[idx].joint} />,
            },
          ]}
        />
      ))}
      <FormRow>
        <FormCell
          className="cell-full"
          isRed
          label="Other Liabilities (Please specify)"
        >
          <Input />
        </FormCell>
      </FormRow>
      <FormRow className="row-gold">
        <FormCell style={{ flex: "1.5" }} label="Total Liabilities"></FormCell>
        <FormCell className="cell-2">
          <Input placeholder="0.00" value={totals.liabCurrent} />
        </FormCell>
        <FormCell className="cell-2">
          <Input placeholder="0.00" value={totals.liabLast} />
        </FormCell>
        <FormCell className="cell-2">
          <Input placeholder="0.00" value={totals.liabJoint} />
        </FormCell>
      </FormRow>
      <FormRow className="row-gold">
        <FormCell style={{ flex: "1.5" }} label="Total Net Worth"></FormCell>
        <FormCell>
          <Input placeholder="0.00" value={totals.netCurrent} />
        </FormCell>
        <FormCell>
          <Input placeholder="0.00" value={totals.netLast} />
        </FormCell>
        <FormCell>
          <Input placeholder="0.00" value={totals.netJoint} />
        </FormCell>
      </FormRow>
    </Section>
  );
}

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
  ];

  const handleUpdate = (key, val) => updateFormData(key, val);

  const calculations = useMemo(() => {
    const sum = (list, prefix) => {
      let curr = 0,
        last = 0;
      list.forEach((_, i) => {
        curr += parseFloat(formData[`${prefix}_${i}_curr`]) || 0;
        last += parseFloat(formData[`${prefix}_${i}_last`]) || 0;
      });
      curr += parseFloat(formData[`${prefix}_other_curr`]) || 0;
      last += parseFloat(formData[`${prefix}_other_last`]) || 0;

      return { curr, last };
    };

    const assetTotals = sum(assets, "asset");
    const liabTotals = sum(liabilities, "liab");

    return {
      assets: assetTotals,
      liabs: liabTotals,
      netCurr: (assetTotals.curr - liabTotals.curr).toFixed(2),
      netLast: (assetTotals.last - liabTotals.last).toFixed(2),
    };
  }, [formData, assets, liabilities]);

  return (
    <Section number={8} title="Assets and Liabilities" isTable>
      {/* --- ASSETS SECTION --- */}
      <div className="table-header">
        <span style={{ flex: "1.5" }}>Assets</span>
        <span>Current Year</span>
        <span>Last Year</span>
        <span>Joint</span>
      </div>

      {assets.map((asset, idx) => (
        <React.Fragment key={`asset-${idx}`}>
          <TableRow
            cells={[
              {
                content: <span className="asset-label">{asset}</span>,
                style: { flex: "1.5" },
              },
              {
                content: (
                  <Input
                    value={formData[`asset_${idx}_curr`] || ""}
                    onChange={(e) =>
                      handleUpdate(`asset_${idx}_curr`, e.target.value)
                    }
                  />
                ),
              },
              {
                content: (
                  <Input
                    value={formData[`asset_${idx}_last`] || ""}
                    onChange={(e) =>
                      handleUpdate(`asset_${idx}_last`, e.target.value)
                    }
                  />
                ),
              },
              {
                content: (
                  <Input
                    value={(
                      parseFloat(formData[`asset_${idx}_curr`] || 0) +
                      parseFloat(formData[`asset_${idx}_last`] || 0)
                    ).toFixed(2)}
                    readOnly
                  />
                ),
              },
            ]}
          />
          {asset === "Net Business Interest" && (
            <>
              <TableRow
                cells={[
                  {
                    content: (
                      <span style={{ paddingLeft: "10px", fontWeight: "500" }}>
                        Company Name, Share
                      </span>
                    ),
                    style: { flex: "1.5" },
                  },
                  { content: "" },
                  { content: "" },
                  { content: "" },
                ]}
              />
              <TableRow
                cells={[
                  {
                    content: (
                      <div
                        style={{
                          paddingLeft: "20px",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        1.{" "}
                        <Input
                          style={{
                            borderBottom: "1px solid #ccc",
                            marginLeft: "5px",
                          }}
                          value={formData.biz_name_1 || ""}
                          onChange={(e) =>
                            handleUpdate("biz_name_1", e.target.value)
                          }
                        />
                      </div>
                    ),
                    style: { flex: "1.5" },
                  },
                  { content: "" },
                  { content: "" },
                  { content: "" },
                ]}
              />
              <TableRow
                cells={[
                  {
                    content: (
                      <div
                        style={{
                          paddingLeft: "20px",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        2.{" "}
                        <Input
                          style={{
                            borderBottom: "1px solid #ccc",
                            marginLeft: "5px",
                          }}
                          value={formData.biz_name_2 || ""}
                          onChange={(e) =>
                            handleUpdate("biz_name_2", e.target.value)
                          }
                        />
                      </div>
                    ),
                    style: { flex: "1.5" },
                  },
                  { content: "" },
                  { content: "" },
                  { content: "" },
                ]}
              />
              <TableRow
                cells={[
                  {
                    content: (
                      <div style={{ paddingLeft: "10px" }}>
                        Other{" "}
                        <span style={{ color: "red", fontSize: "0.8rem" }}>
                          (Please specify)
                        </span>
                        <Input
                          style={{
                            borderBottom: "1px solid #ccc",
                            width: "100%",
                            marginTop: "4px",
                          }}
                          value={formData.biz_other || ""}
                          onChange={(e) =>
                            handleUpdate("biz_other", e.target.value)
                          }
                        />
                      </div>
                    ),
                    style: { flex: "1.5" },
                  },
                  { content: "" },
                  { content: "" },
                  { content: "" },
                ]}
              />
            </>
          )}
        </React.Fragment>
      ))}

      {/* Total Assets Row */}
      <FormRow className="row-gold">
        <FormCell style={{ flex: "1.5" }} label="Total Assets" />
        <FormCell>
          <Input value={calculations.assets.curr.toFixed(2)} readOnly />
        </FormCell>
        <FormCell>
          <Input value={calculations.assets.last.toFixed(2)} readOnly />
        </FormCell>
        <FormCell>
          <Input
            value={(
              calculations.assets.curr + calculations.assets.last
            ).toFixed(2)}
            readOnly
          />
        </FormCell>
      </FormRow>

      {/* UPDATED: Net Assets Row with calculation function (Assets - Liabilities) */}
      <FormRow className="row-gold">
        <FormCell
          style={{ flex: "1.5" }}
          label="Net Assets (Assets - Liabilities)"
        />
        <FormCell>
          <Input value={calculations.netCurr} readOnly />
        </FormCell>
        <FormCell>
          <Input value={calculations.netLast} readOnly />
        </FormCell>
        <FormCell>
          <Input
            value={(
              parseFloat(calculations.netCurr) +
              parseFloat(calculations.netLast)
            ).toFixed(2)}
            readOnly
          />
        </FormCell>
      </FormRow>

      <div style={{ margin: "20px 0" }} />

      {/* --- LIABILITIES SECTION --- */}
      <div className="table-header">
        <span style={{ flex: "1.5" }}>Liabilities</span>
        <span>Current Year</span>
        <span>Last Year</span>
        <span>Joint</span>
      </div>

      {liabilities.map((liab, idx) => (
        <TableRow
          key={`liab-${idx}`}
          cells={[
            {
              content: <span className="liab-label">{liab}</span>,
              style: { flex: "1.5" },
            },
            {
              content: (
                <Input
                  value={formData[`liab_${idx}_curr`] || ""}
                  onChange={(e) =>
                    handleUpdate(`liab_${idx}_curr`, e.target.value)
                  }
                />
              ),
            },
            {
              content: (
                <Input
                  value={formData[`liab_${idx}_last`] || ""}
                  onChange={(e) =>
                    handleUpdate(`liab_${idx}_last`, e.target.value)
                  }
                />
              ),
            },
            {
              content: (
                <Input
                  value={(
                    parseFloat(formData[`liab_${idx}_curr`] || 0) +
                    parseFloat(formData[`liab_${idx}_last`] || 0)
                  ).toFixed(2)}
                  readOnly
                />
              ),
            },
          ]}
        />
      ))}

      <TableRow
        cells={[
          {
            content: (
              <div style={{ paddingLeft: "10px" }}>
                Other{" "}
                <span style={{ color: "red", fontSize: "0.8rem" }}>
                  (Please specify)
                </span>
                <Input
                  style={{
                    borderBottom: "1px solid #ccc",
                    width: "100%",
                    marginTop: "4px",
                  }}
                  value={formData.liab_other_desc || ""}
                  onChange={(e) =>
                    handleUpdate("liab_other_desc", e.target.value)
                  }
                />
              </div>
            ),
            style: { flex: "1.5" },
          },
          {
            content: (
              <Input
                value={formData.liab_other_curr || ""}
                onChange={(e) =>
                  handleUpdate("liab_other_curr", e.target.value)
                }
              />
            ),
          },
          {
            content: (
              <Input
                value={formData.liab_other_last || ""}
                onChange={(e) =>
                  handleUpdate("liab_other_last", e.target.value)
                }
              />
            ),
          },
          {
            content: (
              <Input
                value={(
                  parseFloat(formData.liab_other_curr || 0) +
                  parseFloat(formData.liab_other_last || 0)
                ).toFixed(2)}
                readOnly
              />
            ),
          },
        ]}
      />

      <FormRow className="row-gold">
        <FormCell style={{ flex: "1.5" }} label="Total Liabilities" />
        <FormCell>
          <Input value={calculations.liabs.curr.toFixed(2)} readOnly />
        </FormCell>
        <FormCell>
          <Input value={calculations.liabs.last.toFixed(2)} readOnly />
        </FormCell>
        <FormCell>
          <Input
            value={(calculations.liabs.curr + calculations.liabs.last).toFixed(
              2,
            )}
            readOnly
          />
        </FormCell>
      </FormRow>

      <FormRow className="row-gold">
        <FormCell style={{ flex: "1.5" }} label="Total Net Worth" />
        <FormCell>
          <Input value={calculations.netCurr} readOnly />
        </FormCell>
        <FormCell>
          <Input value={calculations.netLast} readOnly />
        </FormCell>
        <FormCell>
          <Input
            value={(
              parseFloat(calculations.netCurr) +
              parseFloat(calculations.netLast)
            ).toFixed(2)}
            readOnly
          />
        </FormCell>
      </FormRow>
    </Section>
  );
}

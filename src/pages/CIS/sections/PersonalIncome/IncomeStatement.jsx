import React, { useMemo } from "react";
import Section from "../../components/Section";
import Input from "../../components/Input";
import { useForm } from "../../context/FormContext";

export default function IncomeStatement() {
  const { formData, updateFormData } = useForm();

  const incomeSources = [
    "Income / Salary",
    "Bonus",
    "Investment Income",
    "Interest",
    "Dividends",
    "Rental Income",
    "Other Income Source",
  ];

  const freqOptions = ["Monthly", "Annual"];

  // Helper to handle input changes
  const handleChange = (key, value) => {
    updateFormData(key, value);
  };

  // Memoized calculations for Totals and Disposable Income
  const totals = useMemo(() => {
    let selfInc = 0;
    let spouseInc = 0;

    // Calculate Total Income
    incomeSources.forEach((_, idx) => {
      selfInc += parseFloat(formData[`inc_${idx}_self`]) || 0;
      spouseInc += parseFloat(formData[`inc_${idx}_spouse`]) || 0;
    });

    // Get Expenditure values
    const selfExp = parseFloat(formData.exp_self) || 0;
    const spouseExp = parseFloat(formData.exp_spouse) || 0;

    return {
      // Income Totals
      incomeSelf: selfInc.toFixed(2),
      incomeSpouse: spouseInc.toFixed(2),
      incomeJoint: (selfInc + spouseInc).toFixed(2),

      // Expenditure Totals
      expJoint: (selfExp + spouseExp).toFixed(2),

      // Disposable Income (Income - Expenditure)
      dispSelf: (selfInc - selfExp).toFixed(2),
      dispSpouse: (spouseInc - spouseExp).toFixed(2),
      dispJoint: (selfInc + spouseInc - (selfExp + spouseExp)).toFixed(2),
    };
  }, [formData, incomeSources]);

  return (
    <Section number={7} title="Personal Income Statement" isTable>
      <div className="income-header">
        <span>Income Source</span>
        <span>Frequency</span>
        <span>Self (USD)</span>
        <span>Spouse (USD)</span>
        <span>Joint (USD)</span>
      </div>

      {/* Income Rows */}
      {incomeSources.map((source, idx) => {
        const selfVal = parseFloat(formData[`inc_${idx}_self`]) || 0;
        const spouseVal = parseFloat(formData[`inc_${idx}_spouse`]) || 0;

        return (
          <div key={idx} className="income-row">
            <div className="income-cell">
              <label>{source}</label>
            </div>
            <div className="income-cell">
              <select
                value={formData[`inc_${idx}_freq`] || ""}
                onChange={(e) =>
                  handleChange(`inc_${idx}_freq`, e.target.value)
                }
                className="select-plain"
              >
                <option value="">—</option>
                {freqOptions.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
            <div className="income-cell">
              <Input
                value={formData[`inc_${idx}_self`] || ""}
                onChange={(e) =>
                  handleChange(`inc_${idx}_self`, e.target.value)
                }
                placeholder="0.00"
              />
            </div>
            <div className="income-cell">
              <Input
                value={formData[`inc_${idx}_spouse`] || ""}
                onChange={(e) =>
                  handleChange(`inc_${idx}_spouse`, e.target.value)
                }
                placeholder="0.00"
              />
            </div>
            <div className="income-cell">
              <Input
                value={(selfVal + spouseVal).toFixed(2)}
                readOnly
                placeholder="0.00"
              />
            </div>
          </div>
        );
      })}

      {/* Total Income Row */}
      <div className="income-row total-row">
        <div className="income-cell">
          <label style={{ fontWeight: "700" }}>Total Income</label>
        </div>
        <div className="income-cell"></div>
        <div className="income-cell">
          <Input value={totals.incomeSelf} readOnly />
        </div>
        <div className="income-cell">
          <Input value={totals.incomeSpouse} readOnly />
        </div>
        <div className="income-cell">
          <Input value={totals.incomeJoint} readOnly />
        </div>
      </div>

      {/* Total Monthly Expenditure Row */}
      <div className="income-row">
        <div className="income-cell">
          <label>Total Monthly Expenditure</label>
        </div>
        <div className="income-cell">
          <select
            value={formData.exp_freq || ""}
            onChange={(e) => handleChange("exp_freq", e.target.value)}
            className="select-plain"
          >
            <option value="">—</option>
            {freqOptions.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
        <div className="income-cell">
          <Input
            value={formData.exp_self || ""}
            onChange={(e) => handleChange("exp_self", e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="income-cell">
          <Input
            value={formData.exp_spouse || ""}
            onChange={(e) => handleChange("exp_spouse", e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="income-cell">
          <Input value={totals.expJoint} readOnly placeholder="0.00" />
        </div>
      </div>

      {/* Estimated Monthly Disposable Income Row */}
      <div
        className="income-row total-row"
        
      >
        <div className="income-cell">
          <label>
            Estimated Monthly Disposable Income
          </label>
        </div>
        <div className="income-cell"></div>
        <div className="income-cell">
          <Input value={totals.dispSelf} readOnly />
        </div>
        <div className="income-cell">
          <Input value={totals.dispSpouse} readOnly />
        </div>
        <div className="income-cell">
          <Input value={totals.dispJoint} readOnly />
        </div>
      </div>
    </Section>
  );
}

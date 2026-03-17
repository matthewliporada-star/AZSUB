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

  // Memoized calculations for Totals
  const totals = useMemo(() => {
    let self = 0;
    let spouse = 0;

    incomeSources.forEach((_, idx) => {
      self += parseFloat(formData[`inc_${idx}_self`]) || 0;
      spouse += parseFloat(formData[`inc_${idx}_spouse`]) || 0;
    });

    return {
      self: self.toFixed(2),
      spouse: spouse.toFixed(2),
      joint: (self + spouse).toFixed(2),
    };
  }, [formData]);

  return (
    <Section number={7} title="Personal Income Statement" isTable>
      <div className="income-header">
        <span>Income Source</span>
        <span>Frequency</span>
        <span>Self (USD)</span>
        <span>Spouse (USD)</span>
        <span>Joint (USD)</span>
      </div>

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
          <Input value={totals.self} readOnly />
        </div>
        <div className="income-cell">
          <Input value={totals.spouse} readOnly />
        </div>
        <div className="income-cell">
          <Input value={totals.joint} readOnly />
        </div>
      </div>

      {/* Total Monthly Expenditure */}
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
          />
        </div>
        <div className="income-cell">
          <Input
            value={formData.exp_spouse || ""}
            onChange={(e) => handleChange("exp_spouse", e.target.value)}
          />
        </div>
        <div className="income-cell">
          <Input
            value={(
              parseFloat(formData.exp_self || 0) +
              parseFloat(formData.exp_spouse || 0)
            ).toFixed(2)}
            readOnly
          />
        </div>
      </div>
    </Section>
  );
}

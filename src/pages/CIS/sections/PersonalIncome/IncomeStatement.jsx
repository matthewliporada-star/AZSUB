import React, { useState, useCallback } from "react";
import Section from "../../components/Section";
import Input from "../../components/Input";

export default function IncomeStatement() {
  const numSources = 7;
  const initialData = Array(numSources)
    .fill()
    .map(() => ({
      self: "",
      spouse: "",
      joint: "",
    }));
  initialData.push({ self: "", spouse: "", joint: "" }); // Total Income
  initialData.push({ self: "", spouse: "", joint: "" }); // Expenditure
  initialData.push({ self: "", spouse: "", joint: "" }); // Disposable

  const [data, setData] = useState(initialData);
  const [frequencies, setFrequencies] = useState(
    Array(numSources + 3).fill(""),
  );

  const updateValue = useCallback(
    (rowIdx, field, value) => {
      setData((prev) => {
        const newData = [...prev];
        newData[rowIdx][field] = value;

        // Auto-update joint
        if (field !== "joint") {
          const selfNum = parseFloat(newData[rowIdx].self) || 0;
          const spouseNum = parseFloat(newData[rowIdx].spouse) || 0;
          newData[rowIdx].joint = (selfNum + spouseNum).toFixed(2);
        }

        // Update totals (row numSources = Total Income)
        if (rowIdx < numSources) {
          let totalSelf = 0;
          let totalSpouse = 0;
          for (let i = 0; i < numSources; i++) {
            totalSelf += parseFloat(newData[i].self) || 0;
            totalSpouse += parseFloat(newData[i].spouse) || 0;
          }
          const totalJoint = totalSelf + totalSpouse;
          newData[numSources].self = totalSelf.toFixed(2);
          newData[numSources].spouse = totalSpouse.toFixed(2);
          newData[numSources].joint = totalJoint.toFixed(2);
        }

        return newData;
      });
    },
    [numSources],
  );

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
  const rowLabels = [
    "",
    "Total Income",
    "Total Monthly Expenditure",
    "Estimated Monthly Disposable Income",
  ];

  return (
    <Section number={7} title="Personal Income Statement" isTable>
      <div className="income-header">
        <span>Income Source</span>
        <span>Frequency (Monthly/Annual)</span>
        <span>Self (USD)</span>
        <span>Spouse (USD)</span>
        <span>Joint (USD)</span>
      </div>
      {incomeSources.map((source, idx) => (
        <div key={idx} className="income-row">
          <div className="income-cell">
            <label>{source}</label>
          </div>
          <div className="income-cell">
            <select
              value={frequencies[idx]}
              onChange={(e) => {
                const newFreq = [...frequencies];
                newFreq[idx] = e.target.value;
                setFrequencies(newFreq);
              }}
              style={{
                width: "100%",
                border: "none",
                background: "transparent",
                fontFamily: "inherit",
                fontSize: "12px",
              }}
            >
              <option value="">—</option>
              {freqOptions.map((freq, fIdx) => (
                <option key={fIdx} value={freq}>
                  {" "}
                  {freq}{" "}
                </option>
              ))}
            </select>
          </div>
          <div className="income-cell">
            <Input
              placeholder="0.00"
              value={data[idx].self}
              onChange={(e) => updateValue(idx, "self", e.target.value)}
            />
          </div>
          <div className="income-cell">
            <Input
              placeholder="0.00"
              value={data[idx].spouse}
              onChange={(e) => updateValue(idx, "spouse", e.target.value)}
            />
          </div>
          <div className="income-cell">
            <Input
              placeholder="0.00"
              value={data[idx].joint}
              onChange={(e) => updateValue(idx, "joint", e.target.value)}
            />
          </div>
        </div>
      ))}
      <div className="income-row total-row">
        <div className="income-cell">
          <label style={{ fontWeight: "700", color: "var(--navy)" }}>
            {" "}
            Total Income{" "}
          </label>
        </div>
        <div className="income-cell"></div>
        <div className="income-cell">
          <Input
            placeholder="0.00"
            value={data[numSources].self}
            onChange={(e) => updateValue(numSources, "self", e.target.value)}
          />
        </div>
        <div className="income-cell">
          <Input
            placeholder="0.00"
            value={data[numSources].spouse}
            onChange={(e) => updateValue(numSources, "spouse", e.target.value)}
          />
        </div>
        <div className="income-cell">
          <Input
            placeholder="0.00"
            value={data[numSources].joint}
            onChange={(e) => updateValue(numSources, "joint", e.target.value)}
          />
        </div>
      </div>
      <div className="income-row">
        <div className="income-cell">
          <label>Total Monthly Expenditure</label>
        </div>
        <div className="income-cell">
          <select
            value={frequencies[numSources + 1]}
            onChange={(e) => {
              const newFreq = [...frequencies];
              newFreq[numSources + 1] = e.target.value;
              setFrequencies(newFreq);
            }}
            style={{
              width: "100%",
              border: "none",
              background: "transparent",
              fontFamily: "inherit",
              fontSize: "12px",
            }}
          >
            <option value="">—</option>
            {freqOptions.map((freq, fIdx) => (
              <option key={fIdx} value={freq}>
                {" "}
                {freq}{" "}
              </option>
            ))}
          </select>
        </div>
        <div className="income-cell">
          <Input
            placeholder="0.00"
            value={data[numSources + 1].self}
            onChange={(e) =>
              updateValue(numSources + 1, "self", e.target.value)
            }
          />
        </div>
        <div className="income-cell">
          <Input
            placeholder="0.00"
            value={data[numSources + 1].spouse}
            onChange={(e) =>
              updateValue(numSources + 1, "spouse", e.target.value)
            }
          />
        </div>
        <div className="income-cell">
          <Input
            placeholder="0.00"
            value={data[numSources + 1].joint}
            onChange={(e) =>
              updateValue(numSources + 1, "joint", e.target.value)
            }
          />
        </div>
      </div>
      <div className="income-row">
        <div className="income-cell">
          <label>Estimated Monthly Disposable Income</label>
        </div>
        <div className="income-cell">
          <select
            value={frequencies[numSources + 2]}
            onChange={(e) => {
              const newFreq = [...frequencies];
              newFreq[numSources + 2] = e.target.value;
              setFrequencies(newFreq);
            }}
            style={{
              width: "100%",
              border: "none",
              background: "transparent",
              fontFamily: "inherit",
              fontSize: "12px",
            }}
          >
            <option value="">—</option>
            {freqOptions.map((freq, fIdx) => (
              <option key={fIdx} value={freq}>
                {" "}
                {freq}{" "}
              </option>
            ))}
          </select>
        </div>
        <div className="income-cell">
          <Input
            placeholder="0.00"
            value={data[numSources + 2].self}
            onChange={(e) =>
              updateValue(numSources + 2, "self", e.target.value)
            }
          />
        </div>
        <div className="income-cell">
          <Input
            placeholder="0.00"
            value={data[numSources + 2].spouse}
            onChange={(e) =>
              updateValue(numSources + 2, "spouse", e.target.value)
            }
          />
        </div>
        <div className="income-cell">
          <Input
            placeholder="0.00"
            value={data[numSources + 2].joint}
            onChange={(e) =>
              updateValue(numSources + 2, "joint", e.target.value)
            }
          />
        </div>
      </div>
    </Section>
  );
}

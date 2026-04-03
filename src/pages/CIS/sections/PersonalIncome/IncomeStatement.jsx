import React, { useMemo } from "react";
import Section from "../../components/Section";
import Input from "../../components/Input";
import { useForm } from "../../context/FormContext";

export default function IncomeStatement() {
  const { formData, updateFormData } = useForm();

  const freqOptions = ["Monthly", "Annual"];

  const income = formData.incomeStatement || {};

  // Helper to handle input changes
  const handleChange = (key, value) => {
    updateFormData("incomeStatement", key, value);
  };

  // Memoized calculations for Totals
  const totals = useMemo(() => {
    let self = 0;
    let spouse = 0;

    // Sum all income sources for self
    self += parseFloat(income.selfIncome) || 0;
    self += parseFloat(income.bonus) || 0;
    self += parseFloat(income.investmentIncome) || 0;
    self += parseFloat(income.interest) || 0;
    self += parseFloat(income.dividends) || 0;
    self += parseFloat(income.rentalIncome) || 0;
    self += parseFloat(income.otherIncome) || 0;

    // Sum all income sources for spouse
    spouse += parseFloat(income.spouseIncome) || 0;
    spouse += parseFloat(income.spouseBonus) || 0;
    spouse += parseFloat(income.spouseInvestment) || 0;
    spouse += parseFloat(income.spouseInterest) || 0;
    spouse += parseFloat(income.spouseDividends) || 0;
    spouse += parseFloat(income.spouseRental) || 0;
    spouse += parseFloat(income.spouseOther) || 0;

    return {
      self: self.toFixed(2),
      spouse: spouse.toFixed(2),
      joint: (self + spouse).toFixed(2),
    };
  }, [income]);

  const totalExpenditureSelf = parseFloat(income.totalExpenditureSelf) || 0;
  const totalExpenditureSpouse = parseFloat(income.totalExpenditureSpouse) || 0;
  const totalSelfIncome = parseFloat(totals.self) || 0;
  const totalSpouseIncome = parseFloat(totals.spouse) || 0;

  const computedTotalExpenditureJoint = (
    totalExpenditureSelf + totalExpenditureSpouse
  ).toFixed(2);

  const computedDisposableIncomeSelf = (
    totalSelfIncome - totalExpenditureSelf
  ).toFixed(2);
  const computedDisposableIncomeSpouse = (
    totalSpouseIncome - totalExpenditureSpouse
  ).toFixed(2);
  const computedDisposableIncomeJoint = (
    totalSelfIncome +
    totalSpouseIncome -
    totalExpenditureSelf -
    totalExpenditureSpouse
  ).toFixed(2);

  return (
    <Section number={7} title="Personal Income Statement" isTable>
      <div className="income-header">
        <span>Income Source</span>
        <span>Frequency</span>
        <span>Self (USD)</span>
        <span>Spouse (USD)</span>
        <span>Joint (USD)</span>
      </div>

      {/* Income/Salary */}
      <div className="income-row">
        <div className="income-cell">
          <label>Income / Salary</label>
        </div>
        <div className="income-cell">
          <select
            value={income.frequency || "Monthly"}
            onChange={(e) => handleChange("frequency", e.target.value)}
            className="select-plain"
          >
            {freqOptions.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
        <div className="income-cell">
          <Input
            value={income.selfIncome || ""}
            onChange={(e) => handleChange("selfIncome", e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="income-cell">
          <Input
            value={income.spouseIncome || ""}
            onChange={(e) => handleChange("spouseIncome", e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="income-cell">
          <Input
            value={(
              parseFloat(income.selfIncome || 0) +
              parseFloat(income.spouseIncome || 0)
            ).toFixed(2)}
            readOnly
            placeholder="0.00"
          />
        </div>
      </div>

      {/* Bonus */}
      <div className="income-row">
        <div className="income-cell">
          <label>Bonus</label>
        </div>
        <div className="income-cell">
          <select
            value={income.bonusFrequency || "Monthly"}
            onChange={(e) => handleChange("bonusFrequency", e.target.value)}
            className="select-plain"
          >
            {freqOptions.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
        <div className="income-cell">
          <Input
            value={income.bonus || ""}
            onChange={(e) => handleChange("bonus", e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="income-cell">
          <Input
            value={income.spouseBonus || ""}
            onChange={(e) => handleChange("spouseBonus", e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="income-cell">
          <Input
            value={(
              parseFloat(income.bonus || 0) +
              parseFloat(income.spouseBonus || 0)
            ).toFixed(2)}
            readOnly
            placeholder="0.00"
          />
        </div>
      </div>

      {/* Investment Income */}
      <div className="income-row">
        <div className="income-cell">
          <label>Investment Income</label>
        </div>
        <div className="income-cell">
          <select
            value={income.investmentFrequency || "Monthly"}
            onChange={(e) =>
              handleChange("investmentFrequency", e.target.value)
            }
            className="select-plain"
          >
            {freqOptions.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
        <div className="income-cell">
          <Input
            value={income.investmentIncome || ""}
            onChange={(e) => handleChange("investmentIncome", e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="income-cell">
          <Input
            value={income.spouseInvestment || ""}
            onChange={(e) => handleChange("spouseInvestment", e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="income-cell">
          <Input
            value={(
              parseFloat(income.investmentIncome || 0) +
              parseFloat(income.spouseInvestment || 0)
            ).toFixed(2)}
            readOnly
            placeholder="0.00"
          />
        </div>
      </div>

      {/* Interest */}
      <div className="income-row">
        <div className="income-cell">
          <label>Interest</label>
        </div>
        <div className="income-cell">
          <select
            value={income.interestFrequency || "Monthly"}
            onChange={(e) => handleChange("interestFrequency", e.target.value)}
            className="select-plain"
          >
            {freqOptions.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
        <div className="income-cell">
          <Input
            value={income.interest || ""}
            onChange={(e) => handleChange("interest", e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="income-cell">
          <Input
            value={income.spouseInterest || ""}
            onChange={(e) => handleChange("spouseInterest", e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="income-cell">
          <Input
            value={(
              parseFloat(income.interest || 0) +
              parseFloat(income.spouseInterest || 0)
            ).toFixed(2)}
            readOnly
            placeholder="0.00"
          />
        </div>
      </div>

      {/* Dividends */}
      <div className="income-row">
        <div className="income-cell">
          <label>Dividends</label>
        </div>
        <div className="income-cell">
          <select
            value={income.dividendsFrequency || "Monthly"}
            onChange={(e) => handleChange("dividendsFrequency", e.target.value)}
            className="select-plain"
          >
            {freqOptions.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
        <div className="income-cell">
          <Input
            value={income.dividends || ""}
            onChange={(e) => handleChange("dividends", e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="income-cell">
          <Input
            value={income.spouseDividends || ""}
            onChange={(e) => handleChange("spouseDividends", e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="income-cell">
          <Input
            value={(
              parseFloat(income.dividends || 0) +
              parseFloat(income.spouseDividends || 0)
            ).toFixed(2)}
            readOnly
            placeholder="0.00"
          />
        </div>
      </div>

      {/* Rental Income */}
      <div className="income-row">
        <div className="income-cell">
          <label>Rental Income</label>
        </div>
        <div className="income-cell">
          <select
            value={income.rentalFrequency || "Monthly"}
            onChange={(e) => handleChange("rentalFrequency", e.target.value)}
            className="select-plain"
          >
            {freqOptions.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
        <div className="income-cell">
          <Input
            value={income.rentalIncome || ""}
            onChange={(e) => handleChange("rentalIncome", e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="income-cell">
          <Input
            value={income.spouseRental || ""}
            onChange={(e) => handleChange("spouseRental", e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="income-cell">
          <Input
            value={(
              parseFloat(income.rentalIncome || 0) +
              parseFloat(income.spouseRental || 0)
            ).toFixed(2)}
            readOnly
            placeholder="0.00"
          />
        </div>
      </div>

      {/* Other Income Source */}
      <div className="income-row">
        <div className="income-cell">
          <label>Other Income Source</label>
        </div>
        <div className="income-cell">
          <select
            value={income.otherFrequency || "Monthly"}
            onChange={(e) => handleChange("otherFrequency", e.target.value)}
            className="select-plain"
          >
            {freqOptions.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
        <div className="income-cell">
          <Input
            value={income.otherIncome || ""}
            onChange={(e) => handleChange("otherIncome", e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="income-cell">
          <Input
            value={income.spouseOther || ""}
            onChange={(e) => handleChange("spouseOther", e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="income-cell">
          <Input
            value={(
              parseFloat(income.otherIncome || 0) +
              parseFloat(income.spouseOther || 0)
            ).toFixed(2)}
            readOnly
            placeholder="0.00"
          />
        </div>
      </div>

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
            value={income.totalExpenditureFrequency || "Monthly"}
            onChange={(e) =>
              handleChange("totalExpenditureFrequency", e.target.value)
            }
            className="select-plain"
          >
            {freqOptions.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
        <div className="income-cell">
          <Input
            value={income.totalExpenditureSelf || ""}
            onChange={(e) =>
              handleChange("totalExpenditureSelf", e.target.value)
            }
            placeholder="0.00"
          />
        </div>
        <div className="income-cell">
          <Input
            value={income.totalExpenditureSpouse || ""}
            onChange={(e) =>
              handleChange("totalExpenditureSpouse", e.target.value)
            }
            placeholder="0.00"
          />
        </div>
        <div className="income-cell">
          <Input
            value={computedTotalExpenditureJoint}
            readOnly
            placeholder="0.00"
          />
        </div>
      </div>

      {/* Disposable Income */}
      <div className="income-row">
        <div className="income-cell">
          <label>Disposable Income</label>
        </div>
        <div className="income-cell">
          <select
            value={income.disposableIncomeFrequency || "Monthly"}
            onChange={(e) =>
              handleChange("disposableIncomeFrequency", e.target.value)
            }
            className="select-plain"
          >
            {freqOptions.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
        <div className="income-cell">
          <Input
            value={computedDisposableIncomeSelf}
            readOnly
            placeholder="0.00"
          />
        </div>
        <div className="income-cell">
          <Input
            value={computedDisposableIncomeSpouse}
            readOnly
            placeholder="0.00"
          />
        </div>
        <div className="income-cell">
          <Input
            value={computedDisposableIncomeJoint}
            readOnly
            placeholder="0.00"
          />
        </div>
      </div>
    </Section>
  );
}

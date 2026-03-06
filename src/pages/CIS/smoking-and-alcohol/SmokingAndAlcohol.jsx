import React from "react";

function SmokingAndAlcohol({ habits = {}, handleHabitsChange = () => {} }) {
  const defaultHabits = {
    smoking: "",
    smokingPerDay: "",
    smokingEarlier: "",
    alcoholType: "",
    alcoholMeasurement: "",
    alcoholFrequency: "",
  };
  const h = { ...defaultHabits, ...habits };

  // Automatically set smokingPerDay to 0 if Non-Smoker
  React.useEffect(() => {
    if (h.smoking === "No" && h.smokingPerDay !== "0") {
      handleHabitsChange("smokingPerDay", "0");
    }
  }, [h.smoking]);

  return (
    <div className="smoking-section">
      <div className="form-box">
        <h3 className="section-title">
          Smoking and Alcohol Consumption Habits
        </h3>

        <div className="form-grid-2">
          {/* Smoker Status */}
          <div className="input-group">
            <label>
              Smoker Status{" "}
              <span className="label-parenthesis">(Smoker or Non-Smoker)</span>
            </label>
            <select
              className="box-input"
              value={h.smoking}
              onChange={(e) => handleHabitsChange("smoking", e.target.value)}
            >
              <option value="">Select</option>
              <option value="No">Non-Smoker</option>
              <option value="Yes">Smoker</option>
            </select>
          </div>

          {/* If Smoker - Cigarettes/day */}
          <div className="input-group">
            <label>
              If Smoker{" "}
              <span className="label-parenthesis">- how many cigarettes/day?</span>
            </label>
            <input
              type="number"
              className="box-input"
              value={h.smokingPerDay}
              onChange={(e) =>
                handleHabitsChange("smokingPerDay", e.target.value)
              }
              disabled={h.smoking === "No"} // disabled for Non-Smoker
            />
          </div>

          {/* If Non-Smoker - Smoking earlier (always visible) */}
          <div className="input-group">
            <label>
              If Non-Smoker{" "}
              <span className="label-parenthesis">
                - Smoking earlier? If yes, since when
              </span>
            </label>
            <input
              type="text"
              className="box-input"
              value={h.smokingEarlier}
              onChange={(e) =>
                handleHabitsChange("smokingEarlier", e.target.value)
              }
            />
          </div>

          {/* Alcohol Type */}
          <div className="input-group">
            <label>
              Alcohol Consumption <span className="label-parenthesis">- Type</span>
            </label>
            <input
              type="text"
              className="box-input"
              value={h.alcoholType}
              onChange={(e) =>
                handleHabitsChange("alcoholType", e.target.value)
              }
            />
          </div>

          {/* Alcohol Measurement */}
          <div className="input-group">
            <label>
              Alcohol Consumption{" "}
              <span className="label-parenthesis">- Measurement</span>
            </label>
            <input
              type="text"
              className="box-input"
              value={h.alcoholMeasurement}
              onChange={(e) =>
                handleHabitsChange("alcoholMeasurement", e.target.value)
              }
            />
          </div>

          {/* Alcohol Frequency */}
          <div className="input-group">
            <label>
              Alcohol Consumption{" "}
              <span className="label-parenthesis">- Frequency</span>
            </label>
            <input
              type="text"
              className="box-input"
              value={h.alcoholFrequency}
              onChange={(e) =>
                handleHabitsChange("alcoholFrequency", e.target.value)
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SmokingAndAlcohol;
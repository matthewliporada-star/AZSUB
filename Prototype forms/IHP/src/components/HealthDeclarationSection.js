import React, { useMemo } from "react";

const HealthDeclarationSection = ({
  formData,
  dependents,
  healthQuestions,
  additionalConditions,
  onHealthChange,
  onHealthQuestionChange,
  onAdditionalConditionChange,
  onAddCondition,
  onRemoveCondition,
  onDependentHealthChange,
  illnessOptions,
}) => {
  // Check if ANY checkbox in questions 1-6 is ticked for ANY person
  const hasAnyHealthIssue = useMemo(() => {
    // Check all persons: applicantOwner, dependent1, dependent2
    const persons = ["applicantOwner", "dependent1", "dependent2"];

    for (const person of persons) {
      const personData = healthQuestions[person];
      if (!personData) continue;

      // Check q1 (illnesses) - each illness has its own checkbox
      if (personData.q1) {
        for (const key in personData.q1) {
          if (personData.q1[key]) return true;
        }
      }

      // Check q2 (a, b, c)
      if (personData.q2) {
        for (const key in personData.q2) {
          if (personData.q2[key]) return true;
        }
      }

      // Check q3, q4, q5, q6 (simple booleans)
      if (personData.q3) return true;
      if (personData.q4) return true;
      if (personData.q5) return true;
      if (personData.q6) return true;
    }

    return false;
  }, [healthQuestions]);

  return (
    <>
      <PreExistingConditionsBlock
        acknowledged={formData.preExistingConditionsAcknowledged}
        onChange={(v) => onHealthChange("preExistingConditionsAcknowledged", v)}
      />

      <ImportantNotice />

      {/* BASIC HEALTH MEASUREMENTS - WITH DEPENDENT SUPPORT */}
      <BasicHealthMeasurements
        formData={formData}
        dependents={dependents}
        onHealthChange={onHealthChange}
        onDependentHealthChange={onDependentHealthChange}
      />

      {/* LIFESTYLE QUESTIONS - MOVED TO MIDDLE */}
      <LifestyleQuestions
        formData={formData}
        dependents={dependents}
        onHealthChange={onHealthChange}
        onDependentHealthChange={onDependentHealthChange}
      />

      {/* INSTRUCTION TEXT FROM PDF PAGE 6 - ADDED BEFORE QUESTION 1 */}
      <div
        style={{
          marginTop: "30px",
          marginBottom: "15px",
          padding: "12px",
          backgroundColor: "#f0f7ff",
          borderLeft: "4px solid #003266",
          borderRadius: "4px",
          fontStyle: "italic",
        }}
      >
        <p style={{ margin: 0, color: "#003266" }}>
          <strong>Instructions:</strong> Please check if applicable and provide
          the full details of the illness or disease in the Additional
          Information section.
        </p>
      </div>

      {/* TABLES - MOVED TO BOTTOM */}
      <IllnessTable
        illnessOptions={illnessOptions}
        healthQuestions={healthQuestions}
        onChange={onHealthQuestionChange}
      />

      <AdditionalQuestionsTable
        healthQuestions={healthQuestions}
        onChange={onHealthQuestionChange}
      />

      <Questions3456Table
        healthQuestions={healthQuestions}
        onChange={onHealthQuestionChange}
      />

      {/* ADDITIONAL INFORMATION - ONLY SHOWS IF ANY CHECKBOX IS TICKED */}
      {hasAnyHealthIssue && (
        <AdditionalConditionsTable
          conditions={additionalConditions}
          onChange={onAdditionalConditionChange}
          onAdd={onAddCondition}
          onRemove={onRemoveCondition}
        />
      )}
    </>
  );
};

// UPDATED BASIC HEALTH MEASUREMENTS COMPONENT - WITH FULL DEPENDENT SUPPORT
const BasicHealthMeasurements = ({
  formData,
  dependents,
  onHealthChange,
  onDependentHealthChange,
}) => (
  <div
    style={{
      marginTop: "30px",
      padding: "20px",
      border: "2px solid #003266",
      borderRadius: "8px",
      backgroundColor: "#f8f9fa",
    }}
  >
    <h4 style={{ color: "#003266", marginBottom: "15px" }}>
      Basic Health Measurements
    </h4>

    <div style={{ overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          border: "1px solid #ddd",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#003266", color: "white" }}>
            <th
              style={{
                padding: "12px",
                textAlign: "left",
                border: "1px solid #003266",
              }}
            >
              Measurement
            </th>
            <th
              style={{
                padding: "12px",
                textAlign: "center",
                border: "1px solid #003266",
              }}
            >
              Applicant Owner / Proposed Insured
            </th>
            <th
              style={{
                padding: "12px",
                textAlign: "center",
                border: "1px solid #003266",
              }}
            >
              Dependent 1
            </th>
            <th
              style={{
                padding: "12px",
                textAlign: "center",
                border: "1px solid #003266",
              }}
            >
              Dependent 2
            </th>
          </tr>
        </thead>
        <tbody>
          {/* Height Row */}
          <tr style={{ backgroundColor: "#f9f9f9" }}>
            <td
              style={{
                padding: "12px",
                border: "1px solid #ddd",
                fontWeight: "bold",
              }}
            >
              Height
            </td>
            <td style={{ padding: "12px", border: "1px solid #ddd" }}>
              <div
                style={{
                  display: "flex",
                  gap: "5px",
                  justifyContent: "center",
                }}
              >
                <input
                  type="number"
                  step="0.01"
                  value={formData.healthDeclaration?.heightFeet || ""}
                  onChange={(e) =>
                    onHealthChange(
                      "healthDeclaration.heightFeet",
                      e.target.value,
                    )
                  }
                  placeholder="ft"
                  style={{ width: "60px", padding: "5px" }}
                />
                <span>ft</span>
                <input
                  type="number"
                  step="0.01"
                  value={formData.healthDeclaration?.heightInches || ""}
                  onChange={(e) =>
                    onHealthChange(
                      "healthDeclaration.heightInches",
                      e.target.value,
                    )
                  }
                  placeholder="in"
                  style={{ width: "60px", padding: "5px" }}
                />
                <span>in</span>
              </div>
            </td>
            <td style={{ padding: "12px", border: "1px solid #ddd" }}>
              {dependents[0] && (
                <div
                  style={{
                    display: "flex",
                    gap: "5px",
                    justifyContent: "center",
                  }}
                >
                  <input
                    type="number"
                    step="0.01"
                    value={dependents[0]?.healthDeclaration?.heightFeet || ""}
                    onChange={(e) =>
                      onDependentHealthChange(
                        0,
                        "healthDeclaration.heightFeet",
                        e.target.value,
                      )
                    }
                    placeholder="ft"
                    style={{ width: "60px", padding: "5px" }}
                  />
                  <span>ft</span>
                  <input
                    type="number"
                    step="0.01"
                    value={dependents[0]?.healthDeclaration?.heightInches || ""}
                    onChange={(e) =>
                      onDependentHealthChange(
                        0,
                        "healthDeclaration.heightInches",
                        e.target.value,
                      )
                    }
                    placeholder="in"
                    style={{ width: "60px", padding: "5px" }}
                  />
                  <span>in</span>
                </div>
              )}
            </td>
            <td style={{ padding: "12px", border: "1px solid #ddd" }}>
              {dependents[1] && (
                <div
                  style={{
                    display: "flex",
                    gap: "5px",
                    justifyContent: "center",
                  }}
                >
                  <input
                    type="number"
                    step="0.01"
                    value={dependents[1]?.healthDeclaration?.heightFeet || ""}
                    onChange={(e) =>
                      onDependentHealthChange(
                        1,
                        "healthDeclaration.heightFeet",
                        e.target.value,
                      )
                    }
                    placeholder="ft"
                    style={{ width: "60px", padding: "5px" }}
                  />
                  <span>ft</span>
                  <input
                    type="number"
                    step="0.01"
                    value={dependents[1]?.healthDeclaration?.heightInches || ""}
                    onChange={(e) =>
                      onDependentHealthChange(
                        1,
                        "healthDeclaration.heightInches",
                        e.target.value,
                      )
                    }
                    placeholder="in"
                    style={{ width: "60px", padding: "5px" }}
                  />
                  <span>in</span>
                </div>
              )}
            </td>
          </tr>

          {/* Weight Row */}
          <tr>
            <td
              style={{
                padding: "12px",
                border: "1px solid #ddd",
                fontWeight: "bold",
              }}
            >
              Weight
            </td>
            <td style={{ padding: "12px", border: "1px solid #ddd" }}>
              <div
                style={{
                  display: "flex",
                  gap: "5px",
                  justifyContent: "center",
                }}
              >
                <input
                  type="number"
                  step="0.1"
                  value={formData.healthDeclaration?.weightKg || ""}
                  onChange={(e) =>
                    onHealthChange("healthDeclaration.weightKg", e.target.value)
                  }
                  placeholder="kg"
                  style={{ width: "60px", padding: "5px" }}
                />
                <span>kg /</span>
                <input
                  type="number"
                  step="0.1"
                  value={formData.healthDeclaration?.weightLbs || ""}
                  onChange={(e) =>
                    onHealthChange(
                      "healthDeclaration.weightLbs",
                      e.target.value,
                    )
                  }
                  placeholder="lbs"
                  style={{ width: "60px", padding: "5px" }}
                />
                <span>lbs</span>
              </div>
            </td>
            <td style={{ padding: "12px", border: "1px solid #ddd" }}>
              {dependents[0] && (
                <div
                  style={{
                    display: "flex",
                    gap: "5px",
                    justifyContent: "center",
                  }}
                >
                  <input
                    type="number"
                    step="0.1"
                    value={dependents[0]?.healthDeclaration?.weightKg || ""}
                    onChange={(e) =>
                      onDependentHealthChange(
                        0,
                        "healthDeclaration.weightKg",
                        e.target.value,
                      )
                    }
                    placeholder="kg"
                    style={{ width: "60px", padding: "5px" }}
                  />
                  <span>kg /</span>
                  <input
                    type="number"
                    step="0.1"
                    value={dependents[0]?.healthDeclaration?.weightLbs || ""}
                    onChange={(e) =>
                      onDependentHealthChange(
                        0,
                        "healthDeclaration.weightLbs",
                        e.target.value,
                      )
                    }
                    placeholder="lbs"
                    style={{ width: "60px", padding: "5px" }}
                  />
                  <span>lbs</span>
                </div>
              )}
            </td>
            <td style={{ padding: "12px", border: "1px solid #ddd" }}>
              {dependents[1] && (
                <div
                  style={{
                    display: "flex",
                    gap: "5px",
                    justifyContent: "center",
                  }}
                >
                  <input
                    type="number"
                    step="0.1"
                    value={dependents[1]?.healthDeclaration?.weightKg || ""}
                    onChange={(e) =>
                      onDependentHealthChange(
                        1,
                        "healthDeclaration.weightKg",
                        e.target.value,
                      )
                    }
                    placeholder="kg"
                    style={{ width: "60px", padding: "5px" }}
                  />
                  <span>kg /</span>
                  <input
                    type="number"
                    step="0.1"
                    value={dependents[1]?.healthDeclaration?.weightLbs || ""}
                    onChange={(e) =>
                      onDependentHealthChange(
                        1,
                        "healthDeclaration.weightLbs",
                        e.target.value,
                      )
                    }
                    placeholder="lbs"
                    style={{ width: "60px", padding: "5px" }}
                  />
                  <span>lbs</span>
                </div>
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

// LIFESTYLE QUESTIONS COMPONENT
const LifestyleQuestions = ({
  formData,
  dependents,
  onHealthChange,
  onDependentHealthChange,
}) => (
  <div
    style={{
      marginTop: "30px",
      padding: "20px",
      border: "2px solid #003266",
      borderRadius: "8px",
      backgroundColor: "#f8f9fa",
    }}
  >
    <h4 style={{ color: "#003266", marginBottom: "15px" }}>
      Lifestyle Questions
    </h4>

    {/* Applicant Lifestyle */}
    <div
      style={{
        marginBottom: "30px",
        padding: "15px",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        backgroundColor: "white",
      }}
    >
      <h5 style={{ color: "#003266", marginBottom: "15px" }}>
        Applicant Owner / Proposed Insured
      </h5>

      {/* Smoke/Vape */}
      <div style={{ marginBottom: "20px" }}>
        <p>
          <strong>Do you smoke cigarettes or vape?</strong>
        </p>
        <div style={{ display: "flex", gap: "20px", marginBottom: "10px" }}>
          <label>
            <input
              type="radio"
              name="smokeVape"
              checked={formData.healthDeclaration?.smokeVape === true}
              onChange={() =>
                onHealthChange("healthDeclaration.smokeVape", true)
              }
            />{" "}
            Yes
          </label>
          <label>
            <input
              type="radio"
              name="smokeVape"
              checked={formData.healthDeclaration?.smokeVape === false}
              onChange={() =>
                onHealthChange("healthDeclaration.smokeVape", false)
              }
            />{" "}
            No
          </label>
        </div>
        {formData.healthDeclaration?.smokeVape && (
          <div style={{ marginLeft: "20px" }}>
            <label>If yes, no. of sticks/ml. per day: </label>
            <input
              type="text"
              value={formData.healthDeclaration?.smokeQuantity || ""}
              onChange={(e) =>
                onHealthChange(
                  "healthDeclaration.smokeQuantity",
                  e.target.value,
                )
              }
              placeholder="Sticks/ml per day"
              style={{ marginLeft: "10px", padding: "5px", width: "200px" }}
            />
          </div>
        )}
      </div>

      {/* Alcohol */}
      <div style={{ marginBottom: "20px" }}>
        <p>
          <strong>Do you drink alcohol?</strong>
        </p>
        <div style={{ display: "flex", gap: "20px", marginBottom: "10px" }}>
          <label>
            <input
              type="radio"
              name="alcohol"
              checked={formData.healthDeclaration?.alcohol === true}
              onChange={() => onHealthChange("healthDeclaration.alcohol", true)}
            />{" "}
            Yes
          </label>
          <label>
            <input
              type="radio"
              name="alcohol"
              checked={formData.healthDeclaration?.alcohol === false}
              onChange={() =>
                onHealthChange("healthDeclaration.alcohol", false)
              }
            />{" "}
            No
          </label>
        </div>
        {formData.healthDeclaration?.alcohol && (
          <div style={{ marginLeft: "20px" }}>
            <label>If yes, no. of bottles/glass per day: </label>
            <input
              type="text"
              value={formData.healthDeclaration?.alcoholQuantity || ""}
              onChange={(e) =>
                onHealthChange(
                  "healthDeclaration.alcoholQuantity",
                  e.target.value,
                )
              }
              placeholder="Bottles/glasses per day"
              style={{ marginLeft: "10px", padding: "5px", width: "200px" }}
            />
          </div>
        )}
      </div>

      {/* Glasses/Contacts */}
      <div style={{ marginBottom: "20px" }}>
        <p>
          <strong>Do you wear glasses or contacts?</strong>
        </p>
        <div style={{ display: "flex", gap: "20px", marginBottom: "10px" }}>
          <label>
            <input
              type="radio"
              name="glassesContacts"
              checked={formData.healthDeclaration?.glassesContacts === true}
              onChange={() =>
                onHealthChange("healthDeclaration.glassesContacts", true)
              }
            />{" "}
            Yes
          </label>
          <label>
            <input
              type="radio"
              name="glassesContacts"
              checked={formData.healthDeclaration?.glassesContacts === false}
              onChange={() =>
                onHealthChange("healthDeclaration.glassesContacts", false)
              }
            />{" "}
            No
          </label>
        </div>
        {formData.healthDeclaration?.glassesContacts && (
          <div style={{ marginLeft: "20px" }}>
            <label>If yes, eye grade: </label>
            <input
              type="text"
              value={formData.healthDeclaration?.eyeGrade || ""}
              onChange={(e) =>
                onHealthChange("healthDeclaration.eyeGrade", e.target.value)
              }
              placeholder="Eye grade"
              style={{ marginLeft: "10px", padding: "5px", width: "200px" }}
            />
          </div>
        )}
      </div>
    </div>

    {/* Dependents Lifestyle */}
    {dependents.map((dep, index) => (
      <div
        key={dep.id}
        style={{
          marginBottom: "30px",
          padding: "15px",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          backgroundColor: "white",
        }}
      >
        <h5 style={{ color: "#003266", marginBottom: "15px" }}>
          Dependent {index + 1}
        </h5>

        {/* Smoke/Vape */}
        <div style={{ marginBottom: "20px" }}>
          <p>
            <strong>Do you smoke cigarettes or vape?</strong>
          </p>
          <div style={{ display: "flex", gap: "20px", marginBottom: "10px" }}>
            <label>
              <input
                type="radio"
                name={`smokeVape-${index}`}
                checked={dep.healthDeclaration?.smokeVape === true}
                onChange={() =>
                  onDependentHealthChange(
                    index,
                    "healthDeclaration.smokeVape",
                    true,
                  )
                }
              />{" "}
              Yes
            </label>
            <label>
              <input
                type="radio"
                name={`smokeVape-${index}`}
                checked={dep.healthDeclaration?.smokeVape === false}
                onChange={() =>
                  onDependentHealthChange(
                    index,
                    "healthDeclaration.smokeVape",
                    false,
                  )
                }
              />{" "}
              No
            </label>
          </div>
          {dep.healthDeclaration?.smokeVape && (
            <div style={{ marginLeft: "20px" }}>
              <label>If yes, no. of sticks/ml. per day: </label>
              <input
                type="text"
                value={dep.healthDeclaration?.smokeQuantity || ""}
                onChange={(e) =>
                  onDependentHealthChange(
                    index,
                    "healthDeclaration.smokeQuantity",
                    e.target.value,
                  )
                }
                placeholder="Sticks/ml per day"
                style={{ marginLeft: "10px", padding: "5px", width: "200px" }}
              />
            </div>
          )}
        </div>

        {/* Alcohol */}
        <div style={{ marginBottom: "20px" }}>
          <p>
            <strong>Do you drink alcohol?</strong>
          </p>
          <div style={{ display: "flex", gap: "20px", marginBottom: "10px" }}>
            <label>
              <input
                type="radio"
                name={`alcohol-${index}`}
                checked={dep.healthDeclaration?.alcohol === true}
                onChange={() =>
                  onDependentHealthChange(
                    index,
                    "healthDeclaration.alcohol",
                    true,
                  )
                }
              />{" "}
              Yes
            </label>
            <label>
              <input
                type="radio"
                name={`alcohol-${index}`}
                checked={dep.healthDeclaration?.alcohol === false}
                onChange={() =>
                  onDependentHealthChange(
                    index,
                    "healthDeclaration.alcohol",
                    false,
                  )
                }
              />{" "}
              No
            </label>
          </div>
          {dep.healthDeclaration?.alcohol && (
            <div style={{ marginLeft: "20px" }}>
              <label>If yes, no. of bottles/glass per day: </label>
              <input
                type="text"
                value={dep.healthDeclaration?.alcoholQuantity || ""}
                onChange={(e) =>
                  onDependentHealthChange(
                    index,
                    "healthDeclaration.alcoholQuantity",
                    e.target.value,
                  )
                }
                placeholder="Bottles/glasses per day"
                style={{ marginLeft: "10px", padding: "5px", width: "200px" }}
              />
            </div>
          )}
        </div>

        {/* Glasses/Contacts */}
        <div style={{ marginBottom: "20px" }}>
          <p>
            <strong>Do you wear glasses or contacts?</strong>
          </p>
          <div style={{ display: "flex", gap: "20px", marginBottom: "10px" }}>
            <label>
              <input
                type="radio"
                name={`glasses-${index}`}
                checked={dep.healthDeclaration?.glassesContacts === true}
                onChange={() =>
                  onDependentHealthChange(
                    index,
                    "healthDeclaration.glassesContacts",
                    true,
                  )
                }
              />{" "}
              Yes
            </label>
            <label>
              <input
                type="radio"
                name={`glasses-${index}`}
                checked={dep.healthDeclaration?.glassesContacts === false}
                onChange={() =>
                  onDependentHealthChange(
                    index,
                    "healthDeclaration.glassesContacts",
                    false,
                  )
                }
              />{" "}
              No
            </label>
          </div>
          {dep.healthDeclaration?.glassesContacts && (
            <div style={{ marginLeft: "20px" }}>
              <label>If yes, eye grade: </label>
              <input
                type="text"
                value={dep.healthDeclaration?.eyeGrade || ""}
                onChange={(e) =>
                  onDependentHealthChange(
                    index,
                    "healthDeclaration.eyeGrade",
                    e.target.value,
                  )
                }
                placeholder="Eye grade"
                style={{ marginLeft: "10px", padding: "5px", width: "200px" }}
              />
            </div>
          )}
        </div>
      </div>
    ))}
  </div>
);

// PRE-EXISTING CONDITIONS BLOCK
const PreExistingConditionsBlock = ({ acknowledged, onChange }) => (
  <div
    style={{
      marginBottom: "20px",
      padding: "15px",
      backgroundColor: "#e8f4fd",
      borderRadius: "5px",
      borderLeft: "4px solid #003266",
    }}
  >
    <h4 style={{ color: "#003266", marginTop: 0 }}>PRE-EXISTING CONDITIONS</h4>
    <p>
      Pre-existing conditions are medical conditions or any related conditions
      for which one or more symptoms have been displayed at some point during
      the Insured's lifetime, irrespective of whether any medical treatment or
      advice was sought. Any such condition or related condition which presented
      signs or symptoms which the Insured was aware of or should reasonably have
      been aware will be deemed to be a pre-existing condition. Pre-existing
      conditions disclosed during the application are covered under the policy,
      unless otherwise advised by us in writing. Conditions arising between the
      completion of the Application form and the date of entry of an Insured,
      will equally be deemed to be pre-existing. Such pre-existing conditions
      will also be subject to medical underwriting and if not disclosed, they
      will not be covered.<br></br>
      <br></br>
      Please advise us of any material changes to the information provided,
      between submission of this application and acceptance by us. You are
      hereby obliged on request to provide any further information that we might
      require. Full and accurate completion of this Application Form and
      disclosure of all relevant information are conditions precedent to cover
    </p>
  </div>
);

const ImportantNotice = () => (
  <div
    style={{
      marginBottom: "20px",
      padding: "15px",
      backgroundColor: "#fff3cd",
      borderRadius: "5px",
    }}
  >
    <p>
      <strong>Important:</strong> Please answer the following questions on the
      basis of your own and your dependents' complete medical history. All
      material facts (facts likely to influence our assessment and acceptance of
      this application) must be disclosed. Failure to do so may invalidate the
      policy. If you are in any doubt as to whether a fact is material, then it
      should be disclosed.
    </p>
  </div>
);

// TABLES
const IllnessTable = ({ illnessOptions, healthQuestions, onChange }) => (
  <div style={{ marginTop: "15px" }}>
    <p>
      <strong>
        1. Have you ever suffered from or ever had the following illnesses or
        diseases?
      </strong>
    </p>
    <div style={{ overflowX: "auto", marginTop: "15px" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          border: "1px solid #ddd",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f5f5f5" }}>
            <th
              style={{
                padding: "12px",
                textAlign: "left",
                border: "1px solid #ddd",
                width: "60%",
              }}
            >
              Illness/Disease
            </th>
            <th
              style={{
                padding: "12px",
                textAlign: "center",
                border: "1px solid #ddd",
              }}
            >
              Applicant
            </th>
            <th
              style={{
                padding: "12px",
                textAlign: "center",
                border: "1px solid #ddd",
              }}
            >
              Dependent 1
            </th>
            <th
              style={{
                padding: "12px",
                textAlign: "center",
                border: "1px solid #ddd",
              }}
            >
              Dependent 2
            </th>
          </tr>
        </thead>
        <tbody>
          {illnessOptions.map((illness, index) => (
            <tr
              key={illness.key}
              style={{ backgroundColor: index % 2 === 0 ? "#fff" : "#f9f9f9" }}
            >
              <td style={{ padding: "10px 12px", border: "1px solid #ddd" }}>
                {illness.label}
              </td>
              <td
                style={{
                  padding: "10px",
                  textAlign: "center",
                  border: "1px solid #ddd",
                }}
              >
                <input
                  type="checkbox"
                  checked={healthQuestions.applicantOwner.q1[illness.key]}
                  onChange={(e) =>
                    onChange(
                      "applicantOwner",
                      "q1",
                      illness.key,
                      e.target.checked,
                    )
                  }
                />
              </td>
              <td
                style={{
                  padding: "10px",
                  textAlign: "center",
                  border: "1px solid #ddd",
                }}
              >
                <input
                  type="checkbox"
                  checked={healthQuestions.dependent1.q1[illness.key]}
                  onChange={(e) =>
                    onChange("dependent1", "q1", illness.key, e.target.checked)
                  }
                />
              </td>
              <td
                style={{
                  padding: "10px",
                  textAlign: "center",
                  border: "1px solid #ddd",
                }}
              >
                <input
                  type="checkbox"
                  checked={healthQuestions.dependent2.q1[illness.key]}
                  onChange={(e) =>
                    onChange("dependent2", "q1", illness.key, e.target.checked)
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const AdditionalQuestionsTable = ({ healthQuestions, onChange }) => (
  <div style={{ marginTop: "30px" }}>
    <p>
      <strong>2. Have you ever:</strong>
    </p>
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        border: "1px solid #ddd",
      }}
    >
      <thead>
        <tr style={{ backgroundColor: "#f5f5f5" }}>
          <th
            style={{
              padding: "12px",
              textAlign: "left",
              border: "1px solid #ddd",
            }}
          >
            Question
          </th>
          <th
            style={{
              padding: "12px",
              textAlign: "center",
              border: "1px solid #ddd",
            }}
          >
            Applicant
          </th>
          <th
            style={{
              padding: "12px",
              textAlign: "center",
              border: "1px solid #ddd",
            }}
          >
            Dependent 1
          </th>
          <th
            style={{
              padding: "12px",
              textAlign: "center",
              border: "1px solid #ddd",
            }}
          >
            Dependent 2
          </th>
        </tr>
      </thead>
      <tbody>
        {[
          {
            key: "a",
            label:
              "a. been tested for HIV, Hepatitis A-B-C or currently awaiting the results of such a test?",
          },
          {
            key: "b",
            label:
              "b. been admitted to a hospital or undergone surgery during the last ten (10) years?",
          },
          {
            key: "c",
            label:
              "c. been incapacitated or unable to work for a period of more than 2 continuous weeks due to any symptom(s) or medical condition(s)?",
          },
        ].map((q, index) => (
          <tr
            key={q.key}
            style={{ backgroundColor: index % 2 === 0 ? "#fff" : "#f9f9f9" }}
          >
            <td style={{ padding: "10px 12px", border: "1px solid #ddd" }}>
              {q.label}
            </td>
            <td
              style={{
                padding: "10px",
                textAlign: "center",
                border: "1px solid #ddd",
              }}
            >
              <input
                type="checkbox"
                checked={healthQuestions.applicantOwner.q2[q.key]}
                onChange={(e) =>
                  onChange("applicantOwner", "q2", q.key, e.target.checked)
                }
              />
            </td>
            <td
              style={{
                padding: "10px",
                textAlign: "center",
                border: "1px solid #ddd",
              }}
            >
              <input
                type="checkbox"
                checked={healthQuestions.dependent1.q2[q.key]}
                onChange={(e) =>
                  onChange("dependent1", "q2", q.key, e.target.checked)
                }
              />
            </td>
            <td
              style={{
                padding: "10px",
                textAlign: "center",
                border: "1px solid #ddd",
              }}
            >
              <input
                type="checkbox"
                checked={healthQuestions.dependent2.q2[q.key]}
                onChange={(e) =>
                  onChange("dependent2", "q2", q.key, e.target.checked)
                }
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Questions3456Table = ({ healthQuestions, onChange }) => (
  <div style={{ marginTop: "30px" }}>
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        border: "1px solid #ddd",
      }}
    >
      <thead>
        <tr style={{ backgroundColor: "#f5f5f5" }}>
          <th
            style={{
              padding: "12px",
              textAlign: "left",
              border: "1px solid #ddd",
              width: "60%",
            }}
          >
            Question
          </th>
          <th
            style={{
              padding: "12px",
              textAlign: "center",
              border: "1px solid #ddd",
            }}
          >
            Applicant
          </th>
          <th
            style={{
              padding: "12px",
              textAlign: "center",
              border: "1px solid #ddd",
            }}
          >
            Dependent 1
          </th>
          <th
            style={{
              padding: "12px",
              textAlign: "center",
              border: "1px solid #ddd",
            }}
          >
            Dependent 2
          </th>
        </tr>
      </thead>
      <tbody>
        {[3, 4, 5, 6].map((num, index) => (
          <tr
            key={num}
            style={{ backgroundColor: index % 2 === 0 ? "#fff" : "#f9f9f9" }}
          >
            <td style={{ padding: "10px 12px", border: "1px solid #ddd" }}>
              <strong>{num}. </strong>
              {getQuestionText(num)}
            </td>
            <td
              style={{
                padding: "10px",
                textAlign: "center",
                border: "1px solid #ddd",
              }}
            >
              <input
                type="checkbox"
                checked={healthQuestions.applicantOwner[`q${num}`]}
                onChange={(e) =>
                  onChange("applicantOwner", `q${num}`, null, e.target.checked)
                }
              />
            </td>
            <td
              style={{
                padding: "10px",
                textAlign: "center",
                border: "1px solid #ddd",
              }}
            >
              <input
                type="checkbox"
                checked={healthQuestions.dependent1[`q${num}`]}
                onChange={(e) =>
                  onChange("dependent1", `q${num}`, null, e.target.checked)
                }
              />
            </td>
            <td
              style={{
                padding: "10px",
                textAlign: "center",
                border: "1px solid #ddd",
              }}
            >
              <input
                type="checkbox"
                checked={healthQuestions.dependent2[`q${num}`]}
                onChange={(e) =>
                  onChange("dependent2", `q${num}`, null, e.target.checked)
                }
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const getQuestionText = (num) => {
  const texts = {
    3: "Are you taking any prescribed medication, any other medical treatment or is under the care of a medical specialist?",
    4: "Have you undergone any medical tests or investigations, or awaiting results, treatment or further tests/investigations due to any symptom or medical conditions?",
    5: "Do you have any other illnesses, medical condition or symptom(s) not mentioned above? If yes, please include details of any known or suspected issues whether or not medical advice has been sought or a diagnosis reached.",
    6: "Has any of your applications ever been postponed, declined or accepted on special terms by any Insurance Company or Health Maintenance Organization (HMO)?",
  };
  return texts[num];
};

const AdditionalConditionsTable = ({
  conditions,
  onChange,
  onAdd,
  onRemove,
}) => (
  <div
    style={{
      marginTop: "30px",
      paddingTop: "20px",
      borderTop: "2px solid #003266",
    }}
  >
    <h4 style={{ color: "#003266", marginBottom: "15px" }}>
      Additional Information
    </h4>

    {/* Instruction text from PDF Page 7 */}
    <div
      style={{
        marginBottom: "20px",
        padding: "15px",
        backgroundColor: "#f8f9fa",
        borderLeft: "4px solid #003266",
        fontSize: "14px",
      }}
    >
      <p style={{ margin: 0 }}>
        <strong>Note:</strong> If you checked any boxes on questions 1 to 6 of
        the Health Declaration section, please provide details below. We reserve
        the right to request further medical evidence as part of the full
        medical underwriting process.
      </p>
      <p style={{ margin: "10px 0 0 0" }}>
        Please advise if a full recovery has been made and if you have any
        condition or disease related to; or arising from; the original
        diagnosis. Please enclose up-to-date supporting medical reports/test
        results if possible.
      </p>
    </div>

    {conditions.map((condition, index) => (
      <div
        key={index}
        style={{
          marginBottom: "20px",
          padding: "15px",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "10px",
          }}
        >
          <h5>Condition {index + 1}</h5>
          {conditions.length > 1 && (
            <button
              type="button"
              onClick={() => onRemove(index)}
              style={{
                background: "#dc3545",
                color: "white",
                padding: "4px 8px",
                fontSize: "12px",
              }}
            >
              Remove
            </button>
          )}
        </div>

        <div className="form-grid">
          <FormInput
            label="Question No."
            value={condition.questionNo}
            onChange={(v) => onChange(index, "questionNo", v)}
          />
          <FormInput
            label="Name of Person"
            value={condition.nameOfPerson}
            onChange={(v) => onChange(index, "nameOfPerson", v)}
          />
          <FormInput
            label="Diagnosis"
            value={condition.diagnosis}
            onChange={(v) => onChange(index, "diagnosis", v)}
          />
        </div>

        <div className="form-grid">
          <FormInput
            label="Date of Onset"
            value={condition.dateOfOnset}
            onChange={(v) => onChange(index, "dateOfOnset", v)}
          />
          <FormInput
            label="Frequency/Severity"
            value={condition.frequencySeverity}
            onChange={(v) => onChange(index, "frequencySeverity", v)}
          />
          <FormInput
            label="Medical Test Results"
            value={condition.medicalTestResults}
            onChange={(v) => onChange(index, "medicalTestResults", v)}
          />
        </div>

        <div className="form-grid">
          <FormInput
            label="Treatment"
            value={condition.treatment}
            onChange={(v) => onChange(index, "treatment", v)}
          />
          <FormInput
            label="Current Status"
            value={condition.currentStatus}
            onChange={(v) => onChange(index, "currentStatus", v)}
          />
        </div>
      </div>
    ))}

    <button
      type="button"
      onClick={onAdd}
      style={{
        background: "#003266",
        color: "white",
        padding: "8px 16px",
        marginTop: "10px",
      }}
    >
      + Add Condition
    </button>
  </div>
);

const FormInput = ({ label, value, onChange }) => (
  <div className="form-group">
    <label>{label}</label>
    <input
      type="text"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export default HealthDeclarationSection;

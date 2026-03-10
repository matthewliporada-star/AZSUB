import React, { useState } from "react";
import "../CIS.css";

function PersonalInformation({ personalInfo, setPersonalInfo, countries }) {
  const [cities, setCities] = useState({});

  // Update top-level personal info
  const handlePersonalInfoChange = (field, value) =>
    setPersonalInfo((prev) => ({ ...prev, [field]: value }));

  // Update nested fields like addresses
  const handleNestedChange = (section, field, value) =>
    setPersonalInfo((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));

  // Simulate fetching cities from API
  const fetchCities = async (countryCode) => {
    // Replace with real API call if available
    return ["City 1", "City 2", "City 3"];
  };

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) return "";
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    const part1 = digits.slice(0, 3);
    const part2 = digits.slice(3, 6);
    const part3 = digits.slice(6, 10);
    const rest = digits.slice(10);
    return rest
      ? `${part1}-${part2}-${part3} ${rest}`
      : `${part1}-${part2}-${part3}`;
  };

  return (
    <div className="form-box personal-info-section">
      <h3 className="section-title">Personal Information</h3>

      {/* Full Name & Father's Name */}
      <div className="form-grid-2">
        <div className="input-group">
          <label>Full name of Mr. /Mrs.</label>
          <input
            className="box-input"
            value={personalInfo.full_name}
            onChange={(e) =>
              handlePersonalInfoChange("full_name", e.target.value)
            }
          />
        </div>

        <div className="input-group">
          <label>Father's Name</label>
          <input
            className="box-input"
            value={personalInfo.fathers_name}
            onChange={(e) =>
              handlePersonalInfoChange("fathers_name", e.target.value)
            }
          />
        </div>
      </div>

      {/* Mobile & Email side by side */}
      <div className="form-grid-2">
        {/* Mobile No */}
        <div className="input-group">
          <label>Mobile No.</label>
          <div className="mobile-input-wrapper">
            <input
              type="tel"
              className="mobile-number-input-cis"
              placeholder="Enter mobile number"
              maxLength={18}
              value={personalInfo.mobile_no}
              onChange={(e) =>
                handlePersonalInfoChange(
                  "mobile_no",
                  formatPhone(e.target.value),
                )
              }
            />
          </div>
        </div>

        {/* Email */}
        <div className="input-group">
          <label>Email Address</label>
          <input
            type="email"
            className="box-input"
            placeholder="Enter email address"
            value={personalInfo.email}
            onChange={(e) => handlePersonalInfoChange("email", e.target.value)}
          />
        </div>
      </div>

      {/* Addresses */}
      {[
        {
          key: "residence_address",
          label: "Residence Address (Please provide complete address",
        },
        {
          key: "previous_residence",
          label:
            "Previous Residence and dates resided (if any, please provide complete address",
        },
        {
          key: "secondary_residence",
          label:
            "Provide information for any current secondary residence and previous primary and secondary residences you have had in the past 10 years",
        },
        {
          key: "permanent_address",
          label: "Permanent Address (Please provide complete address",
        },
      ].map(({ key: addrKey, label: labelText }) => {
        const addr = personalInfo[addrKey];

        return (
          <div className="input-group" key={addrKey}>
            <label>
              {labelText.split("(")[0].trim()}{" "}
              {labelText.includes("(") && (
                <span className="label-parenthesis">
                  ({labelText.split("(")[1]})
                </span>
              )}
            </label>

            {addrKey === "permanent_address" ? (
              <div className="permanent-address-wrapper">
                {/* Permanent Address */}
                <div className="input-group">
                  <input
                    className="box-input"
                    value={addr.address || ""}
                    onChange={(e) =>
                      handleNestedChange(addrKey, "address", e.target.value)
                    }
                  />
                </div>

                {/* How long lived at current address & country */}
                <div className="input-group">
                  <label>
                    How long have you lived at your current address & in current
                    country?
                  </label>
                  <input
                    className="box-input"
                    value={addr.duration || ""}
                    onChange={(e) =>
                      handleNestedChange(addrKey, "duration", e.target.value)
                    }
                  />
                </div>
              </div>
            ) : (
              // NORMAL ADDRESS FIELDS (unchanged)
              <div className="form-grid-3">
                {/* Address */}
                <input
                  placeholder="Address"
                  className="box-input"
                  value={addr.address || ""}
                  onChange={(e) =>
                    handleNestedChange(addrKey, "address", e.target.value)
                  }
                />

                {/* Country */}
                <select
                  className="box-input"
                  value={addr.country || ""}
                  onChange={async (e) => {
                    const countryCode = e.target.value;
                    handleNestedChange(addrKey, "country", countryCode);
                    handleNestedChange(addrKey, "city", "");
                    if (countryCode && !cities[countryCode]) {
                      const cityList = await fetchCities(countryCode);
                      setCities((prev) => ({
                        ...prev,
                        [countryCode]: cityList,
                      }));
                    }
                  }}
                >
                  <option value="">Select Country</option>
                  {countries.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>

                {/* City */}
                <input
                  type="text"
                  className="box-input"
                  placeholder="Enter City"
                  value={addr.city || ""}
                  onChange={(e) =>
                    handleNestedChange(addrKey, "city", e.target.value)
                  }
                />

                {/* Postal Code */}
                <input
                  placeholder="Postal Code"
                  className="box-input"
                  value={addr.postal_code || ""}
                  onChange={(e) =>
                    handleNestedChange(addrKey, "postal_code", e.target.value)
                  }
                />

                {/* Dates (only for previous/secondary residence) */}
                {["previous_residence", "secondary_residence"].includes(
                  addrKey,
                ) && (
                  <input
                    type="date"
                    className="box-input"
                    value={addr.dates || ""}
                    onChange={(e) =>
                      handleNestedChange(addrKey, "dates", e.target.value)
                    }
                  />
                )}
              </div>
            )}
            {/* How long lived at current address & country */}
          </div>
        );
      })}

      {/* Tax, TIN, Citizenship & Hobbies aligned like Mobile/Email */}
      <div className="form-grid-2">
        <div className="input-group">
          <label>Tax Residency Information</label>
          <input
            className="box-input"
            value={personalInfo.tax_residency_info}
            onChange={(e) =>
              handlePersonalInfoChange("tax_residency_info", e.target.value)
            }
          />
        </div>

        <div className="input-group">
          <label>TIN / SSN Number</label>
          <input
            className="box-input"
            value={personalInfo.tin_ssn}
            onChange={(e) =>
              handlePersonalInfoChange("tin_ssn", e.target.value)
            }
          />
        </div>
      </div>

      {/* Citizenship & Hobbies side by side */}
      <div className="form-grid-2">
        <div className="input-group">
          <label>List Countries of Citizenship</label>
          <input
            className="box-input"
            value={personalInfo.citizenship}
            onChange={(e) =>
              handlePersonalInfoChange("citizenship", e.target.value)
            }
          />
        </div>

        <div className="input-group">
          <label>Hobbies and Activities</label>
          <input
            className="box-input"
            value={personalInfo.hobbies}
            onChange={(e) =>
              handlePersonalInfoChange("hobbies", e.target.value)
            }
          />
        </div>
      </div>
    </div>
  );
}

export default PersonalInformation;

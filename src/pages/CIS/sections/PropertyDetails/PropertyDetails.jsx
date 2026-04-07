import React from "react";
import Section from "../../components/Section";
import Input from "../../components/Input";
import { useForm } from "../../context/FormContext";

export default function PropertyDetails() {
  const { formData, updateFormData } = useForm();
  const propertyDetails = formData.propertyDetails || [];

  const handleUpdate = (idx, field, value) => {
    updateFormData("propertyDetails", { index: idx, field }, value);
  };

  const renderPropRow = (idx, isFirstRow = false, sectionType = "") => {
    const prop = propertyDetails[idx] || {};
    return (
      <div key={idx} className="prop-row">
        <div className="prop-cell">
          {isFirstRow ? (
            <span
              style={{ fontWeight: "500", fontSize: "11px", lineHeight: "1.4" }}
            >
              {sectionType}
            </span>
          ) : (
            <span>&nbsp;</span>
          )}
        </div>
        <div className="prop-cell">
          <Input
            placeholder="Address, City, Country"
            value={prop.location || ""}
            onChange={(e) => handleUpdate(idx, "location", e.target.value)}
          />
        </div>
        <div className="prop-cell">
          <Input
            placeholder="dd/mm/yyyy"
            value={prop.purchaseDate || ""}
            onChange={(e) => handleUpdate(idx, "purchaseDate", e.target.value)}
          />
        </div>
        <div className="prop-cell">
          <Input
            placeholder="0.00"
            value={prop.purchasePrice || ""}
            onChange={(e) => handleUpdate(idx, "purchasePrice", e.target.value)}
          />
        </div>
        <div className="prop-cell">
          <Input
            placeholder="0.00"
            value={prop.mortgage || ""}
            onChange={(e) => handleUpdate(idx, "mortgage", e.target.value)}
          />
        </div>
        <div className="prop-cell">
          <Input
            placeholder="0.00"
            value={prop.currentValue || ""}
            onChange={(e) => handleUpdate(idx, "currentValue", e.target.value)}
          />
        </div>
        <div className="prop-cell">
          <Input
            placeholder="e.g., Daily, Weekly"
            value={prop.frequencyVisits || ""}
            onChange={(e) =>
              handleUpdate(idx, "frequencyVisits", e.target.value)
            }
          />
        </div>
      </div>
    );
  };

  return (
    <Section number={9} title="Property Details" isTable>
      <div className="prop-header">
        <span>Type</span>
        <span>Location - Complete Address with city & country</span>
        <span>Date of Purchase (dd/mm/yyyy)</span>
        <span>Purchase Price (USD)</span>
        <span>Mortgage (USD)</span>
        <span>Current Value (USD)</span>
        <span>Frequency of visits/stays</span>
      </div>

      {/* Personal Properties - 4 rows */}
      {[0, 1, 2, 3].map((idx) =>
        renderPropRow(idx, idx === 0, "Personal Properties"),
      )}

      {/* Real Estate Properties - 4 rows */}
      {[4, 5, 6, 7].map((idx) =>
        renderPropRow(
          idx,
          idx === 4,
          "Real Estate (Please list all properties of which you are a full or partial owner. If you are a partial owner of a property, please specify the percentage of ownership for that particular property.)",
        ),
      )}
    </Section>
  );
}

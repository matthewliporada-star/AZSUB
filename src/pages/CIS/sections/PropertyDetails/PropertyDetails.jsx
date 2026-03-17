import React from "react";
import Section from "../../components/Section";
import Input from "../../components/Input";
import { useForm } from "../../context/FormContext";

export default function PropertyDetails() {
  const { formData, updateFormData } = useForm();

  const handleUpdate = (key, value) => {
    updateFormData(key, value);
  };

  const renderPropRow = (type, idx) => {
    const baseKey = `prop_${type}_${idx}`;
    return (
      <div key={idx} className="prop-row">
        <div className="prop-cell cell-3">
          <Input
            placeholder={
              idx === 0
                ? type === "personal"
                  ? "e.g. Apartment"
                  : "e.g. Commercial"
                : ""
            }
            value={formData[`${baseKey}_type`] || ""}
            onChange={(e) => handleUpdate(`${baseKey}_type`, e.target.value)}
          />
        </div>
        <div className="prop-cell">
          <Input
            value={formData[`${baseKey}_location`] || ""}
            onChange={(e) =>
              handleUpdate(`${baseKey}_location`, e.target.value)
            }
          />
        </div>
        <div className="prop-cell">
          <Input
            placeholder="dd/mm/yyyy"
            value={formData[`${baseKey}_date`] || ""}
            onChange={(e) => handleUpdate(`${baseKey}_date`, e.target.value)}
          />
        </div>
        <div className="prop-cell">
          <Input
            placeholder="0.00"
            value={formData[`${baseKey}_price`] || ""}
            onChange={(e) => handleUpdate(`${baseKey}_price`, e.target.value)}
          />
        </div>
        <div className="prop-cell">
          <Input
            placeholder="0.00"
            value={formData[`${baseKey}_mortgage`] || ""}
            onChange={(e) =>
              handleUpdate(`${baseKey}_mortgage`, e.target.value)
            }
          />
        </div>
        <div className="prop-cell">
          <Input
            placeholder="0.00"
            value={formData[`${baseKey}_value`] || ""}
            onChange={(e) => handleUpdate(`${baseKey}_value`, e.target.value)}
          />
        </div>
        <div className="prop-cell">
          <Input
            value={formData[`${baseKey}_visits`] || ""}
            onChange={(e) => handleUpdate(`${baseKey}_visits`, e.target.value)}
          />
        </div>
      </div>
    );
  };

  return (
    <Section number={9} title="Property Details" isTable>
      <div className="prop-header">
        <span>Type</span>
        <span>Location (Address, City & Country)</span>
        <span>Date of Purchase</span>
        <span>Purchase Price (USD)</span>
        <span>Mortgage (USD)</span>
        <span>Current Value (USD)</span>
        <span>Frequency of Visits</span>
      </div>
      <div className="sub-header personal-props">Personal Properties</div>
      {[...Array(2)].map((_, idx) => renderPropRow("personal", idx))}

      <div className="sub-header real-estate">
        Real Estate (full or partial ownership — specify % if partial)
      </div>
      {[...Array(2)].map((_, idx) => renderPropRow("realestate", idx))}
    </Section>
  );
}

import React from "react";
import Section from "../../components/Section";
import Input from "../../components/Input";
import { useForm } from "../../context/FormContext";

export default function PropertyDetails() {
  const { formData, updateFormData } = useForm();

  const handleUpdate = (key, value) => {
    updateFormData(key, value);
  };

  // 1. DEFINE GRID LAYOUT
  // Adjust these fractions (fr) or pixels (px) to change column widths
  const gridLayout = "1.2fr 1.5fr 1fr 1fr 1fr 1fr 1fr";

  const renderPropRow = (type, idx) => {
    const baseKey = `prop_${type}_${idx}`;
    return (
      <div key={idx} className="prop-row">
        <div className="prop-cell">
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
      {/* SCOPED GRID STYLES */}
      <style>{`
        .property-grid-container .prop-header,
        .property-grid-container .prop-row {
          display: grid !important;
          grid-template-columns: ${gridLayout} !important;
          width: 100% !important;
          align-items: stretch;
          border-bottom: 1px solid var(--border);
        }

        .property-grid-container .prop-header {
          background: var(--navy);
          border-bottom: none;
        }

        .property-grid-container .prop-header span,
        .property-grid-container .prop-cell {
          padding: 10px 12px !important;
          display: flex;
          align-items: center;
          border-right: 1px solid var(--border) !important;
          box-sizing: border-box;
          min-height: 45px;
        }

        /* Header specific text styles */
        .property-grid-container .prop-header span {
          color: white;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          border-right: 1px solid rgba(255, 255, 255, 0.1) !important;
          line-height: 1.2;
        }

        /* Remove last border */
        .property-grid-container .prop-header span:last-child,
        .property-grid-container .prop-cell:last-child {
          border-right: none !important;
        }

        .property-grid-container .sub-header {
          grid-column: 1 / -1; /* Spans across all columns */
          background: #f8fafc;
          padding: 8px 15px;
          font-weight: 700;
          font-size: 11px;
          text-transform: uppercase;
          color: var(--navy);
          border-bottom: 1px solid var(--border);
          border-left: 3px solid var(--gold);
        }
      `}</style>

      <div className="property-grid-container">
        <div className="prop-header">
          <span>Type</span>
          <span>Location (Address, City & Country)</span>
          <span>Date of Purchase</span>
          <span>Purchase Price (USD)</span>
          <span>Mortgage (USD)</span>
          <span>Current Value (USD)</span>
          <span>Frequency of Visits</span>
        </div>

        <div className="sub-header">Personal Properties</div>
        {[...Array(2)].map((_, idx) => renderPropRow("personal", idx))}

        <div className="sub-header">
          Real Estate (full or partial ownership — specify % if partial)
        </div>
        {[...Array(2)].map((_, idx) => renderPropRow("realestate", idx))}
      </div>
    </Section>
  );
}

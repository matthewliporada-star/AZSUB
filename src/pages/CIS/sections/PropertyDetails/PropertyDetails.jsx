import React from "react";
import Section from "../../components/Section";
import FormRow from "../../components/FormRow";
import FormCell from "../../components/FormCell";
import Input from "../../components/Input";
import Select from "../../components/Select";

export default function PropertyDetails() {
  return (
    <Section number={9} title="Property Details" isTable>
      <div className="prop-header">
        <span>Type</span>
        <span>Location (Complete Address, City & Country)</span>
        <span>Date of Purchase</span>
        <span>Purchase Price (USD)</span>
        <span>Mortgage (USD)</span>
        <span>Current Value (USD)</span>
        <span>Frequency of Visits/Stays</span>
      </div>
      <div className="sub-header personal-props">Personal Properties</div>
      {[...Array(2)].map((_, idx) => (
        <div key={idx} className="prop-row">
          <div className="prop-cell cell-3">
            <Input placeholder={idx === 0 ? "e.g. Apartment" : ""} />
          </div>
          <div className="prop-cell">
            <Input />
          </div>
          <div className="prop-cell">
            <Input placeholder="dd/mm/yyyy" />
          </div>
          <div className="prop-cell">
            <Input placeholder="0.00" />
          </div>
          <div className="prop-cell">
            <Input placeholder="0.00" />
          </div>
          <div className="prop-cell">
            <Input placeholder="0.00" />
          </div>
          <div className="prop-cell">
            <Input />
          </div>
        </div>
      ))}
      <div className="sub-header real-estate">
        Real Estate (full or partial ownership — specify % if partial)
      </div>
      {[...Array(2)].map((_, idx) => (
        <div key={idx} className="prop-row">
          <div className="prop-cell">
            <Input placeholder={idx === 0 ? "e.g. Commercial" : ""} />
          </div>
          <div className="prop-cell">
            <Input />
          </div>
          <div className="prop-cell">
            <Input placeholder="dd/mm/yyyy" />
          </div>
          <div className="prop-cell">
            <Input placeholder="0.00" />
          </div>
          <div className="prop-cell">
            <Input placeholder="0.00" />
          </div>
          <div className="prop-cell">
            <Input placeholder="0.00" />
          </div>
          <div className="prop-cell">
            <Input />
          </div>
        </div>
      ))}
    </Section>
  );
}

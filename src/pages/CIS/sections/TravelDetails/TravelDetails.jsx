import React from "react";
import Section from "../../components/Section";
import Input from "../../components/Input";
import TableHeader from "../../components/TableHeader";
import TableRow from "../../components/TableRow";
import { useForm } from "../../context/FormContext";

export default function TravelDetails() {
  const { formData, setFormData, updateFormData } = useForm();
  const travel = formData.travelDetails || [];

  const handleTableChange = (rowIdx, field) => (e) => {
    updateFormData("travelDetails", { index: rowIdx, field }, e.target.value);
  };

  const addRow = () => {
    setFormData((prev) => ({
      ...prev,
      travelDetails: [
        ...(prev.travelDetails || []),
        {
          country: "",
          city: "",
          length_of_stay: "",
          frequency: "",
          date_travel: "",
          reason: "",
        },
      ],
    }));
  };

  const removeRow = (rowIdx) => {
    setFormData((prev) => ({
      ...prev,
      travelDetails: (prev.travelDetails || []).filter(
        (_, index) => index !== rowIdx,
      ),
    }));
  };

  return (
    <Section
      number={2}
      title="Travel Details"
      isTable
      action={
        <button type="button" className="add-row-btn" onClick={addRow}>
          + Add Travel
        </button>
      }
    >
      <div className="table-wrap">
        <TableHeader
          spans={[
            { text: "Country" },
            { text: "City" },
            { text: "Length of Stay" },
            { text: "Frequency" },
            { text: "Date of Travel" },
            { text: "Reason" },
            { text: "Action" },
          ]}
        />
        {travel.map((row, idx) => (
          <TableRow
            key={idx}
            cells={[
              {
                content: (
                  <Input
                    value={row.country || ""}
                    onChange={handleTableChange(idx, "country")}
                  />
                ),
              },
              {
                content: (
                  <Input
                    value={row.city || ""}
                    onChange={handleTableChange(idx, "city")}
                  />
                ),
              },
              {
                content: (
                  <Input
                    value={row.length_of_stay || ""}
                    onChange={handleTableChange(idx, "length_of_stay")}
                  />
                ),
              },
              {
                content: (
                  <Input
                    value={row.frequency || ""}
                    onChange={handleTableChange(idx, "frequency")}
                  />
                ),
              },
              {
                content: (
                  <Input
                    value={row.date_travel || ""}
                    onChange={handleTableChange(idx, "date_travel")}
                    placeholder="DD-MM-YY"
                  />
                ),
              },
              {
                content: (
                  <Input
                    value={row.reason || ""}
                    onChange={handleTableChange(idx, "reason")}
                  />
                ),
              },
              {
                content: (
                  <button
                    type="button"
                    className="remove-row-btn"
                    onClick={() => removeRow(idx)}
                    disabled={travel.length <= 1}
                  >
                    Remove
                  </button>
                ),
              },
            ]}
          />
        ))}
      </div>
    </Section>
  );
}

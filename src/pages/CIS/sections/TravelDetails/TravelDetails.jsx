import React from "react";
import Section from "../../components/Section";
import Input from "../../components/Input";
import TableHeader from "../../components/TableHeader";
import TableRow from "../../components/TableRow";
// 1. Import the hook
import { useForm } from "../../context/FormContext";

export default function TravelDetails() {
  // 2. Access context
  const { formData, updateFormData } = useForm();

  const rows = 3;

  // Helper to handle table input changes
  const handleTableChange = (rowIdx, field) => (e) => {
    // Saves as "travel_country_0", "travel_city_1", etc.
    updateFormData(`travel_${field}_${rowIdx}`, e.target.value);
  };

  return (
    <Section number={2} title="Travel Details" isTable>
      <div className="table-wrap">
        <TableHeader
          spans={[
            { text: "Country" },
            { text: "City" },
            { text: "Length of Stay" },
            { text: "Frequency" },
            { text: "Date of Travel" },
            { text: "Reason" },
          ]}
        />
        {[...Array(rows)].map((_, idx) => (
          <TableRow
            key={idx}
            cells={[
              {
                content: (
                  <Input
                    value={formData[`travel_country_${idx}`]}
                    onChange={handleTableChange(idx, "country")}
                  />
                ),
              },
              {
                content: (
                  <Input
                    value={formData[`travel_city_${idx}`]}
                    onChange={handleTableChange(idx, "city")}
                  />
                ),
              },
              {
                content: (
                  <Input
                    value={formData[`travel_stay_${idx}`]}
                    onChange={handleTableChange(idx, "stay")}
                  />
                ),
              },
              {
                content: (
                  <Input
                    value={formData[`travel_freq_${idx}`]}
                    onChange={handleTableChange(idx, "freq")}
                  />
                ),
              },
              {
                content: (
                  <Input
                    placeholder="DD-MM-YY"
                    value={formData[`travel_date_${idx}`]}
                    onChange={handleTableChange(idx, "date")}
                  />
                ),
              },
              {
                content: (
                  <Input
                    value={formData[`travel_reason_${idx}`]}
                    onChange={handleTableChange(idx, "reason")}
                  />
                ),
              },
            ]}
          />
        ))}
      </div>
    </Section>
  );
}

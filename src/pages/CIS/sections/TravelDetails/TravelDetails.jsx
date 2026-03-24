import React from "react";
import Section from "../../components/Section";
import Input from "../../components/Input";
import TableHeader from "../../components/TableHeader";
import TableRow from "../../components/TableRow";
import { useForm } from "../../context/FormContext";

export default function TravelDetails() {
  const { formData, updateFormData } = useForm();
  const rows = 3;

  const handleTableChange = (rowIdx, field) => (e) => {
    updateFormData("travelDetails", { index: rowIdx, field }, e.target.value);
  };

  const travel = formData.travelDetails;

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
                    value={travel[idx]?.country || ""}
                    onChange={handleTableChange(idx, "country")}
                  />
                ),
              },
              {
                content: (
                  <Input
                    value={travel[idx]?.city || ""}
                    onChange={handleTableChange(idx, "city")}
                  />
                ),
              },
              {
                content: (
                  <Input
                    value={travel[idx]?.length_of_stay || ""}
                    onChange={handleTableChange(idx, "length_of_stay")}
                  />
                ),
              },
              {
                content: (
                  <Input
                    value={travel[idx]?.frequency || ""}
                    onChange={handleTableChange(idx, "frequency")}
                  />
                ),
              },
              {
                content: (
                  <Input
                    value={travel[idx]?.date_travel || ""}
                    onChange={handleTableChange(idx, "date_travel")}
                    placeholder="DD-MM-YY"
                  />
                ),
              },
              {
                content: (
                  <Input
                    value={travel[idx]?.reason || ""}
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

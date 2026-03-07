// TravelDetails.jsx
import React from "react";
import "../CIS.css";

function TravelDetails({
  travelDetails,
  setTravelDetails,
  handleTravelChange,
  countries,
  deleteMode,
  setDeleteMode,
  selectedRows,
  setSelectedRows,
}) {
  const emptyRow = {
    id: Date.now(),
    country: "",
    city: "",
    length: "",
    frequency: "",
    date: "",
    reason: "",
  };

  return (
    <div className="travel-section">
      <h3 className="section-title">Travel Details</h3>

      <table className="travel-table">
        <thead>
          <tr>
            {deleteMode && <th>Select</th>}
            <th>Country</th>
            <th>City</th>
            <th>Length of Stay</th>
            <th>Frequency</th>
            <th>Date Travel</th>
            <th>Reason</th>
          </tr>
        </thead>
        <tbody>
          {travelDetails.map((t, i) => (
            <tr key={t.id || i}>
              {deleteMode && (
                <td>
                  <label className="custom-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(i)}
                      onChange={(e) => {
                        if (e.target.checked)
                          setSelectedRows((prev) => [...prev, i]);
                        else
                          setSelectedRows((prev) =>
                            prev.filter((index) => index !== i),
                          );
                      }}
                    />
                    <span className="checkmark"></span>
                  </label>
                </td>
              )}

              <td>
                <select
                  className="box-input"
                  value={t.country}
                  onChange={(e) =>
                    handleTravelChange(i, "country", e.target.value)
                  }
                >
                  <option value="">Select Country</option>
                  {countries.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </td>

              <td>
                <input
                  className="box-input"
                  type="text"
                  value={t.city}
                  onChange={(e) =>
                    handleTravelChange(i, "city", e.target.value)
                  }
                />
              </td>

              <td>
                <input
                  className="box-input"
                  type="text"
                  value={t.length}
                  onChange={(e) =>
                    handleTravelChange(i, "length", e.target.value)
                  }
                />
              </td>

              <td>
                <input
                  className="box-input"
                  type="text"
                  value={t.frequency}
                  onChange={(e) =>
                    handleTravelChange(i, "frequency", e.target.value)
                  }
                />
              </td>

              <td>
                <input
                  className="box-input"
                  type="date"
                  value={t.date}
                  onChange={(e) =>
                    handleTravelChange(i, "date", e.target.value)
                  }
                />
              </td>

              <td>
                <input
                  className="box-input"
                  type="text"
                  value={t.reason}
                  onChange={(e) =>
                    handleTravelChange(i, "reason", e.target.value)
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="add-row-container">
        {!deleteMode && (
          <button
            type="button"
            className="btn-add-travel"
            onClick={() =>
              setTravelDetails((prev) => [
                ...prev,
                { ...emptyRow, id: Date.now() },
              ])
            }
          >
            + Add Row
          </button>
        )}

        <button
          type="button"
          className="btn-delete-travel"
          onClick={() => {
            if (deleteMode && selectedRows.length > 0) {
              setTravelDetails((prev) =>
                prev.filter((_, index) => !selectedRows.includes(index)),
              );
              setSelectedRows([]);
            }
            setDeleteMode(!deleteMode);
          }}
        >
          {deleteMode ? "Confirm" : "Delete"}
        </button>
      </div>
    </div>
  );
}

export default TravelDetails;

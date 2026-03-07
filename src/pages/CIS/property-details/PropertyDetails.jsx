import React, { useState, useEffect } from "react";
import "../CIS.css";

function PropertyDetails() {
  // Initialize with Personal Properties and Real Estate
  const [properties, setProperties] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (properties.length === 0) {
      setProperties([
        {
          id: 1,
          type: "Personal Properties",
          completeAddress: "",
          purchaseDate: "",
          purchasePrice: "",
          mortgage: "",
          currentValue: "",
          visitFrequency: "",
        },
        {
          id: 2,
          type: "Real Estate (Please list all properties of which you are a full or partial owner. If you are a partial owner of a property, please specify thepercentage of ownership for thatparticular property.",
          completeAddress: "",
          purchaseDate: "",
          purchasePrice: "",
          mortgage: "",
          currentValue: "",
          visitFrequency: "",
        },
      ]);
    }
  }, []);

  // Add new property
  const addProperty = (type) => {
    const newId = properties.length
      ? properties[properties.length - 1].id + 1
      : 1;
    setProperties([
      ...properties,
      {
        id: newId,
        type,
        completeAddress: "",
        purchaseDate: "",
        purchasePrice: "",
        mortgage: "",
        currentValue: "",
        visitFrequency: "",
      },
    ]);
    setShowModal(false);
  };

  // Delete last property
  const deleteProperty = () => {
    if (properties.length > 0) {
      const updated = [...properties];
      updated.pop();
      setProperties(updated);
    }
  };

  // Handle field change
  const handleChange = (id, field, value) => {
    setProperties(
      properties.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    );
  };

  return (
    <div className="existing-section">
      <div className="form-box">
        <h3 className="section-title">Property Details</h3>

        {properties.map((prop) => (
          <div key={prop.id} className="form-grid-2">
            <div className="input-group">
              <label>Type</label>
              <input
                type="text"
                className="box-input"
                value={prop.type}
                readOnly
                style={{
                  border: "1px solid #3b82f6", // blue box line
                  padding: "8px",
                  borderRadius: "4px",
                  backgroundColor: "#f9f9f9",
                }}
              />
            </div>

            <div className="input-group">
              <label>Complete Address (City & Country)</label>
              <input
                type="text"
                className="box-input"
                value={prop.completeAddress}
                onChange={(e) =>
                  handleChange(prop.id, "completeAddress", e.target.value)
                }
              />
            </div>

            <div className="input-group">
              <label>Date of Purchase</label>
              <input
                type="date"
                className="box-input"
                value={prop.purchaseDate}
                onChange={(e) =>
                  handleChange(prop.id, "purchaseDate", e.target.value)
                }
              />
            </div>

            <div className="input-group">
              <label>Purchase Price (USD)</label>
              <input
                type="number"
                className="box-input"
                value={prop.purchasePrice}
                onChange={(e) =>
                  handleChange(prop.id, "purchasePrice", e.target.value)
                }
              />
            </div>

            <div className="input-group">
              <label>Mortgage (USD)</label>
              <input
                type="number"
                className="box-input"
                value={prop.mortgage}
                onChange={(e) =>
                  handleChange(prop.id, "mortgage", e.target.value)
                }
              />
            </div>

            <div className="input-group">
              <label>Current Value (USD)</label>
              <input
                type="number"
                className="box-input"
                value={prop.currentValue}
                onChange={(e) =>
                  handleChange(prop.id, "currentValue", e.target.value)
                }
              />
            </div>

            <div className="input-group">
              <label>Frequency of Visits / Stays</label>
              <input
                type="text"
                className="box-input"
                value={prop.visitFrequency}
                onChange={(e) =>
                  handleChange(prop.id, "visitFrequency", e.target.value)
                }
              />
            </div>
          </div>
        ))}

        {/* Add/Delete Buttons */}
        <div className="adds-deletes-container-cis">
          <button
            type="button"
            className="btn-add-member-cis"
            onClick={() => setShowModal(true)}
          >
            Add Property
          </button>

          <button
            type="button"
            className="btn-delete-member-cis"
            onClick={deleteProperty}
          >
            Delete Last
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h4>Select Property Type</h4>

            <div className="modal-buttons">
              <button
                className="modal-btn"
                onClick={() => addProperty("Personal Properties")}
                style={{
                  flex: "1 1 45%",
                  minWidth: "120px",
                  height: "36px",
                  backgroundColor: "#1f3b73",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  fontWeight: "500",
                  transition: "background 0.2s",
                }}
              >
                Personal Property
              </button>
              <button
                className="modal-btn"
                onClick={() =>
                  addProperty(
                    "Real Estate (Please list all properties of which you are a full or partial owner. If you are a partial owner of a property, please specify the percentage of ownership for that particular property.)",
                  )
                }
                style={{
                  flex: "1 1 45%",
                  minWidth: "120px",
                  height: "36px",
                  backgroundColor: "#1f3b73",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  fontWeight: "500",
                  transition: "background 0.2s",
                }}
              >
                Real Estate
              </button>
            </div>

            {/* Modal Add/Delete Buttons */}
            <div
              className="modal-add-delete-container"
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "12px",
                marginTop: "12px",
              }}
            ></div>

            {/* Cancel button */}
            <button
              className="modal-cancel"
              onClick={() => setShowModal(false)}
              style={{
                margin: "15px auto 0 auto", // centers horizontally
                display: "block", // needed for auto margins to work
                width: "120px",
                height: "36px",
                backgroundColor: "#6b7280",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.85rem",
                fontWeight: "500",
                transition: "background 0.2s",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PropertyDetails;

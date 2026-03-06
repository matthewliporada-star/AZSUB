// BankDetails.jsx
import React, { useState } from "react";
import "../CIS.css";

const BankDetails = () => {
  // ✅ Internal state
  const [bank, setBank] = useState({
    bankName: "",
    accountHeld: "",
    address: "",
    iban: "",
    accountNumber: "",
    relationship: "",
    referenceContact: "",
    email: "",
  });

  // ✅ Internal handler
  const handleBankChange = (field, value) => {
    setBank((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="bank-details">
      <div className="form-box">
        <h3 className="section-title">Bank Details (Payor Details)</h3>

        <div className="form-grid-2">
          <div className="input-group">
            <label>Bank’s Name</label>
            <input
              type="text"
              className="box-input"
              value={bank.bankName}
              onChange={(e) => handleBankChange("bankName", e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>How long is the account held?</label>
            <input
              type="text"
              className="box-input"
              value={bank.accountHeld}
              onChange={(e) => handleBankChange("accountHeld", e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Complete Address</label>
            <input
              type="text"
              className="box-input"
              value={bank.address}
              onChange={(e) => handleBankChange("address", e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>IBAN Number</label>
            <input
              type="text"
              className="box-input"
              value={bank.iban}
              onChange={(e) => handleBankChange("iban", e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Account Number</label>
            <input
              type="text"
              className="box-input"
              value={bank.accountNumber}
              onChange={(e) => handleBankChange("accountNumber", e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Relationship with the Payor</label>
            <input
              type="text"
              className="box-input"
              value={bank.relationship}
              onChange={(e) => handleBankChange("relationship", e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Reference Contact (Name/Contact Number)</label>
            <input
              type="text"
              className="box-input"
              value={bank.referenceContact}
              onChange={(e) => handleBankChange("referenceContact", e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              className="box-input"
              value={bank.email}
              onChange={(e) => handleBankChange("email", e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankDetails;
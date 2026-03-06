// BankDetails.jsx
import React from "react";


const BankDetails = ({ bank, handleBankChange }) => {
  return (
    <div className="bank-details">
      <h3>Bank Details</h3>
      <div className="form-box">
        <div className="form-grid-2">
          <div className="input-group">
            <label>Bank’s Name</label>
            <input type="text" className="box-input" />
          </div>

          <div className="input-group">
            <label>How long is the account held?</label>
            <input type="text" className="box-input" />
          </div>

          <div className="input-group">
            <label>Complete Address</label>
            <input type="text" className="box-input" />
          </div>

          <div className="input-group">
            <label>IBAN Number</label>
            <input type="text" className="box-input" />
          </div>

          <div className="input-group">
            <label>Account Number</label>
            <input type="text" className="box-input" />
          </div>

          <div className="input-group">
            <label>Relationship with the Payor</label>
            <input type="text" className="box-input" />
          </div>

          <div className="input-group">
            <label>Reference Contact (Name/Contact Number)</label>
            <input type="text" className="box-input" />
          </div>

          <div className="input-group">
            <label>Email Address</label>
            <input type="email" className="box-input" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankDetails; // ✅ Must be default

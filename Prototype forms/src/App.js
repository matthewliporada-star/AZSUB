// App.js
import React, { useState } from "react";
import "./App.css";
import LifeInsuranceForm from "./LifeInsuranceForm";
import IHPForm from "./IHPForm";

function App() {
  const [activeForm, setActiveForm] = useState("gae-non-gae"); // Default to combined form
  const [sharedFormData, setSharedFormData] = useState({
    clientId: "",
    clientName: "",
    email: "",
    mobile: "",
  });

  const renderForm = () => {
    switch (activeForm) {
      case "gae-non-gae":
        // You'll need to decide which form to show or create a combined component
        // For now, I'm showing LifeInsuranceForm, but you might want to create
        // a combined GAE/Non-GAE form component
        return (
          <LifeInsuranceForm
            sharedData={sharedFormData}
            updateSharedData={setSharedFormData}
          />
        );
      case "ihp":
        return (
          <IHPForm
            sharedData={sharedFormData}
            updateSharedData={setSharedFormData}
          />
        );
      default:
        return null;
    }
  };

  // Form selector with just two buttons
  const FormSelector = () => (
    <div className="form-selector">
      <button
        className={`selector-btn ${
          activeForm === "gae-non-gae" ? "active" : ""
        }`}
        onClick={() => setActiveForm("gae-non-gae")}
      >
        GAE / NON-GAE
      </button>
      <button
        className={`selector-btn ${activeForm === "ihp" ? "active" : ""}`}
        onClick={() => setActiveForm("ihp")}
      >
        IHP
      </button>
    </div>
  );

  return (
    <div className="app-container">
      <FormSelector />
      <div className="main-content">{renderForm()}</div>
    </div>
  );
}

export default App;

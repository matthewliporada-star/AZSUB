// App.js - GAE / NON-GAE Form (Standalone)
import React, { useState } from "react";
import "./App.css";
import LifeInsuranceForm from "./LifeInsuranceForm";

function App() {
    const [sharedFormData, setSharedFormData] = useState({
        clientId: "",
        clientName: "",
        email: "",
        mobile: "",
    });

    return (
        <div className="app-container">
            <div className="main-content">
                <LifeInsuranceForm
                    sharedData={sharedFormData}
                    updateSharedData={setSharedFormData}
                />
            </div>
        </div>
    );
}

export default App;

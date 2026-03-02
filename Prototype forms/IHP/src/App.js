// App.js - IHP Form (Standalone)
import React, { useState } from "react";
import "./App.css";
import IHPForm from "./IHPForm";

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
        <IHPForm
          sharedData={sharedFormData}
          updateSharedData={setSharedFormData}
        />
      </div>
    </div>
  );
}

export default App;

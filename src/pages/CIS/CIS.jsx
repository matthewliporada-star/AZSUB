import { useState, useRef } from "react";
import "./CIS.css";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import pdfjsWorker from "pdfjs-dist/legacy/build/pdf.worker.mjs?url";
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

import PersonalInformation from "./personal-information/PersonalInformation";
import TravelDetails from "./travel-details/TravelDetails";
import SmokingAndAlcohol from "./smoking-and-alcohol/SmokingAndAlcohol";
import PersonalMedical from "./personal-medical/PersonalMedical";
import FamilyMedical from "./family-medical/FamilyMedical";
import ExistingOrPending from "./existing-or-pending/ExistingOrPending";
import BusinessEmployment from "./business-employment/BusinessEmployment";
import PersonalIncome from "./personal-income/PersonalIncome";
import AssetsLiabilities from "./assets-liabilities/AssetsLiabilities";
import PropertyDetails from "./property-details/PropertyDetails";
import BankDetails from "./bank-details/BankDetails";
import PolicyBeneficiary from "./policy-beneficiary/PolicyBeneficiary";
import DependentDetails from "./dependent-details/DependentDetails";
import SpouseDetails from "./spouse-details/SpouseDetails";

function CIS({ userRole }) {
  const fileInputRef = useRef(null);
  const formRef = useRef(null);
  /* ===============================
      PDF GENERATION HANDLER
  =============================== */
  const handleGeneratePDF = () => {
    // Hide interactive elements temporarily
    document.querySelectorAll("input, select, textarea").forEach((el) => {
      el.dataset.originalDisplay = el.style.display;
      el.style.display = "none";
    });

    // Create visible value placeholders
    document.querySelectorAll("input, select, textarea").forEach((el) => {
      const displayEl = document.createElement("div");
      displayEl.className = "print-value";

      if (el.type === "checkbox" || el.type === "radio") {
        displayEl.textContent = el.checked
          ? "✓ " + el.labels?.[0]?.textContent
          : "☐ Not selected";
      } else {
        displayEl.textContent = el.value || "N/A";
      }

      el.parentNode.insertBefore(displayEl, el);
    });

    // Set PDF filename
    const originalTitle = document.title;
    const clientName = personalInfo.full_name?.replace(/\s+/g, "_") || "Client";
    document.title = `CIS_${clientName}_${new Date().toISOString().split("T")[0]}`;

    // Trigger print
    window.print();

    // Cleanup after printing
    setTimeout(() => {
      document.querySelectorAll(".print-value").forEach((el) => el.remove());
      document.querySelectorAll("input, select, textarea").forEach((el) => {
        el.style.display = el.dataset.originalDisplay || "";
      });
      document.title = originalTitle;
    }, 1000);
  };

  /* ===============================
      HELPER: IMPROVED REGEX
  =============================== */
  function extractFieldsFromText(fullText) {
    const result = {};

    const match = (regex) => {
      const m = fullText.match(regex);
      return m ? m[1].trim() : "";
    };

    // Basic Info
    result.full_name = match(
      /Full\s*name\s*of\s*Mr\.\s*\/Mrs\.\s*(.+?)(?=\n|$|Father)/i,
    );
    result.fathers_name = match(
      /Father[’'s\s]+Name\.?\s*(.+?)(?=\n|$|Mobile)/i,
    );
    result.mobile_no = match(/Mobile\s*No\.?\s*(\d+)/i);
    result.email = match(
      /Email\.?\s*([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]+)/i,
    );

    // Address Components (Improved targeting)
    // These look for the label, skip whitespace/colons, and grab text until the next major label
    result.city = match(
      /City\s*[:\s]*([A-Za-z\s]+?)(?=\s*(?:Country|Postal|Dates|$))/i,
    );
    result.country = match(
      /Country\s*[:\s]*([A-Za-z\s]+?)(?=\s*(?:Postal|Code|Dates|$))/i,
    );
    result.postal = match(/Postal\s*Code\s*[:\s]*(\d+)/i);

    // Date Resided (specific to the format in your image: DD-MM-YY)
    result.dates_resided = match(
      /Dates\s*resided\s*at\s*the\s*residence\s*\(DD-MM-YY\)\s*([\d-]{8,10})/i,
    );

    // Address Lines
    result.res_addr_raw = match(
      /Residence\s*Address\s*\(.*?\)\s*:?\s*(.+?)(?=\s*City|$)/i,
    );
    result.perm_addr_raw = match(
      /Permanent\s*Address\s*:?\s*(.+?)(?=\s*Tax|$)/i,
    );

    // Other Fields
    result.tax_info = match(/Tax\s*Residency\s*Information\s*(\d+)/i);
    result.tin_ssn = match(/TIN\s*\/\s*SSN\s*Number\s*(\d+)/i);
    result.citizenship = match(
      /List\s*Countries\s*of\s*Citizenship\s*(.+?)(?=\s*Hobbies|$)/i,
    );
    result.hobbies = match(/Hobbies\s*and\s*Activities\s*:\s*(.+?)$/i);

    return result;
  }

  /* ===============================
      STATES
  =============================== */
  const [personalInfo, setPersonalInfo] = useState({
    full_name: "",
    fathers_name: "",
    mobile_no: "",
    email: "",
    duration_at_address: "",
    residence_address: { address: "", country: "", city: "", postal_code: "" },
    previous_residence: {
      address: "",
      country: "",
      city: "",
      postal_code: "",
      dates: "",
    },
    provide_information: {
      address: "",
      country: "",
      city: "",
      postal_code: "",
      dates: "",
    },
    permanent_address: { address: "", country: "", city: "", postal_code: "" },
    tax_residency_info: "",
    tin_ssn: "",
    citizenship: "",
    hobbies: "",
  });

  const [travelDetails, setTravelDetails] = useState([
    {
      id: Date.now(),
      country: "",
      city: "",
      length: "",
      frequency: "",
      date: "",
      reason: "",
    },
  ]);
  const [habits, setHabits] = useState({
    smoking: "",
    smokingPerDay: "",
    alcohol: "",
    alcoholPerWeek: "",
  });
  const [medical, setMedical] = useState({
    majorIllness: "",
    illnessDetails: "",
    underMedication: "",
    medicationDetails: "",
  });
  const [spouse, setSpouse] = useState({
    name: "",
    relationship: "",
    contact: "",
    email: "",
  });
  const [dependents, setDependents] = useState({ dependents: [] });
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  /* ===============================
      PDF HANDLER
  =============================== */
  const handlePDFUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        fullText += content.items.map((item) => item.str).join("\n") + "\n";
      }

      const extracted = extractFieldsFromText(fullText);

      setPersonalInfo((prev) => ({
        ...prev,
        full_name: extracted.full_name || prev.full_name,
        fathers_name: extracted.fathers_name || prev.fathers_name,
        mobile_no: extracted.mobile_no || prev.mobile_no,
        email: extracted.email || prev.email,
        tax_residency_info: extracted.tax_info || prev.tax_residency_info,
        tin_ssn: extracted.tin_ssn || prev.tin_ssn,
        citizenship: extracted.citizenship || prev.citizenship,
        hobbies: extracted.hobbies || prev.hobbies,

        // Current Residence
        residence_address: {
          address: extracted.res_addr_raw || prev.residence_address.address,
          city: extracted.city || prev.residence_address.city,
          country: extracted.country || prev.residence_address.country,
          postal_code: extracted.postal || prev.residence_address.postal_code,
        },

        // Previous Residence (Populating the specific fields you requested)
        previous_residence: {
          address: extracted.res_addr_raw, // Often identical if the PDF is a mirror
          city: extracted.city,
          country: extracted.country,
          postal_code: extracted.postal,
          dates: extracted.dates_resided,
        },

        // Permanent Address
        permanent_address: {
          address: extracted.perm_addr_raw || prev.permanent_address.address,
          city: extracted.city,
          country: extracted.country,
          postal_code: extracted.postal,
        },
      }));

      alert("Data successfully imported from PDF!");
    } catch (error) {
      console.error("PDF Error:", error);
      alert("Error parsing PDF. Please ensure it's a valid CIS document.");
    } finally {
      event.target.value = null; // Reset file input
    }
  };

  const countries = [
    { code: "PH", name: "Philippines" },
    { code: "JP", name: "Japan" },
    { code: "US", name: "United States" },
  ]; // ... rest of your list

  return (
    <div className={`cis-page-wrapper ${userRole === "MP" ? "mp-top" : ""}`}>
      <main className="cis-page">
        {(userRole === "AL" || userRole === "MP") && (
          <header className="content-header">
            <h1>Client Information Sheet</h1>
          </header>
        )}

        <form className="insurance-form" ref={formRef}>
          <PersonalInformation
            personalInfo={personalInfo}
            setPersonalInfo={setPersonalInfo}
            countries={countries}
            className="section-container"
          />
          <TravelDetails
            travelDetails={travelDetails}
            setTravelDetails={setTravelDetails}
            countries={countries}
          />
          <SmokingAndAlcohol
            habits={habits}
            handleHabitsChange={(f, v) => setHabits((p) => ({ ...p, [f]: v }))}
          />
          <PersonalMedical
            medical={medical}
            handleMedicalChange={(f, v) =>
              setMedical((p) => ({ ...p, [f]: v }))
            }
          />
          <FamilyMedical data={{}} />
          <ExistingOrPending data={{}} />
          <BusinessEmployment data={{}} />
          <PersonalIncome data={{}} />
          <AssetsLiabilities />
          <PropertyDetails data={{}} />
          <BankDetails data={{}} />
          <PolicyBeneficiary data={{}} />
          <SpouseDetails
            spouse={spouse}
            handleSpouseChange={(f, v) => setSpouse((p) => ({ ...p, [f]: v }))}
          />
          <DependentDetails
            dependents={dependents}
            setDependents={setDependents}
          />

          {/* This container is hidden during generation due to the .no-print class in CSS */}
          <div
            className="cis-pdf-actions no-print"
            style={{
              marginTop: "40px",
              padding: "20px",
              borderTop: "2px solid var(--navy-l)",
              display: "flex",
              justifyContent: "center",
              gap: "15px",
            }}
          >
            <button
              type="button"
              className="upload-pdf-btn"
              onClick={() => fileInputRef.current.click()}
              style={{
                backgroundColor: "#4a6fd8",
                color: "white",
                padding: "12px 24px",
                borderRadius: "8px",
                border: "none",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Upload PDF
            </button>

            <button
              type="button"
              className="generate-pdf-btn"
              onClick={handleGeneratePDF}
              style={{
                backgroundColor: "#2a4899",
                color: "white",
                padding: "12px 24px",
                borderRadius: "8px",
                border: "none",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Generate PDF
            </button>

            <input
              type="file"
              ref={fileInputRef}
              accept="application/pdf"
              style={{ display: "none" }}
              onChange={handlePDFUpload}
            />
          </div>
        </form>
      </main>
    </div>
  );
}

export default CIS;

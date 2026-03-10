import { useState, useRef } from "react";
import "./CIS.css";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
// 1. Tell Vite to treat this as a simple URL instead of a JS module
import pdfjsWorker from "pdfjs-dist/legacy/build/pdf.worker.mjs?url";
// 2. Assign that URL to the library
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

  /* ===============================
      STATES
  =============================== */
  const [currentStep, setCurrentStep] = useState(1);

  const [personalInfo, setPersonalInfo] = useState({
    full_name: "",
    fathers_name: "",
    mobile_code: { code: "+63", country: "Philippines" },
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
    secondary_residence: {
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

  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

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

  /* ===============================
      TRAVEL HANDLER
  =============================== */
  const handleTravelChange = (index, field, value) => {
    setTravelDetails((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  /* ===============================
      PDF Upload
  =============================== */
  /* ===============================
      Improved PDF Upload
  =============================== */
  const handlePDFUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        // Triple space helps RegEx see where one field ends and another begins
        fullText += content.items.map((item) => item.str).join("   ") + "\n";
      }

      // These MUST match the headers in your PDF exactly to act as "stops"
      const stopLabels = [
        "Full name",
        "Father's Name",
        "Mobile No",
        "Email",
        "Residence Address",
        "City",
        "Country",
        "Postal Code",
        "How long have you lived",
        "Previous Residence",
        "Dates resided",
        "Provide information",
        "Permanent Address",
        "Tax Residency",
        "TIN/SSN",
        "List Countries",
        "Hobbies",
        "Travel Details",
      ];

      const getValue = (label) => {
        const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(
          `${escapedLabel}[^a-zA-Z0-9]*\\s*(.*?)(?=${stopLabels.map((l) => l.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")}|$)`,
          "i",
        );
        const match = fullText.match(regex);
        let result = match && match[1] ? match[1].trim() : "";

        // Remove common noise and instructions
        return result
          .replace(/\(Please provide.*?\)/gi, "")
          .replace(/\(if any.*?\)/gi, "")
          .replace(/and previous primary and secondary residences.*/gi, "")
          .trim();
      };

      const sanitize = (val) => {
        if (
          !val ||
          val.length < 2 ||
          val.toLowerCase().includes("please provide")
        )
          return "N/A";
        return val;
      };

      // Helper to format dates from MM/DD/YYYY (PDF) to YYYY-MM-DD (HTML Input)
      const formatDateForInput = (val) => {
        if (!val || val === "N/A") return "";
        const dateParts = val.match(/(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/);
        if (dateParts) {
          return `${dateParts[3]}-${dateParts[1].padStart(2, "0")}-${dateParts[2].padStart(2, "0")}`;
        }
        return "";
      };

      setPersonalInfo({
        full_name: sanitize(getValue("Full name")),
        fathers_name: sanitize(getValue("Father's Name")),
        mobile_no: sanitize(getValue("Mobile No")),
        email: sanitize(getValue("Email")),
        residence_address: {
          address: sanitize(getValue("Residence Address")),
          city: sanitize(getValue("City")),
          postal_code: sanitize(getValue("Postal Code")),
          country: "",
        },
        previous_residence: {
          address: sanitize(getValue("Previous Residence")),
          city: sanitize(getValue("City")),
          postal_code: sanitize(getValue("Postal Code")),
          dates: formatDateForInput(getValue("Dates resided")), // FIXED DATE
          country: "",
        },
        secondary_residence: {
          address: sanitize(getValue("Provide information")),
          city: sanitize(getValue("City")),
          postal_code: sanitize(getValue("Postal Code")),
          dates: formatDateForInput(getValue("Dates resided")), // FIXED DATE
          country: "",
        },
        permanent_address: {
          address: sanitize(getValue("Permanent Address")),
          city: sanitize(getValue("City")),
          postal_code: sanitize(getValue("Postal Code")),
          country: "",
        },
        tax_residency_info: sanitize(getValue("Tax Residency")),
        tin_ssn: sanitize(getValue("TIN/SSN")),
        citizenship: sanitize(getValue("List Countries")),
        hobbies: sanitize(getValue("Hobbies")),
      });

      alert("Upload Success!");
    } catch (error) {
      console.error("PDF Error:", error);
    } finally {
      event.target.value = null;
    }
  };

  /* ===============================
      COUNTRIES LIST
  =============================== */
  const countries = [
    { code: "AF", name: "Afghanistan" },
    { code: "AL", name: "Albania" },
    { code: "DZ", name: "Algeria" },
    { code: "AS", name: "American Samoa" },
    { code: "AD", name: "Andorra" },
    { code: "AO", name: "Angola" },
    { code: "AI", name: "Anguilla" },
    { code: "AQ", name: "Antarctica" },
    { code: "AG", name: "Antigua and Barbuda" },
    { code: "AR", name: "Argentina" },
    { code: "AM", name: "Armenia" },
    { code: "AW", name: "Aruba" },
    { code: "AU", name: "Australia" },
    { code: "AT", name: "Austria" },
    { code: "AZ", name: "Azerbaijan" },
    { code: "BS", name: "Bahamas" },
    { code: "BH", name: "Bahrain" },
    { code: "BD", name: "Bangladesh" },
    { code: "BB", name: "Barbados" },
    { code: "BY", name: "Belarus" },
    { code: "BE", name: "Belgium" },
    { code: "BZ", name: "Belize" },
    { code: "BJ", name: "Benin" },
    { code: "BM", name: "Bermuda" },
    { code: "BT", name: "Bhutan" },
    { code: "BO", name: "Bolivia" },
    { code: "BA", name: "Bosnia and Herzegovina" },
    { code: "BW", name: "Botswana" },
    { code: "BR", name: "Brazil" },
    { code: "IO", name: "British Indian Ocean Territory" },
    { code: "BN", name: "Brunei Darussalam" },
    { code: "BG", name: "Bulgaria" },
    { code: "BF", name: "Burkina Faso" },
    { code: "BI", name: "Burundi" },
    { code: "KH", name: "Cambodia" },
    { code: "CM", name: "Cameroon" },
    { code: "CA", name: "Canada" },
    { code: "CV", name: "Cape Verde" },
    { code: "KY", name: "Cayman Islands" },
    { code: "CF", name: "Central African Republic" },
    { code: "TD", name: "Chad" },
    { code: "CL", name: "Chile" },
    { code: "CN", name: "China" },
    { code: "CO", name: "Colombia" },
    { code: "KM", name: "Comoros" },
    { code: "CG", name: "Congo" },
    { code: "CD", name: "Congo, Democratic Republic of the" },
    { code: "CR", name: "Costa Rica" },
    { code: "CI", name: "Côte d’Ivoire" },
    { code: "HR", name: "Croatia" },
    { code: "CU", name: "Cuba" },
    { code: "CY", name: "Cyprus" },
    { code: "CZ", name: "Czech Republic" },
    { code: "DK", name: "Denmark" },
    { code: "DJ", name: "Djibouti" },
    { code: "DM", name: "Dominica" },
    { code: "DO", name: "Dominican Republic" },
    { code: "EC", name: "Ecuador" },
    { code: "EG", name: "Egypt" },
    { code: "SV", name: "El Salvador" },
    { code: "GQ", name: "Equatorial Guinea" },
    { code: "ER", name: "Eritrea" },
    { code: "EE", name: "Estonia" },
    { code: "SZ", name: "Eswatini" },
    { code: "ET", name: "Ethiopia" },
    { code: "FK", name: "Falkland Islands (Malvinas)" },
    { code: "FO", name: "Faroe Islands" },
    { code: "FJ", name: "Fiji" },
    { code: "FI", name: "Finland" },
    { code: "FR", name: "France" },
    { code: "GF", name: "French Guiana" },
    { code: "PF", name: "French Polynesia" },
    { code: "GA", name: "Gabon" },
    { code: "GM", name: "Gambia" },
    { code: "GE", name: "Georgia" },
    { code: "DE", name: "Germany" },
    { code: "GH", name: "Ghana" },
    { code: "GR", name: "Greece" },
    { code: "GL", name: "Greenland" },
    { code: "GD", name: "Grenada" },
    { code: "GP", name: "Guadeloupe" },
    { code: "GU", name: "Guam" },
    { code: "GT", name: "Guatemala" },
    { code: "GG", name: "Guernsey" },
    { code: "GN", name: "Guinea" },
    { code: "GW", name: "Guinea-Bissau" },
    { code: "GY", name: "Guyana" },
    { code: "HT", name: "Haiti" },
    { code: "HN", name: "Honduras" },
    { code: "HK", name: "Hong Kong" },
    { code: "HU", name: "Hungary" },
    { code: "IS", name: "Iceland" },
    { code: "IN", name: "India" },
    { code: "ID", name: "Indonesia" },
    { code: "IR", name: "Iran" },
    { code: "IQ", name: "Iraq" },
    { code: "IE", name: "Ireland" },
    { code: "IM", name: "Isle of Man" },
    { code: "IL", name: "Israel" },
    { code: "IT", name: "Italy" },
    { code: "JM", name: "Jamaica" },
    { code: "JP", name: "Japan" },
    { code: "JE", name: "Jersey" },
    { code: "JO", name: "Jordan" },
    { code: "KZ", name: "Kazakhstan" },
    { code: "KE", name: "Kenya" },
    { code: "KI", name: "Kiribati" },
    { code: "KP", name: "Korea, DPR" },
    { code: "KR", name: "Korea, Republic of" },
    { code: "KW", name: "Kuwait" },
    { code: "KG", name: "Kyrgyzstan" },
    { code: "LA", name: "Lao PDR" },
    { code: "LV", name: "Latvia" },
    { code: "LB", name: "Lebanon" },
    { code: "LS", name: "Lesotho" },
    { code: "LR", name: "Liberia" },
    { code: "LY", name: "Libya" },
    { code: "LI", name: "Liechtenstein" },
    { code: "LT", name: "Lithuania" },
    { code: "LU", name: "Luxembourg" },
    { code: "MO", name: "Macao" },
    { code: "MG", name: "Madagascar" },
    { code: "MW", name: "Malawi" },
    { code: "MY", name: "Malaysia" },
    { code: "MV", name: "Maldives" },
    { code: "ML", name: "Mali" },
    { code: "MT", name: "Malta" },
    { code: "MH", name: "Marshall Islands" },
    { code: "MQ", name: "Martinique" },
    { code: "MR", name: "Mauritania" },
    { code: "MU", name: "Mauritius" },
    { code: "YT", name: "Mayotte" },
    { code: "MX", name: "Mexico" },
    { code: "FM", name: "Micronesia" },
    { code: "MD", name: "Moldova" },
    { code: "MC", name: "Monaco" },
    { code: "MN", name: "Mongolia" },
    { code: "ME", name: "Montenegro" },
    { code: "MS", name: "Montserrat" },
    { code: "MA", name: "Morocco" },
    { code: "MZ", name: "Mozambique" },
    { code: "MM", name: "Myanmar" },
    { code: "NA", name: "Namibia" },
    { code: "NR", name: "Nauru" },
    { code: "NP", name: "Nepal" },
    { code: "NL", name: "Netherlands" },
    { code: "NC", name: "New Caledonia" },
    { code: "NZ", name: "New Zealand" },
    { code: "NI", name: "Nicaragua" },
    { code: "NE", name: "Niger" },
    { code: "NG", name: "Nigeria" },
    { code: "NU", name: "Niue" },
    { code: "NF", name: "Norfolk Island" },
    { code: "MP", name: "Northern Mariana Islands" },
    { code: "NO", name: "Norway" },
    { code: "OM", name: "Oman" },
    { code: "PK", name: "Pakistan" },
    { code: "PW", name: "Palau" },
    { code: "PS", name: "Palestine" },
    { code: "PA", name: "Panama" },
    { code: "PG", name: "Papua New Guinea" },
    { code: "PY", name: "Paraguay" },
    { code: "PE", name: "Peru" },
    { code: "PH", name: "Philippines" },
    { code: "PL", name: "Poland" },
    { code: "PT", name: "Portugal" },
    { code: "PR", name: "Puerto Rico" },
    { code: "QA", name: "Qatar" },
    { code: "RO", name: "Romania" },
    { code: "RU", name: "Russian Federation" },
    { code: "RW", name: "Rwanda" },
    { code: "RE", name: "Réunion" },
    { code: "BL", name: "Saint Barthélemy" },
    { code: "SH", name: "Saint Helena" },
    { code: "KN", name: "Saint Kitts and Nevis" },
    { code: "LC", name: "Saint Lucia" },
    { code: "MF", name: "Saint Martin" },
    { code: "PM", name: "Saint Pierre and Miquelon" },
    { code: "VC", name: "Saint Vincent" },
    { code: "WS", name: "Samoa" },
    { code: "SM", name: "San Marino" },
    { code: "ST", name: "Sao Tome and Principe" },
    { code: "SA", name: "Saudi Arabia" },
    { code: "SN", name: "Senegal" },
    { code: "RS", name: "Serbia" },
    { code: "SC", name: "Seychelles" },
    { code: "SL", name: "Sierra Leone" },
    { code: "SG", name: "Singapore" },
    { code: "SX", name: "Sint Maarten" },
    { code: "SK", name: "Slovakia" },
    { code: "SI", name: "Slovenia" },
    { code: "SB", name: "Solomon Islands" },
    { code: "SO", name: "Somalia" },
    { code: "ZA", name: "South Africa" },
    { code: "GS", name: "South Georgia" },
    { code: "SS", name: "South Sudan" },
    { code: "ES", name: "Spain" },
    { code: "LK", name: "Sri Lanka" },
    { code: "SD", name: "Sudan" },
    { code: "SR", name: "Suriname" },
    { code: "SE", name: "Sweden" },
    { code: "CH", name: "Switzerland" },
    { code: "SY", name: "Syrian Arab Republic" },
    { code: "TW", name: "Taiwan" },
    { code: "TJ", name: "Tajikistan" },
    { code: "TZ", name: "Tanzania" },
    { code: "TH", name: "Thailand" },
    { code: "TL", name: "Timor-Leste" },
    { code: "TG", name: "Togo" },
    { code: "TK", name: "Tokelau" },
    { code: "TO", name: "Tonga" },
    { code: "TT", name: "Trinidad and Tobago" },
    { code: "TN", name: "Tunisia" },
    { code: "TR", name: "Turkey" },
    { code: "TM", name: "Turkmenistan" },
    { code: "TV", name: "Tuvalu" },
    { code: "UG", name: "Uganda" },
    { code: "UA", name: "Ukraine" },
    { code: "AE", name: "United Arab Emirates" },
    { code: "GB", name: "United Kingdom" },
    { code: "US", name: "United States" },
    { code: "UY", name: "Uruguay" },
    { code: "UZ", name: "Uzbekistan" },
    { code: "VU", name: "Vanuatu" },
    { code: "VE", name: "Venezuela" },
    { code: "VN", name: "Vietnam" },
    { code: "EH", name: "Western Sahara" },
    { code: "YE", name: "Yemen" },
    { code: "ZM", name: "Zambia" },
    { code: "ZW", name: "Zimbabwe" },
  ];

  /* ===============================
      RENDER
  =============================== */
  return (
    <div className={`cis-page-wrapper ${userRole === "MP" ? "mp-top" : ""}`}>
      <main className="cis-page">
        {(userRole === "AL" || userRole === "MP") && (
          <header className="content-header">
            <h1>Client Information Sheet</h1>
          </header>
        )}

        <form className="insurance-form">
          <PersonalInformation
            personalInfo={personalInfo}
            setPersonalInfo={setPersonalInfo}
            countries={countries}
          />

          <TravelDetails
            travelDetails={travelDetails}
            setTravelDetails={setTravelDetails}
            handleTravelChange={handleTravelChange}
            deleteMode={deleteMode}
            setDeleteMode={setDeleteMode}
            selectedRows={selectedRows}
            setSelectedRows={setSelectedRows}
            countries={countries}
          />

          <SmokingAndAlcohol
            habits={habits}
            handleHabitsChange={(field, value) =>
              setHabits((prev) => ({ ...prev, [field]: value }))
            }
          />

          <PersonalMedical
            medical={medical}
            handleMedicalChange={(field, value) =>
              setMedical((prev) => ({ ...prev, [field]: value }))
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
            handleSpouseChange={(field, value) =>
              setSpouse((prev) => ({ ...prev, [field]: value }))
            }
          />

          <DependentDetails
            dependents={dependents}
            setDependents={setDependents}
          />

          <div className="cis-pdf-actions">
            <button
              type="button"
              className="generate-pdf-btn"
              onClick={() => console.log("Generate PDF clicked")}
            >
              Generate PDF
            </button>

            <button
              type="button"
              className="upload-pdf-btn"
              onClick={() => fileInputRef.current.click()}
            >
              Upload PDF
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

import { useState, useRef } from "react";
import "./CIS.css";

import PersonalInformation from "./personal-information/PersonalInformation";
import TravelDetails from "./travel-details/TravelDetails";
import SmokingAndAlcohol from "./smoking-and-alcohol/SmokingAndAlcohol";
import PersonalMedical from "./personal-medical/PersonalMedical";
import FamilyMedical from "./family-medical/FamilyMedical";
import ExistingOrPending from "./existing-or-pending/ExistingOrPending";
import BusinessEmployment from "./business-employment/BusinessEmployment";
import PersonalIncome from "./personal-income/PersonalIncome";
import AssetsLiabilities from "./assets-liabilities/AssetsLiabilities"; // your table
import PropertyDetails from "./property-details/PropertyDetails";
import BankDetails from "./bank-details/BankDetails";
import PolicyBeneficiary from "./policy-beneficiary/PolicyBeneficiary";
import DependentDetails from "./dependent-details/DependentDetails";
import SpouseDetails from "./spouse-details/SpouseDetails";

function CIS({ userRole }) {
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

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

  // ========================
  // Handle Travel Changes
  // ========================
  const handleTravelChange = (index, field, value) => {
    setTravelDetails((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Replace your existing countries array with this full list
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
    { code: "KP", name: "Korea, Democratic People's Republic of" },
    { code: "KR", name: "Korea, Republic of" },
    { code: "KW", name: "Kuwait" },
    { code: "KG", name: "Kyrgyzstan" },
    { code: "LA", name: "Lao People's Democratic Republic" },
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
    { code: "FM", name: "Micronesia, Federated States of" },
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
    { code: "PS", name: "Palestine, State of" },
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
    { code: "MF", name: "Saint Martin (French part)" },
    { code: "PM", name: "Saint Pierre and Miquelon" },
    { code: "VC", name: "Saint Vincent and the Grenadines" },
    { code: "WS", name: "Samoa" },
    { code: "SM", name: "San Marino" },
    { code: "ST", name: "Sao Tome and Principe" },
    { code: "SA", name: "Saudi Arabia" },
    { code: "SN", name: "Senegal" },
    { code: "RS", name: "Serbia" },
    { code: "SC", name: "Seychelles" },
    { code: "SL", name: "Sierra Leone" },
    { code: "SG", name: "Singapore" },
    { code: "SX", name: "Sint Maarten (Dutch part)" },
    { code: "SK", name: "Slovakia" },
    { code: "SI", name: "Slovenia" },
    { code: "SB", name: "Solomon Islands" },
    { code: "SO", name: "Somalia" },
    { code: "ZA", name: "South Africa" },
    { code: "GS", name: "South Georgia and the South Sandwich Islands" },
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
    { code: "TZ", name: "Tanzania, United Republic of" },
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

  const handleNext = () => setStep((prev) => prev + 1);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setTimeout(() => setUploading(false), 1000);
  };

  const handleDropZoneClick = () => fileInputRef.current?.click();

  const handleSearch = () => {
    console.log("Searching for:", personalInfo.full_name);
    setStep(2);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="step-fade">
            <h3>Client Information System</h3>
            <h2 className="step-title">Search for your information sheet</h2>
            <div className="search-container centered">
              <input
                type="text"
                className="search-bar"
                placeholder="Enter full name..."
                onChange={(e) =>
                  setPersonalInfo((prev) => ({
                    ...prev,
                    full_name: e.target.value,
                  }))
                }
              />
              <button onClick={handleSearch} className="search-btn-cis">
                Search
              </button>
            </div>
            <div className="upload-container">
              <p>Upload your client information sheet here!</p>
              <input
                type="file"
                accept="application/pdf"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              <div className="drop-zone" onClick={handleDropZoneClick}>
                <div className="cloud-symbol">☁</div>
                <p>{uploading ? "Uploading..." : "Click to upload PDF"}</p>
              </div>
              <p className="footer-link">
                Don't have one?{" "}
                <span
                  style={{ cursor: "pointer", color: "blue" }}
                  onClick={handleNext}
                >
                  Fill up here
                </span>
              </p>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="step-fade">
            <div className="instruction-box">
              <p
                style={{
                  color: "red",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                Kindly ensure that each and every section of the form is fully
                completed.
                <br />
                If any section is not applicable, please indicate 'N/A'.
                <br />
                Kindly convert all amounts to USD.
              </p>
              <div className="step-footer">
                <button
                  className="btn-navy-cis step2-next-btn"
                  onClick={handleNext}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <form className="insurance-form">
            <PersonalInformation
              personalInfo={personalInfo}
              setPersonalInfo={setPersonalInfo}
              countries={countries}
            />
            <TravelDetails
              travelDetails={travelDetails}
              setTravelDetails={setTravelDetails}
              handleTravelChange={handleTravelChange} // ✅ added
              deleteMode={deleteMode}
              setDeleteMode={setDeleteMode}
              selectedRows={selectedRows}
              setSelectedRows={setSelectedRows}
              countries={countries}
            />
            <SmokingAndAlcohol
              habits={habits}
              handleHabitsChange={(field, value) => {
                setHabits((prev) => ({ ...prev, [field]: value }));
              }}
            />

            <PersonalMedical
              medical={medical}
              handleMedicalChange={(field, value) => {
                setMedical((prev) => ({
                  ...prev,
                  [field]: value,
                }));
              }}
            />
            <FamilyMedical data={{}} />
            <ExistingOrPending data={{}} />
            <BusinessEmployment data={{}} />
            <PersonalIncome data={{}} />
            <AssetsLiabilities /> 
            <PropertyDetails data={{}} />
            <BankDetails data={{}} />
            <PolicyBeneficiary data={{}} />
            <SpouseDetails spouse={spouse} setSpouse={setSpouse} />
            <DependentDetails
              dependents={dependents}
              setDependents={setDependents}
            />
          </form>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`cis-page-wrapper ${userRole === "MP" ? "mp-top" : ""}`}>
      <main className="cis-page">
        {(userRole === "AL" || userRole === "MP") && (
          <header className="content-header">
            <h1>Client Information Sheet</h1>
          </header>
        )}
        <div className="view-window">{renderStep()}</div>
      </main>
    </div>
  );
}

export default CIS;

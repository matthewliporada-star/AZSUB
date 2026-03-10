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

  function extractFieldsFromText(fullText) {
    const result = {};

    const match = (regex) => {
      const m = fullText.match(regex);
      return m ? m[m.length - 1].trim() : "";
    };

    // 0. Full name (with any title such as Mr., Mrs., Ms., Dr., etc.).
    // Rather than trying to write an enormous regex we simply look for the
    // label on a line and then take the rest of that line.  If the parser
    // accidentally keeps the literal word "of" we strip it here but we leave
    // any title prefix intact.
    result.full_name = (() => {
      const m = fullText.match(/(?:Full\s*name|Name of Client)[^A-Za-z0-9]*(.+?)(?=\n|$)/i);
      if (!m) return "";
      let name = m[1].trim();
      // drop stray leading "of" that might precede the title
      name = name.replace(/^of\s+/i, "");
      return name;
    })();

    // 1. Father's Name: Stop before "Mobile No"
    result.fathers_name = match(
      /Father[’'s\s]+Name\.?\s*([A-Za-z\s]+?)(?=\s*Mobile No|$)/i,
    );

    // 2. Mobile No: Just digits
    result.mobile_no = match(/Mobile No\.?\s*([0-9]+)/i);

    // 3. Email
    result.email = match(
      /Email\.?\s*([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]+)/i,
    );

    // 4. Residence Address: Capture everything after the colon but stop before "Email" or "City"
    result.residence_address = match(
      /Residence Address\s*\(.*?\)\s*:\s*([\s\S]+?)(?=\s*(?:Email|City|$))/i,
    );

    // 5. Permanent Address: Stop before "Tax Residency"
    result.permanent_address = match(
      /Permanent Address\s*:\s*([\s\S]+?)(?=\s*Tax Residency|$)/i,
    );

    // 6. Hobbies: Stop before the "Country" table header or next section
    result.hobbies = match(
      /Hobbies and Activities\s*:\s*([\s\S]+?)(?=\s*(?:Unit|Country|City|$))/i,
    );

    // 7. Citizenship: Fix to capture words, not digits
    result.citizenship = match(
      /List Countries of Citizenship\s*:\s*([A-Za-z,\s]+)/i,
    );

    return result;
  }

  const fieldMap = {
    full_name: ["Full name of Mr./Mrs", "Full name", "Name of Client"],

    fathers_name: ["Father’s Name", "Father's Name"],

    mobile_no: ["Mobile No.", "Mobile No", "Mobile Number"],

    email: ["Email", "Email Address"],

    residence_address: ["Residence Address", "Residential Address"],

    permanent_address: ["Permanent Address"],

    tax_residency_info: ["Tax Residency Information", "Tax Residency"],

    hobbies: ["Hobbies and Activities"],
  };

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
        fullText += content.items.map((item) => item.str).join("\n") + "\n";
      }

      // Debug: See raw extracted text in console
      console.log("Raw extracted text:\n", fullText);

      const extracted = extractFieldsFromText(fullText);
      console.log("Extracted fields:", extracted);

      // Special handler for Full Name that removes prefix
      // Special handler for Full Name that removes prefix
      const cleanFullName = (value) => {
        // value may come with the label text (eg. "Full name of Mr. /Mrs.") or
        // with an undesired leading "of" left over after extraction.  We want to
        // display any title prefix (Mr./Mrs./Ms.) as part of the name, so the
        // cleaning logic now only strips a stray "of" and trims whitespace.
        if (!value) return "";

        return value
          // if the extraction left the literal "of" at the start (a common
          // artifact when the parser grabs the label and the name on the same
          // line), drop just that word.
          .replace(/^of\s+/i, "")
          .trim();
      };

      // Format date from DD/MM/YYYY or MM/DD/YYYY to YYYY-MM-DD
      const formatDateForInput = (val) => {
        if (!val || val === "N/A") return "";
        const dateParts = val.match(/(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/);
        if (dateParts) {
          return `${dateParts[3]}-${dateParts[1].padStart(2, "0")}-${dateParts[2].padStart(2, "0")}`;
        }
        return "";
      };

      // Extract address components from lines like "City: QC Country: Philippines Postal Code 0110"
      const parseAddressLine = (text) => {
        const cityMatch = text.match(/City:\s*([^C]+?)(?=\s+Country:|$)/i);
        const countryMatch = text.match(
          /Country:\s*([^P]+?)(?=\s+Postal|:|$)/i,
        );
        const postalMatch = text.match(/Postal Code[:\s]*(\d+)/i);

        return {
          city: cityMatch ? cityMatch[1].trim() : "",
          country: countryMatch ? countryMatch[1].trim() : "",
          postal_code: postalMatch ? postalMatch[1].trim() : "",
        };
      };

      // Split text into lines for easier processing
      // Inside handlePDFUpload, after getting extracted:
      const lines = fullText.split("\n").map((l) => l.trim());

      const getValAfterLabel = (label, startIndex, searchRange = 5) => {
        for (
          let i = startIndex;
          i < startIndex + searchRange && i < lines.length;
          i++
        ) {
          if (lines[i].toLowerCase().includes(label.toLowerCase())) {
            // Return the next line if the current line only contains the label
            if (lines[i].length < label.length + 3 && lines[i + 1])
              return lines[i + 1];
            return lines[i].split(/:\s*/)[1] || "";
          }
        }
        return "";
      };

      // Example for Residence City [cite: 10]
      const resIdx = lines.findIndex((l) => l.includes("Residence Address"));
      const residenceCity = getValAfterLabel("City", resIdx);
      const residencePostal = getValAfterLabel("Postal Code", resIdx);

      // Find residence address line
      const findAddressInfo = () => {
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (
            line.includes("Residence Address") ||
            line.includes("City:") ||
            line.includes("Country:")
          ) {
            const addressText = lines.slice(i, i + 3).join(" ");
            return parseAddressLine(addressText);
          }
        }
        return { city: "", country: "", postal_code: "" };
      };

      const addressInfo = findAddressInfo();

      // Find previous residence
      const findPreviousResidence = () => {
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (line.includes("Previous Residence")) {
            const prevText = lines.slice(i, i + 5).join(" ");
            const addrInfo = parseAddressLine(prevText);
            const dateMatch = prevText.match(/(\d{1,2}[\/-]\d{1,2}[\/-]\d{4})/);
            return {
              ...addrInfo,
              dates: dateMatch ? formatDateForInput(dateMatch[1]) : "",
            };
          }
        }
        return {
          address: "",
          city: "",
          postal_code: "",
          dates: "",
          country: "",
        };
      };

      const previousResidence = findPreviousResidence();

      // Find secondary residence
      const findSecondaryResidence = () => {
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (
            line.includes("Provide information") ||
            line.includes("secondary residence")
          ) {
            const secText = lines.slice(i, i + 5).join(" ");
            const addrInfo = parseAddressLine(secText);
            const dateMatch = secText.match(/(\d{1,2}[\/-]\d{1,2}[\/-]\d{4})/);
            return {
              ...addrInfo,
              dates: dateMatch ? formatDateForInput(dateMatch[1]) : "",
            };
          }
        }
        return {
          address: "",
          city: "",
          postal_code: "",
          dates: "",
          country: "",
        };
      };

      const secondaryResidence = findSecondaryResidence();

      // Extract TIN and Citizenship
      const extractTINAndCitizenship = () => {
        const tinMatch = fullText.match(/TIN\/SSN Number:\s*(\d+)/i);
        const citizenMatch = fullText.match(
          /List Countries of Citizenship:\s*(\d+)/i,
        );
        return {
          tin: tinMatch ? tinMatch[1] : "",
          citizenship: citizenMatch ? citizenMatch[1] : "",
        };
      };

      const { tin, citizenship } = extractTINAndCitizenship();

      // Debug extracted values
      console.log("Extracted values:", {
        full_name: cleanFullName(extracted.full_name || ""),
        fathers_name: extracted.fathers_name,
        mobile_no: extracted.mobile_no,
        email: extracted.email,
        residence_address: extracted.residence_address,
        permanent_address: extracted.permanent_address,
        tax_residency_info: extracted.tax_residency_info,
        hobbies: extracted.hobbies,
        addressInfo,
        previousResidence,
        secondaryResidence,
        tin,
        citizenship,
      });

      // ... after all findAddressInfo() and findPreviousResidence() calls ...

      setPersonalInfo((prev) => ({
        ...prev,
        full_name: cleanFullName(extracted.full_name || ""),
        fathers_name: extracted.fathers_name || "",
        mobile_no: extracted.mobile_no || "",
        email: extracted.email || "",

        // Ensure the string goes into .address and components go into their respective keys
        residence_address: {
          address: extracted.residence_address || "",
          city: addressInfo.city || "",
          country: addressInfo.country || "",
          postal_code: addressInfo.postal_code || "",
        },

        permanent_address: {
          address: extracted.permanent_address || "",
          city: "", // PDF layout usually groups these differently, set defaults if not found
          country: "",
          postal_code: "",
        },

        previous_residence: {
          ...previousResidence,
        },

        tax_residency_info: extracted.tax_residency_info || "",
        tin_ssn: tin || "",
        citizenship: extracted.citizenship || "",
        hobbies: extracted.hobbies || "",
      }));

      alert("Upload Success!");
    } catch (error) {
      console.error("PDF Error:", error);
      alert("Error uploading PDF: " + error.message);
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
    { code: "CI", name: "Côte d'Ivoire" },
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
  ];

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

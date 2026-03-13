import React, { useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

import "./CIS.css";

import PersonalInformation from "./personal-information/PersonalInformation";
import TravelDetails from "./travel-details/TravelDetails";
import SmokingAndAlcohol from "./smoking-and-alcohol/SmokingAndAlcohol";
import PersonalMedical from "./personal-medical/PersonalMedical";
import SpouseDetails from "./spouse-details/SpouseDetails";
import DependentDetails from "./dependent-details/DependentDetails";

// ---------------- SUPABASE CLIENT ----------------
const supabaseUrl = "https://ibbjsjvjfeymglpsvgap.supabase.co";
const supabaseKey = "sb_publishable_8Thh-CJ8S73w4TMy_W4uGw_N3bw5wru";
const supabase = createClient(supabaseUrl, supabaseKey);

function CIS({ userRole }) {
  const formRef = useRef(null);

  const [personalInfo, setPersonalInfo] = useState({
    full_name: "",
    fathers_name: "",
    mobile_no: "",
    email: "",
    residence_address: {},
    previous_residence: {},
    provide_information: {},
    permanent_address: {},
    duration_at_address: "",
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
      length_of_stay: "",
      frequency: "",
      date_travel: "",
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

  // ✅ Dependents state lifted here
  const [dependents, setDependents] = useState([
    { name: "", relation: "", nationality: "", dob: "" },
  ]);

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

  // ------------------- HANDLERS -------------------
  const handleTravelChange = (index, field, value) => {
    setTravelDetails((prev) =>
      prev.map((t, i) => (i === index ? { ...t, [field]: value } : t)),
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 1️⃣ Insert personal information first
      const { data: personalData, error: personalError } = await supabase
        .from("personal_information")
        .insert([personalInfo])
        .select();

      if (personalError) throw personalError;

      const personalId = personalData[0].id;

      // 2️⃣ Insert travel details linked to personal info
      const travelToInsert = travelDetails.map((t) => ({
        personal_info_id: personalId,
        country: t.country,
        city: t.city,
        length_of_stay: t.length_of_stay || null,
        frequency: t.frequency || null,
        date_travel: t.date_travel || null,
        reason: t.reason || null,
      }));

      const { error: travelError } = await supabase
        .from("travel_details")
        .insert(travelToInsert);
      if (travelError) throw travelError;

      // 3️⃣ Insert dependents linked to personal info
      const dependentsToInsert = dependents
        .filter((d) => d.name || d.relation || d.nationality || d.dob) // optional: remove completely empty
        .map((d) => ({
          personal_info_id: personalId, // must be valid UUID
          name: d.name || null,
          relation: d.relation || null,
          nationality: d.nationality || null,
          dob: d.dob || null, // convert empty string to null
        }));

      const { error: depError } = await supabase
        .from("dependents")
        .insert(dependentsToInsert);

      if (depError) throw depError;

      alert("Form submitted successfully!");
    } catch (err) {
      console.error(err);
      alert("Error submitting form: " + err.message);
    }
  };

  /* ================= JSX ================= */
  return (
    <div className={`cis-page-wrapper ${userRole === "MP" ? "mp-top" : ""}`}>
      <main className="cis-page">
        {(userRole === "AL" || userRole === "MP") && (
          <header className="content-header">
            <h1>Client Information Sheet</h1>
          </header>
        )}

        <form className="insurance-form" ref={formRef} onSubmit={handleSubmit}>
          <PersonalInformation
            personalInfo={personalInfo}
            setPersonalInfo={setPersonalInfo}
          />

          <TravelDetails
            travelDetails={travelDetails}
            setTravelDetails={setTravelDetails}
            handleTravelChange={handleTravelChange} // ✅ add this
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

          <SpouseDetails
            spouse={spouse}
            handleSpouseChange={(f, v) => setSpouse((p) => ({ ...p, [f]: v }))}
          />

          <DependentDetails
            dependents={dependents}
            setDependents={setDependents}
          />

          {/* ================= SUBMIT BUTTON ================= */}
          <div
            className="form-submit-container"
            style={{ marginTop: "30px", textAlign: "center" }}
          >
            <button type="submit" className="btn-submit">
              Submit Form
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default CIS;

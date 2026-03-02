import React, { useState } from "react";
// CSS is loaded by FormModal wrapper via FormStyles.css
import { PDFDocument } from "pdf-lib";

function LifeInsuranceForm({ sharedData, updateSharedData }) {
  const [formType, setFormType] = useState("gae");

  const [beneficiaries, setBeneficiaries] = useState([
    {
      id: 1,
      name: "",
      dob: "",
      relationship: "",
      address: "",
      placeOfBirth: "",
      nationality: "",
      contact: "",
      gender: "",
      type: "primary",
      designation: "revocable",
      share: "",
    },
  ]);

  const [existingPolicies, setExistingPolicies] = useState([
    { company: "", insured: "", policyNo: "" },
  ]);

  const [replacementInfo, setReplacementInfo] = useState({
    intendedToReplace: "",
    premiumFromExisting: "",
  });

  const [payoutOption, setPayoutOption] = useState("check");
  const [paymentScheme, setPaymentScheme] = useState("cash");
  const [policyCurrency, setPolicyCurrency] = useState("PHP");
  const [usPerson, setUsPerson] = useState("");
  const [publicPosition, setPublicPosition] = useState("");
  const [shareInformation, setShareInformation] = useState(false);
  const [applicationNo, setApplicationNo] = useState(
    "APP-" + Math.floor(Math.random() * 10000),
  );
  const [mailingSameAsPresent, setMailingSameAsPresent] = useState(false);
  const [aoMailingSameAsPresent, setAoMailingSameAsPresent] = useState(false);

  // Form data state with all PDF fields mapped
  const [formData, setFormData] = useState({
    // A. PROPOSED INSURED INFORMATION
    lastName: "",
    firstName: "",
    middleName: "",
    otherLegalName: "",
    dob: "",
    gender: "",
    placeOfBirth: "",
    civilStatus: "",
    nationality: "",
    mobile: "",
    email: "",
    unitBuilding: "",
    street: "",
    barangay: "",
    city: "",
    province: "",
    country: "Philippines",
    occupation: "",
    employer: "",
    annualIncome: "",
    workUnit: "",
    workStreet: "",
    workBarangay: "",
    workCity: "",
    workProvince: "",
    workCountry: "Philippines",
    sourceFunds: [],

    // B. APPLICANT OWNER INFORMATION
    aoLastName: "",
    aoFirstName: "",
    aoMiddleName: "",
    aoOtherLegalName: "",
    aoDob: "",
    aoGender: "",
    aoPlaceOfBirth: "",
    aoCivilStatus: "",
    aoNationality: "",
    aoMobile: "",
    aoEmail: "",
    aoUnitBuilding: "",
    aoStreet: "",
    aoBarangay: "",
    aoCity: "",
    aoProvince: "",
    aoCountry: "Philippines",
    aoOccupation: "",
    aoEmployer: "",
    aoAnnualIncome: "",
    aoWorkUnit: "",
    aoWorkStreet: "",
    aoWorkBarangay: "",
    aoWorkCity: "",
    aoWorkProvince: "",
    aoWorkCountry: "Philippines",
    aoSourceFunds: [],

    // Contingent Owner
    contingentOwnerName: "",
    contingentOwnerDob: "",
    contingentOwnerRelationship: "",

    // Mailing Address
    mailUnit: "",
    mailLot: "",
    mailStreet: "",
    mailBarangay: "",
    mailCity: "",
    mailProvince: "",
    mailCountry: "",

    // AO Mailing Address
    aoMailUnit: "",
    aoMailLot: "",
    aoMailStreet: "",
    aoMailBarangay: "",
    aoMailCity: "",
    aoMailProvince: "",
    aoMailCountry: "",

    // C. POLICY INFORMATION
    planName: "",
    sumAssured: "",
    purpose: "",
    nonForfeitureOption: "",
    dividendOption: "",

    // D. PAYOUT OPTIONS
    bankName: "",
    bankBranch: "",
    accountNo: "",
    accountName: "",
    accountCurrency: "",
    jointAccountType: "",

    // FAMILY HISTORY
    familyHistoryPI: {
      cardiovascular: "",
      cerebrovascular: "",
      diabetes: "",
      alzheimer: "",
      polycystic: "",
      cancer: "",
    },
    familyHistoryAO: {
      cardiovascular: "",
      cerebrovascular: "",
      diabetes: "",
      alzheimer: "",
      polycystic: "",
      cancer: "",
    },

    // BUILD
    piHeightFt: "",
    piHeightIn: "",
    piHeightCm: "",
    piWeightLbs: "",
    piWeightKg: "",
    aoHeightFt: "",
    aoHeightIn: "",
    aoHeightCm: "",
    aoWeightLbs: "",
    aoWeightKg: "",

    // NON-MEDICAL QUESTIONNAIRE
    piNonMedical: {
      q1: "",
      q2: "",
      q3: "",
      q4: "",
      q5: "",
      q6: "",
      details: "",
    },
    aoNonMedical: {
      q1: "",
      q2: "",
      q3: "",
      q4: "",
      q5: "",
      q6: "",
      details: "",
    },

    // OCCUPATION/AVOCATION DECLARATIONS
    piOccAvoc: {
      changeOccupation: "",
      changeResidence: "",
      hazardousActivities: "",
      details: "",
    },
    aoOccAvoc: {
      changeOccupation: "",
      changeResidence: "",
      hazardousActivities: "",
      details: "",
    },

    // SIGNATURES
    proposedInsuredSig: "",
    proposedInsuredDate: "",
    applicantOwnerSig: "",
    applicantOwnerDate: "",
    childParentGuardianSig: "",

    // DISTRIBUTOR DECLARATIONS
    intermediaryName: "",
    intermediaryCode: "",
    intermediaryDate: "",

    // REFERROR DETAILS
    referrorName: "",
    referrorId: "",
    referrorBank: "",
    referrorBranch: "",
    referrorDate: "",
    referrorSignature: "",

    // Agent's Report
    agentsReport: "",

    // Additional fields from PDF
    totalInsuranceInforce: "",
    accident: "",
    YOI: "",
    AIBR1: "",
    AIBR2: "",
    ROCO: "",
    ROB: "",
    rob: "",
    BAN1: "",
    BAN2: "",
    BAN3: "",
    BL1: "",
    BL2: "",
    text_306hpdn: "",
    company3: "",
    company4: "",
    policyno1: "",
    policyno2: "",
    ft1: "",
    in1: "",
    cm1: "",
    ft2: "",
    in2: "",
    cm2: "",
    lbs1: "",
    kg1: "",
    lbs2: "",
    kg2: "",
    PIname: "",
    PIaddress: "",
    PIdate: "",
    applicantownername: "",
    COMPANY: "",
    INSURED: "",
    POLICYNO: "",
    COMPANY2: "",
    INSURED2: "",
    POLICYNO2: "",
    SIGNATURE: "",
    DATE: "",
  });

  // ===== COMPLETE AUTO-FILL FUNCTION =====
  const autoFillForm = () => {
    const currentType = formType;

    // COMPLETE DATA PARA SA LAHAT NG FIELDS
    const completeData = {
      // ===== SECTION A: PROPOSED INSURED INFORMATION =====
      lastName: "Dela Cruz",
      firstName: "Juan",
      middleName: "Santos",
      otherLegalName: "Juanito S. Dela Cruz",
      dob: "1985-05-15",
      gender: "Male",
      placeOfBirth: "Manila, Philippines",
      civilStatus: "Married",
      nationality: "Filipino",
      mobile: "09171234567",
      email: "juan.delacruz@email.com",

      // Present Address
      unitBuilding: "Unit 123, Greenfield Tower",
      street: "Rizal Street",
      barangay: "Barangay 1",
      city: "Makati City",
      province: "Metro Manila",
      country: "Philippines",

      // Mailing Address
      mailUnit: "Unit 456, Blue Ridge Residences",
      mailLot: "Lot 789",
      mailStreet: "Different Street",
      mailBarangay: "Barangay 2",
      mailCity: "Quezon City",
      mailProvince: "Metro Manila",
      mailCountry: "Philippines",

      // Work Information
      occupation: "Software Engineer",
      employer: "Tech Solutions Inc.",
      annualIncome: "1200000",
      workUnit: "Tech Tower, 8th Floor",
      workStreet: "Ayala Avenue",
      workBarangay: "Salcedo Village",
      workCity: "Makati City",
      workProvince: "Metro Manila",
      workCountry: "Philippines",
      sourceFunds: [
        "Business",
        "Salary/Commission",
        "Investments",
        "Remittances/Allowances/Pension",
      ],

      // ===== SECTION B: APPLICANT OWNER INFORMATION =====
      aoLastName: "Dela Cruz",
      aoFirstName: "Maria",
      aoMiddleName: "Santos",
      aoOtherLegalName: "Marietta S. Dela Cruz",
      aoDob: "1987-08-20",
      aoGender: "Female",
      aoPlaceOfBirth: "Quezon City, Philippines",
      aoCivilStatus: "Married",
      aoNationality: "Filipino",
      aoMobile: "09181234567",
      aoEmail: "maria.delacruz@email.com",

      // AO Present Address
      aoUnitBuilding: "Unit 123, Greenfield Tower",
      aoStreet: "Rizal Street",
      aoBarangay: "Barangay 1",
      aoCity: "Makati City",
      aoProvince: "Metro Manila",
      aoCountry: "Philippines",

      // AO Mailing Address
      aoMailUnit: "Unit 789, Sunshine Condo",
      aoMailLot: "Lot 101",
      aoMailStreet: "AO Different Street",
      aoMailBarangay: "Barangay 3",
      aoMailCity: "Pasig City",
      aoMailProvince: "Metro Manila",
      aoMailCountry: "Philippines",

      // AO Work Information
      aoOccupation: "Businesswoman",
      aoEmployer: "Self-Employed",
      aoAnnualIncome: "800000",
      aoWorkUnit: "Commercial Space 5",
      aoWorkStreet: "Ortigas Avenue",
      aoWorkBarangay: "Kapitolyo",
      aoWorkCity: "Pasig City",
      aoWorkProvince: "Metro Manila",
      aoWorkCountry: "Philippines",
      aoSourceFunds: ["Business", "Investments"],

      // ===== CONTINGENT OWNER =====
      contingentOwnerName: "Maria Dela Cruz",
      contingentOwnerDob: "1987-08-20",
      contingentOwnerRelationship: "Spouse",

      // ===== POLICY INFORMATION =====
      planName:
        currentType === "gae"
          ? "Allianz Life Secure (GAE)"
          : "Allianz Life Secure",
      sumAssured: "2000000",
      purpose: "Income Continuation",
      nonForfeitureOption: "Net Surrender Value",
      dividendOption: "Left to accumulate",

      // ===== PAYOUT OPTIONS =====
      bankName: "Bank of the Philippine Islands",
      bankBranch: "Makati Branch",
      accountNo: "1234567890",
      accountName: "Juan Dela Cruz",
      accountCurrency: "PHP",
      jointAccountType: "OR",

      // ===== FAMILY HISTORY =====
      familyHistoryPI: {
        cardiovascular: "Not Applicable",
        cerebrovascular: "Not Applicable",
        diabetes: "Not Applicable",
        alzheimer: "Not Applicable",
        polycystic: "Not Applicable",
        cancer: "Not Applicable",
      },
      familyHistoryAO: {
        cardiovascular: "Not Applicable",
        cerebrovascular: "Not Applicable",
        diabetes: "Not Applicable",
        alzheimer: "Not Applicable",
        polycystic: "Not Applicable",
        cancer: "Not Applicable",
      },

      // ===== BUILD =====
      piHeightFt: "5",
      piHeightIn: "9",
      piHeightCm: "175",
      piWeightLbs: "160",
      piWeightKg: "72.5",
      aoHeightFt: "5",
      aoHeightIn: "4",
      aoHeightCm: "162",
      aoWeightLbs: "120",
      aoWeightKg: "54.4",

      // ===== NON-MEDICAL QUESTIONNAIRE =====
      piNonMedical: {
        q1: "No",
        q2: "No",
        q3: "No",
        q4: "No",
        q5: "No",
        q6: "No",
        details: "No medical conditions to report",
      },
      aoNonMedical: {
        q1: "No",
        q2: "No",
        q3: "No",
        q4: "No",
        q5: "No",
        q6: "No",
        details: "No medical conditions to report",
      },

      // ===== OCCUPATION/AVOCATION DECLARATIONS =====
      piOccAvoc: {
        changeOccupation: "No",
        changeResidence: "No",
        hazardousActivities: "No",
        details: "No hazardous activities",
      },
      aoOccAvoc: {
        changeOccupation: "No",
        changeResidence: "No",
        hazardousActivities: "No",
        details: "No hazardous activities",
      },

      // ===== SIGNATURES =====
      proposedInsuredSig: "Juan Dela Cruz",
      proposedInsuredDate: "2026-02-20",
      applicantOwnerSig: "Maria Dela Cruz",
      applicantOwnerDate: "2026-02-20",
      childParentGuardianSig: "Maria Dela Cruz",

      // ===== DISTRIBUTOR DECLARATIONS =====
      intermediaryName: "Pedro Santos",
      intermediaryCode: "AGT12345",
      intermediaryDate: "2026-02-20",

      // ===== REFERROR DETAILS =====
      referrorName: "Ana Reyes",
      referrorId: "ID98765",
      referrorBank: "BPI",
      referrorBranch: "Makati",
      referrorDate: "2026-02-20",
      referrorSignature: "Ana Reyes",

      // ===== AGENT'S REPORT =====
      agentsReport:
        "Client is in good health and financially stable. Recommended for standard rating.",

      // ===== ADDITIONAL FIELDS =====
      totalInsuranceInforce: "5000000",
      accident: "None",
      YOI: "2025",
      AIBR1: "AIBR1 Value",
      AIBR2: "AIBR2 Value",
      ROCO: "Spouse",
      ROB: "Spouse",
      rob: "Spouse",
      BAN1: "Juan Dela Cruz",
      BAN2: "Juan Dela Cruz",
      BAN3: "Juan Dela Cruz",
      BL1: "Juan Dela Cruz",
      BL2: "Maria Dela Cruz",
      text_306hpdn: "Sample Text",
      company3: "Sun Life",
      company4: "Insular Life",
      policyno1: "SL-2020-12345",
      policyno2: "IL-2019-67890",
      ft1: "5",
      in1: "9",
      cm1: "175",
      ft2: "5",
      in2: "4",
      cm2: "162",
      lbs1: "160",
      kg1: "72.5",
      lbs2: "120",
      kg2: "54.4",
      PIname: "Juan Dela Cruz",
      PIaddress:
        "Unit 123, Rizal Street, Makati City, Metro Manila, Philippines",
      PIdate: "02/20/2026",
      applicantownername: "Maria Dela Cruz",
      COMPANY: "Sun Life",
      INSURED: "Juan Dela Cruz",
      POLICYNO: "SL-2020-12345",
      COMPANY2: "Insular Life",
      INSURED2: "Maria Dela Cruz",
      POLICYNO2: "IL-2019-67890",
      SIGNATURE: "Pedro Santos",
      DATE: "02/20/2026",
    };

    // Para sa GAE, i-clear ang medical-related fields
    if (currentType === "gae") {
      completeData.familyHistoryPI = {
        cardiovascular: "",
        cerebrovascular: "",
        diabetes: "",
        alzheimer: "",
        polycystic: "",
        cancer: "",
      };
      completeData.familyHistoryAO = {
        cardiovascular: "",
        cerebrovascular: "",
        diabetes: "",
        alzheimer: "",
        polycystic: "",
        cancer: "",
      };
      completeData.piNonMedical = {
        q1: "",
        q2: "",
        q3: "",
        q4: "",
        q5: "",
        q6: "",
        details: "",
      };
      completeData.aoNonMedical = {
        q1: "",
        q2: "",
        q3: "",
        q4: "",
        q5: "",
        q6: "",
        details: "",
      };
      completeData.piOccAvoc = {
        changeOccupation: "",
        changeResidence: "",
        hazardousActivities: "",
        details: "",
      };
      completeData.aoOccAvoc = {
        changeOccupation: "",
        changeResidence: "",
        hazardousActivities: "",
        details: "",
      };
    }

    // Update form data with complete data
    setFormData((prev) => ({
      ...prev,
      ...completeData,
    }));

    // Update other states
    setApplicationNo(
      currentType === "gae" ? "APP-GAE-12345" : "APP-NGAE-12345",
    );
    setUsPerson("No");
    setPublicPosition("No");
    setPayoutOption("auto");
    setPaymentScheme("auto");
    setPolicyCurrency("PHP");
    setShareInformation(true);
    setMailingSameAsPresent(false);
    setAoMailingSameAsPresent(false);

    // Add sample beneficiaries
    setBeneficiaries([
      {
        id: 1,
        name: "Maria Dela Cruz",
        dob: "1987-08-20",
        relationship: "Spouse",
        address: "Unit 123, Rizal Street, Makati City",
        placeOfBirth: "Manila",
        nationality: "Filipino",
        contact: "09181234567",
        gender: "Female",
        type: "primary",
        designation: "irrevocable",
        share: "60",
      },
      {
        id: 2,
        name: "Juan Dela Cruz Jr.",
        dob: "2015-03-10",
        relationship: "Child",
        address: "Unit 123, Rizal Street, Makati City",
        placeOfBirth: "Makati City",
        nationality: "Filipino",
        contact: "09171234567",
        gender: "Male",
        type: "primary",
        designation: "revocable",
        share: "40",
      },
    ]);

    // Add sample existing policies
    setExistingPolicies([
      {
        company: "Sun Life",
        insured: "Juan Dela Cruz",
        policyNo: "SL-2020-12345",
      },
      {
        company: "Insular Life",
        insured: "Juan Dela Cruz",
        policyNo: "IL-2018-67890",
      },
    ]);

    // Replacement info
    setReplacementInfo({
      intendedToReplace: "No",
      premiumFromExisting: "No",
    });

    // Show confirmation
    alert(
      `✅ Auto-fill completed for ${currentType === "gae" ? "GAE" : "NON-GAE"} form!`,
    );
  };

  const handleExclusiveCheckbox = (setter, value) => {
    setter(value);
  };

  // =============== PDF GENERATION FUNCTIONS ===============

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    } catch (error) {
      return dateString;
    }
  };

  const getMonthFromDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      return String(date.getMonth() + 1).padStart(2, "0");
    } catch (error) {
      return "";
    }
  };

  const getDayFromDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      return String(date.getDate()).padStart(2, "0");
    } catch (error) {
      return "";
    }
  };

  const getYearFromDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      return date.getFullYear().toString();
    } catch (error) {
      return "";
    }
  };

  const loadPDFTemplate = async () => {
    try {
      const paths = [
        `/Final.pdf`,
        `/Final.pdf`,
        `./Final.pdf`,
      ];

      for (const pdfUrl of paths) {
        try {
          console.log(`Trying to load PDF from: ${pdfUrl}`);
          const response = await fetch(pdfUrl);
          if (response.ok) {
            const pdfBytes = await response.arrayBuffer();
            console.log(
              `✓ Successfully loaded PDF from: ${pdfUrl}, size: ${pdfBytes.byteLength} bytes`,
            );
            return pdfBytes;
          }
        } catch (error) {
          console.log(`✗ Error loading from ${pdfUrl}:`, error.message);
          continue;
        }
      }

      throw new Error(
        "PDF template not found. Please make sure 'Final.pdf' exists in your public folder.",
      );
    } catch (error) {
      console.error("Error loading PDF template:", error);
      throw error;
    }
  };

  const fillTextField = (form, fieldName, value) => {
    try {
      if (!value || value.toString().trim() === "") {
        return false;
      }

      const stringValue = value.toString().trim();
      const field = form.getTextField(fieldName);
      if (field) {
        field.setText(stringValue);
        console.log(
          `✓ Filled: "${fieldName}" with "${stringValue.substring(0, 30)}..."`,
        );
        return true;
      }
    } catch (e) {
      console.log(`✗ Field not found: "${fieldName}"`);
      return false;
    }
  };

  const fillCheckbox = (form, fieldName, checked) => {
    try {
      const checkbox = form.getCheckBox(fieldName);
      if (checkbox) {
        if (checked) {
          checkbox.check();
        } else {
          checkbox.uncheck();
        }
        console.log(
          `✓ ${checked ? "Checked" : "Unchecked"} checkbox "${fieldName}"`,
        );
        return true;
      }
    } catch (e) {
      console.log(`✗ Could not find checkbox "${fieldName}"`);
      return false;
    }
  };

  // Fill PDF with form data
  const fillPDF = async () => {
    try {
      console.log("Loading PDF template...");
      const pdfBytes = await loadPDFTemplate();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const form = pdfDoc.getForm();

      console.log("Filling PDF with form data...");

      // ========== DEBUG: Log all available fields ==========
      const allFields = form.getFields();
      console.log("=== ALL AVAILABLE PDF FIELDS ===");
      allFields.forEach((field) => {
        try {
          console.log(
            `Field: "${field.getName()}", Type: ${field.constructor.name}`,
          );
        } catch (e) {
          console.log(`Field: unknown`);
        }
      });
      console.log("=== END OF FIELDS ===");

      // ========== APPLICATION NUMBER ==========
      fillTextField(form, "AppNo", applicationNo);
      fillTextField(form, "AppNo1", applicationNo);
      fillTextField(form, "AppNo2", applicationNo);
      fillTextField(form, "AppNo3", applicationNo);
      fillTextField(form, "AppNo4", applicationNo);
      fillTextField(form, "AppNo5", applicationNo);
      fillTextField(form, "AppNo6", applicationNo);
      fillTextField(form, "AppNo7", applicationNo);
      fillTextField(form, "AppNo9", applicationNo);

      // ========== SECTION A: PROPOSED INSURED INFORMATION ==========

      // Name fields
      fillTextField(
        form,
        "name1",
        `${formData.lastName}, ${formData.firstName} ${formData.middleName}`.trim(),
      );
      fillTextField(form, "othertext", formData.otherLegalName);

      // Date of Birth
      fillTextField(form, "mm1", getMonthFromDate(formData.dob));
      fillTextField(form, "dd1", getDayFromDate(formData.dob));
      fillTextField(form, "yy1", getYearFromDate(formData.dob));

      // Gender
      fillCheckbox(form, "male", formData.gender === "Male");
      fillCheckbox(form, "female", formData.gender === "Female");

      // Place of Birth
      fillTextField(form, "pob1", formData.placeOfBirth);
      fillTextField(form, "Pob1", formData.placeOfBirth);

      // Civil Status
      fillCheckbox(form, "single", formData.civilStatus === "Single");
      fillCheckbox(form, "married", formData.civilStatus === "Married");
      fillCheckbox(form, "widowed", formData.civilStatus === "Widowed");
      fillCheckbox(form, "separated", formData.civilStatus === "Separated");
      fillCheckbox(form, "annuled", formData.civilStatus === "Annulled");
      fillCheckbox(form, "divored", formData.civilStatus === "Divorced");

      // Nationality
      fillTextField(form, "Nationality1", formData.nationality);
      fillTextField(form, "nationality2", formData.nationality);

      // U.S. Person
      fillCheckbox(form, "USyes", usPerson === "Yes");
      fillCheckbox(form, "USno", usPerson === "No");

      // Contact Information
      fillTextField(form, "MN1", formData.mobile);
      fillTextField(form, "MN2", formData.mobile);
      fillTextField(form, "Email1", formData.email);
      fillTextField(form, "email", formData.email);

      // Present Address
      fillTextField(form, "Unit1", formData.unitBuilding);
      fillTextField(form, "Street1", formData.street);
      fillTextField(form, "Barangay1", formData.barangay);
      fillTextField(form, "City1", formData.city);
      fillTextField(form, "Province1", formData.province);
      fillTextField(form, "County1", formData.country);
      fillTextField(form, "Country3", formData.country);

      // Mailing Address - Checkbox
      fillCheckbox(form, "mailing check", mailingSameAsPresent);

      // Mailing Address Fields
      if (!mailingSameAsPresent) {
        fillTextField(form, "Unit2", formData.mailUnit);
        fillTextField(form, "Lot2", formData.mailLot);
        fillTextField(form, "Street2", formData.mailStreet);
        fillTextField(form, "Barangay2", formData.mailBarangay);
        fillTextField(form, "City2", formData.mailCity);
        fillTextField(form, "Province2", formData.mailProvince);
        fillTextField(form, "Country2", formData.mailCountry);
      }

      // Work Information
      fillTextField(form, "Occupation1", formData.occupation);
      fillTextField(form, "Employer1", formData.employer);
      fillTextField(form, "Gai1", formData.annualIncome);
      fillTextField(form, "gai2", formData.annualIncome);
      fillTextField(form, "Unit3", formData.workUnit);
      fillTextField(form, "Street3", formData.workStreet);
      fillTextField(form, "Barangay3", formData.workBarangay);
      fillTextField(form, "City3", formData.workCity);
      fillTextField(form, "Province3", formData.workProvince);
      fillTextField(form, "Country3", formData.workCountry);

      // Source of Funds
      fillCheckbox(form, "business", formData.sourceFunds.includes("Business"));
      fillCheckbox(
        form,
        "salary",
        formData.sourceFunds.includes("Salary/Commission"),
      );
      fillCheckbox(
        form,
        "investments",
        formData.sourceFunds.includes("Investments"),
      );
      fillCheckbox(
        form,
        "remittance",
        formData.sourceFunds.includes("Remittances/Allowances/Pension"),
      );
      fillCheckbox(
        form,
        "donations",
        formData.sourceFunds.includes("Donations/Contributions"),
      );
      fillCheckbox(form, "others1", formData.sourceFunds.includes("Others"));

      // Public Position
      fillCheckbox(form, "12mntsYES", publicPosition === "Yes");
      fillCheckbox(form, "12mntsNO", publicPosition === "No");

      // Contingent Owner
      fillTextField(form, "CO", formData.contingentOwnerName);
      fillTextField(form, "mm3", getMonthFromDate(formData.contingentOwnerDob));
      fillTextField(form, "dd3", getDayFromDate(formData.contingentOwnerDob));
      fillTextField(form, "yy3", getYearFromDate(formData.contingentOwnerDob));
      fillTextField(form, "ROCO", formData.contingentOwnerRelationship);

      // ========== SECTION B: APPLICANT OWNER INFORMATION ==========

      // AO Name
      fillTextField(
        form,
        "name3",
        `${formData.aoLastName}, ${formData.aoFirstName} ${formData.aoMiddleName}`.trim(),
      );
      fillTextField(form, "othertext2", formData.aoOtherLegalName);

      // AO Date of Birth
      fillTextField(form, "Bmm2", getMonthFromDate(formData.aoDob));
      fillTextField(form, "Bdd2", getDayFromDate(formData.aoDob));
      fillTextField(form, "Byy2", getYearFromDate(formData.aoDob));

      // AO Gender
      fillCheckbox(form, "male2", formData.aoGender === "Male");
      fillCheckbox(form, "female2", formData.aoGender === "Female");

      // AO Place of Birth
      fillTextField(form, "pob2", formData.aoPlaceOfBirth);

      // AO Civil Status
      fillCheckbox(form, "single2", formData.aoCivilStatus === "Single");
      fillCheckbox(form, "married2", formData.aoCivilStatus === "Married");
      fillCheckbox(form, "widowed2", formData.aoCivilStatus === "Widowed");
      fillCheckbox(form, "separated2", formData.aoCivilStatus === "Separated");
      fillCheckbox(form, "annuled2", formData.aoCivilStatus === "Annulled");
      fillCheckbox(form, "divorced2", formData.aoCivilStatus === "Divorced");

      // AO Nationality
      fillTextField(form, "nationality2", formData.aoNationality);
      fillTextField(form, "nationality3", formData.aoNationality);
      fillTextField(form, "nationality4", formData.aoNationality);

      // AO Contact
      fillTextField(form, "MN2", formData.aoMobile);
      fillTextField(form, "email", formData.aoEmail);

      // AO Present Address
      fillTextField(form, "UnitB1", formData.aoUnitBuilding);
      fillTextField(form, "LotB1", formData.aoStreet);
      fillTextField(form, "BarangayB1", formData.aoBarangay);
      fillTextField(form, "CityB1", formData.aoCity);
      fillTextField(form, "ProvinceB1", formData.aoProvince);
      fillTextField(form, "CountryB1", formData.aoCountry);

      // AO Mailing Address - Checkbox
      fillCheckbox(form, "mailing check2", aoMailingSameAsPresent);

      // AO Mailing Address Fields
      if (!aoMailingSameAsPresent) {
        fillTextField(form, "UnitB2", formData.aoMailUnit);
        fillTextField(form, "LotB2", formData.aoMailLot);
        fillTextField(form, "StreetB2", formData.aoMailStreet);
        fillTextField(form, "BarangayB2", formData.aoMailBarangay);
        fillTextField(form, "CityB2", formData.aoMailCity);
        fillTextField(form, "ProvinceB2", formData.aoMailProvince);
        fillTextField(form, "CountryB2", formData.aoMailCountry);
      }

      // AO Work
      fillTextField(form, "occupation2", formData.aoOccupation);
      fillTextField(form, "employer2", formData.aoEmployer);
      fillTextField(form, "gai2", formData.aoAnnualIncome);
      fillTextField(form, "UnitB3", formData.aoWorkUnit);
      fillTextField(form, "StreetB3", formData.aoWorkStreet);
      fillTextField(form, "BarangayB3", formData.aoWorkBarangay);
      fillTextField(form, "CityB3", formData.aoWorkCity);
      fillTextField(form, "ProvinceB3", formData.aoWorkProvince);
      fillTextField(form, "CountryB3", formData.aoWorkCountry);

      // AO Source of Funds
      fillCheckbox(
        form,
        "business2",
        formData.aoSourceFunds.includes("Business"),
      );
      fillCheckbox(
        form,
        "salary2",
        formData.aoSourceFunds.includes("Salary/Commission"),
      );
      fillCheckbox(
        form,
        "investments2",
        formData.aoSourceFunds.includes("Investments"),
      );
      fillCheckbox(
        form,
        "remittance2",
        formData.aoSourceFunds.includes("Remittances/Allowances/Pension"),
      );
      fillCheckbox(
        form,
        "donations3",
        formData.aoSourceFunds.includes("Donations/Contributions"),
      );
      fillCheckbox(form, "others2", formData.aoSourceFunds.includes("Others"));

      // AO Public Position
      fillCheckbox(form, "12mntsYES2", publicPosition === "Yes");
      fillCheckbox(form, "12mntsNO2", publicPosition === "No");

      // ========== BENEFICIARIES ==========

      beneficiaries.forEach((ben, index) => {
        if (index === 0) {
          // First Beneficiary
          fillTextField(form, "Bname2", ben.name);
          fillTextField(form, "BRelationship2", ben.relationship);
          fillTextField(form, "sharepercent", ben.share);
          fillCheckbox(form, "primary", ben.type === "primary");
          fillCheckbox(form, "contingent", ben.type === "contingent");
          fillCheckbox(form, "irrevocable", ben.designation === "irrevocable");
          fillCheckbox(form, "revocable", ben.designation === "revocable");
          fillTextField(form, "contactinfo", ben.contact);
          fillTextField(form, "pob2", ben.placeOfBirth);
          fillTextField(form, "pob3", ben.placeOfBirth);
          fillTextField(form, "nationality3", ben.nationality);
          fillCheckbox(form, "male2", ben.gender === "Male");
          fillCheckbox(form, "female2", ben.gender === "Female");
        } else if (index === 1) {
          // Second Beneficiary
          fillTextField(form, "name5", ben.name);
          fillTextField(form, "ROB", ben.relationship);
          fillTextField(form, "sharepercent3", ben.share);
          fillCheckbox(form, "checkbox_316uzgo", ben.type === "primary");
          fillCheckbox(form, "checkbox_317uwea", ben.type === "contingent");
          fillCheckbox(
            form,
            "checkbox_318elwd",
            ben.designation === "irrevocable",
          );
          fillCheckbox(
            form,
            "checkbox_319wknj",
            ben.designation === "revocable",
          );
          fillCheckbox(form, "checkbox_320dglt", ben.gender === "Male");
          fillCheckbox(form, "checkbox_321mchv", ben.gender === "Female");
        } else if (index === 2) {
          // Third Beneficiary
          fillTextField(form, "name6", ben.name);
          fillTextField(form, "rob", ben.relationship);
          fillTextField(form, "sharepercent4", ben.share);
          fillCheckbox(form, "checkbox_322msuy", ben.type === "primary");
          fillCheckbox(form, "checkbox_400sdkh", ben.type === "contingent");
          fillCheckbox(
            form,
            "checkbox_401nrpc",
            ben.designation === "irrevocable",
          );
          fillCheckbox(
            form,
            "checkbox_405rvyl",
            ben.designation === "revocable",
          );
        }
      });

      // Total percentage
      const totalShare = beneficiaries.reduce(
        (sum, ben) => sum + (parseFloat(ben.share) || 0),
        0,
      );
      fillTextField(form, "totalpercent", totalShare.toString());
      fillTextField(form, "totalpercent2", totalShare.toString());

      // ========== POLICY INFORMATION ==========

      fillTextField(form, "Pname1", formData.planName);
      fillTextField(form, "SA1", formData.sumAssured);

      // Purpose of Insurance
      fillCheckbox(form, "IC", formData.purpose === "Income Continuation");
      fillCheckbox(form, "EC", formData.purpose === "Estate Creation");
      fillCheckbox(form, "mortgage", formData.purpose === "Mortgage");
      fillCheckbox(form, "KI", formData.purpose === "Keyman Insurance");
      fillCheckbox(form, "others3", formData.purpose === "Others");
      fillTextField(
        form,
        "othertext3",
        formData.purpose === "Others" ? formData.purpose : "",
      );

      // Payment Scheme
      fillCheckbox(form, "AD", paymentScheme === "auto");
      fillCheckbox(form, "cash/check", paymentScheme === "cash");
      fillCheckbox(form, "others4", paymentScheme === "others");

      // Non-Forfeiture Options
      fillCheckbox(
        form,
        "NSV",
        formData.nonForfeitureOption === "Net Surrender Value",
      );
      fillCheckbox(
        form,
        "PUI",
        formData.nonForfeitureOption === "Paid-up Insurance",
      );
      fillCheckbox(
        form,
        "ETI",
        formData.nonForfeitureOption === "Extended Term Insurance",
      );
      fillCheckbox(
        form,
        "APL",
        formData.nonForfeitureOption === "Automatic Premium Loan",
      );

      // Dividend Options
      fillCheckbox(
        form,
        "painincash",
        formData.dividendOption === "Paid in cash",
      );
      fillCheckbox(
        form,
        "APP",
        formData.dividendOption === "Applied to any premium due",
      );
      fillCheckbox(
        form,
        "lefttoaccumulate",
        formData.dividendOption === "Left to accumulate",
      );
      fillCheckbox(
        form,
        "appliedaspaid",
        formData.dividendOption === "Applied as paid-up additional",
      );

      // ========== PAYOUT OPTIONS ==========

      if (payoutOption === "auto") {
        fillCheckbox(form, "checkbox_127ewbs", true);
        fillCheckbox(form, "checkbox_128lyfi", false);

        fillTextField(form, "Bname", formData.bankName);
        fillTextField(form, "Bbranch", formData.bankBranch);
        fillTextField(form, "BankAccountNo", formData.accountNo);
        fillTextField(form, "BAN1", formData.accountName);
        fillTextField(form, "BAN2", formData.accountName);
        fillTextField(form, "BAN3", formData.accountName);

        fillCheckbox(
          form,
          "checkbox_281tmxk",
          formData.accountCurrency === "PHP",
        );
        fillCheckbox(form, "USD", formData.accountCurrency === "USD");

        fillCheckbox(
          form,
          "checkbox_314jveg",
          formData.jointAccountType === "AND",
        );
        fillCheckbox(
          form,
          "checkbox_315hekx",
          formData.jointAccountType === "OR",
        );
        fillCheckbox(
          form,
          "checkbox_317anjg",
          formData.jointAccountType === "AND/OR",
        );
      } else {
        fillCheckbox(form, "checkbox_128lyfi", true);
        fillCheckbox(form, "checkbox_127ewbs", false);
      }

      // ========== REPLACEMENT DECLARATION ==========

      fillTextField(
        form,
        "totalInsuranceInforce",
        formData.totalInsuranceInforce,
      );

      fillCheckbox(
        form,
        "checkbox_257segh",
        replacementInfo.intendedToReplace === "Yes",
      );
      fillCheckbox(
        form,
        "checkbox_258woib",
        replacementInfo.intendedToReplace === "No",
      );
      fillCheckbox(
        form,
        "checkbox_334irjn",
        replacementInfo.premiumFromExisting === "Yes",
      );
      fillCheckbox(
        form,
        "checkbox_424fhqy",
        replacementInfo.premiumFromExisting === "No",
      );

      // Existing Policies
      existingPolicies.forEach((policy, index) => {
        if (index === 0) {
          fillTextField(form, "company1", policy.company);
          fillTextField(form, "BL1", policy.insured);
          fillTextField(form, "policyno1", policy.policyNo);
          fillTextField(form, "COMPANY", policy.company);
          fillTextField(form, "INSURED", policy.insured);
          fillTextField(form, "POLICYNO", policy.policyNo);
        } else if (index === 1) {
          fillTextField(form, "company2", policy.company);
          fillTextField(form, "BL2", policy.insured);
          fillTextField(form, "policyno2", policy.policyNo);
          fillTextField(form, "COMPANY2", policy.company);
          fillTextField(form, "INSURED2", policy.insured);
          fillTextField(form, "POLICYNO2", policy.policyNo);
        } else if (index === 2) {
          fillTextField(form, "company3", policy.company);
          fillTextField(form, "text_306hpdn", policy.insured);
          fillTextField(form, "company4", policy.company);
        }
      });

      fillTextField(form, "accident", formData.accident);
      fillTextField(form, "YOI", formData.YOI);
      fillTextField(form, "AIBR1", formData.AIBR1);
      fillTextField(form, "AIBR2", formData.AIBR2);

      // ========== FAMILY HISTORY ==========

      fillCheckbox(
        form,
        "cardiovascular1",
        formData.familyHistoryPI.cardiovascular === "Not Applicable",
      );
      fillCheckbox(
        form,
        "cardiovascular2",
        formData.familyHistoryPI.cardiovascular === "1 member",
      );
      fillCheckbox(
        form,
        "cardiovascular3",
        formData.familyHistoryPI.cardiovascular === "2 or more members",
      );
      fillCheckbox(
        form,
        "cardiovascular4",
        formData.familyHistoryAO.cardiovascular === "Not Applicable",
      );
      fillCheckbox(
        form,
        "cardiovascular5",
        formData.familyHistoryAO.cardiovascular === "1 member",
      );
      fillCheckbox(
        form,
        "cardiovascular6",
        formData.familyHistoryAO.cardiovascular === "2 or more members",
      );

      fillCheckbox(
        form,
        "cerebrovascular1",
        formData.familyHistoryPI.cerebrovascular === "Not Applicable",
      );
      fillCheckbox(
        form,
        "cerebrovascular2",
        formData.familyHistoryPI.cerebrovascular === "1 member",
      );
      fillCheckbox(
        form,
        "cerebrovascular3",
        formData.familyHistoryPI.cerebrovascular === "2 or more members",
      );
      fillCheckbox(
        form,
        "cerebrovascular4",
        formData.familyHistoryAO.cerebrovascular === "Not Applicable",
      );
      fillCheckbox(
        form,
        "cerebrovascular5",
        formData.familyHistoryAO.cerebrovascular === "1 member",
      );
      fillCheckbox(
        form,
        "cerebrovascular6",
        formData.familyHistoryAO.cerebrovascular === "2 or more members",
      );

      fillCheckbox(
        form,
        "diabetes1",
        formData.familyHistoryPI.diabetes === "Not Applicable",
      );
      fillCheckbox(
        form,
        "diabetes2",
        formData.familyHistoryPI.diabetes === "1 member",
      );
      fillCheckbox(
        form,
        "diabetes3",
        formData.familyHistoryPI.diabetes === "2 or more members",
      );
      fillCheckbox(
        form,
        "diabetes4",
        formData.familyHistoryAO.diabetes === "Not Applicable",
      );
      fillCheckbox(
        form,
        "diabetes5",
        formData.familyHistoryAO.diabetes === "1 member",
      );
      fillCheckbox(
        form,
        "diabetes6",
        formData.familyHistoryAO.diabetes === "2 or more members",
      );

      // BUILD
      fillTextField(form, "ft1", formData.piHeightFt);
      fillTextField(form, "in1", formData.piHeightIn);
      fillTextField(form, "cm1", formData.piHeightCm);
      fillTextField(form, "ft2", formData.aoHeightFt);
      fillTextField(form, "in2", formData.aoHeightIn);
      fillTextField(form, "cm2", formData.aoHeightCm);
      fillTextField(form, "lbs1", formData.piWeightLbs);
      fillTextField(form, "kg1", formData.piWeightKg);
      fillTextField(form, "lbs2", formData.aoWeightLbs);
      fillTextField(form, "kg2", formData.aoWeightKg);

      // ========== NON-MEDICAL QUESTIONNAIRE ==========

      fillCheckbox(form, "PIyes", formData.piNonMedical.q1 === "Yes");
      fillCheckbox(form, "PIno", formData.piNonMedical.q1 === "No");
      fillCheckbox(form, "PI2yes", formData.piNonMedical.q2 === "Yes");
      fillCheckbox(form, "PI2no", formData.piNonMedical.q2 === "No");
      fillCheckbox(form, "PI3yes", formData.piNonMedical.q3 === "Yes");
      fillCheckbox(form, "PI3no", formData.piNonMedical.q3 === "No");
      fillCheckbox(form, "PI4yes", formData.piNonMedical.q4 === "Yes");
      fillCheckbox(form, "PI4no", formData.piNonMedical.q4 === "No");
      fillCheckbox(form, "PI5yes", formData.piNonMedical.q5 === "Yes");
      fillCheckbox(form, "PI5no", formData.piNonMedical.q5 === "No");
      fillCheckbox(form, "PI6yes", formData.piNonMedical.q6 === "Yes");
      fillCheckbox(form, "PI6no", formData.piNonMedical.q6 === "No");

      fillCheckbox(form, "AOyes", formData.aoNonMedical.q1 === "Yes");
      fillCheckbox(form, "AOno", formData.aoNonMedical.q1 === "No");
      fillCheckbox(form, "AO2yes", formData.aoNonMedical.q2 === "Yes");
      fillCheckbox(form, "AO2no", formData.aoNonMedical.q2 === "No");
      fillCheckbox(form, "AO3yes", formData.aoNonMedical.q3 === "Yes");
      fillCheckbox(form, "AO3no", formData.aoNonMedical.q3 === "No");
      fillCheckbox(form, "AO4yes", formData.aoNonMedical.q4 === "Yes");
      fillCheckbox(form, "AO4no", formData.aoNonMedical.q4 === "No");
      fillCheckbox(form, "AO5yes", formData.aoNonMedical.q5 === "Yes");
      fillCheckbox(form, "AO5no", formData.aoNonMedical.q5 === "No");
      fillCheckbox(form, "AO6yes", formData.aoNonMedical.q6 === "Yes");
      fillCheckbox(form, "AO6no", formData.aoNonMedical.q6 === "No");

      fillTextField(form, "DetailofYes", formData.piNonMedical.details);
      fillTextField(form, "DetailofYes2", formData.piNonMedical.details);
      fillTextField(form, "DetailofYes3", formData.piNonMedical.details);
      fillTextField(form, "DetailofYes4", formData.piNonMedical.details);
      fillTextField(form, "DetailofYes5", formData.piNonMedical.details);
      fillTextField(form, "DetailofYes6", formData.piNonMedical.details);
      fillTextField(form, "DetailofYes7", formData.piNonMedical.details);
      fillTextField(form, "DetailofYes8", formData.piNonMedical.details);

      // ========== OCCUPATION/AVOCATION DECLARATIONS ==========

      fillCheckbox(
        form,
        "PI1yes",
        formData.piOccAvoc.changeOccupation === "Yes",
      );
      fillCheckbox(form, "PI1no", formData.piOccAvoc.changeOccupation === "No");
      fillCheckbox(
        form,
        "AO1yes",
        formData.aoOccAvoc.changeOccupation === "Yes",
      );
      fillCheckbox(form, "AO1no", formData.aoOccAvoc.changeOccupation === "No");

      fillCheckbox(
        form,
        "checkbox_400sdkh",
        formData.piOccAvoc.changeResidence === "Yes",
      );
      fillCheckbox(
        form,
        "checkbox_401nrpc",
        formData.piOccAvoc.changeResidence === "No",
      );
      fillCheckbox(
        form,
        "checkbox_405rvyl",
        formData.aoOccAvoc.changeResidence === "Yes",
      );
      fillCheckbox(
        form,
        "checkbox_406qjna",
        formData.aoOccAvoc.changeResidence === "No",
      );

      fillCheckbox(
        form,
        "checkbox_407qmxi",
        formData.piOccAvoc.hazardousActivities === "Yes",
      );
      fillCheckbox(
        form,
        "checkbox_410ulwd",
        formData.piOccAvoc.hazardousActivities === "No",
      );
      fillCheckbox(
        form,
        "checkbox_411bbh",
        formData.aoOccAvoc.hazardousActivities === "Yes",
      );
      fillCheckbox(
        form,
        "checkbox_412mgzx",
        formData.aoOccAvoc.hazardousActivities === "No",
      );

      fillTextField(form, "text_428rivv", formData.piOccAvoc.details);
      fillTextField(form, "text_435udiz", formData.aoOccAvoc.details);

      // ========== GENERAL DECLARATION ==========
      fillCheckbox(form, "Iauthorized", shareInformation);
      fillCheckbox(form, "checkbox_440fycr", shareInformation);

      // ========== SIGNATURES ==========

      fillTextField(form, "Signature1", formData.proposedInsuredSig);
      fillTextField(form, "signature2", formData.applicantOwnerSig);
      fillTextField(form, "signature3", formData.childParentGuardianSig);
      fillTextField(
        form,
        "signedonPH",
        formatDate(formData.proposedInsuredDate),
      );

      fillTextField(form, "signature5", formData.proposedInsuredSig);
      fillTextField(form, "signature4", formData.applicantOwnerSig);
      fillTextField(form, "signature6", formData.childParentGuardianSig);

      // ========== DISTRIBUTOR DECLARATIONS ==========

      fillCheckbox(
        form,
        "declaration1yes",
        replacementInfo.intendedToReplace === "Yes",
      );
      fillCheckbox(
        form,
        "declaration1no",
        replacementInfo.intendedToReplace === "No",
      );
      fillCheckbox(
        form,
        "declaration2yes",
        replacementInfo.premiumFromExisting === "Yes",
      );
      fillCheckbox(
        form,
        "declaration2no",
        replacementInfo.premiumFromExisting === "No",
      );

      fillTextField(form, "signature7", formData.intermediaryName);
      fillTextField(form, "signature8", formData.intermediaryName);
      fillTextField(form, "code", formData.intermediaryCode);
      fillTextField(form, "signedonPH2", formatDate(formData.intermediaryDate));

      // ========== REFERROR DETAILS ==========

      fillTextField(form, "Referrorname", formData.referrorName);
      fillTextField(form, "referrorid", formData.referrorId);
      fillTextField(form, "bank", formData.referrorBank);
      fillTextField(form, "referringbranch", formData.referrorBranch);
      fillTextField(form, "signatureofreferror", formData.referrorSignature);
      fillTextField(form, "mm5", getMonthFromDate(formData.referrorDate));
      fillTextField(form, "dd5", getDayFromDate(formData.referrorDate));
      fillTextField(form, "yy5", getYearFromDate(formData.referrorDate));

      fillTextField(form, "agentsreport", formData.agentsReport);

      // ========== REPLACEMENT NOTIFICATION FORM ==========

      fillTextField(
        form,
        "PIname",
        `${formData.lastName}, ${formData.firstName} ${formData.middleName}`.trim(),
      );
      fillTextField(
        form,
        "PIaddress",
        `${formData.unitBuilding} ${formData.street}, ${formData.barangay}, ${formData.city}, ${formData.province}, ${formData.country}`,
      );
      fillTextField(form, "PIdate", formatDate(formData.dob));
      fillTextField(form, "applicantownername", formData.applicantOwnerSig);
      fillTextField(form, "SIGNATURE", formData.intermediaryName);
      fillTextField(form, "DATE", formatDate(formData.intermediaryDate));

      // Count filled fields
      const filledFields = allFields.filter((field) => {
        try {
          if (field.constructor.name === "PDFTextField") {
            return field.getText() && field.getText().trim() !== "";
          } else if (field.constructor.name === "PDFCheckBox") {
            return field.isChecked();
          }
          return false;
        } catch (e) {
          return false;
        }
      });

      console.log(
        `Successfully filled ${filledFields.length} out of ${allFields.length} fields`,
      );

      // ===== LOG MISSING FIELDS =====
      console.log("=== FIELDS THAT WERE NOT FILLED ===");
      const missingFields = [];
      allFields.forEach((field) => {
        try {
          if (field.constructor.name === "PDFTextField") {
            const value = field.getText();
            if (!value || value.trim() === "") {
              missingFields.push(field.getName());
            }
          } else if (field.constructor.name === "PDFCheckBox") {
            if (!field.isChecked()) {
              missingFields.push(field.getName());
            }
          }
        } catch (e) {
          // Skip fields that cause errors
        }
      });

      console.log(`Total missing fields: ${missingFields.length}`);
      console.log("Missing fields list:", missingFields);
      console.log("=== END OF MISSING FIELDS ===");

      const filledPdfBytes = await pdfDoc.save();
      downloadPDF(filledPdfBytes);

      console.log("PDF generated successfully!");
      return true;
    } catch (error) {
      console.error("Error filling PDF:", error);
      alert(
        `Failed to generate PDF: ${error.message}. Please check console for details.`,
      );
      throw error;
    }
  };

  const handleGeneratePDF = async () => {
    const pdfButton = document.querySelector(".pdf-generate-btn");

    if (pdfButton) {
      const originalText = pdfButton.textContent;
      pdfButton.textContent = "Generating PDF...";
      pdfButton.disabled = true;
      pdfButton.classList.add("loading");

      try {
        await fillPDF();

        pdfButton.textContent = "PDF Generated!";
        setTimeout(() => {
          pdfButton.textContent = originalText;
          pdfButton.disabled = false;
          pdfButton.classList.remove("loading");
        }, 2000);
      } catch (error) {
        console.error("PDF generation failed:", error);
        pdfButton.textContent = "Failed - Try Again";
        pdfButton.style.backgroundColor = "#dc3545";

        setTimeout(() => {
          pdfButton.textContent = originalText;
          pdfButton.disabled = false;
          pdfButton.classList.remove("loading");
          pdfButton.style.backgroundColor = "";
        }, 3000);
      }
    }
  };

  const downloadPDF = (pdfBytes, customName = null) => {
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download =
      customName ||
      `Life-Insurance-Application-${formData.lastName || "Form"}-${new Date().toISOString().split("T")[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = [
      formData.lastName,
      formData.firstName,
      formData.dob,
      formData.gender,
      formData.civilStatus,
      formData.nationality,
      formData.mobile,
      formData.email,
      formData.city,
      formData.country,
      formData.planName,
      formData.sumAssured,
    ];

    if (requiredFields.some((field) => !field)) {
      alert("Please fill in all required fields (marked with *)");
      return;
    }

    const totalShare = beneficiaries.reduce((sum, ben) => {
      const share = parseFloat(ben.share) || 0;
      return sum + share;
    }, 0);

    if (totalShare > 100) {
      alert("Total beneficiary shares cannot exceed 100%");
      return;
    }

    const generatePDFConfirm = window.confirm(
      "Form submitted successfully! Would you like to generate a PDF version?",
    );

    if (generatePDFConfirm) {
      await handleGeneratePDF();
    }

    console.log("Form submitted", {
      formData,
      beneficiaries,
      existingPolicies,
      replacementInfo,
      payoutOption,
      paymentScheme,
      policyCurrency,
      usPerson,
      publicPosition,
      shareInformation,
      applicationNo,
    });
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSourceFundsChange = (fund, type = "pi") => {
    if (type === "pi") {
      setFormData((prev) => {
        const funds = [...prev.sourceFunds];
        const index = funds.indexOf(fund);
        if (index > -1) {
          funds.splice(index, 1);
        } else {
          funds.push(fund);
        }
        return { ...prev, sourceFunds: funds };
      });
    } else {
      setFormData((prev) => {
        const funds = [...prev.aoSourceFunds];
        const index = funds.indexOf(fund);
        if (index > -1) {
          funds.splice(index, 1);
        } else {
          funds.push(fund);
        }
        return { ...prev, aoSourceFunds: funds };
      });
    }
  };

  const addExistingPolicy = () => {
    setExistingPolicies([
      ...existingPolicies,
      { company: "", insured: "", policyNo: "" },
    ]);
  };

  const removeExistingPolicy = (index) => {
    setExistingPolicies(existingPolicies.filter((_, i) => i !== index));
  };

  const updateExistingPolicy = (index, field, value) => {
    const updated = [...existingPolicies];
    updated[index][field] = value;
    setExistingPolicies(updated);
  };

  const addBeneficiary = () => {
    setBeneficiaries([
      ...beneficiaries,
      {
        id: beneficiaries.length + 1,
        name: "",
        dob: "",
        relationship: "",
        address: "",
        placeOfBirth: "",
        nationality: "",
        contact: "",
        gender: "",
        type: "primary",
        designation: "revocable",
        share: "",
      },
    ]);
  };

  const removeBeneficiary = (id) => {
    setBeneficiaries(beneficiaries.filter((b) => b.id !== id));
  };

  const renderFormTypeSelector = () => (
    <div className="inner-card" style={{ marginBottom: "20px" }}>
      <h3 className="section-title">Select Form Type</h3>
      <div className="radio-group" style={{ marginTop: "10px" }}>
        <label>
          <input
            type="radio"
            name="formType"
            checked={formType === "gae"}
            onChange={() => setFormType("gae")}
          />
          GAE (Guaranteed Acceptance Endorsement)
        </label>
        <label>
          <input
            type="radio"
            name="formType"
            checked={formType === "nongae"}
            onChange={() => setFormType("nongae")}
          />
          NON-GAE (Non-Guaranteed Acceptance Endorsement)
        </label>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="big-card">
      <div className="big-card-header">
        <h2>
          {formType === "gae"
            ? "GUARANTEED ACCEPTANCE ENDORSEMENT"
            : "NON-GUARANTEED ACCEPTANCE ENDORSEMENT"}
        </h2>
      </div>

      <div className="big-card-body">
        {renderFormTypeSelector()}

        {/* Auto-fill Button */}
        <div
          className="inner-card"
          style={{ marginBottom: "20px", backgroundColor: "#e8f4fd" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3 style={{ margin: 0 }}>Quick Fill Options</h3>
            <button
              type="button"
              onClick={autoFillForm}
              style={{
                backgroundColor: "#28a745",
                color: "white",
                padding: "10px 20px",
                border: "none",
                borderRadius: "5px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Auto-Fill with Sample Data
            </button>
          </div>
          <p style={{ marginTop: "10px", fontSize: "14px", color: "#666" }}>
            Click the button above to automatically fill the form with sample
            data based on your selected form type.
          </p>
        </div>

        {/* Floating Generate PDF Button */}
        <button
          type="button"
          onClick={handleGeneratePDF}
          className="pdf-generate-btn floating-pdf-btn"
          style={{
            position: "fixed",
            bottom: "30px",
            right: "30px",
            backgroundColor: "#003266",
            color: "white",
            padding: "15px 30px",
            border: "none",
            borderRadius: "50px",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
            zIndex: 1000,
            transition: "all 0.3s ease",
            fontFamily: "'Axiforma', sans-serif",
            fontSize: "16px",
            letterSpacing: "0.5px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          Generate PDF
        </button>

        {/* Application Number */}
        <div className="inner-card">
          <div className="form-group" style={{ maxWidth: "300px" }}>
            <label>Application No.</label>
            <input
              type="text"
              placeholder="Application Number"
              value={applicationNo}
              onChange={(e) => setApplicationNo(e.target.value)}
            />
          </div>
        </div>

        {/* SECTION A: PROPOSED INSURED INFORMATION */}
        <div className="inner-card">
          <h3 className="section-title">
            A. PROPOSED INSURED (PI) INFORMATION
          </h3>

          <div className="form-grid">
            <div className="form-group">
              <label>
                Last Name <span className="required">*</span>
              </label>
              <input
                type="text"
                placeholder="Last Name"
                required
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>
                First Name <span className="required">*</span>
              </label>
              <input
                type="text"
                placeholder="First Name"
                required
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Middle Name</label>
              <input
                type="text"
                placeholder="Middle Name"
                value={formData.middleName}
                onChange={(e) =>
                  handleInputChange("middleName", e.target.value)
                }
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>
                Date of Birth <span className="required">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.dob}
                onChange={(e) => handleInputChange("dob", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>
                Gender <span className="required">*</span>
              </label>
              <select
                required
                value={formData.gender}
                onChange={(e) => handleInputChange("gender", e.target.value)}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div className="form-group">
              <label>Place of Birth</label>
              <input
                type="text"
                placeholder="City/Municipality, Province, Country"
                value={formData.placeOfBirth}
                onChange={(e) =>
                  handleInputChange("placeOfBirth", e.target.value)
                }
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>
                Civil Status <span className="required">*</span>
              </label>
              <select
                required
                value={formData.civilStatus}
                onChange={(e) =>
                  handleInputChange("civilStatus", e.target.value)
                }
              >
                <option value="">Select Status</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Widowed">Widowed</option>
                <option value="Separated">Separated</option>
                <option value="Annulled">Annulled</option>
                <option value="Divorced">Divorced</option>
              </select>
            </div>
            <div className="form-group">
              <label>
                Nationality <span className="required">*</span>
              </label>
              <input
                type="text"
                placeholder="Nationality"
                required
                value={formData.nationality}
                onChange={(e) =>
                  handleInputChange("nationality", e.target.value)
                }
              />
            </div>
            <div className="form-group">
              <label>
                Are you a U.S. Person? <span className="required">*</span>
              </label>
              <select
                value={usPerson}
                onChange={(e) => setUsPerson(e.target.value)}
                required
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>
                Mobile Number <span className="required">*</span>
              </label>
              <input
                type="tel"
                placeholder="+63"
                required
                value={formData.mobile}
                onChange={(e) => handleInputChange("mobile", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>
                Email <span className="required">*</span>
              </label>
              <input
                type="email"
                placeholder="email@example.com"
                required
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
            </div>
          </div>

          <h4
            style={{
              marginTop: "20px",
              marginBottom: "10px",
            }}
          >
            Present Address
          </h4>
          <div className="form-grid">
            <div className="form-group">
              <label>Unit/Building Name</label>
              <input
                type="text"
                placeholder="Unit/Building"
                value={formData.unitBuilding}
                onChange={(e) =>
                  handleInputChange("unitBuilding", e.target.value)
                }
              />
            </div>
            <div className="form-group">
              <label>Street Name/Number</label>
              <input
                type="text"
                placeholder="Street"
                value={formData.street}
                onChange={(e) => handleInputChange("street", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Barangay/Subdivision</label>
              <input
                type="text"
                placeholder="Barangay"
                value={formData.barangay}
                onChange={(e) => handleInputChange("barangay", e.target.value)}
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>
                City/Municipality <span className="required">*</span>
              </label>
              <input
                type="text"
                placeholder="City/Municipality"
                required
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Province</label>
              <input
                type="text"
                placeholder="Province"
                value={formData.province}
                onChange={(e) => handleInputChange("province", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>
                Country <span className="required">*</span>
              </label>
              <input
                type="text"
                placeholder="Country"
                required
                value={formData.country}
                onChange={(e) => handleInputChange("country", e.target.value)}
              />
            </div>
          </div>

          <h4
            style={{
              marginTop: "20px",
              marginBottom: "10px",
            }}
          >
            Mailing Address
          </h4>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={mailingSameAsPresent}
                onChange={() => setMailingSameAsPresent(!mailingSameAsPresent)}
              />
              Tick if same as Present Address
            </label>
          </div>

          {!mailingSameAsPresent && (
            <>
              <div className="form-grid">
                <div className="form-group">
                  <label>Unit/Building Name</label>
                  <input
                    type="text"
                    placeholder="Unit/Building"
                    value={formData.mailUnit}
                    onChange={(e) =>
                      handleInputChange("mailUnit", e.target.value)
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Lot/Block No.</label>
                  <input
                    type="text"
                    placeholder="Lot/Block"
                    value={formData.mailLot}
                    onChange={(e) =>
                      handleInputChange("mailLot", e.target.value)
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Street Name/Number</label>
                  <input
                    type="text"
                    placeholder="Street"
                    value={formData.mailStreet}
                    onChange={(e) =>
                      handleInputChange("mailStreet", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Barangay/Subdivision</label>
                  <input
                    type="text"
                    placeholder="Barangay"
                    value={formData.mailBarangay}
                    onChange={(e) =>
                      handleInputChange("mailBarangay", e.target.value)
                    }
                  />
                </div>
                <div className="form-group">
                  <label>City/Municipality</label>
                  <input
                    type="text"
                    placeholder="City"
                    value={formData.mailCity}
                    onChange={(e) =>
                      handleInputChange("mailCity", e.target.value)
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Province</label>
                  <input
                    type="text"
                    placeholder="Province"
                    value={formData.mailProvince}
                    onChange={(e) =>
                      handleInputChange("mailProvince", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  placeholder="Country"
                  value={formData.mailCountry}
                  onChange={(e) =>
                    handleInputChange("mailCountry", e.target.value)
                  }
                />
              </div>
            </>
          )}

          <h4
            style={{
              marginTop: "20px",
              marginBottom: "10px",
            }}
          >
            Work Information
          </h4>
          <div className="form-grid">
            <div className="form-group">
              <label>Unit/Building Name</label>
              <input
                type="text"
                placeholder="Unit/Building"
                value={formData.workUnit}
                onChange={(e) => handleInputChange("workUnit", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Street Name/Number</label>
              <input
                type="text"
                placeholder="Street"
                value={formData.workStreet}
                onChange={(e) =>
                  handleInputChange("workStreet", e.target.value)
                }
              />
            </div>
            <div className="form-group">
              <label>Barangay/Subdivision</label>
              <input
                type="text"
                placeholder="Barangay"
                value={formData.workBarangay}
                onChange={(e) =>
                  handleInputChange("workBarangay", e.target.value)
                }
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>City/Municipality</label>
              <input
                type="text"
                placeholder="City/Municipality"
                value={formData.workCity}
                onChange={(e) => handleInputChange("workCity", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Province</label>
              <input
                type="text"
                placeholder="Province"
                value={formData.workProvince}
                onChange={(e) =>
                  handleInputChange("workProvince", e.target.value)
                }
              />
            </div>
            <div className="form-group">
              <label>Country</label>
              <input
                type="text"
                placeholder="Country"
                value={formData.workCountry}
                onChange={(e) =>
                  handleInputChange("workCountry", e.target.value)
                }
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Occupation (Title and/or Duties)</label>
              <input
                type="text"
                placeholder="Title and/or Duties"
                value={formData.occupation}
                onChange={(e) =>
                  handleInputChange("occupation", e.target.value)
                }
              />
            </div>
            <div className="form-group">
              <label>Employer / Nature of Business</label>
              <input
                type="text"
                placeholder="Employer"
                value={formData.employer}
                onChange={(e) => handleInputChange("employer", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Gross Annual Income (Php)</label>
              <input
                type="number"
                placeholder="0.00"
                step="0.01"
                value={formData.annualIncome}
                onChange={(e) =>
                  handleInputChange("annualIncome", e.target.value)
                }
              />
            </div>
          </div>

          <h4
            style={{
              marginTop: "20px",
              marginBottom: "10px",
              color: "#395998",
            }}
          >
            Source of Funds
          </h4>
          <div className="form-grid">
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.sourceFunds.includes("Business")}
                  onChange={() => handleSourceFundsChange("Business", "pi")}
                />{" "}
                Business
              </label>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.sourceFunds.includes("Salary/Commission")}
                  onChange={() =>
                    handleSourceFundsChange("Salary/Commission", "pi")
                  }
                />{" "}
                Salary/Commission
              </label>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.sourceFunds.includes("Investments")}
                  onChange={() => handleSourceFundsChange("Investments", "pi")}
                />{" "}
                Investments
              </label>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.sourceFunds.includes(
                    "Remittances/Allowances/Pension",
                  )}
                  onChange={() =>
                    handleSourceFundsChange(
                      "Remittances/Allowances/Pension",
                      "pi",
                    )
                  }
                />{" "}
                Remittances/Allowances/Pension
              </label>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.sourceFunds.includes(
                    "Donations/Contributions",
                  )}
                  onChange={() =>
                    handleSourceFundsChange("Donations/Contributions", "pi")
                  }
                />{" "}
                Donations/Contributions
              </label>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.sourceFunds.includes("Others")}
                  onChange={() => handleSourceFundsChange("Others", "pi")}
                />{" "}
                Others
              </label>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: "15px" }}>
            <label>
              Have you or any of your immediate family members or close
              relationships and associates been entrusted with prominent public
              position/s in (a) the Philippines with substantial authority over
              policy, operations or the use or allocation of government-owned
              resources; (b) a foreign State; or (c) an international
              organization, within the last 12 months?
            </label>
            <select
              value={publicPosition}
              onChange={(e) => setPublicPosition(e.target.value)}
            >
              <option value="">Select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          <h4
            style={{
              marginTop: "20px",
              marginBottom: "10px",
              color: "#395998",
            }}
          >
            Contingent Owner upon death of applicant owner
          </h4>
          <div className="form-grid">
            <div className="form-group">
              <label>Name (last name, first name, middle name)</label>
              <input
                type="text"
                placeholder="Full Name"
                value={formData.contingentOwnerName}
                onChange={(e) =>
                  handleInputChange("contingentOwnerName", e.target.value)
                }
              />
            </div>
            <div className="form-group">
              <label>Date of Birth (mm/dd/yyyy)</label>
              <input
                type="date"
                value={formData.contingentOwnerDob}
                onChange={(e) =>
                  handleInputChange("contingentOwnerDob", e.target.value)
                }
              />
            </div>
            <div className="form-group">
              <label>Relationship to Proposed Insured</label>
              <input
                type="text"
                placeholder="Relationship"
                value={formData.contingentOwnerRelationship}
                onChange={(e) =>
                  handleInputChange(
                    "contingentOwnerRelationship",
                    e.target.value,
                  )
                }
              />
            </div>
          </div>
        </div>

        {/* SECTION B: APPLICANT OWNER INFORMATION */}
        <div className="inner-card">
          <h3 className="section-title">B. APPLICANT OWNER (AO) INFORMATION</h3>
          <p className="note">
            1. Fill out only if the Applicant Owner is an individual and is
            different from the Proposed Insured.
            <br />
            2. Fill out the Applicant Owner (Business) Information Form if the
            Applicant Owner is an Entity.
          </p>

          <div className="form-grid">
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                placeholder="Last Name"
                value={formData.aoLastName}
                onChange={(e) =>
                  handleInputChange("aoLastName", e.target.value)
                }
              />
            </div>
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                placeholder="First Name"
                value={formData.aoFirstName}
                onChange={(e) =>
                  handleInputChange("aoFirstName", e.target.value)
                }
              />
            </div>
            <div className="form-group">
              <label>Middle Name</label>
              <input
                type="text"
                placeholder="Middle Name"
                value={formData.aoMiddleName}
                onChange={(e) =>
                  handleInputChange("aoMiddleName", e.target.value)
                }
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Date of Birth</label>
              <input
                type="date"
                value={formData.aoDob}
                onChange={(e) => handleInputChange("aoDob", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select
                value={formData.aoGender}
                onChange={(e) => handleInputChange("aoGender", e.target.value)}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div className="form-group">
              <label>Place of Birth</label>
              <input
                type="text"
                placeholder="City/Municipality, Province, Country"
                value={formData.aoPlaceOfBirth}
                onChange={(e) =>
                  handleInputChange("aoPlaceOfBirth", e.target.value)
                }
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Civil Status</label>
              <select
                value={formData.aoCivilStatus}
                onChange={(e) =>
                  handleInputChange("aoCivilStatus", e.target.value)
                }
              >
                <option value="">Select Status</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Widowed">Widowed</option>
                <option value="Separated">Separated</option>
                <option value="Annulled">Annulled</option>
                <option value="Divorced">Divorced</option>
              </select>
            </div>
            <div className="form-group">
              <label>Nationality</label>
              <input
                type="text"
                placeholder="Nationality"
                value={formData.aoNationality}
                onChange={(e) =>
                  handleInputChange("aoNationality", e.target.value)
                }
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Mobile Number</label>
              <input
                type="tel"
                placeholder="+63"
                value={formData.aoMobile}
                onChange={(e) => handleInputChange("aoMobile", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="email@example.com"
                value={formData.aoEmail}
                onChange={(e) => handleInputChange("aoEmail", e.target.value)}
              />
            </div>
          </div>

          <h4
            style={{
              marginTop: "20px",
              marginBottom: "10px",
              color: "#395998",
            }}
          >
            Present Address
          </h4>
          <div className="form-grid">
            <div className="form-group">
              <label>Unit/Building Name</label>
              <input
                type="text"
                placeholder="Unit/Building"
                value={formData.aoUnitBuilding}
                onChange={(e) =>
                  handleInputChange("aoUnitBuilding", e.target.value)
                }
              />
            </div>
            <div className="form-group">
              <label>Street Name/Number</label>
              <input
                type="text"
                placeholder="Street"
                value={formData.aoStreet}
                onChange={(e) => handleInputChange("aoStreet", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Barangay/Subdivision</label>
              <input
                type="text"
                placeholder="Barangay"
                value={formData.aoBarangay}
                onChange={(e) =>
                  handleInputChange("aoBarangay", e.target.value)
                }
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>City/Municipality</label>
              <input
                type="text"
                placeholder="City/Municipality"
                value={formData.aoCity}
                onChange={(e) => handleInputChange("aoCity", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Province</label>
              <input
                type="text"
                placeholder="Province"
                value={formData.aoProvince}
                onChange={(e) =>
                  handleInputChange("aoProvince", e.target.value)
                }
              />
            </div>
            <div className="form-group">
              <label>Country</label>
              <input
                type="text"
                placeholder="Country"
                value={formData.aoCountry}
                onChange={(e) => handleInputChange("aoCountry", e.target.value)}
              />
            </div>
          </div>

          <h4
            style={{
              marginTop: "20px",
              marginBottom: "10px",
              color: "#395998",
            }}
          >
            Mailing Address
          </h4>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={aoMailingSameAsPresent}
                onChange={() =>
                  setAoMailingSameAsPresent(!aoMailingSameAsPresent)
                }
              />
              Tick if same as Present Address
            </label>
          </div>

          {!aoMailingSameAsPresent && (
            <>
              <div className="form-grid">
                <div className="form-group">
                  <label>Unit/Building Name</label>
                  <input
                    type="text"
                    placeholder="Unit/Building"
                    value={formData.aoMailUnit}
                    onChange={(e) =>
                      handleInputChange("aoMailUnit", e.target.value)
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Lot/Block No.</label>
                  <input
                    type="text"
                    placeholder="Lot/Block"
                    value={formData.aoMailLot}
                    onChange={(e) =>
                      handleInputChange("aoMailLot", e.target.value)
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Street Name/Number</label>
                  <input
                    type="text"
                    placeholder="Street"
                    value={formData.aoMailStreet}
                    onChange={(e) =>
                      handleInputChange("aoMailStreet", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Barangay/Subdivision</label>
                  <input
                    type="text"
                    placeholder="Barangay"
                    value={formData.aoMailBarangay}
                    onChange={(e) =>
                      handleInputChange("aoMailBarangay", e.target.value)
                    }
                  />
                </div>
                <div className="form-group">
                  <label>City/Municipality</label>
                  <input
                    type="text"
                    placeholder="City"
                    value={formData.aoMailCity}
                    onChange={(e) =>
                      handleInputChange("aoMailCity", e.target.value)
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Province</label>
                  <input
                    type="text"
                    placeholder="Province"
                    value={formData.aoMailProvince}
                    onChange={(e) =>
                      handleInputChange("aoMailProvince", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  placeholder="Country"
                  value={formData.aoMailCountry}
                  onChange={(e) =>
                    handleInputChange("aoMailCountry", e.target.value)
                  }
                />
              </div>
            </>
          )}

          <h4
            style={{
              marginTop: "20px",
              marginBottom: "10px",
              color: "#395998",
            }}
          >
            Work Information
          </h4>
          <div className="form-grid">
            <div className="form-group">
              <label>Unit/Building Name</label>
              <input
                type="text"
                placeholder="Unit/Building"
                value={formData.aoWorkUnit}
                onChange={(e) =>
                  handleInputChange("aoWorkUnit", e.target.value)
                }
              />
            </div>
            <div className="form-group">
              <label>Street Name/Number</label>
              <input
                type="text"
                placeholder="Street"
                value={formData.aoWorkStreet}
                onChange={(e) =>
                  handleInputChange("aoWorkStreet", e.target.value)
                }
              />
            </div>
            <div className="form-group">
              <label>Barangay/Subdivision</label>
              <input
                type="text"
                placeholder="Barangay"
                value={formData.aoWorkBarangay}
                onChange={(e) =>
                  handleInputChange("aoWorkBarangay", e.target.value)
                }
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>City/Municipality</label>
              <input
                type="text"
                placeholder="City/Municipality"
                value={formData.aoWorkCity}
                onChange={(e) =>
                  handleInputChange("aoWorkCity", e.target.value)
                }
              />
            </div>
            <div className="form-group">
              <label>Province</label>
              <input
                type="text"
                placeholder="Province"
                value={formData.aoWorkProvince}
                onChange={(e) =>
                  handleInputChange("aoWorkProvince", e.target.value)
                }
              />
            </div>
            <div className="form-group">
              <label>Country</label>
              <input
                type="text"
                placeholder="Country"
                value={formData.aoWorkCountry}
                onChange={(e) =>
                  handleInputChange("aoWorkCountry", e.target.value)
                }
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Occupation (Title and/or Duties)</label>
              <input
                type="text"
                placeholder="Title and/or Duties"
                value={formData.aoOccupation}
                onChange={(e) =>
                  handleInputChange("aoOccupation", e.target.value)
                }
              />
            </div>
            <div className="form-group">
              <label>Employer / Nature of Business</label>
              <input
                type="text"
                placeholder="Employer"
                value={formData.aoEmployer}
                onChange={(e) =>
                  handleInputChange("aoEmployer", e.target.value)
                }
              />
            </div>
            <div className="form-group">
              <label>Gross Annual Income (Php)</label>
              <input
                type="number"
                placeholder="0.00"
                step="0.01"
                value={formData.aoAnnualIncome}
                onChange={(e) =>
                  handleInputChange("aoAnnualIncome", e.target.value)
                }
              />
            </div>
          </div>

          <h4
            style={{
              marginTop: "20px",
              marginBottom: "10px",
              color: "#395998",
            }}
          >
            Source of Funds
          </h4>
          <div className="form-grid">
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.aoSourceFunds.includes("Business")}
                  onChange={() => handleSourceFundsChange("Business", "ao")}
                />{" "}
                Business
              </label>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.aoSourceFunds.includes("Salary/Commission")}
                  onChange={() =>
                    handleSourceFundsChange("Salary/Commission", "ao")
                  }
                />{" "}
                Salary/Commission
              </label>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.aoSourceFunds.includes("Investments")}
                  onChange={() => handleSourceFundsChange("Investments", "ao")}
                />{" "}
                Investments
              </label>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.aoSourceFunds.includes(
                    "Remittances/Allowances/Pension",
                  )}
                  onChange={() =>
                    handleSourceFundsChange(
                      "Remittances/Allowances/Pension",
                      "ao",
                    )
                  }
                />{" "}
                Remittances/Allowances/Pension
              </label>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.aoSourceFunds.includes(
                    "Donations/Contributions",
                  )}
                  onChange={() =>
                    handleSourceFundsChange("Donations/Contributions", "ao")
                  }
                />{" "}
                Donations/Contributions
              </label>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.aoSourceFunds.includes("Others")}
                  onChange={() => handleSourceFundsChange("Others", "ao")}
                />{" "}
                Others
              </label>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: "15px" }}>
            <label>
              Have you or any of your immediate family members or close
              relationships and associates been entrusted with prominent public
              position/s?
            </label>
            <select
              value={publicPosition}
              onChange={(e) => setPublicPosition(e.target.value)}
            >
              <option value="">Select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
        </div>

        {/* BENEFICIARIES SECTION */}
        <div className="inner-card">
          <h3 className="section-title">C. BENEFICIARIES</h3>

          {beneficiaries.map((ben, index) => (
            <div
              key={ben.id}
              style={{
                marginBottom: "25px",
                paddingBottom: "20px",
                borderBottom:
                  index < beneficiaries.length - 1
                    ? "1px solid #e5e7eb"
                    : "none",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "15px",
                }}
              >
                <h4 style={{ color: "#395998", margin: 0 }}>
                  Beneficiary {index + 1}
                </h4>
                {beneficiaries.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeBeneficiary(ben.id)}
                    style={{
                      background: "#dc3545",
                      color: "white",
                      padding: "6px 12px",
                      fontSize: "12px",
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    placeholder="Last Name, First Name, Middle Name"
                    value={ben.name}
                    onChange={(e) => {
                      const updated = [...beneficiaries];
                      updated[index].name = e.target.value;
                      setBeneficiaries(updated);
                    }}
                  />
                </div>
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    value={ben.dob}
                    onChange={(e) => {
                      const updated = [...beneficiaries];
                      updated[index].dob = e.target.value;
                      setBeneficiaries(updated);
                    }}
                  />
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select
                    value={ben.gender}
                    onChange={(e) => {
                      const updated = [...beneficiaries];
                      updated[index].gender = e.target.value;
                      setBeneficiaries(updated);
                    }}
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Relationship to Proposed Insured</label>
                  <input
                    type="text"
                    placeholder="e.g., Spouse, Child, Parent"
                    value={ben.relationship}
                    onChange={(e) => {
                      const updated = [...beneficiaries];
                      updated[index].relationship = e.target.value;
                      setBeneficiaries(updated);
                    }}
                  />
                </div>
                <div className="form-group">
                  <label>Place of Birth</label>
                  <input
                    type="text"
                    placeholder="City, Province, Country"
                    value={ben.placeOfBirth}
                    onChange={(e) => {
                      const updated = [...beneficiaries];
                      updated[index].placeOfBirth = e.target.value;
                      setBeneficiaries(updated);
                    }}
                  />
                </div>
                <div className="form-group">
                  <label>Nationality</label>
                  <input
                    type="text"
                    placeholder="Nationality"
                    value={ben.nationality}
                    onChange={(e) => {
                      const updated = [...beneficiaries];
                      updated[index].nationality = e.target.value;
                      setBeneficiaries(updated);
                    }}
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Contact Information</label>
                  <input
                    type="text"
                    placeholder="Phone or Email"
                    value={ben.contact}
                    onChange={(e) => {
                      const updated = [...beneficiaries];
                      updated[index].contact = e.target.value;
                      setBeneficiaries(updated);
                    }}
                  />
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <select
                    value={ben.type}
                    onChange={(e) => {
                      const updated = [...beneficiaries];
                      updated[index].type = e.target.value;
                      setBeneficiaries(updated);
                    }}
                  >
                    <option value="primary">Primary</option>
                    <option value="contingent">Contingent</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Designation</label>
                  <select
                    value={ben.designation}
                    onChange={(e) => {
                      const updated = [...beneficiaries];
                      updated[index].designation = e.target.value;
                      setBeneficiaries(updated);
                    }}
                  >
                    <option value="revocable">Revocable</option>
                    <option value="irrevocable">Irrevocable</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>% Share</label>
                <input
                  type="number"
                  placeholder="%"
                  min="0"
                  max="100"
                  value={ben.share}
                  onChange={(e) => {
                    const updated = [...beneficiaries];
                    updated[index].share = e.target.value;
                    setBeneficiaries(updated);
                  }}
                />
              </div>

              <div className="form-group">
                <label>Address</label>
                <textarea
                  rows="2"
                  placeholder="Full Address"
                  value={ben.address}
                  onChange={(e) => {
                    const updated = [...beneficiaries];
                    updated[index].address = e.target.value;
                    setBeneficiaries(updated);
                  }}
                ></textarea>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addBeneficiary}
            style={{
              background: "#395998",
              color: "white",
              padding: "10px 20px",
              marginTop: "10px",
            }}
          >
            + Add Another Beneficiary
          </button>
        </div>

        {/* SECTION D: POLICY INFORMATION */}
        <div className="inner-card">
          <h3 className="section-title">
            D. INFORMATION ON THE POLICY APPLIED FOR
          </h3>

          <div className="form-group">
            <label>
              Plan Name <span className="required">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter Plan Name"
              required
              value={formData.planName}
              onChange={(e) => handleInputChange("planName", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>
              Sum Assured <span className="required">*</span>
            </label>
            <div style={{ display: "flex", gap: "10px" }}>
              <select
                value={policyCurrency}
                onChange={(e) => setPolicyCurrency(e.target.value)}
                style={{ width: "80px" }}
              >
                <option value="PHP">PHP</option>
                <option value="USD">USD</option>
              </select>
              <input
                type="number"
                placeholder="0.00"
                step="0.01"
                required
                style={{ flex: 1 }}
                value={formData.sumAssured}
                onChange={(e) =>
                  handleInputChange("sumAssured", e.target.value)
                }
              />
            </div>
          </div>

          <h4
            style={{
              marginTop: "20px",
              marginBottom: "10px",
              color: "#395998",
            }}
          >
            Purpose of Insurance
          </h4>
          <div className="form-grid">
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.purpose === "Income Continuation"}
                  onChange={() =>
                    handleInputChange("purpose", "Income Continuation")
                  }
                />{" "}
                Income Continuation
              </label>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.purpose === "Estate Creation"}
                  onChange={() =>
                    handleInputChange("purpose", "Estate Creation")
                  }
                />{" "}
                Estate Creation
              </label>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.purpose === "Mortgage"}
                  onChange={() => handleInputChange("purpose", "Mortgage")}
                />{" "}
                Mortgage
              </label>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.purpose === "Keyman Insurance"}
                  onChange={() =>
                    handleInputChange("purpose", "Keyman Insurance")
                  }
                />{" "}
                Keyman Insurance
              </label>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.purpose === "Others"}
                  onChange={() => handleInputChange("purpose", "Others")}
                />{" "}
                Others
              </label>
            </div>
          </div>

          <h4
            style={{
              marginTop: "20px",
              marginBottom: "10px",
              color: "#395998",
            }}
          >
            Payment Scheme
          </h4>
          <div className="form-grid">
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={paymentScheme === "auto"}
                  onChange={() =>
                    handleExclusiveCheckbox(setPaymentScheme, "auto")
                  }
                />{" "}
                Auto-Debit (Submit Auto Debit Forms)
              </label>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={paymentScheme === "cash"}
                  onChange={() =>
                    handleExclusiveCheckbox(setPaymentScheme, "cash")
                  }
                />{" "}
                Cash/Check
              </label>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={paymentScheme === "others"}
                  onChange={() =>
                    handleExclusiveCheckbox(setPaymentScheme, "others")
                  }
                />{" "}
                Others
              </label>
            </div>
          </div>

          <h4
            style={{
              marginTop: "20px",
              marginBottom: "10px",
              color: "#395998",
            }}
          >
            Non-Forfeiture Option (if applicable)
          </h4>
          <div className="form-grid">
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={
                    formData.nonForfeitureOption === "Net Surrender Value"
                  }
                  onChange={() =>
                    handleInputChange(
                      "nonForfeitureOption",
                      "Net Surrender Value",
                    )
                  }
                />{" "}
                Net Surrender Value
              </label>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.nonForfeitureOption === "Paid-up Insurance"}
                  onChange={() =>
                    handleInputChange(
                      "nonForfeitureOption",
                      "Paid-up Insurance",
                    )
                  }
                />{" "}
                Paid-up Insurance
              </label>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={
                    formData.nonForfeitureOption === "Extended Term Insurance"
                  }
                  onChange={() =>
                    handleInputChange(
                      "nonForfeitureOption",
                      "Extended Term Insurance",
                    )
                  }
                />{" "}
                Extended Term Insurance
              </label>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={
                    formData.nonForfeitureOption === "Automatic Premium Loan"
                  }
                  onChange={() =>
                    handleInputChange(
                      "nonForfeitureOption",
                      "Automatic Premium Loan",
                    )
                  }
                />{" "}
                Automatic Premium Loan
              </label>
            </div>
          </div>

          <h4
            style={{
              marginTop: "20px",
              marginBottom: "10px",
              color: "#395998",
            }}
          >
            Policy Dividend Option (if applicable)
          </h4>
          <div className="form-grid">
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.dividendOption === "Paid in cash"}
                  onChange={() =>
                    handleInputChange("dividendOption", "Paid in cash")
                  }
                />{" "}
                Paid in cash
              </label>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={
                    formData.dividendOption ===
                    "Applied to any premium due (APP)"
                  }
                  onChange={() =>
                    handleInputChange(
                      "dividendOption",
                      "Applied to any premium due (APP)",
                    )
                  }
                />{" "}
                Applied to any premium due (APP)
              </label>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={
                    formData.dividendOption ===
                    "Left to accumulate (Accumulate at interest)"
                  }
                  onChange={() =>
                    handleInputChange(
                      "dividendOption",
                      "Left to accumulate (Accumulate at interest)",
                    )
                  }
                />{" "}
                Left to accumulate (Accumulate at interest)
              </label>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={
                    formData.dividendOption ===
                    "Applied as paid-up additional non-participating life insurance"
                  }
                  onChange={() =>
                    handleInputChange(
                      "dividendOption",
                      "Applied as paid-up additional non-participating life insurance",
                    )
                  }
                />{" "}
                Applied as paid-up additional non-participating life insurance
              </label>
            </div>
          </div>
        </div>

        {/* SECTION E: PAYOUT OPTION FOR ALL LIVING BENEFITS */}
        <div className="inner-card">
          <h3 className="section-title">
            E. PAYOUT OPTION FOR ALL LIVING BENEFITS
          </h3>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={payoutOption === "check"}
                onChange={() =>
                  handleExclusiveCheckbox(setPayoutOption, "check")
                }
              />{" "}
              Check (to be mailed to my mailing address)
            </label>
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={payoutOption === "auto"}
                onChange={() =>
                  handleExclusiveCheckbox(setPayoutOption, "auto")
                }
              />{" "}
              AUTOMATIC TRANSFER TO MY ACCOUNT
            </label>
          </div>

          {payoutOption === "auto" && (
            <div
              style={{
                marginTop: "20px",
                padding: "15px",
                backgroundColor: "#f8f9fa",
                borderRadius: "5px",
              }}
            >
              <p style={{ marginBottom: "15px" }}>
                I hereby agree that all my living benefits (anticipated
                endowment proceeds net of outstanding loans, dividends, policy
                loans, withdrawals, surrenders and maturities) and refunds will
                automatically be transferred to my account with details
                indicated below, hereby granting Allianz PNB Life Insurance,
                Inc. authority to effect the same.
              </p>
              <p style={{ marginBottom: "15px", fontStyle: "italic" }}>
                I fully understand and agree that the authorization shall be on
                a continuing basis and shall remain in full force and effect
                unless cancelled by the undersigned in writing or as determined
                by Allianz PNB Life Insurance, Inc.
              </p>
              <p style={{ marginBottom: "15px", fontStyle: "italic" }}>
                By signing this application form, I agree to inform Allianz PNB
                Life Insurance, Inc. in writing of any change in the information
                provided or in my account status. I also authorize Allianz PNB
                Life Insurance, Inc. to deduct from the proceeds any applicable
                bank charge/s.
              </p>

              <h4 style={{ color: "#395998", marginBottom: "15px" }}>
                Bank Account Details
              </h4>
              <div className="form-grid">
                <div className="form-group">
                  <label>Bank Name</label>
                  <input
                    type="text"
                    placeholder="Bank Name"
                    value={formData.bankName}
                    onChange={(e) =>
                      handleInputChange("bankName", e.target.value)
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Bank Branch</label>
                  <input
                    type="text"
                    placeholder="Branch"
                    value={formData.bankBranch}
                    onChange={(e) =>
                      handleInputChange("bankBranch", e.target.value)
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Bank Account Number</label>
                  <input
                    type="text"
                    placeholder="Account Number"
                    value={formData.accountNo}
                    onChange={(e) =>
                      handleInputChange("accountNo", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Account Name</label>
                  <input
                    type="text"
                    placeholder="Account Name"
                    value={formData.accountName}
                    onChange={(e) =>
                      handleInputChange("accountName", e.target.value)
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Account Currency</label>
                  <select
                    value={formData.accountCurrency}
                    onChange={(e) =>
                      handleInputChange("accountCurrency", e.target.value)
                    }
                  >
                    <option value="">Select Currency</option>
                    <option value="PHP">PHP</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Joint Account Type</label>
                  <select
                    value={formData.jointAccountType}
                    onChange={(e) =>
                      handleInputChange("jointAccountType", e.target.value)
                    }
                  >
                    <option value="">Select Type</option>
                    <option value="AND">AND</option>
                    <option value="OR">OR</option>
                    <option value="AND/OR">AND/OR</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION F: DECLARATION ON THE PROPOSED REPLACEMENT OF EXISTING POLICY(IES) */}
        <div className="inner-card">
          <h3 className="section-title">
            F. DECLARATION ON THE PROPOSED REPLACEMENT OF EXISTING POLICY(IES)
          </h3>

          <div className="form-group">
            <label>Total Insurance Inforce on Proposed Insured</label>
            <input
              type="text"
              placeholder="Total Insurance Inforce"
              value={formData.totalInsuranceInforce}
              onChange={(e) =>
                handleInputChange("totalInsuranceInforce", e.target.value)
              }
            />
          </div>

          <div className="form-group">
            <label>
              Is the Policy applied for intended to change or replace any
              existing insurance in force on the life of Proposed Insured?
            </label>
            <select
              value={replacementInfo.intendedToReplace}
              onChange={(e) =>
                setReplacementInfo({
                  ...replacementInfo,
                  intendedToReplace: e.target.value,
                })
              }
            >
              <option value="">Select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          <div className="form-group">
            <label>
              Will premiums for the insurance applied for be paid by a policy
              loan, withdrawal, or surrender from any existing policy?
            </label>
            <select
              value={replacementInfo.premiumFromExisting}
              onChange={(e) =>
                setReplacementInfo({
                  ...replacementInfo,
                  premiumFromExisting: e.target.value,
                })
              }
            >
              <option value="">Select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          <div
            style={{
              backgroundColor: "#fff3cd",
              padding: "15px",
              borderRadius: "5px",
              marginBottom: "20px",
              border: "1px solid #ffeaa7",
            }}
          >
            <p>
              <strong>REMINDER:</strong> It is usually disadvantageous to
              REPLACE existing life insurance policy(ies) with a new one. Some
              disadvantages are:
            </p>
            <ol style={{ margin: "10px 0 0 25px" }}>
              <li>You may not be insurable on standard terms.</li>
              <li>
                You may have to pay a higher Premium in view of higher age.
              </li>
              <li>You may lose financial benefits.</li>
            </ol>
            <p style={{ marginTop: "10px" }}>
              Please note that in your own interest, we would advise that you
              consult your present insurer before making a final decision. Hear
              from both sides and make a careful comparison. You can then be
              sure that you are making a decision that is in your best interest.
            </p>
          </div>

          {(replacementInfo.intendedToReplace === "Yes" ||
            replacementInfo.premiumFromExisting === "Yes") && (
              <>
                <h4
                  style={{
                    marginTop: "20px",
                    marginBottom: "10px",
                    color: "#395998",
                  }}
                >
                  Existing Policies to be Replaced
                </h4>

                {existingPolicies.map((policy, index) => (
                  <div
                    key={index}
                    style={{
                      marginBottom: "20px",
                      padding: "15px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "5px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "10px",
                      }}
                    >
                      <h5 style={{ margin: 0, color: "#666" }}>
                        Policy #{index + 1}
                      </h5>
                      {existingPolicies.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeExistingPolicy(index)}
                          style={{
                            background: "#dc3545",
                            color: "white",
                            padding: "5px 10px",
                            fontSize: "12px",
                            border: "none",
                            borderRadius: "3px",
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="form-grid">
                      <div className="form-group">
                        <label>Company Name (as in Policy)</label>
                        <input
                          type="text"
                          value={policy.company}
                          onChange={(e) =>
                            updateExistingPolicy(index, "company", e.target.value)
                          }
                          placeholder="Company Name"
                        />
                      </div>
                      <div className="form-group">
                        <label>Insured Name (as in Policy)</label>
                        <input
                          type="text"
                          value={policy.insured}
                          onChange={(e) =>
                            updateExistingPolicy(index, "insured", e.target.value)
                          }
                          placeholder="Insured Name"
                        />
                      </div>
                      <div className="form-group">
                        <label>Policy Number</label>
                        <input
                          type="text"
                          value={policy.policyNo}
                          onChange={(e) =>
                            updateExistingPolicy(
                              index,
                              "policyNo",
                              e.target.value,
                            )
                          }
                          placeholder="Policy No."
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addExistingPolicy}
                  style={{
                    background: "#395998",
                    color: "white",
                    padding: "8px 16px",
                    marginTop: "10px",
                    border: "none",
                    borderRadius: "5px",
                  }}
                >
                  + Add Another Policy
                </button>
              </>
            )}
        </div>

        {/* FAMILY HISTORY - Page 4 */}
        {formType === "nongae" && (
          <div className="inner-card">
            <h3 className="section-title">FAMILY HISTORY</h3>
            <p className="note">
              Please declare if any of the immediate family members (father,
              mother, siblings, children) has/had any of the following
              conditions on or before the age of 60
            </p>

            <h4 style={{ color: "#395998", marginBottom: "15px" }}>
              Cardiovascular Disease/Coronary Artery Disease / Myocardial
              Infarction / Hypertension
            </h4>
            <div className="form-grid">
              <div className="form-group">
                <label>Proposed Insured</label>
                <select
                  value={formData.familyHistoryPI.cardiovascular}
                  onChange={(e) => {
                    const updated = {
                      ...formData.familyHistoryPI,
                      cardiovascular: e.target.value,
                    };
                    setFormData({ ...formData, familyHistoryPI: updated });
                  }}
                >
                  <option value="">Select</option>
                  <option value="Not Applicable">Not Applicable</option>
                  <option value="1 member">1 member</option>
                  <option value="2 or more members">2 or more members</option>
                </select>
              </div>
              <div className="form-group">
                <label>Applicant Owner</label>
                <select
                  value={formData.familyHistoryAO.cardiovascular}
                  onChange={(e) => {
                    const updated = {
                      ...formData.familyHistoryAO,
                      cardiovascular: e.target.value,
                    };
                    setFormData({ ...formData, familyHistoryAO: updated });
                  }}
                >
                  <option value="">Select</option>
                  <option value="Not Applicable">Not Applicable</option>
                  <option value="1 member">1 member</option>
                  <option value="2 or more members">2 or more members</option>
                </select>
              </div>
            </div>

            <h4
              style={{
                color: "#395998",
                marginTop: "20px",
                marginBottom: "15px",
              }}
            >
              Cerebrovascular Disease / Stroke
            </h4>
            <div className="form-grid">
              <div className="form-group">
                <label>Proposed Insured</label>
                <select
                  value={formData.familyHistoryPI.cerebrovascular}
                  onChange={(e) => {
                    const updated = {
                      ...formData.familyHistoryPI,
                      cerebrovascular: e.target.value,
                    };
                    setFormData({ ...formData, familyHistoryPI: updated });
                  }}
                >
                  <option value="">Select</option>
                  <option value="Not Applicable">Not Applicable</option>
                  <option value="1 member">1 member</option>
                  <option value="2 or more members">2 or more members</option>
                </select>
              </div>
              <div className="form-group">
                <label>Applicant Owner</label>
                <select
                  value={formData.familyHistoryAO.cerebrovascular}
                  onChange={(e) => {
                    const updated = {
                      ...formData.familyHistoryAO,
                      cerebrovascular: e.target.value,
                    };
                    setFormData({ ...formData, familyHistoryAO: updated });
                  }}
                >
                  <option value="">Select</option>
                  <option value="Not Applicable">Not Applicable</option>
                  <option value="1 member">1 member</option>
                  <option value="2 or more members">2 or more members</option>
                </select>
              </div>
            </div>

            <h4
              style={{
                color: "#395998",
                marginTop: "20px",
                marginBottom: "15px",
              }}
            >
              Diabetes Mellitus
            </h4>
            <div className="form-grid">
              <div className="form-group">
                <label>Proposed Insured</label>
                <select
                  value={formData.familyHistoryPI.diabetes}
                  onChange={(e) => {
                    const updated = {
                      ...formData.familyHistoryPI,
                      diabetes: e.target.value,
                    };
                    setFormData({ ...formData, familyHistoryPI: updated });
                  }}
                >
                  <option value="">Select</option>
                  <option value="Not Applicable">Not Applicable</option>
                  <option value="1 member">1 member</option>
                  <option value="2 or more members">2 or more members</option>
                </select>
              </div>
              <div className="form-group">
                <label>Applicant Owner</label>
                <select
                  value={formData.familyHistoryAO.diabetes}
                  onChange={(e) => {
                    const updated = {
                      ...formData.familyHistoryAO,
                      diabetes: e.target.value,
                    };
                    setFormData({ ...formData, familyHistoryAO: updated });
                  }}
                >
                  <option value="">Select</option>
                  <option value="Not Applicable">Not Applicable</option>
                  <option value="1 member">1 member</option>
                  <option value="2 or more members">2 or more members</option>
                </select>
              </div>
            </div>

            <h4
              style={{
                color: "#395998",
                marginTop: "20px",
                marginBottom: "15px",
              }}
            >
              BUILD
            </h4>
            <div className="form-grid">
              <div className="form-group">
                <label>Proposed Insured Height</label>
                <div style={{ display: "flex", gap: "5px" }}>
                  <input
                    type="text"
                    placeholder="ft"
                    style={{ width: "60px" }}
                    value={formData.piHeightFt}
                    onChange={(e) =>
                      handleInputChange("piHeightFt", e.target.value)
                    }
                  />
                  <input
                    type="text"
                    placeholder="in"
                    style={{ width: "60px" }}
                    value={formData.piHeightIn}
                    onChange={(e) =>
                      handleInputChange("piHeightIn", e.target.value)
                    }
                  />
                  <input
                    type="text"
                    placeholder="cm"
                    style={{ width: "80px" }}
                    value={formData.piHeightCm}
                    onChange={(e) =>
                      handleInputChange("piHeightCm", e.target.value)
                    }
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Proposed Insured Weight</label>
                <div style={{ display: "flex", gap: "5px" }}>
                  <input
                    type="text"
                    placeholder="lbs"
                    style={{ width: "80px" }}
                    value={formData.piWeightLbs}
                    onChange={(e) =>
                      handleInputChange("piWeightLbs", e.target.value)
                    }
                  />
                  <input
                    type="text"
                    placeholder="kg"
                    style={{ width: "80px" }}
                    value={formData.piWeightKg}
                    onChange={(e) =>
                      handleInputChange("piWeightKg", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Applicant Owner Height</label>
                <div style={{ display: "flex", gap: "5px" }}>
                  <input
                    type="text"
                    placeholder="ft"
                    style={{ width: "60px" }}
                    value={formData.aoHeightFt}
                    onChange={(e) =>
                      handleInputChange("aoHeightFt", e.target.value)
                    }
                  />
                  <input
                    type="text"
                    placeholder="in"
                    style={{ width: "60px" }}
                    value={formData.aoHeightIn}
                    onChange={(e) =>
                      handleInputChange("aoHeightIn", e.target.value)
                    }
                  />
                  <input
                    type="text"
                    placeholder="cm"
                    style={{ width: "80px" }}
                    value={formData.aoHeightCm}
                    onChange={(e) =>
                      handleInputChange("aoHeightCm", e.target.value)
                    }
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Applicant Owner Weight</label>
                <div style={{ display: "flex", gap: "5px" }}>
                  <input
                    type="text"
                    placeholder="lbs"
                    style={{ width: "80px" }}
                    value={formData.aoWeightLbs}
                    onChange={(e) =>
                      handleInputChange("aoWeightLbs", e.target.value)
                    }
                  />
                  <input
                    type="text"
                    placeholder="kg"
                    style={{ width: "80px" }}
                    value={formData.aoWeightKg}
                    onChange={(e) =>
                      handleInputChange("aoWeightKg", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* NON-MEDICAL QUESTIONNAIRE - Page 4 */}
        {formType === "nongae" && (
          <div className="inner-card">
            <h3 className="section-title">NON-MEDICAL QUESTIONNAIRE</h3>

            <div className="form-group">
              <label>
                1. Have you ever been diagnosed or consulted with a medical
                doctor, or referred for medical tests or hospitalization for any
                kind of medical condition beyond the conditions listed below?
              </label>
              <div style={{ display: "flex", gap: "20px", marginTop: "5px" }}>
                <div>
                  <strong>PI:</strong>
                  <select
                    value={formData.piNonMedical.q1}
                    onChange={(e) => {
                      const updated = {
                        ...formData.piNonMedical,
                        q1: e.target.value,
                      };
                      setFormData({ ...formData, piNonMedical: updated });
                    }}
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div>
                  <strong>AO:</strong>
                  <select
                    value={formData.aoNonMedical.q1}
                    onChange={(e) => {
                      const updated = {
                        ...formData.aoNonMedical,
                        q1: e.target.value,
                      };
                      setFormData({ ...formData, aoNonMedical: updated });
                    }}
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>
                2. Have you ever been diagnosed or received treatment or medical
                advice for any lump, cyst, cancer, high blood, heart or lung
                disease, diabetes, kidney or liver disease, mental or
                neurological dysfunction, pending or previous minor or major
                operation, or any other ailment with or without physical
                impairment other than those listed in item number 1?
              </label>
              <div style={{ display: "flex", gap: "20px", marginTop: "5px" }}>
                <div>
                  <strong>PI:</strong>
                  <select
                    value={formData.piNonMedical.q2}
                    onChange={(e) => {
                      const updated = {
                        ...formData.piNonMedical,
                        q2: e.target.value,
                      };
                      setFormData({ ...formData, piNonMedical: updated });
                    }}
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div>
                  <strong>AO:</strong>
                  <select
                    value={formData.aoNonMedical.q2}
                    onChange={(e) => {
                      const updated = {
                        ...formData.aoNonMedical,
                        q2: e.target.value,
                      };
                      setFormData({ ...formData, aoNonMedical: updated });
                    }}
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>3. Do you smoke more than 30 sticks per day?</label>
              <div style={{ display: "flex", gap: "20px", marginTop: "5px" }}>
                <div>
                  <strong>PI:</strong>
                  <select
                    value={formData.piNonMedical.q3}
                    onChange={(e) => {
                      const updated = {
                        ...formData.piNonMedical,
                        q3: e.target.value,
                      };
                      setFormData({ ...formData, piNonMedical: updated });
                    }}
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div>
                  <strong>AO:</strong>
                  <select
                    value={formData.aoNonMedical.q3}
                    onChange={(e) => {
                      const updated = {
                        ...formData.aoNonMedical,
                        q3: e.target.value,
                      };
                      setFormData({ ...formData, aoNonMedical: updated });
                    }}
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>
                4. Do you consume alcoholic beverages more than 6 bottles of
                beer / 10 shots of hard liquor / 4 glasses of wine per day?
              </label>
              <div style={{ display: "flex", gap: "20px", marginTop: "5px" }}>
                <div>
                  <strong>PI:</strong>
                  <select
                    value={formData.piNonMedical.q4}
                    onChange={(e) => {
                      const updated = {
                        ...formData.piNonMedical,
                        q4: e.target.value,
                      };
                      setFormData({ ...formData, piNonMedical: updated });
                    }}
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div>
                  <strong>AO:</strong>
                  <select
                    value={formData.aoNonMedical.q4}
                    onChange={(e) => {
                      const updated = {
                        ...formData.aoNonMedical,
                        q4: e.target.value,
                      };
                      setFormData({ ...formData, aoNonMedical: updated });
                    }}
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>
                5. Have you ever used habit forming drugs (cocaine, heroin,
                marijuana, LSD or amphetamines)?
              </label>
              <div style={{ display: "flex", gap: "20px", marginTop: "5px" }}>
                <div>
                  <strong>PI:</strong>
                  <select
                    value={formData.piNonMedical.q5}
                    onChange={(e) => {
                      const updated = {
                        ...formData.piNonMedical,
                        q5: e.target.value,
                      };
                      setFormData({ ...formData, piNonMedical: updated });
                    }}
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div>
                  <strong>AO:</strong>
                  <select
                    value={formData.aoNonMedical.q5}
                    onChange={(e) => {
                      const updated = {
                        ...formData.aoNonMedical,
                        q5: e.target.value,
                      };
                      setFormData({ ...formData, aoNonMedical: updated });
                    }}
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>
                6. For women only, are you pregnant? If yes, how many weeks?
              </label>
              <div style={{ display: "flex", gap: "20px", marginTop: "5px" }}>
                <div>
                  <strong>PI:</strong>
                  <select
                    value={formData.piNonMedical.q6}
                    onChange={(e) => {
                      const updated = {
                        ...formData.piNonMedical,
                        q6: e.target.value,
                      };
                      setFormData({ ...formData, piNonMedical: updated });
                    }}
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div>
                  <strong>AO:</strong>
                  <select
                    value={formData.aoNonMedical.q6}
                    onChange={(e) => {
                      const updated = {
                        ...formData.aoNonMedical,
                        q6: e.target.value,
                      };
                      setFormData({ ...formData, aoNonMedical: updated });
                    }}
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Details of "YES" answers:</label>
              <textarea
                rows="4"
                style={{ width: "100%" }}
                placeholder="Please indicate the diagnosis/reason, date of first symptoms, duration of illness, Doctor/Attending Physician, and other details"
                value={formData.piNonMedical.details}
                onChange={(e) => {
                  const updated = {
                    ...formData.piNonMedical,
                    details: e.target.value,
                  };
                  setFormData({ ...formData, piNonMedical: updated });
                }}
              ></textarea>
            </div>
          </div>
        )}

        {/* DECLARATIONS ON OCCUPATION/AVOCATION - Page 5 */}
        {formType === "nongae" && (
          <div className="inner-card">
            <h3 className="section-title">
              DECLARATIONS ON OCCUPATION/AVOCATION
            </h3>

            <div className="form-group">
              <label>
                1. Do you expect to change in the next 12 months: a) occupation?
                b) country of residence?
              </label>
              <div style={{ marginTop: "10px" }}>
                <div>
                  <strong>PI - Occupation:</strong>
                  <select
                    value={formData.piOccAvoc.changeOccupation}
                    onChange={(e) => {
                      const updated = {
                        ...formData.piOccAvoc,
                        changeOccupation: e.target.value,
                      };
                      setFormData({ ...formData, piOccAvoc: updated });
                    }}
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div style={{ marginTop: "5px" }}>
                  <strong>PI - Residence:</strong>
                  <select
                    value={formData.piOccAvoc.changeResidence}
                    onChange={(e) => {
                      const updated = {
                        ...formData.piOccAvoc,
                        changeResidence: e.target.value,
                      };
                      setFormData({ ...formData, piOccAvoc: updated });
                    }}
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div style={{ marginTop: "5px" }}>
                  <strong>AO - Occupation:</strong>
                  <select
                    value={formData.aoOccAvoc.changeOccupation}
                    onChange={(e) => {
                      const updated = {
                        ...formData.aoOccAvoc,
                        changeOccupation: e.target.value,
                      };
                      setFormData({ ...formData, aoOccAvoc: updated });
                    }}
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div style={{ marginTop: "5px" }}>
                  <strong>AO - Residence:</strong>
                  <select
                    value={formData.aoOccAvoc.changeResidence}
                    onChange={(e) => {
                      const updated = {
                        ...formData.aoOccAvoc,
                        changeResidence: e.target.value,
                      };
                      setFormData({ ...formData, aoOccAvoc: updated });
                    }}
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: "15px" }}>
              <label>
                2. Do you engage or intend to engage in any private flying,
                scuba, or skin diving; motorcycle, car, motorboat racing or any
                other extreme sports/hazardous activities?
              </label>
              <div style={{ marginTop: "10px" }}>
                <div>
                  <strong>PI:</strong>
                  <select
                    value={formData.piOccAvoc.hazardousActivities}
                    onChange={(e) => {
                      const updated = {
                        ...formData.piOccAvoc,
                        hazardousActivities: e.target.value,
                      };
                      setFormData({ ...formData, piOccAvoc: updated });
                    }}
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div style={{ marginTop: "5px" }}>
                  <strong>AO:</strong>
                  <select
                    value={formData.aoOccAvoc.hazardousActivities}
                    onChange={(e) => {
                      const updated = {
                        ...formData.aoOccAvoc,
                        hazardousActivities: e.target.value,
                      };
                      setFormData({ ...formData, aoOccAvoc: updated });
                    }}
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Details of "YES" answers:</label>
              <textarea
                rows="3"
                style={{ width: "100%" }}
                placeholder="Provide details"
                value={formData.piOccAvoc.details}
                onChange={(e) => {
                  const updated = {
                    ...formData.piOccAvoc,
                    details: e.target.value,
                  };
                  setFormData({ ...formData, piOccAvoc: updated });
                }}
              ></textarea>
            </div>
          </div>
        )}

        {/* SECTION H: ACKNOWLEDGEMENT OF VARIABILITY */}
        <div className="inner-card">
          <h3 className="section-title">
            H. ACKNOWLEDGEMENT OF VARIABILITY APPLICABLE ONLY FOR PARTICIPATING
            LIFE INSURANCE POLICY
          </h3>

          <div style={{ marginBottom: "15px" }}>
            <p>I hereby acknowledge the following:</p>
            <p>
              1. I am applying for a participating life insurance with Allianz
              PNB Life Insurance, Inc.
            </p>
            <p>
              2. I understand that in a participating life insurance, the
              Applicant Owner is eligible to receive dividends, subject to the
              following limitations/conditions:
            </p>
            <div style={{ paddingLeft: "30px" }}>
              <p>
                a) Allianz PNB Life Insurance, Inc. in its sole discretion
                determines the amount of dividends, if any;
              </p>
              <p>
                b) Dividend rates will typically vary based on the performance
                of a number of factors including Allianz PNB Life Insurance,
                Inc.'s investment returns, mortality experience, expense and
                taxes;
              </p>
              <p>
                c) In view of the variability of dividend performance, it is not
                guaranteed: (i) that there will be accumulated dividends
                sufficient to offset any future premiums; or (ii) that the
                Policy will become self-liquidating (i.e., able to pay its own
                premiums) in the future.
              </p>
            </div>
            <p>
              3. That Allianz PNB Life Insurance, Inc. shall have the right to
              adopt or change the basis for any distribution of surplus and for
              the determination of any amount to be apportioned by way of
              dividend to said policy (if participating).
            </p>
          </div>
        </div>

        {/* SECTION I: GENERAL DECLARATION */}
        <div className="inner-card">
          <h3 className="section-title">I. GENERAL DECLARATION</h3>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={shareInformation}
                onChange={() => setShareInformation(!shareInformation)}
              />
              I further authorize Allianz PNB Life Insurance, Inc. to share,
              transfer and/or disclose my Personal Data to any of its
              subsidiaries, affiliates, and partners for offer of their products
              and services.
            </label>
          </div>
        </div>

        {/* SECTION J: SIGNATURES */}
        <div className="inner-card">
          <h3 className="section-title">J. SIGNATURES</h3>

          <div
            style={{
              marginBottom: "20px",
              padding: "15px",
              backgroundColor: "#fff3cd",
              borderRadius: "5px",
            }}
          >
            <p>
              <strong>Important:</strong> If a material fact is not disclosed in
              this application, any policy issued may not be valid. If in doubt
              as to whether a fact is material, you are advised to disclose it.
              This includes information that you may have provided to the
              Distributor but was not included in the application.
            </p>
            <p>
              Please check to ensure you are fully satisfied with the
              information declared in this application.
            </p>
            <p>
              By signing below, I declare that I have read and agree with the
              General Declarations. Further, I agree that updates in my Personal
              Data made in this Application will be applied to my existing
              policies with Allianz PNB Life Insurance, Inc., if any, to ensure
              that all my policies are always up to date. As such, it is my
              responsibility to provide accurate and relevant Personal Data in
              this Application. I acknowledge that Allianz PNB Life Insurance,
              Inc. is not liable for any consequence resulting from incomplete
              or inaccurate Personal Data provided by me or any delays in
              updating it.
            </p>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Signature over Printed Name of Proposed Insured</label>
              <input
                type="text"
                placeholder="Proposed Insured Name"
                value={formData.proposedInsuredSig}
                onChange={(e) =>
                  handleInputChange("proposedInsuredSig", e.target.value)
                }
              />
            </div>
            <div className="form-group">
              <label>Date (mm/dd/yyyy)</label>
              <input
                type="date"
                value={formData.proposedInsuredDate}
                onChange={(e) =>
                  handleInputChange("proposedInsuredDate", e.target.value)
                }
              />
            </div>
          </div>

          <div className="form-grid" style={{ marginTop: "20px" }}>
            <div className="form-group">
              <label>
                Signature over Printed Name of Applicant Owner (if other than
                Proposed Insured)
              </label>
              <input
                type="text"
                placeholder="Applicant Owner Name"
                value={formData.applicantOwnerSig}
                onChange={(e) =>
                  handleInputChange("applicantOwnerSig", e.target.value)
                }
              />
            </div>
            <div className="form-group">
              <label>Date (mm/dd/yyyy)</label>
              <input
                type="date"
                value={formData.applicantOwnerDate}
                onChange={(e) =>
                  handleInputChange("applicantOwnerDate", e.target.value)
                }
              />
            </div>
          </div>

          <div className="form-grid" style={{ marginTop: "20px" }}>
            <div className="form-group">
              <label>
                Signature over Printed Name of Child's Parent/Guardian (for
                Authorization to Insure Child)
              </label>
              <input
                type="text"
                placeholder="Parent/Guardian Name"
                value={formData.childParentGuardianSig}
                onChange={(e) =>
                  handleInputChange("childParentGuardianSig", e.target.value)
                }
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: "20px" }}>
            <label>Signed in the Philippines on Date (mm/dd/yyyy)</label>
            <input type="date" value={formData.proposedInsuredDate} readOnly />
          </div>
        </div>

        {/* DISTRIBUTOR DECLARATIONS */}
        <div className="inner-card">
          <h3 className="section-title">DISTRIBUTOR DECLARATIONS</h3>

          <h4 style={{ color: "#395998", marginBottom: "15px" }}>
            A. DECLARATION ON THE PROPOSED REPLACEMENT OF EXISTING POLICY(IES)
          </h4>

          <div className="form-group">
            <label>
              Is the Policy applied for intended to change or replace any
              existing insurance in force on the life of Proposed Insured?
            </label>
            <select
              value={replacementInfo.intendedToReplace}
              onChange={(e) =>
                setReplacementInfo({
                  ...replacementInfo,
                  intendedToReplace: e.target.value,
                })
              }
            >
              <option value="">Select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          <div className="form-group">
            <label>
              Will premiums for the insurance applied for be paid by a policy
              loan, withdrawal, or surrender from any existing policy?
            </label>
            <select
              value={replacementInfo.premiumFromExisting}
              onChange={(e) =>
                setReplacementInfo({
                  ...replacementInfo,
                  premiumFromExisting: e.target.value,
                })
              }
            >
              <option value="">Select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          <h4
            style={{
              color: "#395998",
              marginTop: "20px",
              marginBottom: "15px",
            }}
          >
            B. SIGNATURE
          </h4>

          <div
            style={{
              backgroundColor: "#f8f9fa",
              padding: "15px",
              borderRadius: "5px",
              marginBottom: "15px",
            }}
          >
            <p>
              There are no known factors (health or otherwise) evident from the
              application form and that could affect the evaluation of the
              application. Furthermore, the identity of the Proposed Insured,
              Applicant Owner or Beneficiary is not any of the following:
            </p>
            <ul style={{ marginLeft: "25px" }}>
              <li>
                a Politically Exposed Person (PEP) or an immediate family member
                or a close associate of politically exposed person
              </li>
              <li>
                a remittance agent, money changer or foreign exchange dealer
              </li>
              <li>
                a member of Non Government Organization (NGO), Non-Profit
                Organization (NPO) or Foundation
              </li>
              <li>connected with a casino and related gaming entities</li>
              <li>a customs broker, a jewel / gem / precious metal dealer</li>
              <li>a gun/ ammunition / military equipment dealer</li>
              <li>
                a shell company from High Risk Jurisdictions/Countries that is
                recognized as having inadequate internationally accepted
                anti-money laundering standards; does not sufficiently regulate
                business to counteract money-laundering; fails to incorporate
                Financial Action Task Force (FATF) recommendation into its
                regulatory regimes
              </li>
              <li>
                from countries that exhibits a relatively high prevalence or
                risk of crime, corruption, or terrorist financing
              </li>
            </ul>
            <p style={{ fontStyle: "italic" }}>
              Otherwise, Enhanced Due Diligence (EDD) form must be filled out
              and submitted.
            </p>
            <p>
              I certify that I have verified the identity of the Proposed
              Insured and/or Applicant Owner.
            </p>
            <p>
              I have personally presented and explained the product and its
              benefits and have personally witnessed the Proposed Insured and/or
              Applicant Owner signing the application before the application is
              submitted.
            </p>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Signature over Printed Name of Distributor</label>
              <input
                type="text"
                placeholder="Distributor Name"
                value={formData.intermediaryName}
                onChange={(e) =>
                  handleInputChange("intermediaryName", e.target.value)
                }
              />
            </div>
            <div className="form-group">
              <label>Code</label>
              <input
                type="text"
                placeholder="Agent Code"
                value={formData.intermediaryCode}
                onChange={(e) =>
                  handleInputChange("intermediaryCode", e.target.value)
                }
              />
            </div>
            <div className="form-group">
              <label>Signed in the Philippines on Date (mm/dd/yyyy)</label>
              <input
                type="date"
                value={formData.intermediaryDate}
                onChange={(e) =>
                  handleInputChange("intermediaryDate", e.target.value)
                }
              />
            </div>
          </div>

          <h4
            style={{
              color: "#395998",
              marginTop: "20px",
              marginBottom: "15px",
            }}
          >
            C. REFERROR & REFERRING BRANCH DETAILS (FOR BANK CLIENTS)
          </h4>

          <div className="form-grid">
            <div className="form-group">
              <label>
                Name of Referror (last name, first name, middle name)
              </label>
              <input
                type="text"
                placeholder="Referror Name"
                value={formData.referrorName}
                onChange={(e) =>
                  handleInputChange("referrorName", e.target.value)
                }
              />
            </div>
            <div className="form-group">
              <label>Referror's ID No.</label>
              <input
                type="text"
                placeholder="ID Number"
                value={formData.referrorId}
                onChange={(e) =>
                  handleInputChange("referrorId", e.target.value)
                }
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Bank</label>
              <input
                type="text"
                placeholder="Bank Name"
                value={formData.referrorBank}
                onChange={(e) =>
                  handleInputChange("referrorBank", e.target.value)
                }
              />
            </div>
            <div className="form-group">
              <label>Referring Branch</label>
              <input
                type="text"
                placeholder="Branch Name"
                value={formData.referrorBranch}
                onChange={(e) =>
                  handleInputChange("referrorBranch", e.target.value)
                }
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Signature of Referror</label>
              <input
                type="text"
                placeholder="Referror Signature"
                value={formData.referrorSignature}
                onChange={(e) =>
                  handleInputChange("referrorSignature", e.target.value)
                }
              />
            </div>
            <div className="form-group">
              <label>Date Signed (mm/dd/yyyy)</label>
              <input
                type="date"
                value={formData.referrorDate}
                onChange={(e) =>
                  handleInputChange("referrorDate", e.target.value)
                }
              />
            </div>
          </div>

          <h4
            style={{
              color: "#395998",
              marginTop: "20px",
              marginBottom: "15px",
            }}
          >
            D. AGENT'S REPORT
          </h4>

          <div className="form-group">
            <textarea
              rows="4"
              style={{ width: "100%" }}
              placeholder="Agent's Report"
              value={formData.agentsReport}
              onChange={(e) =>
                handleInputChange("agentsReport", e.target.value)
              }
            ></textarea>
          </div>
        </div>

        {/* Buttons */}
        <div
          className="btn-group"
          style={{
            marginTop: "30px",
            paddingTop: "20px",
            borderTop: "1px solid #eaeaea",
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to reset the form? All data will be lost.",
                  )
                ) {
                  window.location.reload();
                }
              }}
              style={{ marginRight: "10px" }}
            >
              Reset Form
            </button>
          </div>
          <div style={{ display: "flex", gap: "10px", marginLeft: "auto" }}>
            <button
              type="button"
              onClick={handleGeneratePDF}
              className="pdf-generate-btn"
              style={{
                marginRight: "10px",
                backgroundColor: "#003266",
                color: "white",
                padding: "12px 24px",
                border: "none",
                borderRadius: "8px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s ease",
                fontFamily: "'Axiforma', sans-serif",
              }}
            >
              Generate PDF
            </button>
            <button type="submit" className="btn-success">
              Submit Application
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

export default LifeInsuranceForm;

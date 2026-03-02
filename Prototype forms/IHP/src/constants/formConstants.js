export const INITIAL_DEPENDENT = {
  id: null,
  lastName: "",
  firstName: "",
  middleName: "",
  suffix: "",
  otherLegalName: "",
  dob: "", // Make sure this is properly initialized
  gender: "",
  placeOfBirth: "",
  civilStatus: "",
  nationality: "",
  countryOfResidence: "",
  durationOfStay: "",
  tin: "",
  relationship: "",

  presentAddress: {
    unitBuilding: "",
    lotBlockStreet: "",
    barangaySubdivision: "",
    cityMunicipality: "",
    province: "",
    country: "Philippines",
    zipCode: "",
  },

  workInformation: {
    unitBuilding: "",
    lotBlockStreet: "",
    barangaySubdivision: "",
    cityMunicipality: "",
    province: "",
    country: "Philippines",
    zipCode: "",
    estimatedAnnualIncome: "",
    occupation: "",
    employer: "",
    natureOfBusiness: "",
  },

  currentInsurance: {
    provider: "",
    effectiveDate: "",
    policyNumber: "",
  },

  healthDeclaration: {
    heightFeet: "",
    heightMeters: "",
    weightKg: "",
    weightLbs: "",
    smokeVape: false,
    smokeQuantity: "",
    alcohol: false,
    alcoholQuantity: "",
    glassesContacts: false,
    eyeGrade: "",
  },
};

export const INITIAL_HEALTH_QUESTIONS = {
  applicantOwner: createHealthQuestionTemplate(),
  dependent1: createHealthQuestionTemplate(),
  dependent2: createHealthQuestionTemplate(),
};

export const INITIAL_POLICY_INFO = {
  basePlan: "",
  amountInsured: "",
  amountOfPaymentDeposit: "",
  deductible: "",
  coPayment: "",
  commencementOfCoverNote: "",
  areaOfCover: "",
  modeOfPayment: "",
  paymentScheme: "",
};

export const INITIAL_ADDITIONAL_CONDITION = {
  questionNo: "",
  nameOfPerson: "",
  diagnosis: "",
  dateOfOnset: "",
  frequencySeverity: "",
  medicalTestResults: "",
  treatment: "",
  currentStatus: "",
};

export const INITIAL_FORM_DATA = {
  lastName: "",
  firstName: "",
  middleName: "",
  suffix: "",
  otherLegalName: "",
  placeOfBirth: "",
  nationality: "",
  usPerson: "",
  dob: "",
  gender: "",
  civilStatus: "",
  countryOfResidence: "",
  durationOfStay: "",
  tin: "",
  presentAddress: createAddress(),
  workInformation: createWorkInfo(),
  preferredMailingAddress: "",
  contactInformation: { primaryContact: "", secondaryContact: "", email: "" },
  sourceOfFunds: createSourceOfFunds(),
  contingentOwner: {
    lastName: "",
    firstName: "",
    middleName: "",
    suffix: "",
    dob: "",
    relationship: "",
  },
  currentInsurance: { provider: "", effectiveDate: "", policyNumber: "" },
  proposedInsured: createProposedInsured(),
  healthDeclaration: createHealthDeclaration(),
  preExistingConditionsAcknowledged: false,
  authorizeInfoSharing: false,

  applicantSignature: "",
  applicantDate: "",

  financialAdvisor: {
    signature: "",
    code: "",
    signedDate: "",
  },

  authorizedRepresentative: {
    name: "",
    relationship: "",
    signature: "",
    date: "",
  },

  policyReceipt: {
    policyNo: "",
    signature: "",
    date: "",
    time: "",
  },

  attestation: {
    clientName: "",
    clientDate: "",
    intermediaryName: "",
    intermediaryDate: "",
  },

  remoteCommunication: {
    applicationNo: "",
    productName: "",
    date: "",
    mode: "",
  },
};

export const ILLNESS_OPTIONS = [
  { key: "a", label: "Cancer or any other oncological diseases" },
  { key: "b", label: "Heart or Blood vessel diseases" },
  { key: "c", label: "Stroke or any other neurological diseases" },
  { key: "d", label: "Rheumatoid Arthritis" },
  {
    key: "e",
    label:
      "Systemic Lupus Erythematous (lupus) or any other autoimmune diseases",
  },
  { key: "f", label: "Psychiatric or psychological illness" },
  { key: "g", label: "Liver diseases" },
  { key: "h", label: "Kidney diseases" },
  { key: "i", label: "Lung or respiratory diseases" },
  { key: "j", label: "Diabetes Mellitus or any other endocrine diseases" },
  { key: "k", label: "Gastrointestinal Tract disorders" },
  { key: "l", label: "Reproductive, gynecological or genital disorders" },
  { key: "m", label: "Anemia or any other blood diseases" },
  { key: "n", label: "Urinary or Prostate conditions" },
  {
    key: "o",
    label: "Glaucoma, cataract or any other eye, ear, nose and throat diseases",
  },
  { key: "p", label: "Muscular and skeletal disorders" },
];

// Helper functions
function createHealthQuestionTemplate() {
  return {
    q1: {
      a: false,
      b: false,
      c: false,
      d: false,
      e: false,
      f: false,
      g: false,
      h: false,
      i: false,
      j: false,
      k: false,
      l: false,
      m: false,
      n: false,
      o: false,
      p: false,
    },
    q2: { a: false, b: false, c: false },
    q3: false,
    q4: false,
    q5: false,
    q6: false,
    additionalInfo: "",
  };
}

function createAddress() {
  return {
    unitBuilding: "",
    lotBlockStreet: "",
    barangaySubdivision: "",
    cityMunicipality: "",
    province: "",
    country: "Philippines",
    zipCode: "",
  };
}

function createWorkInfo() {
  return {
    address: "",
    unitBuilding: "",
    lotBlockStreet: "",
    barangaySubdivision: "",
    cityMunicipality: "",
    province: "",
    country: "Philippines",
    zipCode: "",
    estimatedAnnualIncome: "",
    occupation: "",
    employer: "",
    natureOfBusiness: "",
  };
}

function createSourceOfFunds() {
  return {
    business: false,
    salaryCommission: false,
    donationsContributions: false,
    remittancesAllowancesPension: false,
    investments: false,
    others: false,
  };
}

function createProposedInsured() {
  return {
    sameAsApplicant: true,
    lastName: "",
    firstName: "",
    middleName: "",
    suffix: "",
    placeOfBirth: "",
    nationality: "",
    dob: "",
    gender: "",
    civilStatus: "",
    countryOfResidence: "",
    durationOfStay: "",
    tin: "",
    presentAddress: createAddress(),
    workInformation: {
      estimatedAnnualIncome: "",
      occupation: "",
      employer: "",
      natureOfBusiness: "",
    },
    relationshipToOwner: "",
    currentInsurance: { provider: "", effectiveDate: "", policyNumber: "" },
    // New signature fields for proposed insured
    signature: "",
    signatureDate: "",
  };
}

function createHealthDeclaration() {
  return {
    heightFeet: "",
    heightMeters: "",
    weightKg: "",
    weightLbs: "",
    smokeVape: false,
    smokeQuantity: "",
    alcohol: false,
    alcoholQuantity: "",
    glassesContacts: false,
    eyeGrade: "",
  };
}

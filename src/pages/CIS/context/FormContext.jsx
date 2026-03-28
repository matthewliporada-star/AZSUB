import React, { createContext, useContext, useState } from "react";

const FormContext = createContext();

export const FormProvider = ({ children }) => {
  const [formData, setFormData] = useState({
    personalInformation: {
      fullName: "",
      fatherName: "",
      mobile: "",
      email: "",
      currentAddress: "",
      currentCity: "",
      currentCountry: "",
      currentPostalCode: "",
      currentAddressDuration: "",
      previousAddress: "",
      previousCity: "",
      previousCountry: "",
      previousPostalCode: "",
      previousDates: "",
      secondaryAddress: "",
      secondaryCity: "",
      secondaryCountry: "",
      secondaryPostalCode: "",
      secondaryDates: "",
      permanentAddress: "",
      taxResidency: "",
      tinSsn: "",
      citizenship: "",
      hobbies: "",
      // Note: permanent_city, permanent_country, permanent_zip are not in your form
      // They are separate fields in Supabase but not in your UI
    },

    travelDetails: [
      {
        country: "",
        city: "",
        length_of_stay: "",
        frequency: "",
        date_travel: "",
        reason: "",
      },
      {
        country: "",
        city: "",
        length_of_stay: "",
        frequency: "",
        date_travel: "",
        reason: "",
      },
      {
        country: "",
        city: "",
        length_of_stay: "",
        frequency: "",
        date_travel: "",
        reason: "",
      },
    ],
    habits: {
      smokerStatus: "",
      cigarettesPerDay: "",
      previousSmokingHistory: "",
      alcoholType: "",
      alcoholMeasurement: "",
      alcoholFrequency: "",
    },
    medical: {
      weight: "",
      height: "",
      exercise: "",
      disorders: "",
      medication: "",
      familyPhysician: "",
      physicianAddress: "",
      physicianPhone: "",
      yearsAttended: "",
      lastVisit: "",
    },
    familyMedicalHistory: [
      {
        relationship: "Father",
        name: "",
        age: "",
        medicalHistory: "",
        healthStatus: "",
      },
      {
        relationship: "Mother",
        name: "",
        age: "",
        medicalHistory: "",
        healthStatus: "",
      },
      {
        relationship: "Brother",
        name: "",
        age: "",
        medicalHistory: "",
        healthStatus: "",
      },
      {
        relationship: "Sister",
        name: "",
        age: "",
        medicalHistory: "",
        healthStatus: "",
      },
      {
        relationship: "Brother 1",
        name: "",
        age: "",
        medicalHistory: "",
        healthStatus: "",
      },
      {
        relationship: "Sister 1",
        name: "",
        age: "",
        medicalHistory: "",
        healthStatus: "",
      },
      {
        relationship: "Spouse",
        name: "",
        age: "",
        medicalHistory: "",
        healthStatus: "",
      },
    ],
    insurance: [
      {
        company: "",
        type: "",
        countryYear: "",
        amount: "",
        premium: "",
      },
      {
        company: "",
        type: "",
        countryYear: "",
        amount: "",
        premium: "",
      },
      {
        company: "",
        type: "",
        countryYear: "",
        amount: "",
        premium: "",
      },
    ],
    businessEmployment: {
      businessName: "",
      natureOfBusiness: "",
      occupation: "",
      businessType: "",
      ownership: "",
      businessAddress: "",
      city: "",
      country: "",
      postalCode: "",
      website: "",
      telephone: "",
      incorporationDate: "",
      workExperience: "",
    },
    incomeStatement: {
      frequency: "Monthly",
      selfIncome: "",
      spouseIncome: "",
      jointIncome: "",
      bonusFrequency: "Monthly",
      bonus: "",
      spouseBonus: "",
      jointBonus: "",
      investmentFrequency: "Monthly",
      investmentIncome: "",
      spouseInvestment: "",
      jointInvestment: "",
      interestFrequency: "Monthly",
      interest: "",
      spouseInterest: "",
      jointInterest: "",
      dividendsFrequency: "Monthly",
      dividends: "",
      spouseDividends: "",
      jointDividends: "",
      rentalFrequency: "Monthly",
      rentalIncome: "",
      spouseRental: "",
      jointRental: "",
      otherFrequency: "Monthly",
      otherIncome: "",
      spouseOther: "",
      jointOther: "",
      totalExpenditureFrequency: "Monthly",
      totalExpenditureSelf: "",
      totalExpenditureSpouse: "",
      totalExpenditureJoint: "",
      disposableIncomeFrequency: "Monthly",
      disposableIncomeSelf: "",
      disposableIncomeSpouse: "",
      disposableIncomeJoint: "",
    },

    assetsLiabilities: {
      // Assets with indices (12 assets)
      asset_0_curr: "",
      asset_0_last: "",
      asset_1_curr: "",
      asset_1_last: "",
      asset_2_curr: "",
      asset_2_last: "",
      asset_3_curr: "",
      asset_3_last: "",
      asset_4_curr: "",
      asset_4_last: "",
      asset_5_curr: "",
      asset_5_last: "",
      asset_6_curr: "",
      asset_6_last: "",
      asset_7_curr: "",
      asset_7_last: "",
      asset_8_curr: "",
      asset_8_last: "",
      asset_9_curr: "",
      asset_9_last: "",
      asset_10_curr: "",
      asset_10_last: "",
      asset_11_curr: "",
      asset_11_last: "",

      // Business Names (Asset side only)
      businessName1: "",
      businessName2: "",
      businessOther: "",

      // Liabilities with indices (7 liabilities - ALL NUMERIC)
      liab_0_curr: "", // Personal Loans
      liab_0_last: "",
      liab_1_curr: "", // Margin Account
      liab_1_last: "",
      liab_2_curr: "", // Residential Mortgage(s)
      liab_2_last: "",
      liab_3_curr: "", // Loan Guarantees
      liab_3_last: "",
      liab_4_curr: "", // Investment Property Mortgage(s)
      liab_4_last: "",
      liab_5_curr: "", // Business Loans/security (NUMERIC)
      liab_5_last: "",
      liab_6_curr: "", // Other (Please specify)
      liab_6_last: "",
    },

    propertyDetails: [
      // Personal Properties (4 rows)
      {
        location: "",
        purchaseDate: "",
        purchasePrice: "",
        mortgage: "",
        currentValue: "",
        frequencyVisits: "",
      },
      {
        location: "",
        purchaseDate: "",
        purchasePrice: "",
        mortgage: "",
        currentValue: "",
        frequencyVisits: "",
      },
      {
        location: "",
        purchaseDate: "",
        purchasePrice: "",
        mortgage: "",
        currentValue: "",
        frequencyVisits: "",
      },
      {
        location: "",
        purchaseDate: "",
        purchasePrice: "",
        mortgage: "",
        currentValue: "",
        frequencyVisits: "",
      },
      // Real Estate Properties (4 rows)
      {
        location: "",
        purchaseDate: "",
        purchasePrice: "",
        mortgage: "",
        currentValue: "",
        frequencyVisits: "",
      },
      {
        location: "",
        purchaseDate: "",
        purchasePrice: "",
        mortgage: "",
        currentValue: "",
        frequencyVisits: "",
      },
      {
        location: "",
        purchaseDate: "",
        purchasePrice: "",
        mortgage: "",
        currentValue: "",
        frequencyVisits: "",
      },
      {
        location: "",
        purchaseDate: "",
        purchasePrice: "",
        mortgage: "",
        currentValue: "",
        frequencyVisits: "",
      },
    ],

    bankDetails: {
      bankName: "",
      accountHeld: "",
      address: "",
      iban: "",
      accountNumber: "",
      relationship: "",
      referenceContact: "",
      email: "",
    },

    policyBeneficiary: [
      {
        name: "",
        type: "",
        relationship: "",
        dateOfBirth: "",
        passportNo: "",
        share: "",
      },
      {
        name: "",
        type: "",
        relationship: "",
        dateOfBirth: "",
        passportNo: "",
        share: "",
      },
      {
        name: "",
        type: "",
        relationship: "",
        dateOfBirth: "",
        passportNo: "",
        share: "",
      },
      {
        name: "",
        type: "",
        relationship: "",
        dateOfBirth: "",
        passportNo: "",
        share: "",
      },
    ],

    spouseDetails: {
      name: "",
      relationship: "",
      nationality: "",
      dateOfBirth: "",
      contactNumber: "",
      email: "",
      currentAddress: "",
      countryOfResidence: "",
      city: "",
      country: "",
      postalCode: "",
      permanentAddress: "",
      permanentCity: "",
      permanentCountry: "",
      permanentPostalCode: "",
      smokingStatus: "",
      employmentRole: "",
      companyName: "",
    },

    dependentDetails: [
      {
        name: "",
        relationship: "",
        nationality: "",
        dateOfBirth: "",
      },
      {
        name: "",
        relationship: "",
        nationality: "",
        dateOfBirth: "",
      },
    ],
  });

  const updateFormData = (section, key, value) => {
    setFormData((prev) => {
      // Handle array sections
      if (
        section === "travelDetails" ||
        section === "propertyDetails" ||
        section === "policyBeneficiary" ||
        section === "dependentDetails" ||
        section === "insurance" ||
        section === "familyMedicalHistory"
      ) {
        if (typeof key === "object" && key.index !== undefined && key.field) {
          const newArr = [...prev[section]];
          newArr[key.index][key.field] = value;
          return { ...prev, [section]: newArr };
        } else if (typeof key === "number") {
          // If key is a number, treat it as index and value as the whole object
          const newArr = [...prev[section]];
          newArr[key] = value;
          return { ...prev, [section]: newArr };
        } else {
          // If we're replacing the entire array
          return { ...prev, [section]: value };
        }
      }
      // Handle object sections
      else if (typeof key === "string") {
        return {
          ...prev,
          [section]: { ...prev[section], [key]: value },
        };
      }
      // If we're replacing the entire section
      return {
        ...prev,
        [section]: value,
      };
    });
  };

  const submitForm = async () => {
    console.log("Submitting:", formData);
    return formData;
  };

  return (
    <FormContext.Provider
      value={{ formData, setFormData, updateFormData, submitForm }}
    >
      {children}
    </FormContext.Provider>
  );
};

export const useForm = () => {
  const context = useContext(FormContext);
  if (!context) throw new Error("useForm must be used within FormProvider");
  return context;
};

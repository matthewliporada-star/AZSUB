import React from "react";
import supabase from "../../config/supabaseClient.js";
import "./CIS.css";

// Components
import Header from "./components/Header";
import Notice from "./components/Notice";
import PrintBar from "./components/PrintBar";

// Sections
import PersonalInformation from "./sections/PersonalInformation/PersonalInformation";
import TravelDetails from "./sections/TravelDetails/TravelDetails";
import SmokingAlcohol from "./sections/Habits/SmokingAlcohol";
import MedicalDetails from "./sections/Medical/MedicalDetails";
import Insurance from "./sections/ExistingPending/Insurance";
import BusinessEmployment from "./sections/BusinessEmployment/BusinessEmployment";
import IncomeStatement from "./sections/PersonalIncome/IncomeStatement";
import AssetsLiabilities from "./sections/AssetsLiabilities/AssetsLiabilities";
import PropertyDetails from "./sections/PropertyDetails/PropertyDetails";
import BankDetails from "./sections/BankDetails/BankDetails";
import PolicyBeneficiary from "./sections/PolicyBeneficiary/PolicyBeneficiary";
import SpouseDetails from "./sections/Spouse/SpouseDetails";
import DependentDetails from "./sections/Dependent/DependentDetails";

import { FormProvider, useForm } from "./context/FormContext";
import { PDFDocument } from "pdf-lib";

// 🔥 INNER COMPONENT (safe to use useForm)
function AppContent() {
  const { setFormData } = useForm();

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      const form = pdfDoc.getForm();
      const fields = form.getFields();

      // Create a map of field names to their values
      const extractedData = {};

      fields.forEach((field) => {
        const name = field.getName();
        let value = "";
        try {
          value = field.getText();
        } catch {
          value = "";
        }
        extractedData[name] = value;
      });

      console.log("Extracted PDF Data with Field Names:", extractedData);

      // Helper function to check if a value is a placeholder
      const isPlaceholder = (value) => {
        if (!value || typeof value !== "string") return true;
        // Check if it's exactly a single uppercase letter (G, H, I, J, K, L, M, N, O, P, etc.)
        if (/^[A-Z]$/.test(value)) return true;
        // Check if it's exactly a single lowercase letter
        if (/^[a-z]$/.test(value)) return true;
        // Check for exact "Idunno" match or with numbers
        if (value === "Idunno" || /^Idunno\d*$/.test(value)) return true;
        // Don't filter out valid values that contain numbers or multiple characters
        return false;
      };

      // ========== ADD DEBUG LOGS HERE ==========
      console.log("=== FINAL CHECK BEFORE SETTING FORM DATA ===");
      console.log("Medical extracted values:", {
        weight: extractedData["personal-med_weight"],
        height: extractedData["personal-med_height"],
        exercise: extractedData["personal-med_exercise"],
        disorders: extractedData["personal-med_health-disorder"],
        medication: extractedData["personal-med_medication-take"],
        familyPhysician: extractedData["personal-med_family-physician"],
        physicianAddress: extractedData["personal-med_physician-add"],
        physicianPhone: extractedData["personal-med_tele"],
        yearsAttended: extractedData["personal-med_years-attend"],
        lastVisit: extractedData["personal-med_last-visit"],
      });

      console.log("=== ABOUT TO CALL setFormData ===");
      // ========== END DEBUG LOGS ==========

      // Update form data with correct field mappings
      setFormData((prev) => ({
        ...prev,

        // ==================== PERSONAL INFORMATION ====================
        personalInformation: {
          ...prev.personalInformation,

          // Basic Information
          fullName:
            extractedData["Full_name_of-_Mr /Mrs"] ||
            prev.personalInformation.fullName,
          fatherName:
            extractedData["Father’s_Name"] ||
            prev.personalInformation.fatherName,
          mobile:
            extractedData["Personal_Mobile_No"] ||
            prev.personalInformation.mobile,
          email:
            extractedData["Personal_Email"] || prev.personalInformation.email,

          // Current Residence
          currentAddress:
            extractedData["Personal_Residence_Address"] ||
            prev.personalInformation.currentAddress,
          currentCity:
            extractedData["Personal_Res_City"] ||
            prev.personalInformation.currentCity,
          currentCountry:
            extractedData["personal_res_country"] ||
            prev.personalInformation.currentCountry,
          currentPostalCode:
            extractedData["personal_res_postcode"] ||
            prev.personalInformation.currentPostalCode,
          currentAddressDuration:
            extractedData["personal_Howlongyoulive"] ||
            prev.personalInformation.currentAddressDuration,

          // Previous Residence
          previousAddress:
            extractedData["personal_previous-residence"] ||
            prev.personalInformation.previousAddress,
          previousCity:
            extractedData["personal_previous-city"] ||
            prev.personalInformation.previousCity,
          previousCountry:
            extractedData["personal_previous-country"] ||
            prev.personalInformation.previousCountry,
          previousPostalCode:
            extractedData["personal_previous-postalcode"] ||
            prev.personalInformation.previousPostalCode,
          previousDates:
            extractedData["personal_previous-datereside"] ||
            prev.personalInformation.previousDates,

          // Secondary/Other Residence
          secondaryAddress:
            extractedData["personal_secondary_add"] ||
            prev.personalInformation.secondaryAddress,
          secondaryCity:
            extractedData["personal_secondary-city"] ||
            prev.personalInformation.secondaryCity,
          secondaryCountry:
            extractedData["personal_secondary-country"] ||
            prev.personalInformation.secondaryCountry,
          secondaryPostalCode:
            extractedData["personal_secondary-postalcode"] ||
            prev.personalInformation.secondaryPostalCode,
          secondaryDates:
            extractedData["personal_secondary-datereside"] ||
            prev.personalInformation.secondaryDates,

          // Other Information
          permanentAddress:
            extractedData["personal_permanent-address"] ||
            prev.personalInformation.permanentAddress,
          taxResidency:
            extractedData["personal_tax-residency"] ||
            prev.personalInformation.taxResidency,
          tinSsn:
            extractedData["personal_tin/ssn"] ||
            prev.personalInformation.tinSsn,
          citizenship:
            extractedData["personal_list-country"] ||
            prev.personalInformation.citizenship,
          hobbies:
            extractedData["personal_hobbies"] ||
            prev.personalInformation.hobbies,
        },

        // ==================== TRAVEL DETAILS ====================
        travelDetails: [
          {
            country:
              extractedData["travel_country_1"] ||
              prev.travelDetails[0]?.country ||
              "",
            city:
              extractedData["travel_city_1"] ||
              prev.travelDetails[0]?.city ||
              "",
            length_of_stay:
              extractedData["travel_stay_1"] ||
              prev.travelDetails[0]?.length_of_stay ||
              "",
            frequency:
              extractedData["travel_freq_1"] ||
              prev.travelDetails[0]?.frequency ||
              "",
            date_travel:
              extractedData["travel_date_1"] ||
              prev.travelDetails[0]?.date_travel ||
              "",
            reason:
              extractedData["travel_reason_1"] ||
              prev.travelDetails[0]?.reason ||
              "",
          },
          {
            country:
              extractedData["travel_country_2"] ||
              prev.travelDetails[1]?.country ||
              "",
            city:
              extractedData["travel_city_2"] ||
              prev.travelDetails[1]?.city ||
              "",
            length_of_stay:
              extractedData["travel_stay_2"] ||
              prev.travelDetails[1]?.length_of_stay ||
              "",
            frequency:
              extractedData["travel_freq_2"] ||
              prev.travelDetails[1]?.frequency ||
              "",
            date_travel:
              extractedData["travel_date_2"] ||
              prev.travelDetails[1]?.date_travel ||
              "",
            reason:
              extractedData["travel_reason_2"] ||
              prev.travelDetails[1]?.reason ||
              "",
          },
          {
            country:
              extractedData["travel_country_3"] ||
              prev.travelDetails[2]?.country ||
              "",
            city:
              extractedData["travel_city_3"] ||
              prev.travelDetails[2]?.city ||
              "",
            length_of_stay:
              extractedData["travel_stay_3"] ||
              prev.travelDetails[2]?.length_of_stay ||
              "",
            frequency:
              extractedData["travel_freq_3"] ||
              prev.travelDetails[2]?.frequency ||
              "",
            date_travel:
              extractedData["travel_date_3"] ||
              prev.travelDetails[2]?.date_travel ||
              "",
            reason:
              extractedData["travel_reason_3"] ||
              prev.travelDetails[2]?.reason ||
              "",
          },
        ],

        // ==================== HABITS ====================
        habits: {
          ...prev.habits,
          smokerStatus:
            extractedData["habits_Smoker-Status"] || prev.habits.smokerStatus,
          cigarettesPerDay:
            extractedData["habits_cigar-day"] || prev.habits.cigarettesPerDay,
          previousSmokingHistory:
            extractedData["habits_non-smoker"] ||
            prev.habits.previousSmokingHistory,
          alcoholType:
            extractedData["habits_alcohol-type"] || prev.habits.alcoholType,
          alcoholMeasurement:
            extractedData["habits_alcohol-measurement"] ||
            prev.habits.alcoholMeasurement,
          alcoholFrequency:
            extractedData["habits_alcohol-freq"] ||
            prev.habits.alcoholFrequency,
        },

        // ==================== MEDICAL ====================
        medical: {
          ...prev.medical,
          weight: extractedData["personal-med_weight"] || prev.medical.weight,
          height: extractedData["personal-med_height"] || prev.medical.height,
          exercise:
            extractedData["personal-med_exercise"] || prev.medical.exercise,
          disorders:
            extractedData["personal-med_health-disorder"] ||
            prev.medical.disorders,
          medication:
            extractedData["personal-med_medication-take"] ||
            prev.medical.medication,
          familyPhysician:
            extractedData["personal-med_family-physician"] ||
            prev.medical.familyPhysician,
          physicianAddress:
            extractedData["personal-med_physician-add"] ||
            prev.medical.physicianAddress,
          physicianPhone:
            extractedData["personal-med_tele"] || prev.medical.physicianPhone,
          yearsAttended:
            extractedData["personal-med_years-attend"] ||
            prev.medical.yearsAttended,
          lastVisit:
            extractedData["personal-med_last-visit"] || prev.medical.lastVisit,
        },

        // ==================== FAMILY MEDICAL HISTORY ====================
        familyMedicalHistory: [
          {
            relationship: "Father",
            name:
              extractedData["family-med_father"] ||
              prev.familyMedicalHistory[0]?.name ||
              "",
            age: !isPlaceholder(extractedData["family-med_father-age"])
              ? extractedData["family-med_father-age"]
              : prev.familyMedicalHistory[0]?.age || "",
            medicalHistory: !isPlaceholder(
              extractedData["family-med_history-father"],
            )
              ? extractedData["family-med_history-father"]
              : prev.familyMedicalHistory[0]?.medicalHistory || "",
            healthStatus: !isPlaceholder(
              extractedData["family-current_health-father"],
            )
              ? extractedData["family-current_health-father"]
              : prev.familyMedicalHistory[0]?.healthStatus || "",
          },
          {
            relationship: "Mother",
            name:
              extractedData["family-med_mother"] ||
              prev.familyMedicalHistory[1]?.name ||
              "",
            age: !isPlaceholder(extractedData["family-med_mother-age"])
              ? extractedData["family-med_mother-age"]
              : prev.familyMedicalHistory[1]?.age || "",
            medicalHistory: !isPlaceholder(
              extractedData["family-med_history-mother"],
            )
              ? extractedData["family-med_history-mother"]
              : prev.familyMedicalHistory[1]?.medicalHistory || "",
            healthStatus: !isPlaceholder(
              extractedData["family-current_health-mother"],
            )
              ? extractedData["family-current_health-mother"]
              : prev.familyMedicalHistory[1]?.healthStatus || "",
          },
          {
            relationship: "Brother",
            name:
              extractedData["family-med_brother"] ||
              prev.familyMedicalHistory[2]?.name ||
              "",
            age: !isPlaceholder(extractedData["family-med_brother-age"])
              ? extractedData["family-med_brother-age"]
              : prev.familyMedicalHistory[2]?.age || "",
            medicalHistory: !isPlaceholder(
              extractedData["family-med_history-brother"],
            )
              ? extractedData["family-med_history-brother"]
              : prev.familyMedicalHistory[2]?.medicalHistory || "",
            healthStatus: !isPlaceholder(
              extractedData["family-current_health-brother"],
            )
              ? extractedData["family-current_health-brother"]
              : prev.familyMedicalHistory[2]?.healthStatus || "",
          },
          {
            relationship: "Sister",
            name:
              extractedData["family-med_sister"] ||
              prev.familyMedicalHistory[3]?.name ||
              "",
            age: !isPlaceholder(extractedData["family-med_sister-age"])
              ? extractedData["family-med_sister-age"]
              : prev.familyMedicalHistory[3]?.age || "",
            medicalHistory: !isPlaceholder(
              extractedData["family-med_history-sister"],
            )
              ? extractedData["family-med_history-sister"]
              : prev.familyMedicalHistory[3]?.medicalHistory || "",
            healthStatus: !isPlaceholder(
              extractedData["family-current_health-sister"],
            )
              ? extractedData["family-current_health-sister"]
              : prev.familyMedicalHistory[3]?.healthStatus || "",
          },
          {
            relationship: "Brother 1",
            name:
              extractedData["family-med_brother1"] ||
              prev.familyMedicalHistory[4]?.name ||
              "",
            age: !isPlaceholder(extractedData["family-med_brother1-age"])
              ? extractedData["family-med_brother1-age"]
              : prev.familyMedicalHistory[4]?.age || "",
            medicalHistory: !isPlaceholder(
              extractedData["family-med_history-brother1"],
            )
              ? extractedData["family-med_history-brother1"]
              : prev.familyMedicalHistory[4]?.medicalHistory || "",
            healthStatus: !isPlaceholder(
              extractedData["family-current_health-brother1"],
            )
              ? extractedData["family-current_health-brother1"]
              : prev.familyMedicalHistory[4]?.healthStatus || "",
          },
          {
            relationship: "Sister 1",
            name:
              extractedData["family-med_sister1"] ||
              prev.familyMedicalHistory[5]?.name ||
              "",
            age: !isPlaceholder(extractedData["family-med_sister1-age"])
              ? extractedData["family-med_sister1-age"]
              : prev.familyMedicalHistory[5]?.age || "",
            medicalHistory: !isPlaceholder(
              extractedData["family-med_history-sister1"],
            )
              ? extractedData["family-med_history-sister1"]
              : prev.familyMedicalHistory[5]?.medicalHistory || "",
            healthStatus: !isPlaceholder(
              extractedData["family-current_health-sister1"],
            )
              ? extractedData["family-current_health-sister1"]
              : prev.familyMedicalHistory[5]?.healthStatus || "",
          },
          {
            relationship: "Spouse",
            name:
              extractedData["family-med_spouse"] ||
              prev.familyMedicalHistory[6]?.name ||
              "",
            age: !isPlaceholder(extractedData["family-med_spouse-age"])
              ? extractedData["family-med_spouse-age"]
              : prev.familyMedicalHistory[6]?.age || "",
            medicalHistory: !isPlaceholder(
              extractedData["family-med_history-spouse"],
            )
              ? extractedData["family-med_history-spouse"]
              : prev.familyMedicalHistory[6]?.medicalHistory || "",
            healthStatus: !isPlaceholder(
              extractedData["family-current_health-spouse"],
            )
              ? extractedData["family-current_health-spouse"]
              : prev.familyMedicalHistory[6]?.healthStatus || "",
          },
        ],

        // ==================== INSURANCE ====================
        insurance: [
          {
            company:
              extractedData["existing_name-1"] ||
              prev.insurance?.[0]?.company ||
              "",
            type:
              extractedData["existing_type-1"] ||
              prev.insurance?.[0]?.type ||
              "",
            countryYear:
              extractedData["existing_issue-1"] ||
              prev.insurance?.[0]?.countryYear ||
              "",
            amount:
              extractedData["existing_cover-1"] ||
              prev.insurance?.[0]?.amount ||
              "",
            premium:
              extractedData["existing_premium-1"] ||
              prev.insurance?.[0]?.premium ||
              "",
          },
          {
            company:
              extractedData["existing_name-2"] ||
              prev.insurance?.[1]?.company ||
              "",
            type:
              extractedData["existing_type-2"] ||
              prev.insurance?.[1]?.type ||
              "",
            countryYear:
              extractedData["existing_issue-2"] ||
              prev.insurance?.[1]?.countryYear ||
              "",
            amount:
              extractedData["existing_cover-2"] ||
              prev.insurance?.[1]?.amount ||
              "",
            premium:
              extractedData["existing_premium-2"] ||
              prev.insurance?.[1]?.premium ||
              "",
          },
          {
            company:
              extractedData["existing_name-3"] ||
              prev.insurance?.[2]?.company ||
              "",
            type:
              extractedData["existing_type-3"] ||
              prev.insurance?.[2]?.type ||
              "",
            countryYear:
              extractedData["existing_issue-3"] ||
              prev.insurance?.[2]?.countryYear ||
              "",
            amount:
              extractedData["existing_cover-3"] ||
              prev.insurance?.[2]?.amount ||
              "",
            premium:
              extractedData["existing_premium-3"] ||
              prev.insurance?.[2]?.premium ||
              "",
          },
        ],

        // ==================== BUSINESS EMPLOYMENT ====================
        businessEmployment: {
          ...prev.businessEmployment,
          businessName:
            extractedData["business_employment-name"] ||
            prev.businessEmployment.businessName,
          natureOfBusiness:
            extractedData["business_employment-nature"] ||
            prev.businessEmployment.natureOfBusiness,
          occupation:
            extractedData["business_employment-occupation"] ||
            prev.businessEmployment.occupation,
          businessType:
            extractedData["business_employment-type-business"] ||
            prev.businessEmployment.businessType,
          ownership:
            extractedData["business_employment-percentage"] ||
            prev.businessEmployment.ownership,
          businessAddress:
            extractedData["business_employment-address"] ||
            prev.businessEmployment.businessAddress,
          city:
            extractedData["business_employment-city"] ||
            prev.businessEmployment.city,
          country:
            extractedData["business_employment-country"] ||
            prev.businessEmployment.country,
          postalCode:
            extractedData["business_employment-postalcode"] ||
            prev.businessEmployment.postalCode,
          website:
            extractedData["business_employment-website"] ||
            prev.businessEmployment.website,
          telephone:
            extractedData["business_employment-tele"] ||
            prev.businessEmployment.telephone,
          incorporationDate:
            extractedData["business_employment-date-incor"] ||
            prev.businessEmployment.incorporationDate,
          workExperience:
            extractedData["business_employment-previous-work"] ||
            prev.businessEmployment.workExperience,
        },

        // ==================== INCOME STATEMENT ====================
        incomeStatement: {
          ...prev.incomeStatement,

          // Income/Salary (row 1)
          frequency:
            extractedData["persoIncome-freq1"] ||
            prev.incomeStatement.frequency,
          selfIncome:
            extractedData["persoIncome-self1"] ||
            prev.incomeStatement.selfIncome,
          spouseIncome:
            extractedData["persoIncome-spouse1"] ||
            prev.incomeStatement.spouseIncome,
          jointIncome:
            extractedData["persoIncome-joint1"] ||
            prev.incomeStatement.jointIncome,

          // Bonus (row 2)
          bonusFrequency:
            extractedData["persoIncome-freq2"] ||
            prev.incomeStatement.bonusFrequency,
          bonus:
            extractedData["persoIncome-self2"] || prev.incomeStatement.bonus,
          spouseBonus:
            extractedData["persoIncome-spouse2"] ||
            prev.incomeStatement.spouseBonus,
          jointBonus:
            extractedData["persoIncome-joint2"] ||
            prev.incomeStatement.jointBonus,

          // Investment Income (row 3)
          investmentFrequency:
            extractedData["persoIncome-freq3"] ||
            prev.incomeStatement.investmentFrequency,
          investmentIncome:
            extractedData["persoIncome-self3"] ||
            prev.incomeStatement.investmentIncome,
          spouseInvestment:
            extractedData["persoIncome-spouse3"] ||
            prev.incomeStatement.spouseInvestment,
          jointInvestment:
            extractedData["persoIncome-joint3"] ||
            prev.incomeStatement.jointInvestment,

          // Interest (row 4)
          interestFrequency:
            extractedData["persoIncome-freq4"] ||
            prev.incomeStatement.interestFrequency,
          interest:
            extractedData["persoIncome-self4"] || prev.incomeStatement.interest,
          spouseInterest:
            extractedData["persoIncome-spouse4"] ||
            prev.incomeStatement.spouseInterest,
          jointInterest:
            extractedData["persoIncome-joint4"] ||
            prev.incomeStatement.jointInterest,

          // Dividends (row 5)
          dividendsFrequency:
            extractedData["persoIncome-freq5"] ||
            prev.incomeStatement.dividendsFrequency,
          dividends:
            extractedData["persoIncome-self5"] ||
            prev.incomeStatement.dividends,
          spouseDividends:
            extractedData["persoIncome-spouse5"] ||
            prev.incomeStatement.spouseDividends,
          jointDividends:
            extractedData["persoIncome-joint5"] ||
            prev.incomeStatement.jointDividends,

          // Rental Income (row 6)
          rentalFrequency:
            extractedData["persoIncome-freq6"] ||
            prev.incomeStatement.rentalFrequency,
          rentalIncome:
            extractedData["persoIncome-self6"] ||
            prev.incomeStatement.rentalIncome,
          spouseRental:
            extractedData["persoIncome-spouse6"] ||
            prev.incomeStatement.spouseRental,
          jointRental:
            extractedData["persoIncome-joint6"] ||
            prev.incomeStatement.jointRental,

          // Other Income (row 7)
          otherFrequency:
            extractedData["persoIncome-freq7"] ||
            prev.incomeStatement.otherFrequency,
          otherIncome:
            extractedData["persoIncome-self7"] ||
            prev.incomeStatement.otherIncome,
          spouseOther:
            extractedData["persoIncome-spouse7"] ||
            prev.incomeStatement.spouseOther,
          jointOther:
            extractedData["persoIncome-joint7"] ||
            prev.incomeStatement.jointOther,

          // Total Income (row 8)
          totalIncomeFrequency:
            extractedData["persoIncome-freq8"] ||
            prev.incomeStatement.totalIncomeFrequency,
          totalSelfIncome:
            extractedData["persoIncome-self8"] ||
            prev.incomeStatement.totalSelfIncome,
          totalSpouseIncome:
            extractedData["persoIncome-spouse8"] ||
            prev.incomeStatement.totalSpouseIncome,
          totalJointIncome:
            extractedData["persoIncome-joint8"] ||
            prev.incomeStatement.totalJointIncome,

          // Expenditure
          totalExpenditure:
            extractedData["persoIncome-total-expenditure"] ||
            prev.incomeStatement.totalExpenditure,
          totalExpenditureSelf:
            extractedData["persoIncome-total-expenditure-self"] ||
            prev.incomeStatement.totalExpenditureSelf,
          totalExpenditureSpouse:
            extractedData["persoIncome-total-expenditure-spouse"] ||
            prev.incomeStatement.totalExpenditureSpouse,
          totalExpenditureJoint:
            extractedData["persoIncome-total-expenditure-joint"] ||
            prev.incomeStatement.totalExpenditureJoint,

          // Disposable Income
          disposableIncome:
            extractedData["persoIncome-monthly-disposable"] ||
            prev.incomeStatement.disposableIncome,
          disposableIncomeSelf:
            extractedData["persoIncome-monthly-disposable-self"] ||
            prev.incomeStatement.disposableIncomeSelf,
          disposableIncomeSpouse:
            extractedData["persoIncome-monthly-disposable-spouse"] ||
            prev.incomeStatement.disposableIncomeSpouse,
          disposableIncomeJoint:
            extractedData["persoIncome-monthly-disposable-joint"] ||
            prev.incomeStatement.disposableIncomeJoint,
        },

        // ==================== ASSETS & LIABILITIES ====================
        assetsLiabilities: {
          ...prev.assetsLiabilities,

          // Map 12 assets (ALL NUMERIC)
          asset_0_curr:
            extractedData["assets_liabilities-cash-current"] ||
            prev.assetsLiabilities.asset_0_curr,
          asset_0_last:
            extractedData["assets_liabilities-cash-last"] ||
            prev.assetsLiabilities.asset_0_last,
          asset_1_curr:
            extractedData["assets_liabilities-savings-current"] ||
            prev.assetsLiabilities.asset_1_curr,
          asset_1_last:
            extractedData["assets_liabilities-savings-last"] ||
            prev.assetsLiabilities.asset_1_last,
          asset_2_curr:
            extractedData["assets_liabilities-stocks-current"] ||
            prev.assetsLiabilities.asset_2_curr,
          asset_2_last:
            extractedData["assets_liabilities-stocks-last"] ||
            prev.assetsLiabilities.asset_2_last,
          asset_3_curr:
            extractedData["assets_liabilities-personal-current"] ||
            prev.assetsLiabilities.asset_3_curr,
          asset_3_last:
            extractedData["assets_liabilities-personal-last"] ||
            prev.assetsLiabilities.asset_3_last,
          asset_4_curr:
            extractedData["assets_liabilities-invest-current"] ||
            prev.assetsLiabilities.asset_4_curr,
          asset_4_last:
            extractedData["assets_liabilities-invest-last"] ||
            prev.assetsLiabilities.asset_4_last,
          asset_5_curr:
            extractedData["assets_liabilities-realestate-current"] ||
            prev.assetsLiabilities.asset_5_curr,
          asset_5_last:
            extractedData["assets_liabilities-realestate-last"] ||
            prev.assetsLiabilities.asset_5_last,
          asset_6_curr:
            extractedData["assets_liabilities-otherparental-current"] ||
            prev.assetsLiabilities.asset_6_curr,
          asset_6_last:
            extractedData["assets_liabilities-otherparental-last"] ||
            prev.assetsLiabilities.asset_6_last,
          asset_7_curr:
            extractedData["assets_liabilities-vehicle-current"] ||
            prev.assetsLiabilities.asset_7_curr,
          asset_7_last:
            extractedData["assets_liabilities-vehicle-last"] ||
            prev.assetsLiabilities.asset_7_last,
          asset_8_curr:
            extractedData["assets_liabilities-funds-current"] ||
            prev.assetsLiabilities.asset_8_curr,
          asset_8_last:
            extractedData["assets_liabilities-funds-last"] ||
            prev.assetsLiabilities.asset_8_last,
          asset_9_curr:
            extractedData["assets_liabilities-pension-current"] ||
            prev.assetsLiabilities.asset_9_curr,
          asset_9_last:
            extractedData["assets_liabilities-pension-last"] ||
            prev.assetsLiabilities.asset_9_last,
          asset_10_curr:
            extractedData["assets_liabilities-shareholding-current"] ||
            prev.assetsLiabilities.asset_10_curr,
          asset_10_last:
            extractedData["assets_liabilities-shareholding-last"] ||
            prev.assetsLiabilities.asset_10_last,
          asset_11_curr:
            extractedData["assets_liabilities-netbusiness-current"] ||
            prev.assetsLiabilities.asset_11_curr,
          asset_11_last:
            extractedData["assets_liabilities-netbusiness-last"] ||
            prev.assetsLiabilities.asset_11_last,

          // Asset Side Business Names (Company Name, Share section)
          businessName1:
            extractedData["assets_liabilities-companyname-current1"] ||
            prev.assetsLiabilities.businessName1,
          businessName2:
            extractedData["assets_liabilities-companyname-current2"] ||
            prev.assetsLiabilities.businessName2,
          businessOther:
            extractedData["assets_liabilities-other-current"] ||
            prev.assetsLiabilities.businessOther,

          // Liabilities - ALL 7 ROWS ARE NUMERIC
          liab_0_curr:
            extractedData["assets_liabilities-personalloan-current"] ||
            prev.assetsLiabilities.liab_0_curr, // Personal Loans - 2500
          liab_0_last:
            extractedData["assets_liabilities-personalloan-last"] ||
            prev.assetsLiabilities.liab_0_last,
          liab_1_curr:
            extractedData["assets_liabilities-marginaccount-current"] ||
            prev.assetsLiabilities.liab_1_curr, // Margin Account - 2500
          liab_1_last:
            extractedData["assets_liabilities-marginaccount-last"] ||
            prev.assetsLiabilities.liab_1_last,
          liab_2_curr:
            extractedData["assets_liabilities-residential-current"] ||
            prev.assetsLiabilities.liab_2_curr, // Residential Mortgage - 2500
          liab_2_last:
            extractedData["assets_liabilities-residential-last"] ||
            prev.assetsLiabilities.liab_2_last,
          liab_3_curr:
            extractedData["assets_liabilities-guarantees-current"] ||
            prev.assetsLiabilities.liab_3_curr, // Loan Guarantees - 2500
          liab_3_last:
            extractedData["assets_liabilities-guarantees-last"] ||
            prev.assetsLiabilities.liab_3_last,
          liab_4_curr:
            extractedData["assets_liabilities-investment-current"] ||
            prev.assetsLiabilities.liab_4_curr, // Investment Property Mortgage - 2500
          liab_4_last:
            extractedData["assets_liabilities-investment-last"] ||
            prev.assetsLiabilities.liab_4_last,
          liab_5_curr:
            extractedData["assets_liabilities-security-current"] ||
            prev.assetsLiabilities.liab_5_curr, // Business Loans/security - 2500 (using security-current)
          liab_5_last:
            extractedData["assets_liabilities-security-last"] ||
            prev.assetsLiabilities.liab_5_last,
          liab_6_curr:
            extractedData["assets_liabilities-liabilities-other-current"] ||
            prev.assetsLiabilities.liab_6_curr, // Other - 2500
          liab_6_last:
            extractedData["assets_liabilities-liabilities-other-last"] ||
            prev.assetsLiabilities.liab_6_last,
        },

        // ==================== PROPERTY DETAILS ====================
        propertyDetails: [
          // Personal Property 1 (Row 1)
          {
            location:
              extractedData["propertydetails_country-1"] ||
              prev.propertyDetails[0]?.location ||
              "",
            purchaseDate:
              extractedData["propertydetails_date-1"] ||
              prev.propertyDetails[0]?.purchaseDate ||
              "",
            purchasePrice:
              extractedData["propertydetails_price-1"] ||
              prev.propertyDetails[0]?.purchasePrice ||
              "",
            mortgage:
              extractedData["propertydetails_mortgage-1"] ||
              prev.propertyDetails[0]?.mortgage ||
              "",
            currentValue:
              extractedData["propertydetails_currentvalue-1"] ||
              prev.propertyDetails[0]?.currentValue ||
              "",
            frequencyVisits:
              extractedData["propertydetails_freq-1"] ||
              prev.propertyDetails[0]?.frequencyVisits ||
              "",
          },
          // Personal Property 2 (Row 2)
          {
            location:
              extractedData["propertydetails_country-2"] ||
              prev.propertyDetails[1]?.location ||
              "",
            purchaseDate:
              extractedData["propertydetails_date-2"] ||
              prev.propertyDetails[1]?.purchaseDate ||
              "",
            purchasePrice:
              extractedData["propertydetails_price-2"] ||
              prev.propertyDetails[1]?.purchasePrice ||
              "",
            mortgage:
              extractedData["propertydetails_mortgage-2"] ||
              prev.propertyDetails[1]?.mortgage ||
              "",
            currentValue:
              extractedData["propertydetails_currentvalue-2"] ||
              prev.propertyDetails[1]?.currentValue ||
              "",
            frequencyVisits:
              extractedData["propertydetails_freq-2"] ||
              prev.propertyDetails[1]?.frequencyVisits ||
              "",
          },
          // Personal Property 3 (Row 3)
          {
            location:
              extractedData["propertydetails_country-3"] ||
              prev.propertyDetails[2]?.location ||
              "",
            purchaseDate:
              extractedData["propertydetails_date-3"] ||
              prev.propertyDetails[2]?.purchaseDate ||
              "",
            purchasePrice:
              extractedData["propertydetails_price-3"] ||
              prev.propertyDetails[2]?.purchasePrice ||
              "",
            mortgage:
              extractedData["propertydetails_mortgage-3"] ||
              prev.propertyDetails[2]?.mortgage ||
              "",
            currentValue:
              extractedData["propertydetails_currentvalue-3"] ||
              prev.propertyDetails[2]?.currentValue ||
              "",
            frequencyVisits:
              extractedData["propertydetails_freq-3"] ||
              prev.propertyDetails[2]?.frequencyVisits ||
              "",
          },
          // Personal Property 4 (Row 4)
          {
            location:
              extractedData["propertydetails_country-4"] ||
              prev.propertyDetails[3]?.location ||
              "",
            purchaseDate:
              extractedData["propertydetails_date-4"] ||
              prev.propertyDetails[3]?.purchaseDate ||
              "",
            purchasePrice:
              extractedData["propertydetails_price-4"] ||
              prev.propertyDetails[3]?.purchasePrice ||
              "",
            mortgage:
              extractedData["propertydetails_mortgage-4"] ||
              prev.propertyDetails[3]?.mortgage ||
              "",
            currentValue:
              extractedData["propertydetails_currentvalue-4"] ||
              prev.propertyDetails[3]?.currentValue ||
              "",
            frequencyVisits:
              extractedData["propertydetails_freq-4"] ||
              prev.propertyDetails[3]?.frequencyVisits ||
              "",
          },
          // Real Estate 1 (Row 5)
          {
            location:
              extractedData["propertydetails_country-5"] ||
              prev.propertyDetails[4]?.location ||
              "",
            purchaseDate:
              extractedData["propertydetails_date-5"] ||
              prev.propertyDetails[4]?.purchaseDate ||
              "",
            purchasePrice:
              extractedData["propertydetails_price-5"] ||
              prev.propertyDetails[4]?.purchasePrice ||
              "",
            mortgage:
              extractedData["propertydetails_mortgage-5"] ||
              prev.propertyDetails[4]?.mortgage ||
              "",
            currentValue:
              extractedData["propertydetails_currentvalue-5"] ||
              prev.propertyDetails[4]?.currentValue ||
              "",
            frequencyVisits:
              extractedData["propertydetails_freq-5"] ||
              prev.propertyDetails[4]?.frequencyVisits ||
              "",
          },
          // Real Estate 2 (Row 6)
          {
            location:
              extractedData["propertydetails_country-6"] ||
              prev.propertyDetails[5]?.location ||
              "",
            purchaseDate:
              extractedData["propertydetails_date-6"] ||
              prev.propertyDetails[5]?.purchaseDate ||
              "",
            purchasePrice:
              extractedData["propertydetails_price-6"] ||
              prev.propertyDetails[5]?.purchasePrice ||
              "",
            mortgage:
              extractedData["propertydetails_mortgage-6"] ||
              prev.propertyDetails[5]?.mortgage ||
              "",
            currentValue:
              extractedData["propertydetails_currentvalue-6"] ||
              prev.propertyDetails[5]?.currentValue ||
              "",
            frequencyVisits:
              extractedData["propertydetails_freq-6"] ||
              prev.propertyDetails[5]?.frequencyVisits ||
              "",
          },
          // Real Estate 3 (Row 7)
          {
            location:
              extractedData["propertydetails_country-7"] ||
              prev.propertyDetails[6]?.location ||
              "",
            purchaseDate:
              extractedData["propertydetails_date-7"] ||
              prev.propertyDetails[6]?.purchaseDate ||
              "",
            purchasePrice:
              extractedData["propertydetails_price-7"] ||
              prev.propertyDetails[6]?.purchasePrice ||
              "",
            mortgage:
              extractedData["propertydetails_mortgage-7"] ||
              prev.propertyDetails[6]?.mortgage ||
              "",
            currentValue:
              extractedData["propertydetails_currentvalue-7"] ||
              prev.propertyDetails[6]?.currentValue ||
              "",
            frequencyVisits:
              extractedData["propertydetails_freq-7"] ||
              prev.propertyDetails[6]?.frequencyVisits ||
              "",
          },
          // Real Estate 4 (Row 8)
          {
            location:
              extractedData["propertydetails_country-8"] ||
              prev.propertyDetails[7]?.location ||
              "",
            purchaseDate:
              extractedData["propertydetails_date-8"] ||
              prev.propertyDetails[7]?.purchaseDate ||
              "",
            purchasePrice:
              extractedData["propertydetails_price-8"] ||
              prev.propertyDetails[7]?.purchasePrice ||
              "",
            mortgage:
              extractedData["propertydetails_mortgage-8"] ||
              prev.propertyDetails[7]?.mortgage ||
              "",
            currentValue:
              extractedData["propertydetails_currentvalue-8"] ||
              prev.propertyDetails[7]?.currentValue ||
              "",
            frequencyVisits:
              extractedData["propertydetails_freq-8"] ||
              prev.propertyDetails[7]?.frequencyVisits ||
              "",
          },
        ],

        // ==================== BANK DETAILS ====================
        bankDetails: {
          ...prev.bankDetails,
          bankName:
            extractedData["bankdetails_name"] || prev.bankDetails.bankName,
          accountHeld:
            extractedData["bankdetails_accountheld"] ||
            prev.bankDetails.accountHeld,
          address:
            extractedData["bankdetails_complete_add"] ||
            prev.bankDetails.address,
          iban: extractedData["bankdetails_iban"] || prev.bankDetails.iban,
          accountNumber:
            extractedData["bankdetails_accountnumber"] ||
            prev.bankDetails.accountNumber,
          relationship:
            extractedData["bankdetails_relationship"] ||
            prev.bankDetails.relationship,
          referenceContact:
            extractedData["bankdetails_referencecontact"] ||
            prev.bankDetails.referenceContact,
          email: extractedData["bankdetails_email"] || prev.bankDetails.email,
        },

        // ==================== POLICY BENEFICIARY ====================
        policyBeneficiary: prev.policyBeneficiary.map((beneficiary, index) => ({
          ...beneficiary,
          name:
            extractedData[`policy_beneficiary-name-${index + 1}`] ||
            beneficiary.name,
          type:
            extractedData[`policy_beneficiary-primary-${index + 1}`] ||
            beneficiary.type,
          relationship:
            extractedData[`policy_beneficiary-relationship-${index + 1}`] ||
            beneficiary.relationship,
          dateOfBirth:
            extractedData[`policy_beneficiary-date-${index + 1}`] ||
            beneficiary.dateOfBirth,
          passportNo:
            extractedData[`policy_beneficiary-passport-${index + 1}`] ||
            beneficiary.passportNo,
          share:
            extractedData[`policy_beneficiary-allocate-${index + 1}`] ||
            beneficiary.share,
        })),

        // ==================== SPOUSE DETAILS ====================
        spouseDetails: {
          ...prev.spouseDetails,
          name: extractedData["spouse-name"] || prev.spouseDetails.name,
          relationship:
            extractedData["spouse-relationship"] ||
            prev.spouseDetails.relationship,
          nationality:
            extractedData["spouse-nationality"] ||
            prev.spouseDetails.nationality,
          dateOfBirth:
            extractedData["spouse-birth"] || prev.spouseDetails.dateOfBirth,
          contactNumber:
            extractedData["spouse-contact"] || prev.spouseDetails.contactNumber, // ← ADD THIS LINE
          email: extractedData["spouse-email"] || prev.spouseDetails.email,
          currentAddress:
            extractedData["spouse-current-add"] ||
            prev.spouseDetails.currentAddress,
          countryOfResidence:
            extractedData["spouse-country-residence"] ||
            prev.spouseDetails.countryOfResidence,
          city: extractedData["spouse-city"] || prev.spouseDetails.city,
          country:
            extractedData["spouse-country"] || prev.spouseDetails.country,
          postalCode:
            extractedData["spouse-postalcode"] || prev.spouseDetails.postalCode,
          permanentAddress:
            extractedData["spouse-permanentadd"] ||
            prev.spouseDetails.permanentAddress,
          permanentCity:
            extractedData["spouse-permanentadd-city"] ||
            prev.spouseDetails.permanentCity,
          permanentCountry:
            extractedData["spouse-permanentadd-country"] ||
            prev.spouseDetails.permanentCountry,
          permanentPostalCode:
            extractedData["spouse-permanentadd-postalcode"] ||
            prev.spouseDetails.permanentPostalCode,
          smokingStatus:
            extractedData["spouse-smoking"] || prev.spouseDetails.smokingStatus,
          employmentRole:
            extractedData["spouse-employmentrole"] ||
            prev.spouseDetails.employmentRole,
          companyName:
            extractedData["spouse-employment-company"] ||
            prev.spouseDetails.companyName,
        },

        // ==================== DEPENDENT DETAILS ====================
        dependentDetails: prev.dependentDetails.map((dependent, index) => ({
          ...dependent,
          name: extractedData[`dependent-name-${index + 1}`] || dependent.name,
          relationship:
            extractedData[`dependent-relationship-${index + 1}`] ||
            dependent.relationship,
          nationality:
            extractedData[`dependent-nationality-${index + 1}`] ||
            dependent.nationality,
          dateOfBirth:
            extractedData[`dependent-birth-${index + 1}`] ||
            dependent.dateOfBirth,
        })),
      }));

      console.log("Form data updated successfully with PDF values");
    } catch (error) {
      console.error("Error reading PDF:", error);
    }
  };

  return (
    <div className="page-wrapper">
      <Header />
      <Notice />

      <div style={{ margin: "20px 0", textAlign: "center" }}>
        <label className="upload-btn">
          Upload PDF
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileUpload}
            style={{ display: "none" }}
          />
        </label>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: "60%" }}></div>
      </div>

      <PersonalInformation />
      <TravelDetails />
      <SmokingAlcohol />
      <MedicalDetails />
      <Insurance />
      <BusinessEmployment />
      <IncomeStatement />
      <AssetsLiabilities />
      <PropertyDetails />
      <BankDetails />
      <PolicyBeneficiary />
      <SpouseDetails />
      <DependentDetails />
      <PrintBar />
    </div>
  );
}

// MAIN APP COMPONENT WITH PROPER EXPORT
function App() {
  return (
    <FormProvider>
      <AppContent />
    </FormProvider>
  );
}

// THIS IS THE CRITICAL PART - MAKE SURE THIS IS AT THE VERY END
export default App;

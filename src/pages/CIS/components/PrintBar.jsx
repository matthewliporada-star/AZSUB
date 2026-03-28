import React, { useState } from "react";
import { useForm } from "../context/FormContext";
import supabase from "../../../config/supabaseClient.js";

function PrintBar({ editMode = false, editId = null }) {
  const { formData, setFormData } = useForm();
  const [isSaving, setIsSaving] = useState(false);

  const handleReset = () => {
    if (confirm("Clear all fields and start over?")) {
      // Clear stored PDF URL as well
      localStorage.removeItem("uploaded_pdf_url");
      localStorage.removeItem("uploaded_pdf_path");
      // Clear edit mode flag
      localStorage.removeItem("edit_mode");
      localStorage.removeItem("edit_id");
      window.location.reload();
    }
  };

  const handleSubmit = async () => {
    setIsSaving(true);

    try {
      // 1. AUTH CHECK
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("No user logged in or session expired");
      }

      console.log("User authenticated:", user.id);
      console.log("Edit Mode:", editMode);
      console.log("Edit ID:", editId);

      // 2. GET PDF URL FROM LOCALSTORAGE
      const pdfUrl = localStorage.getItem("uploaded_pdf_url");
      console.log("PDF URL from localStorage:", pdfUrl);

      const personalInfo = formData.personalInformation;
      let profileId;

      if (editMode && editId) {
        // ==================== UPDATE EXISTING RECORD ====================
        console.log("Updating existing record with ID:", editId);

        // Update personal_information
        const { error: updateError } = await supabase
          .from("personal_information")
          .update({
            full_name: personalInfo.fullName || null,
            fathers_name: personalInfo.fatherName || null,
            mobile_no: personalInfo.mobile || null,
            email: personalInfo.email || null,
            residence_address: personalInfo.currentAddress || null,
            residence_city: personalInfo.currentCity || null,
            residence_country: personalInfo.currentCountry || null,
            residence_zip: personalInfo.currentPostalCode || null,
            residence_duration: personalInfo.currentAddressDuration || null,
            prev_residence_complete: personalInfo.previousAddress || null,
            prev_residence_city: personalInfo.previousCity || null,
            prev_residence_country: personalInfo.previousCountry || null,
            prev_residence_zip: personalInfo.previousPostalCode || null,
            prev_residence_dates_resided: personalInfo.previousDates || null,
            secondary_address: personalInfo.secondaryAddress || null,
            secondary_city: personalInfo.secondaryCity || null,
            secondary_country: personalInfo.secondaryCountry || null,
            secondary_zip: personalInfo.secondaryPostalCode || null,
            secondary_dates_resided: personalInfo.secondaryDates || null,
            permanent_address: personalInfo.permanentAddress || null,
            tax_residency: personalInfo.taxResidency || null,
            tin_ssn: personalInfo.tinSsn || null,
            citizenship: personalInfo.citizenship || null,
            hobbies: personalInfo.hobbies || null,
            pdf_url: pdfUrl || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editId);

        if (updateError) throw updateError;
        profileId = editId;
        console.log("✅ Profile updated with ID:", profileId);

        // Delete all related records
        console.log("Deleting related records...");
        await supabase
          .from("travel_details")
          .delete()
          .eq("personal_info_id", profileId);
        await supabase
          .from("smoking_alcohol_habits")
          .delete()
          .eq("personal_info_id", profileId);
        await supabase
          .from("personal_medical_details")
          .delete()
          .eq("personal_info_id", profileId);
        await supabase
          .from("family_medical_history")
          .delete()
          .eq("personal_info_id", profileId);
        await supabase
          .from("existing_pending")
          .delete()
          .eq("personal_info_id", profileId);
        await supabase
          .from("business_employment_info")
          .delete()
          .eq("personal_info_id", profileId);
        await supabase
          .from("income_sources")
          .delete()
          .eq("personal_info_id", profileId);
        await supabase
          .from("financial_summary")
          .delete()
          .eq("personal_info_id", profileId);
        await supabase
          .from("assets_liabilities")
          .delete()
          .eq("personal_info_id", profileId);
        await supabase
          .from("assets_net_worth_summary")
          .delete()
          .eq("personal_info_id", profileId);
        await supabase
          .from("property_details")
          .delete()
          .eq("personal_info_id", profileId);
        await supabase
          .from("bank_details")
          .delete()
          .eq("personal_info_id", profileId);
        await supabase
          .from("policy_beneficiaries")
          .delete()
          .eq("personal_info_id", profileId);
        await supabase
          .from("spouse_details")
          .delete()
          .eq("personal_info_id", profileId);
        await supabase
          .from("dependent_details")
          .delete()
          .eq("personal_info_id", profileId);
      } else {
        // ==================== CREATE NEW RECORD ====================
        const { data: newProfile, error: insertError } = await supabase
          .from("personal_information")
          .insert({
            user_id: user.id,
            full_name: personalInfo.fullName || null,
            fathers_name: personalInfo.fatherName || null,
            mobile_no: personalInfo.mobile || null,
            email: personalInfo.email || null,
            residence_address: personalInfo.currentAddress || null,
            residence_city: personalInfo.currentCity || null,
            residence_country: personalInfo.currentCountry || null,
            residence_zip: personalInfo.currentPostalCode || null,
            residence_duration: personalInfo.currentAddressDuration || null,
            prev_residence_complete: personalInfo.previousAddress || null,
            prev_residence_city: personalInfo.previousCity || null,
            prev_residence_country: personalInfo.previousCountry || null,
            prev_residence_zip: personalInfo.previousPostalCode || null,
            prev_residence_dates_resided: personalInfo.previousDates || null,
            secondary_address: personalInfo.secondaryAddress || null,
            secondary_city: personalInfo.secondaryCity || null,
            secondary_country: personalInfo.secondaryCountry || null,
            secondary_zip: personalInfo.secondaryPostalCode || null,
            secondary_dates_resided: personalInfo.secondaryDates || null,
            permanent_address: personalInfo.permanentAddress || null,
            tax_residency: personalInfo.taxResidency || null,
            tin_ssn: personalInfo.tinSsn || null,
            citizenship: personalInfo.citizenship || null,
            hobbies: personalInfo.hobbies || null,
            pdf_url: pdfUrl || null,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        profileId = newProfile.id;
        console.log("✅ Profile created with ID:", profileId);
      }

      // Clear the stored PDF URL after saving
      localStorage.removeItem("uploaded_pdf_url");
      localStorage.removeItem("uploaded_pdf_path");

      // ==================== TRAVEL DETAILS ====================
      const travelEntries = formData.travelDetails
        .filter((t) => t.country && t.country !== "")
        .map((travel) => ({
          personal_info_id: profileId,
          country: travel.country,
          city: travel.city,
          length_of_stay: travel.length_of_stay,
          frequency: travel.frequency,
          date_of_travel: travel.date_travel,
          reason: travel.reason,
        }));

      if (travelEntries.length > 0) {
        const { error } = await supabase
          .from("travel_details")
          .insert(travelEntries);
        if (error) console.error("❌ TRAVEL ERROR:", error);
        else console.log("✅ Travel details saved:", travelEntries.length);
      }

      // ==================== SMOKING & ALCOHOL HABITS ====================
      const habits = formData.habits;
      const { error: smokingError } = await supabase
        .from("smoking_alcohol_habits")
        .insert({
          personal_info_id: profileId,
          smoker_status: habits.smokerStatus || null,
          cigarettes_per_day: habits.cigarettesPerDay || null,
          previous_smoking_history: habits.previousSmokingHistory || null,
          alcohol_type: habits.alcoholType || null,
          alcohol_measurement: habits.alcoholMeasurement || null,
          alcohol_frequency: habits.alcoholFrequency || null,
        });
      if (smokingError) console.error("❌ SMOKING ERROR:", smokingError);
      else console.log("✅ Habits saved");

      // ==================== PERSONAL MEDICAL DETAILS ====================
      const medical = formData.medical;
      const { error: medicalError } = await supabase
        .from("personal_medical_details")
        .insert({
          personal_info_id: profileId,
          weight: medical.weight || null,
          height: medical.height || null,
          exercise_details: medical.exercise || null,
          health_disorders: medical.disorders || null,
          medications: medical.medication || null,
          physician_name: medical.familyPhysician || null,
          physician_address: medical.physicianAddress || null,
          physician_phone: medical.physicianPhone || null,
          years_attended: medical.yearsAttended || null,
          last_visit_details: medical.lastVisit || null,
        });
      if (medicalError) console.error("❌ MEDICAL ERROR:", medicalError);
      else console.log("✅ Medical details saved");

      // ==================== FAMILY MEDICAL HISTORY ====================
      const familyEntries = formData.familyMedicalHistory
        .filter((member) => member.name && member.name !== "")
        .map((member) => ({
          personal_info_id: profileId,
          relationship: member.relationship,
          full_name: member.name,
          age: member.age || null,
          medical_history: member.medicalHistory || null,
          current_health_status: member.healthStatus || null,
        }));

      if (familyEntries.length > 0) {
        const { error } = await supabase
          .from("family_medical_history")
          .insert(familyEntries);
        if (error) console.error("❌ FAMILY ERROR:", error);
        else console.log("✅ Family medical history saved");
      }

      // ==================== EXISTING/PENDING INSURANCE ====================
      const insuranceEntries = formData.insurance
        .filter((ins) => ins.company && ins.company !== "")
        .map((ins) => ({
          personal_info_id: profileId,
          insurance_company: ins.company,
          insurance_type: ins.type || null,
          country_year_issue: ins.countryYear || null,
          amount_of_cover: ins.amount || null,
          premium: ins.premium || null,
        }));

      if (insuranceEntries.length > 0) {
        const { error } = await supabase
          .from("existing_pending")
          .insert(insuranceEntries);
        if (error) console.error("❌ INSURANCE ERROR:", error);
        else console.log("✅ Insurance saved");
      }

      // ==================== BUSINESS EMPLOYMENT ====================
      const business = formData.businessEmployment;
      const { error: businessError } = await supabase
        .from("business_employment_info")
        .insert({
          personal_info_id: profileId,
          business_name: business.businessName || null,
          business_nature: business.natureOfBusiness || null,
          occupation: business.occupation || null,
          business_type: business.businessType || null,
          ownership_percent: business.ownership || null,
          business_address: business.businessAddress || null,
          business_city: business.city || null,
          business_country: business.country || null,
          business_zip: business.postalCode || null,
          business_website: business.website || null,
          business_phone: business.telephone || null,
          incorporation_date: business.incorporationDate || null,
          previous_experience: business.workExperience || null,
        });
      if (businessError) console.error("❌ BUSINESS ERROR:", businessError);
      else console.log("✅ Business employment saved");

      // ==================== PERSONAL INCOME STATEMENT (Financial Summary) ====================
      const income = formData.incomeStatement;

      let totalSelfIncome = 0;
      let totalSpouseIncome = 0;

      totalSelfIncome += parseFloat(income.selfIncome) || 0;
      totalSelfIncome += parseFloat(income.bonus) || 0;
      totalSelfIncome += parseFloat(income.investmentIncome) || 0;
      totalSelfIncome += parseFloat(income.interest) || 0;
      totalSelfIncome += parseFloat(income.dividends) || 0;
      totalSelfIncome += parseFloat(income.rentalIncome) || 0;
      totalSelfIncome += parseFloat(income.otherIncome) || 0;

      totalSpouseIncome += parseFloat(income.spouseIncome) || 0;
      totalSpouseIncome += parseFloat(income.spouseBonus) || 0;
      totalSpouseIncome += parseFloat(income.spouseInvestment) || 0;
      totalSpouseIncome += parseFloat(income.spouseInterest) || 0;
      totalSpouseIncome += parseFloat(income.spouseDividends) || 0;
      totalSpouseIncome += parseFloat(income.spouseRental) || 0;
      totalSpouseIncome += parseFloat(income.spouseOther) || 0;

      const totalJointIncome = totalSelfIncome + totalSpouseIncome;
      const selfExpenditure = parseFloat(income.totalExpenditureSelf) || 0;
      const spouseExpenditure = parseFloat(income.totalExpenditureSpouse) || 0;
      const totalJointExpenditure = selfExpenditure + spouseExpenditure;
      const disposableSelf = totalSelfIncome - selfExpenditure;
      const disposableSpouse = totalSpouseIncome - spouseExpenditure;
      const disposableJoint = totalJointIncome - totalJointExpenditure;

      const { error: financialError } = await supabase
        .from("financial_summary")
        .insert({
          personal_info_id: profileId,
          expenditure_frequency: income.totalExpenditureFrequency || "Monthly",
          expenditure_self: selfExpenditure,
          expenditure_spouse: spouseExpenditure,
          total_income_self: totalSelfIncome,
          total_income_spouse: totalSpouseIncome,
          total_income_joint: totalJointIncome,
          total_expenditure_joint: totalJointExpenditure,
          disposable_income_self: disposableSelf,
          disposable_income_spouse: disposableSpouse,
          disposable_income_joint: disposableJoint,
        });

      if (financialError)
        console.error("❌ FINANCIAL SUMMARY ERROR:", financialError);
      else console.log("✅ Financial summary saved");

      // ==================== INCOME SOURCES (Detailed) ====================
      const incomeSources = [
        {
          name: "Income / Salary",
          self: income.selfIncome,
          spouse: income.spouseIncome,
          freq: income.frequency,
        },
        {
          name: "Bonus",
          self: income.bonus,
          spouse: income.spouseBonus,
          freq: income.bonusFrequency,
        },
        {
          name: "Investment Income",
          self: income.investmentIncome,
          spouse: income.spouseInvestment,
          freq: income.investmentFrequency,
        },
        {
          name: "Interest",
          self: income.interest,
          spouse: income.spouseInterest,
          freq: income.interestFrequency,
        },
        {
          name: "Dividends",
          self: income.dividends,
          spouse: income.spouseDividends,
          freq: income.dividendsFrequency,
        },
        {
          name: "Rental Income",
          self: income.rentalIncome,
          spouse: income.spouseRental,
          freq: income.rentalFrequency,
        },
        {
          name: "Other Income Source",
          self: income.otherIncome,
          spouse: income.spouseOther,
          freq: income.otherFrequency,
        },
      ];

      const incomeEntries = incomeSources
        .map((source, idx) => ({
          personal_info_id: profileId,
          source_name: source.name,
          source_index: idx,
          frequency: source.freq || "Monthly",
          self_amount: parseFloat(source.self) || 0,
          spouse_amount: parseFloat(source.spouse) || 0,
          joint_amount:
            (parseFloat(source.self) || 0) + (parseFloat(source.spouse) || 0),
        }))
        .filter(
          (entry) => entry.self_amount !== 0 || entry.spouse_amount !== 0,
        );

      if (incomeEntries.length > 0) {
        const { error } = await supabase
          .from("income_sources")
          .insert(incomeEntries);
        if (error) console.error("❌ INCOME SOURCES ERROR:", error);
        else console.log("✅ Income sources saved");
      }

      // ==================== ASSETS & LIABILITIES ====================
      const assetsData = formData.assetsLiabilities;

      const assetCategories = [
        {
          name: "Cash",
          curr: assetsData.asset_0_curr,
          last: assetsData.asset_0_last,
        },
        {
          name: "Savings",
          curr: assetsData.asset_1_curr,
          last: assetsData.asset_1_last,
        },
        {
          name: "Stocks and Bonds",
          curr: assetsData.asset_2_curr,
          last: assetsData.asset_2_last,
        },
        {
          name: "Personal/Residential Property",
          curr: assetsData.asset_3_curr,
          last: assetsData.asset_3_last,
        },
        {
          name: "Investment Property",
          curr: assetsData.asset_4_curr,
          last: assetsData.asset_4_last,
        },
        {
          name: "Real Estate",
          curr: assetsData.asset_5_curr,
          last: assetsData.asset_5_last,
        },
        {
          name: "Other Parental Property",
          curr: assetsData.asset_6_curr,
          last: assetsData.asset_6_last,
        },
        {
          name: "Vehicle",
          curr: assetsData.asset_7_curr,
          last: assetsData.asset_7_last,
        },
        {
          name: "Funds/Unit Trusts",
          curr: assetsData.asset_8_curr,
          last: assetsData.asset_8_last,
        },
        {
          name: "Pensions",
          curr: assetsData.asset_9_curr,
          last: assetsData.asset_9_last,
        },
        {
          name: "Business Shareholding",
          curr: assetsData.asset_10_curr,
          last: assetsData.asset_10_last,
        },
        {
          name: "Net Business Interest",
          curr: assetsData.asset_11_curr,
          last: assetsData.asset_11_last,
        },
      ];

      const liabilityCategories = [
        {
          name: "Personal Loans",
          curr: assetsData.liab_0_curr,
          last: assetsData.liab_0_last,
        },
        {
          name: "Margin Account",
          curr: assetsData.liab_1_curr,
          last: assetsData.liab_1_last,
        },
        {
          name: "Residential Mortgage(s)",
          curr: assetsData.liab_2_curr,
          last: assetsData.liab_2_last,
        },
        {
          name: "Loan Guarantees",
          curr: assetsData.liab_3_curr,
          last: assetsData.liab_3_last,
        },
        {
          name: "Investment Property Mortgage(s)",
          curr: assetsData.liab_4_curr,
          last: assetsData.liab_4_last,
        },
        {
          name: "Business Loans/security",
          curr: assetsData.liab_5_curr,
          last: assetsData.liab_5_last,
        },
        {
          name: "Other (Please specify)",
          curr: assetsData.liab_6_curr,
          last: assetsData.liab_6_last,
        },
      ];

      const allFinancialItems = [];

      assetCategories.forEach((cat, idx) => {
        const currVal = parseFloat(cat.curr) || 0;
        const lastVal = parseFloat(cat.last) || 0;
        if (currVal !== 0 || lastVal !== 0) {
          allFinancialItems.push({
            personal_info_id: profileId,
            item_type: "asset",
            category_name: cat.name,
            item_index: idx,
            current_year_val: currVal,
            last_year_val: lastVal,
            is_other: false,
            other_description: null,
          });
        }
      });

      liabilityCategories.forEach((cat, idx) => {
        const currVal = parseFloat(cat.curr) || 0;
        const lastVal = parseFloat(cat.last) || 0;
        if (currVal !== 0 || lastVal !== 0) {
          allFinancialItems.push({
            personal_info_id: profileId,
            item_type: "liability",
            category_name: cat.name,
            item_index: idx,
            current_year_val: currVal,
            last_year_val: lastVal,
            is_other: false,
            other_description: null,
          });
        }
      });

      const businessNamesList = [];

      if (assetsData.businessName1 && assetsData.businessName1.trim() !== "") {
        businessNamesList.push(assetsData.businessName1.trim());
      }
      if (assetsData.businessName2 && assetsData.businessName2.trim() !== "") {
        if (!businessNamesList.includes(assetsData.businessName2.trim())) {
          businessNamesList.push(assetsData.businessName2.trim());
        }
      }
      if (assetsData.businessOther && assetsData.businessOther.trim() !== "") {
        if (!businessNamesList.includes(assetsData.businessOther.trim())) {
          businessNamesList.push(assetsData.businessOther.trim());
        }
      }

      businessNamesList.forEach((name, idx) => {
        allFinancialItems.push({
          personal_info_id: profileId,
          item_type: "asset",
          category_name: "Company Name, Share",
          item_index: 100 + idx,
          current_year_val: 0,
          last_year_val: 0,
          is_other: true,
          other_description: name,
        });
      });

      if (allFinancialItems.length > 0) {
        const { error } = await supabase
          .from("assets_liabilities")
          .insert(allFinancialItems);
        if (error) console.error("❌ ASSETS ERROR:", error);
        else
          console.log(
            "✅ Assets & Liabilities saved:",
            allFinancialItems.length,
          );
      }

      // ==================== NET WORTH SUMMARY ====================
      let totalAssetsCurr = 0,
        totalAssetsLast = 0;
      let totalLiabilitiesCurr = 0,
        totalLiabilitiesLast = 0;

      assetCategories.forEach((cat) => {
        totalAssetsCurr += parseFloat(cat.curr) || 0;
        totalAssetsLast += parseFloat(cat.last) || 0;
      });

      liabilityCategories.forEach((cat) => {
        totalLiabilitiesCurr += parseFloat(cat.curr) || 0;
        totalLiabilitiesLast += parseFloat(cat.last) || 0;
      });

      const netWorthCurr = totalAssetsCurr - totalLiabilitiesCurr;
      const netWorthLast = totalAssetsLast - totalLiabilitiesLast;

      const { error: networthError } = await supabase
        .from("assets_net_worth_summary")
        .insert({
          personal_info_id: profileId,
          total_assets_curr: totalAssetsCurr,
          total_assets_last: totalAssetsLast,
          total_liabilities_curr: totalLiabilitiesCurr,
          total_liabilities_last: totalLiabilitiesLast,
          net_worth_curr: netWorthCurr,
          net_worth_last: netWorthLast,
        });

      if (networthError) console.error("❌ NET WORTH ERROR:", networthError);
      else console.log("✅ Net worth saved");

      // ==================== PROPERTY DETAILS ====================
      const propertyEntriesData = [];

      for (let index = 0; index < 8; index++) {
        const prop = formData.propertyDetails[index] || {};
        const hasData =
          prop.location ||
          prop.purchaseDate ||
          prop.purchasePrice ||
          prop.mortgage ||
          prop.currentValue ||
          prop.frequencyVisits;

        if (hasData) {
          propertyEntriesData.push({
            personal_info_id: profileId,
            property_category: index < 4 ? "personal" : "real_estate",
            property_index: index,
            location_details: prop.location || "",
            purchase_date: prop.purchaseDate || "",
            purchase_price: parseFloat(prop.purchasePrice) || 0,
            mortgage_amount: parseFloat(prop.mortgage) || 0,
            current_market_value: parseFloat(prop.currentValue) || 0,
            visit_frequency: prop.frequencyVisits || "",
            ownership_percent: null,
          });
        }
      }

      if (propertyEntriesData.length > 0) {
        const { error } = await supabase
          .from("property_details")
          .insert(propertyEntriesData);
        if (error) console.error("❌ PROPERTY ERROR:", error);
        else
          console.log("✅ Property details saved:", propertyEntriesData.length);
      }

      // ==================== BANK DETAILS ====================
      const bank = formData.bankDetails;
      const { error: bankError } = await supabase.from("bank_details").insert({
        personal_info_id: profileId,
        bank_name: bank.bankName || null,
        account_tenure: bank.accountHeld || null,
        bank_address: bank.address || null,
        bank_iban: bank.iban || null,
        bank_account_number: bank.accountNumber || null,
        payor_relationship: bank.relationship || null,
        bank_reference: bank.referenceContact || null,
        bank_email: bank.email || null,
      });
      if (bankError) console.error("❌ BANK ERROR:", bankError);
      else console.log("✅ Bank details saved");

      // ==================== POLICY BENEFICIARIES ====================
      const beneficiaryEntries = formData.policyBeneficiary
        .filter((bene) => bene.name && bene.name !== "")
        .map((bene, index) => ({
          personal_info_id: profileId,
          beneficiary_index: index,
          full_name: bene.name,
          beneficiary_type: bene.type || null,
          relationship_to_insured: bene.relationship || null,
          date_of_birth: bene.dateOfBirth || null,
          passport_number: bene.passportNo || null,
          allocated_share_percent: parseFloat(bene.share) || 0,
        }));

      if (beneficiaryEntries.length > 0) {
        const { error } = await supabase
          .from("policy_beneficiaries")
          .insert(beneficiaryEntries);
        if (error) console.error("❌ BENEFICIARY ERROR:", error);
        else console.log("✅ Beneficiaries saved");
      }

      // ==================== SPOUSE DETAILS ====================
      const spouse = formData.spouseDetails;

      if (spouse.name && spouse.name !== "") {
        const spouseData = {
          personal_info_id: profileId,
          full_name: spouse.name,
          relationship: spouse.relationship || null,
          nationality: spouse.nationality || null,
          date_of_birth: spouse.dateOfBirth || null,
          phone_number: spouse.contactNumber || null,
          email_address: spouse.email || null,
          res_address: spouse.currentAddress || null,
          res_city: spouse.city || null,
          res_country: spouse.country || null,
          res_zip: spouse.postalCode || null,
          res_country_residency: spouse.countryOfResidence || null,
          perm_address: spouse.permanentAddress || null,
          perm_city: spouse.permanentCity || null,
          perm_country: spouse.permanentCountry || null,
          perm_zip: spouse.permanentPostalCode || null,
          smoking_status: spouse.smokingStatus || null,
          job_role: spouse.employmentRole || null,
          company_name: spouse.companyName || null,
        };

        const { error: spouseError } = await supabase
          .from("spouse_details")
          .insert(spouseData);
        if (spouseError) console.error("❌ SPOUSE ERROR:", spouseError);
        else console.log("✅ Spouse details saved successfully!");
      }

      // ==================== DEPENDENT DETAILS ====================
      const dependentEntries = formData.dependentDetails
        .filter((dep) => dep.name && dep.name !== "")
        .map((dep, index) => ({
          personal_info_id: profileId,
          dependent_index: index,
          full_name: dep.name,
          relationship: dep.relationship || null,
          nationality: dep.nationality || null,
          date_of_birth: dep.dateOfBirth || null,
        }));

      if (dependentEntries.length > 0) {
        const { error } = await supabase
          .from("dependent_details")
          .insert(dependentEntries);
        if (error) console.error("❌ DEPENDENT ERROR:", error);
        else console.log("✅ Dependent details saved");
      }

      alert(
        editMode
          ? "✅ Application updated successfully!"
          : "✅ Application submitted successfully!",
      );
      window.location.href = window.location.pathname;
    } catch (err) {
      console.error("MAIN ERROR:", err);
      alert("❌ Error: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="print-bar">
      <div className="print-bar-info">
        <strong>Client Information Sheet</strong> · Complete all sections · All
        amounts in USD
        {isSaving && (
          <span style={{ marginLeft: "10px", color: "#ff9800" }}>
            Saving...
          </span>
        )}
        {editMode && (
          <span
            style={{ marginLeft: "10px", color: "#ff9800", fontWeight: "bold" }}
          >
            ✏️ EDIT MODE
          </span>
        )}
      </div>
      <div className="print-bar-actions">
        <button className="btn-reset" onClick={handleReset} disabled={isSaving}>
          Clear Form
        </button>
        <button
          className="btn-print"
          onClick={handleSubmit}
          disabled={isSaving}
        >
          {isSaving
            ? "Processing..."
            : editMode
              ? "Update Application"
              : "Submit Application"}
        </button>
      </div>
    </div>
  );
}

export default PrintBar;

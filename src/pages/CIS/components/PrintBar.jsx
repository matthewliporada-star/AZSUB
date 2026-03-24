import React, { useState } from "react";
import { useForm } from "../context/FormContext";
import supabase from "../../../config/supabaseClient.js";

function PrintBar() {
  const { formData, setFormData } = useForm();
  const [isSaving, setIsSaving] = useState(false);

  const handleReset = () => {
    if (confirm("Clear all fields and start over?")) {
      // Reset form data to initial state
      setFormData({
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
          { company: "", type: "", countryYear: "", amount: "", premium: "" },
          { company: "", type: "", countryYear: "", amount: "", premium: "" },
          { company: "", type: "", countryYear: "", amount: "", premium: "" },
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
          frequency: "",
          selfIncome: "",
          spouseIncome: "",
          jointIncome: "",
          bonusFrequency: "",
          bonus: "",
          spouseBonus: "",
          jointBonus: "",
          investmentFrequency: "",
          investmentIncome: "",
          spouseInvestment: "",
          jointInvestment: "",
          interestFrequency: "",
          interest: "",
          spouseInterest: "",
          jointInterest: "",
          dividendsFrequency: "",
          dividends: "",
          spouseDividends: "",
          jointDividends: "",
          rentalFrequency: "",
          rentalIncome: "",
          spouseRental: "",
          jointRental: "",
          otherFrequency: "",
          otherIncome: "",
          spouseOther: "",
          jointOther: "",
          totalIncomeFrequency: "",
          totalSelfIncome: "",
          totalSpouseIncome: "",
          totalJointIncome: "",
          totalExpenditure: "",
          totalExpenditureSelf: "",
          totalExpenditureSpouse: "",
          totalExpenditureJoint: "",
          disposableIncome: "",
          disposableIncomeSelf: "",
          disposableIncomeSpouse: "",
          disposableIncomeJoint: "",
        },
        assetsLiabilities: {
          cash: "",
          savings: "",
          stocksBonds: "",
          personalProperty: "",
          investmentProperty: "",
          realEstate: "",
          otherProperty: "",
          vehicle: "",
          funds: "",
          pensions: "",
          businessShareholding: "",
          otherAssets: "",
          totalAssets: "",
          netAssets: "",
          personalLoans: "",
          marginAccount: "",
          residentialMortgage: "",
          loanGuarantees: "",
          investmentMortgage: "",
          businessLoans: "",
          otherLiabilities: "",
          totalNetWorth: "",
        },
        propertyDetails: [
          {
            type: "",
            location: "",
            purchaseDate: "",
            purchasePrice: "",
            mortgage: "",
            currentValue: "",
            frequencyVisits: "",
          },
          {
            type: "",
            location: "",
            purchaseDate: "",
            purchasePrice: "",
            mortgage: "",
            currentValue: "",
            frequencyVisits: "",
          },
          {
            type: "",
            location: "",
            purchaseDate: "",
            purchasePrice: "",
            mortgage: "",
            currentValue: "",
            frequencyVisits: "",
          },
          {
            type: "",
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
          { name: "", relationship: "", nationality: "", dateOfBirth: "" },
          { name: "", relationship: "", nationality: "", dateOfBirth: "" },
          { name: "", relationship: "", nationality: "", dateOfBirth: "" },
        ],
      });
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
      console.log("Form Data to save:", formData);

      // 2. CREATE NEW PERSONAL INFORMATION RECORD
      const personalInfo = formData.personalInformation;

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
          permanent_address: personalInfo.permanentAddress || null,
          permanent_city: personalInfo.permanentCity || null,
          permanent_country: personalInfo.permanentCountry || null,
          permanent_zip: personalInfo.permanentPostalCode || null,
          tax_residency: personalInfo.taxResidency || null,
          tin_ssn: personalInfo.tinSsn || null,
          citizenship: personalInfo.citizenship || null,
          hobbies: personalInfo.hobbies || null,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Insert error:", insertError);
        throw insertError;
      }

      const profileId = newProfile.id;
      console.log("NEW PROFILE CREATED WITH ID:", profileId);

      // 3. TRAVEL DETAILS
      const travelEntries = formData.travelDetails
        .filter((t) => t.country && t.country !== "")
        .map((travel, index) => ({
          personal_info_id: profileId,
          country: travel.country,
          city: travel.city,
          length_of_stay: travel.length_of_stay,
          frequency: travel.frequency,
          date_of_travel: travel.date_travel,
          reason: travel.reason,
          travel_index: index,
        }));

      if (travelEntries.length > 0) {
        const { error } = await supabase
          .from("travel_details")
          .insert(travelEntries);
        if (error) console.error("TRAVEL ERROR:", error);
        else console.log("✅ Travel details saved");
      }

      // 4. SMOKING & ALCOHOL HABITS
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
      if (smokingError) console.error("SMOKING ERROR:", smokingError);
      else console.log("✅ Habits saved");

      // 5. PERSONAL MEDICAL DETAILS
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
      if (medicalError) console.error("MEDICAL ERROR:", medicalError);
      else console.log("✅ Medical details saved");

      // 6. FAMILY MEDICAL HISTORY
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
        if (error) console.error("FAMILY ERROR:", error);
        else console.log("✅ Family medical history saved");
      }

      // 7. EXISTING/PENDING INSURANCE
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
        if (error) console.error("INSURANCE ERROR:", error);
        else console.log("✅ Insurance saved");
      }

      // 8. BUSINESS EMPLOYMENT
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
      if (businessError) console.error("BUSINESS ERROR:", businessError);
      else console.log("✅ Business employment saved");

      // 9. INCOME SOURCES
      const income = formData.incomeStatement;
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
        if (error) console.error("INCOME ERROR:", error);
        else console.log("✅ Income sources saved");
      }

      // 10. ASSETS & LIABILITIES
      const assets = formData.assetsLiabilities;
      const assetCategories = [
        { name: "Cash", curr: assets.cash },
        { name: "Savings", curr: assets.savings },
        { name: "Stocks and Bonds", curr: assets.stocksBonds },
        {
          name: "Personal/Residential Property",
          curr: assets.personalProperty,
        },
        { name: "Investment Property", curr: assets.investmentProperty },
        { name: "Real Estate", curr: assets.realEstate },
        { name: "Other Parental Property", curr: assets.otherProperty },
        { name: "Vehicle", curr: assets.vehicle },
        { name: "Funds/Unit Trusts", curr: assets.funds },
        { name: "Pensions", curr: assets.pensions },
        { name: "Business Shareholding", curr: assets.businessShareholding },
        { name: "Other Assets", curr: assets.otherAssets },
      ];

      const liabilityCategories = [
        { name: "Personal Loans", curr: assets.personalLoans },
        { name: "Margin Account", curr: assets.marginAccount },
        { name: "Residential Mortgage(s)", curr: assets.residentialMortgage },
        { name: "Loan Guarantees", curr: assets.loanGuarantees },
        {
          name: "Investment Property Mortgage(s)",
          curr: assets.investmentMortgage,
        },
        { name: "Business Loans/Security", curr: assets.businessLoans },
        { name: "Other Liabilities", curr: assets.otherLiabilities },
      ];

      const allFinancialItems = [
        ...assetCategories.map((cat, idx) => ({
          personal_info_id: profileId,
          item_type: "asset",
          category_name: cat.name,
          item_index: idx,
          current_year_val: parseFloat(cat.curr) || 0,
          last_year_val: 0,
          is_other: false,
        })),
        ...liabilityCategories.map((cat, idx) => ({
          personal_info_id: profileId,
          item_type: "liability",
          category_name: cat.name,
          item_index: idx,
          current_year_val: parseFloat(cat.curr) || 0,
          last_year_val: 0,
          is_other: false,
        })),
      ].filter((item) => item.current_year_val !== 0);

      if (allFinancialItems.length > 0) {
        const { error } = await supabase
          .from("assets_liabilities")
          .insert(allFinancialItems);
        if (error) console.error("ASSETS ERROR:", error);
        else console.log("✅ Assets & Liabilities saved");
      }

      // 11. NET WORTH SUMMARY
      const totalAssetsCurr = assetCategories.reduce(
        (sum, cat) => sum + (parseFloat(cat.curr) || 0),
        0,
      );
      const totalLiabilitiesCurr = liabilityCategories.reduce(
        (sum, cat) => sum + (parseFloat(cat.curr) || 0),
        0,
      );
      const netWorthCurr = totalAssetsCurr - totalLiabilitiesCurr;

      const { error: networthError } = await supabase
        .from("assets_net_worth_summary")
        .insert({
          personal_info_id: profileId,
          total_assets_curr: totalAssetsCurr,
          total_assets_last: 0,
          total_liabilities_curr: totalLiabilitiesCurr,
          total_liabilities_last: 0,
          net_worth_curr: netWorthCurr,
          net_worth_last: 0,
        });
      if (networthError) console.error("NET WORTH ERROR:", networthError);
      else console.log("✅ Net worth saved");

      // 12. PROPERTY DETAILS
      const propertyEntriesData = formData.propertyDetails
        .filter((prop) => prop.type && prop.type !== "")
        .map((prop, index) => ({
          personal_info_id: profileId,
          property_category: "personal",
          property_index: index,
          property_type: prop.type,
          location_details: prop.location,
          purchase_date: prop.purchaseDate,
          purchase_price: parseFloat(prop.purchasePrice) || 0,
          mortgage_amount: parseFloat(prop.mortgage) || 0,
          current_market_value: parseFloat(prop.currentValue) || 0,
          visit_frequency: prop.frequencyVisits,
        }));

      if (propertyEntriesData.length > 0) {
        const { error } = await supabase
          .from("property_details")
          .insert(propertyEntriesData);
        if (error) console.error("PROPERTY ERROR:", error);
        else console.log("✅ Property details saved");
      }

      // 13. BANK DETAILS
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
      if (bankError) console.error("BANK ERROR:", bankError);
      else console.log("✅ Bank details saved");

      // 14. POLICY BENEFICIARIES
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
        if (error) console.error("BENEFICIARY ERROR:", error);
        else console.log("✅ Beneficiaries saved");
      }

      // 15. SPOUSE DETAILS
      const spouse = formData.spouseDetails;
      if (spouse.name && spouse.name !== "") {
        const { error: spouseError } = await supabase
          .from("spouse_details")
          .insert({
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
          });
        if (spouseError) console.error("SPOUSE ERROR:", spouseError);
        else console.log("✅ Spouse details saved");
      }

      // 16. DEPENDENT DETAILS
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
        if (error) console.error("DEPENDENT ERROR:", error);
        else console.log("✅ Dependent details saved");
      }

      alert("✅ Application submitted successfully!");
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
          {isSaving ? "Processing..." : "Submit Application"}
        </button>
      </div>
    </div>
  );
}

export default PrintBar;

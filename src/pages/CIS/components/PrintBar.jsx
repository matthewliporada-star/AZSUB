import React, { useState } from "react";
import { useForm } from "../context/FormContext";
import supabase from "../../../config/supabaseClient.js";

function PrintBar() {
  const { formData, updateFormData, submitForm } = useForm();
  const [isSaving, setIsSaving] = useState(false);

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

      // 2. CHECK FOR EXISTING PROFILE
      const { data: existingProfile } = await supabase
        .from("personal_information")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      let profileId;

      if (existingProfile) {
        // UPDATE existing profile
        const { data: updatedProfile, error: updateError } = await supabase
          .from("personal_information")
          .update({
            full_name: formData.fullName,
            fathers_name: formData.fathersName,
            mobile_no: formData.mobileNo,
            email: formData.email,
            residence_address: formData.residenceAddress,
            residence_city: formData.residenceCity,
            residence_country: formData.residenceCountry,
            residence_zip: formData.residenceZip,
            residence_duration: formData.residenceDuration,
            permanent_address: formData.permanentAddress,
            permanent_city: formData.permanentCity,
            permanent_country: formData.permanentCountry,
            permanent_zip: formData.permanentZip,
            citizenship: formData.citizenship,
            hobbies: formData.hobbies,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id)
          .select()
          .single();

        if (updateError) throw updateError;
        profileId = updatedProfile.id;
      } else {
        // INSERT new profile
        const { data: newProfile, error: insertError } = await supabase
          .from("personal_information")
          .insert({
            user_id: user.id,
            full_name: formData.fullName,
            fathers_name: formData.fathersName,
            mobile_no: formData.mobileNo,
            email: formData.email,
            residence_address: formData.residenceAddress,
            residence_city: formData.residenceCity,
            residence_country: formData.residenceCountry,
            residence_zip: formData.residenceZip,
            residence_duration: formData.residenceDuration,
            permanent_address: formData.permanentAddress,
            permanent_city: formData.permanentCity,
            permanent_country: formData.permanentCountry,
            permanent_zip: formData.permanentZip,
            citizenship: formData.citizenship,
            hobbies: formData.hobbies,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        profileId = newProfile.id;
      }

      console.log("PROFILE ID:", profileId);
      console.log("FORM DATA:", formData);

      // =========================
      // 🔹 DEPENDENT DETAILS - Delete existing and insert new
      // =========================
      console.log("========== DEPENDENT FORM DATA DEBUG ==========");
      for (let i = 1; i <= 2; i++) {
        console.log(`Dependent ${i}:`, {
          name: formData[`dep_${i}_name`],
          relationship: formData[`dep_${i}_rel`],
          nationality: formData[`dep_${i}_nat`],
          dob: formData[`dep_${i}_dob`],
        });
      }
      console.log("==============================================");

      // First delete existing records
      const { error: deleteDependentsError } = await supabase
        .from("dependent_details")
        .delete()
        .eq("personal_info_id", profileId);

      if (deleteDependentsError) {
        console.error(
          "Error deleting existing dependents:",
          deleteDependentsError,
        );
      } else {
        console.log("Existing dependents deleted successfully");
      }

      // Create dependent entries array (2 dependents from your component)
      const dependentEntries = [];

      for (let i = 1; i <= 2; i++) {
        const name = formData[`dep_${i}_name`];

        // Only include if there's a name
        if (name && name.trim() !== "") {
          const entry = {
            personal_info_id: profileId,
            dependent_index: i,
            full_name: name.trim(),
            relationship: formData[`dep_${i}_rel`] || "",
            nationality: formData[`dep_${i}_nat`] || "",
            date_of_birth: formData[`dep_${i}_dob`] || "",
          };

          console.log(`Dependent ${i} entry to save:`, entry);
          dependentEntries.push(entry);
        } else {
          console.log(`Dependent ${i} skipped - no name provided`);
        }
      }

      console.log(
        "Final dependent entries to save:",
        JSON.stringify(dependentEntries, null, 2),
      );

      if (dependentEntries.length > 0) {
        console.log(
          `Attempting to save ${dependentEntries.length} dependent records...`,
        );

        const { data, error } = await supabase
          .from("dependent_details")
          .insert(dependentEntries)
          .select();

        if (error) {
          console.error("❌ DEPENDENT DETAILS ERROR:", error);
          console.error("Error details:", {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint,
          });
        } else {
          console.log("✅ Dependent details saved successfully:", data);
        }
      } else {
        console.log("⚠️ No dependent details to save");
      }

      // =========================
      // 🔹 SPOUSE DETAILS - Check if exists and update/insert
      // =========================
      console.log("========== SPOUSE FORM DATA DEBUG ==========");
      console.log("Spouse data:", {
        name: formData.spouse_name,
        relationship: formData.spouse_rel,
        nationality: formData.spouse_nat,
        dob: formData.spouse_dob,
        phone: formData.spouse_phone,
        email: formData.spouse_email,
        res_addr: formData.spouse_res_addr,
        res_city: formData.spouse_res_city,
        res_country: formData.spouse_res_country,
        res_zip: formData.spouse_res_zip,
        res_residency: formData.spouse_res_residency,
        perm_addr: formData.spouse_perm_addr,
        perm_city: formData.spouse_perm_city,
        perm_country: formData.spouse_perm_country,
        perm_zip: formData.spouse_perm_zip,
        smoking: formData.spouse_smoking,
        job: formData.spouse_job,
        company: formData.spouse_company,
      });
      console.log("===========================================");

      // Only proceed if there's at least a name
      if (formData.spouse_name && formData.spouse_name.trim() !== "") {
        // Check if spouse record exists
        const { data: existingSpouse } = await supabase
          .from("spouse_details")
          .select("id")
          .eq("personal_info_id", profileId)
          .maybeSingle();

        const spouseData = {
          personal_info_id: profileId,
          full_name: formData.spouse_name.trim(),
          relationship: formData.spouse_rel || "",
          nationality: formData.spouse_nat || "",
          date_of_birth: formData.spouse_dob || "",
          phone_number: formData.spouse_phone || "",
          email_address: formData.spouse_email || "",
          res_address: formData.spouse_res_addr || "",
          res_city: formData.spouse_res_city || "",
          res_country: formData.spouse_res_country || "",
          res_zip: formData.spouse_res_zip || "",
          res_country_residency: formData.spouse_res_residency || "",
          perm_address: formData.spouse_perm_addr || "",
          perm_city: formData.spouse_perm_city || "",
          perm_country: formData.spouse_perm_country || "",
          perm_zip: formData.spouse_perm_zip || "",
          smoking_status: formData.spouse_smoking || "",
          job_role: formData.spouse_job || "",
          company_name: formData.spouse_company || "",
        };

        console.log("Spouse data to save:", spouseData);

        if (existingSpouse) {
          // Update existing record
          const { error: spouseError } = await supabase
            .from("spouse_details")
            .update(spouseData)
            .eq("personal_info_id", profileId);

          if (spouseError) {
            console.error("❌ SPOUSE UPDATE ERROR:", spouseError);
          } else {
            console.log("✅ Spouse details updated successfully");
          }
        } else {
          // Insert new record
          const { error: spouseError } = await supabase
            .from("spouse_details")
            .insert(spouseData);

          if (spouseError) {
            console.error("❌ SPOUSE INSERT ERROR:", spouseError);
          } else {
            console.log("✅ Spouse details inserted successfully");
          }
        }
      } else {
        console.log("⚠️ No spouse name provided - skipping spouse details");
      }

      // =========================
      // 🔹 POLICY BENEFICIARIES - Delete and insert with proper structure
      // =========================
      console.log("Starting policy beneficiaries save...");

      // First, delete existing records
      const { error: deleteError } = await supabase
        .from("policy_beneficiaries")
        .delete()
        .eq("personal_info_id", profileId);

      if (deleteError) {
        console.error("Error deleting existing beneficiaries:", deleteError);
      } else {
        console.log("Existing beneficiaries deleted successfully");
      }

      // Create beneficiary entries array (3 rows from your component)
      const beneficiaryEntries = [];

      for (let i = 0; i < 3; i++) {
        // Get the name - this is the key field
        const name = formData[`bene_${i}_name`];

        console.log(`Processing beneficiary ${i}, name:`, name);

        // Only include if there's a name (seems to be the required field)
        if (name && name.toString().trim() !== "") {
          // Get share value and parse it properly
          let shareValue = 0;
          const rawShare = formData[`bene_${i}_share`];

          if (rawShare) {
            // Remove any % symbol and parse
            const cleanedShare = rawShare.toString().replace("%", "").trim();
            shareValue = parseFloat(cleanedShare) || 0;
          }

          const entry = {
            personal_info_id: profileId,
            beneficiary_index: i,
            full_name: name.toString().trim(),
            beneficiary_type: formData[`bene_${i}_type`] || "",
            relationship_to_insured: formData[`bene_${i}_rel`] || "",
            date_of_birth: formData[`bene_${i}_dob`] || "",
            passport_number: formData[`bene_${i}_passport`] || "",
            allocated_share_percent: shareValue,
          };

          console.log(`Beneficiary ${i} entry to save:`, entry);
          beneficiaryEntries.push(entry);
        } else {
          console.log(`Beneficiary ${i} skipped - no name provided`);
        }
      }

      // Log the final array of entries
      console.log(
        "Final beneficiary entries to save:",
        JSON.stringify(beneficiaryEntries, null, 2),
      );

      if (beneficiaryEntries.length > 0) {
        console.log(
          `Attempting to save ${beneficiaryEntries.length} beneficiary records...`,
        );

        const { data, error } = await supabase
          .from("policy_beneficiaries")
          .insert(beneficiaryEntries)
          .select();

        if (error) {
          console.error("❌ POLICY BENEFICIARIES ERROR:", error);
          console.error("Error details:", {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint,
          });
        } else {
          console.log("✅ Policy beneficiaries saved successfully:", data);
        }
      } else {
        console.log("⚠️ No policy beneficiaries to save - no names provided");
      }

      console.log("Policy beneficiaries section completed");

      // =========================
      // 🔹 DEBUG - Check what beneficiary data is in formData
      // =========================
      console.log("========== BENEFICIARY FORM DATA DEBUG ==========");
      for (let i = 0; i < 3; i++) {
        console.log(`Beneficiary ${i} raw data:`, {
          name: formData[`bene_${i}_name`],
          type: formData[`bene_${i}_type`],
          rel: formData[`bene_${i}_rel`],
          dob: formData[`bene_${i}_dob`],
          passport: formData[`bene_${i}_passport`],
          share: formData[`bene_${i}_share`],
        });
      }
      console.log("================================================");

      // =========================
      // 🔹 INCOME SOURCES - Delete and insert with proper structure
      // =========================
      await supabase
        .from("income_sources")
        .delete()
        .eq("personal_info_id", profileId);

      const incomeSources = [
        "Income / Salary",
        "Bonus",
        "Investment Income",
        "Interest",
        "Dividends",
        "Rental Income",
        "Other Income Source",
      ];

      const incomeEntries = incomeSources
        .map((source, idx) => {
          const selfAmount = parseFloat(formData[`inc_${idx}_self`]) || 0;
          const spouseAmount = parseFloat(formData[`inc_${idx}_spouse`]) || 0;

          // Only include if there's any amount
          if (selfAmount === 0 && spouseAmount === 0) return null;

          return {
            personal_info_id: profileId,
            source_name: source,
            source_index: idx,
            frequency: formData[`inc_${idx}_freq`] || "Monthly",
            self_amount: selfAmount,
            spouse_amount: spouseAmount,
            joint_amount: selfAmount + spouseAmount,
          };
        })
        .filter(Boolean);

      console.log("Income entries to save:", incomeEntries);

      if (incomeEntries.length) {
        const { error } = await supabase
          .from("income_sources")
          .insert(incomeEntries);

        if (error) console.error("INCOME SOURCES ERROR:", error);
      }

      // =========================
      // 🔹 FINANCIAL SUMMARY - Check if exists
      // =========================
      // Calculate totals
      let totalSelfInc = 0;
      let totalSpouseInc = 0;

      incomeSources.forEach((_, idx) => {
        totalSelfInc += parseFloat(formData[`inc_${idx}_self`]) || 0;
        totalSpouseInc += parseFloat(formData[`inc_${idx}_spouse`]) || 0;
      });

      const totalJointInc = totalSelfInc + totalSpouseInc;

      const selfExp = parseFloat(formData.exp_self) || 0;
      const spouseExp = parseFloat(formData.exp_spouse) || 0;
      const totalJointExp = selfExp + spouseExp;

      const disposableSelf = totalSelfInc - selfExp;
      const disposableSpouse = totalSpouseInc - spouseExp;
      const disposableJoint = totalJointInc - totalJointExp;

      const { data: existingFinancial } = await supabase
        .from("financial_summary")
        .select("id")
        .eq("personal_info_id", profileId)
        .maybeSingle();

      const financialData = {
        personal_info_id: profileId,
        expenditure_frequency: formData.exp_freq || "Monthly",
        expenditure_self: selfExp,
        expenditure_spouse: spouseExp,
        total_income_self: totalSelfInc,
        total_income_spouse: totalSpouseInc,
        total_income_joint: totalJointInc,
        total_expenditure_joint: totalJointExp,
        disposable_income_self: disposableSelf,
        disposable_income_spouse: disposableSpouse,
        disposable_income_joint: disposableJoint,
      };

      if (existingFinancial) {
        const { error: financialError } = await supabase
          .from("financial_summary")
          .update(financialData)
          .eq("personal_info_id", profileId);

        if (financialError)
          console.error("FINANCIAL SUMMARY UPDATE ERROR:", financialError);
      } else {
        const { error: financialError } = await supabase
          .from("financial_summary")
          .insert(financialData);

        if (financialError)
          console.error("FINANCIAL SUMMARY INSERT ERROR:", financialError);
      }

      // =========================
      // 🔹 ASSETS & LIABILITIES - Delete and insert with proper structure
      // =========================
      await supabase
        .from("assets_liabilities")
        .delete()
        .eq("personal_info_id", profileId);

      // Define asset categories from your component
      const assetCategories = [
        "Cash",
        "Savings",
        "Stocks and Bonds",
        "Personal/Residential Property",
        "Investment Property",
        "Real Estate",
        "Other Parental Property",
        "Vehicle",
        "Funds/Unit Trusts",
        "Pensions",
        "Business Shareholding",
        "Net Business Interest",
      ];

      // Define liability categories from your component
      const liabilityCategories = [
        "Personal Loans",
        "Margin Account",
        "Residential Mortgage(s)",
        "Loan Guarantees",
        "Investment Property Mortgage(s)",
        "Business Loans/security",
      ];

      // Create asset entries
      const assetEntries = [];

      // Regular assets
      assetCategories.forEach((category, idx) => {
        const currVal = parseFloat(formData[`asset_${idx}_curr`]) || 0;
        const lastVal = parseFloat(formData[`asset_${idx}_last`]) || 0;

        // Only include if there's any value
        if (currVal !== 0 || lastVal !== 0) {
          assetEntries.push({
            personal_info_id: profileId,
            item_type: "asset",
            category_name: category,
            item_index: idx,
            current_year_val: currVal,
            last_year_val: lastVal,
            is_other: false,
          });
        }
      });

      // Handle business interest details
      if (formData.biz_name_1) {
        assetEntries.push({
          personal_info_id: profileId,
          item_type: "asset",
          category_name: "Business Interest",
          item_index: 100,
          other_description: formData.biz_name_1,
          is_other: true,
          current_year_val: 0,
          last_year_val: 0,
        });
      }

      if (formData.biz_name_2) {
        assetEntries.push({
          personal_info_id: profileId,
          item_type: "asset",
          category_name: "Business Interest",
          item_index: 101,
          other_description: formData.biz_name_2,
          is_other: true,
          current_year_val: 0,
          last_year_val: 0,
        });
      }

      if (formData.biz_other) {
        assetEntries.push({
          personal_info_id: profileId,
          item_type: "asset",
          category_name: "Business Interest - Other",
          item_index: 102,
          other_description: formData.biz_other,
          is_other: true,
          current_year_val: 0,
          last_year_val: 0,
        });
      }

      // Create liability entries
      const liabilityEntries = [];

      // Regular liabilities
      liabilityCategories.forEach((category, idx) => {
        const currVal = parseFloat(formData[`liab_${idx}_curr`]) || 0;
        const lastVal = parseFloat(formData[`liab_${idx}_last`]) || 0;

        if (currVal !== 0 || lastVal !== 0) {
          liabilityEntries.push({
            personal_info_id: profileId,
            item_type: "liability",
            category_name: category,
            item_index: idx,
            current_year_val: currVal,
            last_year_val: lastVal,
            is_other: false,
          });
        }
      });

      // Handle other liability
      const otherLiabCurr = parseFloat(formData.liab_other_curr) || 0;
      const otherLiabLast = parseFloat(formData.liab_other_last) || 0;

      if (
        otherLiabCurr !== 0 ||
        otherLiabLast !== 0 ||
        formData.liab_other_desc
      ) {
        liabilityEntries.push({
          personal_info_id: profileId,
          item_type: "liability",
          category_name: "Other Liability",
          item_index: 100,
          current_year_val: otherLiabCurr,
          last_year_val: otherLiabLast,
          is_other: true,
          other_description: formData.liab_other_desc || "Other Liability",
        });
      }

      // Combine all entries
      const allFinancialItems = [...assetEntries, ...liabilityEntries];

      // Log to see what's being saved
      console.log(
        "Assets & Liabilities to save:",
        JSON.stringify(allFinancialItems, null, 2),
      );

      if (allFinancialItems.length > 0) {
        const { data, error } = await supabase
          .from("assets_liabilities")
          .insert(allFinancialItems)
          .select();

        if (error) {
          console.error("ASSETS & LIABILITIES ERROR:", error);
        } else {
          console.log("Assets & Liabilities saved successfully:", data);
        }
      } else {
        console.log("No assets or liabilities to save");
      }

      // =========================
      // 🔹 NET WORTH - Calculate and save
      // =========================

      // Calculate totals
      let totalAssetsCurr = 0;
      let totalAssetsLast = 0;

      assetCategories.forEach((_, idx) => {
        totalAssetsCurr += parseFloat(formData[`asset_${idx}_curr`]) || 0;
        totalAssetsLast += parseFloat(formData[`asset_${idx}_last`]) || 0;
      });

      let totalLiabilitiesCurr = 0;
      let totalLiabilitiesLast = 0;

      liabilityCategories.forEach((_, idx) => {
        totalLiabilitiesCurr += parseFloat(formData[`liab_${idx}_curr`]) || 0;
        totalLiabilitiesLast += parseFloat(formData[`liab_${idx}_last`]) || 0;
      });

      // Add other liability
      totalLiabilitiesCurr += parseFloat(formData.liab_other_curr) || 0;
      totalLiabilitiesLast += parseFloat(formData.liab_other_last) || 0;

      // Calculate net worth
      const netWorthCurr = totalAssetsCurr - totalLiabilitiesCurr;
      const netWorthLast = totalAssetsLast - totalLiabilitiesLast;

      const { data: existingNetWorth } = await supabase
        .from("assets_net_worth_summary")
        .select("id")
        .eq("personal_info_id", profileId)
        .maybeSingle();

      const netWorthData = {
        personal_info_id: profileId,
        total_assets_curr: totalAssetsCurr,
        total_assets_last: totalAssetsLast,
        total_liabilities_curr: totalLiabilitiesCurr,
        total_liabilities_last: totalLiabilitiesLast,
        net_worth_curr: netWorthCurr,
        net_worth_last: netWorthLast,
      };

      if (existingNetWorth) {
        const { error: networthError } = await supabase
          .from("assets_net_worth_summary")
          .update(netWorthData)
          .eq("personal_info_id", profileId);

        if (networthError)
          console.error("NET WORTH UPDATE ERROR:", networthError);
      } else {
        const { error: networthError } = await supabase
          .from("assets_net_worth_summary")
          .insert(netWorthData);

        if (networthError)
          console.error("NET WORTH INSERT ERROR:", networthError);
      }

      // =========================
      // 🔹 TRAVEL DETAILS - Delete and insert
      // =========================
      await supabase
        .from("travel_details")
        .delete()
        .eq("personal_info_id", profileId);

      const travelEntries = [0, 1, 2, 3, 4]
        .map((i) => ({
          personal_info_id: profileId,
          country: formData[`travel_country_${i}`],
          city: formData[`travel_city_${i}`],
          length_of_stay: formData[`travel_stay_${i}`],
          frequency: formData[`travel_freq_${i}`],
          date_of_travel: formData[`travel_date_${i}`],
          reason: formData[`travel_reason_${i}`],
        }))
        .filter((t) => t.country);

      if (travelEntries.length) {
        const { error } = await supabase
          .from("travel_details")
          .insert(travelEntries);

        if (error) console.error("TRAVEL ERROR:", error);
      }

      // =========================
      // 🔹 SMOKING & ALCOHOL - Check if exists
      // =========================
      const { data: existingSmoking } = await supabase
        .from("smoking_alcohol_habits")
        .select("id")
        .eq("personal_info_id", profileId)
        .maybeSingle();

      if (existingSmoking) {
        const { error: smokingError } = await supabase
          .from("smoking_alcohol_habits")
          .update({
            smoker_status: formData.smokerStatus,
            cigarettes_per_day: formData.cigarettesPerDay,
            previous_smoking_history: formData.smokingHistory,
            alcohol_type: formData.alcoholType,
            alcohol_measurement: formData.alcoholMeasurement,
            alcohol_frequency: formData.alcoholFrequency,
          })
          .eq("personal_info_id", profileId);

        if (smokingError) console.error("SMOKING UPDATE ERROR:", smokingError);
      } else {
        const { error: smokingError } = await supabase
          .from("smoking_alcohol_habits")
          .insert({
            personal_info_id: profileId,
            smoker_status: formData.smokerStatus,
            cigarettes_per_day: formData.cigarettesPerDay,
            previous_smoking_history: formData.smokingHistory,
            alcohol_type: formData.alcoholType,
            alcohol_measurement: formData.alcoholMeasurement,
            alcohol_frequency: formData.alcoholFrequency,
          });

        if (smokingError) console.error("SMOKING INSERT ERROR:", smokingError);
      }

      // =========================
      // 🔹 PERSONAL MEDICAL - Check if exists
      // =========================
      const { data: existingMedical } = await supabase
        .from("personal_medical_details")
        .select("id")
        .eq("personal_info_id", profileId)
        .maybeSingle();

      if (existingMedical) {
        const { error: medicalError } = await supabase
          .from("personal_medical_details")
          .update({
            weight: formData.weight,
            height: formData.height,
            exercise_details: formData.exercise_details,
            health_disorders: formData.health_disorders,
            medications: formData.medications,
            physician_name: formData.physician_name,
            physician_address: formData.physician_address,
            physician_phone: formData.physician_phone,
            years_attended: formData.years_attended,
            last_visit_details: formData.last_visit_details,
          })
          .eq("personal_info_id", profileId);

        if (medicalError) console.error("MEDICAL UPDATE ERROR:", medicalError);
      } else {
        const { error: medicalError } = await supabase
          .from("personal_medical_details")
          .insert({
            personal_info_id: profileId,
            weight: formData.weight,
            height: formData.height,
            exercise_details: formData.exercise_details,
            health_disorders: formData.health_disorders,
            medications: formData.medications,
            physician_name: formData.physician_name,
            physician_address: formData.physician_address,
            physician_phone: formData.physician_phone,
            years_attended: formData.years_attended,
            last_visit_details: formData.last_visit_details,
          });

        if (medicalError) console.error("MEDICAL INSERT ERROR:", medicalError);
      }

      // =========================
      // 🔹 FAMILY MEDICAL HISTORY - Delete and insert
      // =========================
      await supabase
        .from("family_medical_history")
        .delete()
        .eq("personal_info_id", profileId);

      const familyMembers = [
        "Father",
        "Mother",
        "Brother",
        "Sister",
        "Brother1",
        "Sister1",
        "Spouse",
      ];

      const familyEntries = familyMembers
        .map((member) => {
          const key = member.replace(/\s+/g, "");
          const name = formData[`family_${key}_name`];

          return name
            ? {
                personal_info_id: profileId,
                relationship: member,
                full_name: name,
                age: formData[`family_${key}_age`],
                medical_history: formData[`family_${key}_history`],
                current_health_status: formData[`family_${key}_status`],
              }
            : null;
        })
        .filter(Boolean);

      if (familyEntries.length) {
        const { error } = await supabase
          .from("family_medical_history")
          .insert(familyEntries);

        if (error) console.error("FAMILY ERROR:", error);
      }

      // =========================
      // 🔹 EXISTING / PENDING INSURANCE - Delete and insert
      // =========================
      await supabase
        .from("existing_pending")
        .delete()
        .eq("personal_info_id", profileId);

      const insuranceEntries = [0, 1, 2]
        .map((i) => {
          const company = formData[`insurance_company_${i}`];
          if (!company) return null;

          return {
            personal_info_id: profileId,
            insurance_company: company,
            insurance_type: formData[`insurance_type_${i}`],
            country_year_issue: formData[`insurance_year_${i}`],
            amount_of_cover: formData[`insurance_cover_${i}`],
            premium: formData[`insurance_premium_${i}`],
          };
        })
        .filter(Boolean);

      if (insuranceEntries.length) {
        const { error } = await supabase
          .from("existing_pending")
          .insert(insuranceEntries);

        if (error) console.error("INSURANCE ERROR:", error);
      }

      // =========================
      // 🔹 BUSINESS EMPLOYMENT - Check if exists
      // =========================
      const { data: existingBusiness } = await supabase
        .from("business_employment_info")
        .select("id")
        .eq("personal_info_id", profileId)
        .maybeSingle();

      if (existingBusiness) {
        const { error: businessError } = await supabase
          .from("business_employment_info")
          .update({
            business_name: formData.businessName,
            business_nature: formData.businessNature,
            occupation: formData.occupation,
            business_type: formData.businessType,
            ownership_percent: formData.ownershipPercent,
            business_address: formData.businessAddress,
            business_city: formData.businessCity,
            business_country: formData.businessCountry,
            business_zip: formData.businessZip,
            business_website: formData.businessWebsite,
            business_phone: formData.businessPhone,
            incorporation_date: formData.incorporationDate,
            previous_experience: formData.previousExperience,
          })
          .eq("personal_info_id", profileId);

        if (businessError)
          console.error("BUSINESS UPDATE ERROR:", businessError);
      } else {
        const { error: businessError } = await supabase
          .from("business_employment_info")
          .insert({
            personal_info_id: profileId,
            business_name: formData.businessName,
            business_nature: formData.businessNature,
            occupation: formData.occupation,
            business_type: formData.businessType,
            ownership_percent: formData.ownershipPercent,
            business_address: formData.businessAddress,
            business_city: formData.businessCity,
            business_country: formData.businessCountry,
            business_zip: formData.businessZip,
            business_website: formData.businessWebsite,
            business_phone: formData.businessPhone,
            incorporation_date: formData.incorporationDate,
            previous_experience: formData.previousExperience,
          });

        if (businessError)
          console.error("BUSINESS INSERT ERROR:", businessError);
      }

      // =========================
      // 🔹 PROPERTY DETAILS - Delete and insert with proper structure
      // =========================
      await supabase
        .from("property_details")
        .delete()
        .eq("personal_info_id", profileId);

      // Create property entries array
      const propertyEntries = [];

      // Personal Properties (2 rows)
      for (let i = 0; i < 2; i++) {
        const propertyType = formData[`prop_personal_${i}_type`];
        // Only include if there's at least some data
        if (
          propertyType ||
          formData[`prop_personal_${i}_location`] ||
          formData[`prop_personal_${i}_date`] ||
          formData[`prop_personal_${i}_price`] ||
          formData[`prop_personal_${i}_mortgage`] ||
          formData[`prop_personal_${i}_value`] ||
          formData[`prop_personal_${i}_visits`]
        ) {
          propertyEntries.push({
            personal_info_id: profileId,
            property_category: "personal",
            property_index: i,
            property_type: formData[`prop_personal_${i}_type`] || "",
            location_details: formData[`prop_personal_${i}_location`] || "",
            purchase_date: formData[`prop_personal_${i}_date`] || "",
            purchase_price:
              parseFloat(formData[`prop_personal_${i}_price`]) || 0,
            mortgage_amount:
              parseFloat(formData[`prop_personal_${i}_mortgage`]) || 0,
            current_market_value:
              parseFloat(formData[`prop_personal_${i}_value`]) || 0,
            visit_frequency: formData[`prop_personal_${i}_visits`] || "",
          });
        }
      }

      // Real Estate Properties (2 rows)
      for (let i = 0; i < 2; i++) {
        const propertyType = formData[`prop_realestate_${i}_type`];
        // Only include if there's at least some data
        if (
          propertyType ||
          formData[`prop_realestate_${i}_location`] ||
          formData[`prop_realestate_${i}_date`] ||
          formData[`prop_realestate_${i}_price`] ||
          formData[`prop_realestate_${i}_mortgage`] ||
          formData[`prop_realestate_${i}_value`] ||
          formData[`prop_realestate_${i}_visits`]
        ) {
          propertyEntries.push({
            personal_info_id: profileId,
            property_category: "realestate",
            property_index: i,
            property_type: formData[`prop_realestate_${i}_type`] || "",
            location_details: formData[`prop_realestate_${i}_location`] || "",
            purchase_date: formData[`prop_realestate_${i}_date`] || "",
            purchase_price:
              parseFloat(formData[`prop_realestate_${i}_price`]) || 0,
            mortgage_amount:
              parseFloat(formData[`prop_realestate_${i}_mortgage`]) || 0,
            current_market_value:
              parseFloat(formData[`prop_realestate_${i}_value`]) || 0,
            visit_frequency: formData[`prop_realestate_${i}_visits`] || "",
          });
        }
      }

      // Log to see what's being saved
      console.log(
        "Property entries to save:",
        JSON.stringify(propertyEntries, null, 2),
      );

      if (propertyEntries.length > 0) {
        const { data, error } = await supabase
          .from("property_details")
          .insert(propertyEntries)
          .select();

        if (error) {
          console.error("PROPERTY DETAILS ERROR:", error);
        } else {
          console.log("Property details saved successfully:", data);
        }
      } else {
        console.log("No property details to save");
      }

      // =========================
      // 🔹 BANK DETAILS - Check if exists
      // =========================
      const { data: existingBank } = await supabase
        .from("bank_details")
        .select("id")
        .eq("personal_info_id", profileId)
        .maybeSingle();

      if (existingBank) {
        const { error: bankError } = await supabase
          .from("bank_details")
          .update({
            bank_name: formData.bankName,
            account_tenure: formData.accountTenure,
            bank_address: formData.bankAddress,
            bank_iban: formData.bankIban,
            bank_account_number: formData.bankAccountNumber,
            payor_relationship: formData.payorRelationship,
            bank_reference: formData.bankReference,
            bank_email: formData.bankEmail,
          })
          .eq("personal_info_id", profileId);

        if (bankError) console.error("BANK UPDATE ERROR:", bankError);
      } else {
        const { error: bankError } = await supabase
          .from("bank_details")
          .insert({
            personal_info_id: profileId,
            bank_name: formData.bankName,
            account_tenure: formData.accountTenure,
            bank_address: formData.bankAddress,
            bank_iban: formData.bankIban,
            bank_account_number: formData.bankAccountNumber,
            payor_relationship: formData.payorRelationship,
            bank_reference: formData.bankReference,
            bank_email: formData.bankEmail,
          });

        if (bankError) console.error("BANK INSERT ERROR:", bankError);
      }

      // Show success message
      alert("✅ Application submitted successfully!");

      // FORCE PAGE TO RELOAD FROM TOP
      // This ensures the page reloads and scrolls to top
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
        <strong>Sync Status:</strong> Ready to Save
      </div>
      <div className="print-bar-actions">
        <button className="btn-reset" onClick={() => window.location.reload()}>
          Clear
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
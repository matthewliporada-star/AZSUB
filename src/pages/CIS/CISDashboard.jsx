import React, { useState, useEffect } from "react";
import {
  Search,
  Users,
  Send,
  Clock,
  XCircle,
  Eye,
  X,
  FileText,
  Archive,
  ChevronDown,
  ChevronUp,
  Edit,
} from "lucide-react";
import supabase from "../../config/supabaseClient.js";
import "./CIS.css";

const CISDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalInquiries: 0,
    pdfsSent: 0,
    totalActive: 0,
    deactivated: 0,
  });
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showFullReviewModal, setShowFullReviewModal] = useState(false);
  const [inquiryDetails, setInquiryDetails] = useState(null);
  const [fullReviewData, setFullReviewData] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    business: true,
    income: true,
    assets: true,
    property: true,
  });

  // Get user role function
  const getUserRole = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: userData, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching user role:", error);
        return null;
      }

      return userData?.role?.toLowerCase() || null;
    } catch (error) {
      console.error("Error getting user role:", error);
      return null;
    }
  };

  useEffect(() => {
    fetchInquiries();
    fetchStats();
  }, []);

  const fetchInquiries = async () => {
    setLoading(true);
    setError(null);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.log("No user logged in");
        setInquiries([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("personal_information")
        .select("id, full_name, created_at, email, mobile_no")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        setInquiries([]);
        setLoading(false);
        return;
      }

      const formattedData = data.map((item) => ({
        id: item.id,
        fullname: item.full_name || "N/A",
        email: item.email || "N/A",
        mobile: item.mobile_no || "N/A",
        date: new Date(item.created_at).toLocaleDateString(),
      }));

      setInquiries(formattedData);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setStats({
          totalInquiries: 0,
          pdfsSent: 0,
          totalActive: 0,
          deactivated: 0,
        });
        return;
      }

      const { count: totalCount } = await supabase
        .from("personal_information")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: monthCount } = await supabase
        .from("personal_information")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", startOfMonth.toISOString());

      // Calculate active and deactivated accounts
      // You'll need to add a 'status' field to your personal_information table
      // or determine based on some other logic
      const { count: activeCount } = await supabase
        .from("personal_information")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "active"); // Assuming you have a status column

      const { count: deactivatedCount } = await supabase
        .from("personal_information")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "deactivated"); // Assuming you have a status column

      setStats({
        totalInquiries: totalCount || 0,
        pdfsSent: monthCount || 0,
        totalActive: activeCount || 0,
        deactivated: deactivatedCount || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // View inquiry details (summary view)
  const handleViewInquiry = async (inquiry) => {
    setSelectedInquiry(inquiry);
    setShowModal(true);
    setInquiryDetails(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: personalData, error: personalError } = await supabase
        .from("personal_information")
        .select("*")
        .eq("id", inquiry.id)
        .eq("user_id", user.id)
        .single();

      if (personalError || !personalData) {
        console.error("Unauthorized or not found");
        alert("You don't have permission to view this inquiry");
        setShowModal(false);
        return;
      }

      const { data: businessData } = await supabase
        .from("business_employment_info")
        .select("*")
        .eq("personal_info_id", inquiry.id)
        .maybeSingle();

      const { data: assetsData } = await supabase
        .from("assets_liabilities")
        .select("*")
        .eq("personal_info_id", inquiry.id);

      setInquiryDetails({
        personal: personalData,
        business: businessData,
        assets: assetsData || [],
      });
    } catch (error) {
      console.error("Error fetching inquiry details:", error);
    }
  };

  // FULL REVIEW - Fetch ALL data from Supabase
  const handleFullReview = async (inquiry) => {
    setSelectedInquiry(inquiry);
    setShowFullReviewModal(true);
    setFullReviewData(null);

    try {
      console.log("Fetching full review data for inquiry ID:", inquiry.id);

      const [
        personalResult,
        travelResult,
        habitsResult,
        medicalResult,
        familyMedicalResult,
        insuranceResult,
        businessResult,
        incomeSourcesResult,
        financialResult,
        assetsResult,
        netWorthResult,
        propertyResult,
        bankResult,
        beneficiaryResult,
        spouseResult,
        dependentResult,
      ] = await Promise.all([
        supabase
          .from("personal_information")
          .select("*")
          .eq("id", inquiry.id)
          .single(),
        supabase
          .from("travel_details")
          .select("*")
          .eq("personal_info_id", inquiry.id),
        supabase
          .from("smoking_alcohol_habits")
          .select("*")
          .eq("personal_info_id", inquiry.id),
        supabase
          .from("personal_medical_details")
          .select("*")
          .eq("personal_info_id", inquiry.id),
        supabase
          .from("family_medical_history")
          .select("*")
          .eq("personal_info_id", inquiry.id),
        supabase
          .from("existing_pending")
          .select("*")
          .eq("personal_info_id", inquiry.id),
        supabase
          .from("business_employment_info")
          .select("*")
          .eq("personal_info_id", inquiry.id),
        supabase
          .from("income_sources")
          .select("*")
          .eq("personal_info_id", inquiry.id),
        supabase
          .from("financial_summary")
          .select("*")
          .eq("personal_info_id", inquiry.id),
        supabase
          .from("assets_liabilities")
          .select("*")
          .eq("personal_info_id", inquiry.id),
        supabase
          .from("assets_net_worth_summary")
          .select("*")
          .eq("personal_info_id", inquiry.id),
        supabase
          .from("property_details")
          .select("*")
          .eq("personal_info_id", inquiry.id),
        supabase
          .from("bank_details")
          .select("*")
          .eq("personal_info_id", inquiry.id),
        supabase
          .from("policy_beneficiaries")
          .select("*")
          .eq("personal_info_id", inquiry.id),
        supabase
          .from("spouse_details")
          .select("*")
          .eq("personal_info_id", inquiry.id),
        supabase
          .from("dependent_details")
          .select("*")
          .eq("personal_info_id", inquiry.id),
      ]);

      if (personalResult.error)
        console.error("Personal error:", personalResult.error);
      if (travelResult.error)
        console.error("Travel error:", travelResult.error);
      if (habitsResult.error)
        console.error("Habits error:", habitsResult.error);
      if (medicalResult.error)
        console.error("Medical error:", medicalResult.error);
      if (familyMedicalResult.error)
        console.error("Family Medical error:", familyMedicalResult.error);
      if (insuranceResult.error)
        console.error("Insurance error:", insuranceResult.error);
      if (businessResult.error)
        console.error("Business error:", businessResult.error);
      if (incomeSourcesResult.error)
        console.error("Income Sources error:", incomeSourcesResult.error);
      if (financialResult.error)
        console.error("Financial error:", financialResult.error);
      if (assetsResult.error)
        console.error("Assets error:", assetsResult.error);
      if (netWorthResult.error)
        console.error("Net Worth error:", netWorthResult.error);
      if (propertyResult.error)
        console.error("Property error:", propertyResult.error);
      if (bankResult.error) console.error("Bank error:", bankResult.error);
      if (beneficiaryResult.error)
        console.error("Beneficiary error:", beneficiaryResult.error);
      if (spouseResult.error)
        console.error("Spouse error:", spouseResult.error);
      if (dependentResult.error)
        console.error("Dependent error:", dependentResult.error);

      setFullReviewData({
        personal: personalResult.data || null,
        travel: travelResult.data || [],
        habits: habitsResult.data?.[0] || null,
        medical: medicalResult.data?.[0] || null,
        familyMedical: familyMedicalResult.data || [],
        insurance: insuranceResult.data || [],
        business: businessResult.data?.[0] || null,
        incomeSources: incomeSourcesResult.data || [],
        financial: financialResult.data?.[0] || null,
        assets: assetsResult.data || [],
        netWorth: netWorthResult.data?.[0] || null,
        property: propertyResult.data || [],
        bank: bankResult.data?.[0] || null,
        beneficiary: beneficiaryResult.data || [],
        spouse: spouseResult.data?.[0] || null,
        dependent: dependentResult.data || [],
      });

      console.log("Full review data loaded successfully");
    } catch (error) {
      console.error("Error fetching full review data:", error);
      alert("Error loading full review data: " + error.message);
    }
  };

  // Handle Edit - Load all data and redirect to CIS form with edit mode
  // Handle Edit - Load all data and redirect to CIS form with edit mode
  const handleEdit = async (inquiry) => {
    try {
      console.log("Preparing edit data for inquiry ID:", inquiry.id);

      const userRole = await getUserRole();
      let basePath = "/";
      if (userRole === "mp") basePath = "/mp/cis";
      else if (userRole === "al") basePath = "/al/cis";
      else if (userRole === "md") basePath = "/md/cis";
      else if (userRole === "ap") basePath = "/ap/cis";
      else basePath = "/mp/cis";

      // Fetch all related data for the inquiry
      const [
        personalResult,
        travelResult,
        habitsResult,
        medicalResult,
        familyMedicalResult,
        insuranceResult,
        businessResult,
        incomeSourcesResult,
        financialResult,
        assetsResult,
        propertyResult,
        bankResult,
        beneficiaryResult,
        spouseResult,
        dependentResult,
      ] = await Promise.all([
        supabase
          .from("personal_information")
          .select("*")
          .eq("id", inquiry.id)
          .single(),
        supabase
          .from("travel_details")
          .select("*")
          .eq("personal_info_id", inquiry.id),
        supabase
          .from("smoking_alcohol_habits")
          .select("*")
          .eq("personal_info_id", inquiry.id),
        supabase
          .from("personal_medical_details")
          .select("*")
          .eq("personal_info_id", inquiry.id),
        supabase
          .from("family_medical_history")
          .select("*")
          .eq("personal_info_id", inquiry.id),
        supabase
          .from("existing_pending")
          .select("*")
          .eq("personal_info_id", inquiry.id),
        supabase
          .from("business_employment_info")
          .select("*")
          .eq("personal_info_id", inquiry.id),
        supabase
          .from("income_sources")
          .select("*")
          .eq("personal_info_id", inquiry.id),
        supabase
          .from("financial_summary")
          .select("*")
          .eq("personal_info_id", inquiry.id),
        supabase
          .from("assets_liabilities")
          .select("*")
          .eq("personal_info_id", inquiry.id),
        supabase
          .from("property_details")
          .select("*")
          .eq("personal_info_id", inquiry.id),
        supabase
          .from("bank_details")
          .select("*")
          .eq("personal_info_id", inquiry.id),
        supabase
          .from("policy_beneficiaries")
          .select("*")
          .eq("personal_info_id", inquiry.id),
        supabase
          .from("spouse_details")
          .select("*")
          .eq("personal_info_id", inquiry.id),
        supabase
          .from("dependent_details")
          .select("*")
          .eq("personal_info_id", inquiry.id),
      ]);

      // DEBUG: Log assets result
      console.log("Assets result from Supabase:", assetsResult.data);

      // Helper function to get asset value by category name and type
      const getAssetValue = (categoryName, field = "current_year_val") => {
        const item = assetsResult.data?.find(
          (a) =>
            a.category_name === categoryName &&
            a.item_type === "asset" &&
            !a.is_other,
        );
        const value = item ? item[field] : 0;
        return value !== null && value !== undefined ? value.toString() : "";
      };

      const getAssetLastValue = (categoryName) =>
        getAssetValue(categoryName, "last_year_val");

      const getLiabilityValue = (categoryName, field = "current_year_val") => {
        const item = assetsResult.data?.find(
          (a) =>
            a.category_name === categoryName && a.item_type === "liability",
        );
        const value = item ? item[field] : 0;
        return value !== null && value !== undefined ? value.toString() : "";
      };

      const getLiabilityLastValue = (categoryName) =>
        getLiabilityValue(categoryName, "last_year_val");

      // Get business names (is_other = true items)
      const businessItems =
        assetsResult.data?.filter((a) => a.is_other === true) || [];
      const businessName1 =
        businessItems.find((b) => b.item_index === 100)?.other_description ||
        "";
      const businessName2 =
        businessItems.find((b) => b.item_index === 101)?.other_description ||
        "";
      const businessOther =
        businessItems.find((b) => b.item_index === 102)?.other_description ||
        "";

      // Format the data to match the FormContext structure
      const editFormData = {
        personalInformation: {
          fullName: personalResult.data?.full_name || "",
          fatherName: personalResult.data?.fathers_name || "",
          mobile: personalResult.data?.mobile_no || "",
          email: personalResult.data?.email || "",
          currentAddress: personalResult.data?.residence_address || "",
          currentCity: personalResult.data?.residence_city || "",
          currentCountry: personalResult.data?.residence_country || "",
          currentPostalCode: personalResult.data?.residence_zip || "",
          currentAddressDuration: personalResult.data?.residence_duration || "",
          previousAddress: personalResult.data?.prev_residence_complete || "",
          previousCity: personalResult.data?.prev_residence_city || "",
          previousCountry: personalResult.data?.prev_residence_country || "",
          previousPostalCode: personalResult.data?.prev_residence_zip || "",
          previousDates:
            personalResult.data?.prev_residence_dates_resided || "",
          secondaryAddress: personalResult.data?.secondary_address || "",
          secondaryCity: personalResult.data?.secondary_city || "",
          secondaryCountry: personalResult.data?.secondary_country || "",
          secondaryPostalCode: personalResult.data?.secondary_zip || "",
          secondaryDates: personalResult.data?.secondary_dates_resided || "",
          permanentAddress: personalResult.data?.permanent_address || "",
          taxResidency: personalResult.data?.tax_residency || "",
          tinSsn: personalResult.data?.tin_ssn || "",
          citizenship: personalResult.data?.citizenship || "",
          hobbies: personalResult.data?.hobbies || "",
        },

        travelDetails:
          travelResult.data && travelResult.data.length > 0
            ? travelResult.data.map((travel) => ({
                country: travel.country || "",
                city: travel.city || "",
                length_of_stay: travel.length_of_stay || "",
                frequency: travel.frequency || "",
                date_travel: travel.date_of_travel || "",
                reason: travel.reason || "",
              }))
            : [
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
          smokerStatus: habitsResult.data?.[0]?.smoker_status || "",
          cigarettesPerDay: habitsResult.data?.[0]?.cigarettes_per_day || "",
          previousSmokingHistory:
            habitsResult.data?.[0]?.previous_smoking_history || "",
          alcoholType: habitsResult.data?.[0]?.alcohol_type || "",
          alcoholMeasurement: habitsResult.data?.[0]?.alcohol_measurement || "",
          alcoholFrequency: habitsResult.data?.[0]?.alcohol_frequency || "",
        },

        medical: {
          weight: medicalResult.data?.[0]?.weight || "",
          height: medicalResult.data?.[0]?.height || "",
          exercise: medicalResult.data?.[0]?.exercise_details || "",
          disorders: medicalResult.data?.[0]?.health_disorders || "",
          medication: medicalResult.data?.[0]?.medications || "",
          familyPhysician: medicalResult.data?.[0]?.physician_name || "",
          physicianAddress: medicalResult.data?.[0]?.physician_address || "",
          physicianPhone: medicalResult.data?.[0]?.physician_phone || "",
          yearsAttended: medicalResult.data?.[0]?.years_attended || "",
          lastVisit: medicalResult.data?.[0]?.last_visit_details || "",
        },

        familyMedicalHistory:
          familyMedicalResult.data && familyMedicalResult.data.length > 0
            ? familyMedicalResult.data.map((member) => ({
                relationship: member.relationship || "",
                name: member.full_name || "",
                age: member.age || "",
                medicalHistory: member.medical_history || "",
                healthStatus: member.current_health_status || "",
              }))
            : [],

        insurance:
          insuranceResult.data && insuranceResult.data.length > 0
            ? insuranceResult.data.map((ins) => ({
                company: ins.insurance_company || "",
                type: ins.insurance_type || "",
                countryYear: ins.country_year_issue || "",
                amount: ins.amount_of_cover || "",
                premium: ins.premium || "",
              }))
            : [],

        businessEmployment: {
          businessName: businessResult.data?.[0]?.business_name || "",
          natureOfBusiness: businessResult.data?.[0]?.business_nature || "",
          occupation: businessResult.data?.[0]?.occupation || "",
          businessType: businessResult.data?.[0]?.business_type || "",
          ownership: businessResult.data?.[0]?.ownership_percent || "",
          businessAddress: businessResult.data?.[0]?.business_address || "",
          city: businessResult.data?.[0]?.business_city || "",
          country: businessResult.data?.[0]?.business_country || "",
          postalCode: businessResult.data?.[0]?.business_zip || "",
          website: businessResult.data?.[0]?.business_website || "",
          telephone: businessResult.data?.[0]?.business_phone || "",
          incorporationDate: businessResult.data?.[0]?.incorporation_date || "",
          workExperience: businessResult.data?.[0]?.previous_experience || "",
        },

        incomeStatement: {
          frequency:
            incomeSourcesResult.data?.find(
              (s) => s.source_name === "Income / Salary",
            )?.frequency || "Monthly",
          selfIncome:
            incomeSourcesResult.data
              ?.find((s) => s.source_name === "Income / Salary")
              ?.self_amount?.toString() || "",
          spouseIncome:
            incomeSourcesResult.data
              ?.find((s) => s.source_name === "Income / Salary")
              ?.spouse_amount?.toString() || "",
          bonus:
            incomeSourcesResult.data
              ?.find((s) => s.source_name === "Bonus")
              ?.self_amount?.toString() || "",
          spouseBonus:
            incomeSourcesResult.data
              ?.find((s) => s.source_name === "Bonus")
              ?.spouse_amount?.toString() || "",
          investmentIncome:
            incomeSourcesResult.data
              ?.find((s) => s.source_name === "Investment Income")
              ?.self_amount?.toString() || "",
          spouseInvestment:
            incomeSourcesResult.data
              ?.find((s) => s.source_name === "Investment Income")
              ?.spouse_amount?.toString() || "",
          interest:
            incomeSourcesResult.data
              ?.find((s) => s.source_name === "Interest")
              ?.self_amount?.toString() || "",
          spouseInterest:
            incomeSourcesResult.data
              ?.find((s) => s.source_name === "Interest")
              ?.spouse_amount?.toString() || "",
          dividends:
            incomeSourcesResult.data
              ?.find((s) => s.source_name === "Dividends")
              ?.self_amount?.toString() || "",
          spouseDividends:
            incomeSourcesResult.data
              ?.find((s) => s.source_name === "Dividends")
              ?.spouse_amount?.toString() || "",
          rentalIncome:
            incomeSourcesResult.data
              ?.find((s) => s.source_name === "Rental Income")
              ?.self_amount?.toString() || "",
          spouseRental:
            incomeSourcesResult.data
              ?.find((s) => s.source_name === "Rental Income")
              ?.spouse_amount?.toString() || "",
          otherIncome:
            incomeSourcesResult.data
              ?.find((s) => s.source_name === "Other Income Source")
              ?.self_amount?.toString() || "",
          spouseOther:
            incomeSourcesResult.data
              ?.find((s) => s.source_name === "Other Income Source")
              ?.spouse_amount?.toString() || "",
          totalExpenditureSelf:
            financialResult.data?.[0]?.expenditure_self?.toString() || "",
          totalExpenditureSpouse:
            financialResult.data?.[0]?.expenditure_spouse?.toString() || "",
          totalExpenditureJoint:
            financialResult.data?.[0]?.total_expenditure_joint?.toString() ||
            "",
          disposableIncomeSelf:
            financialResult.data?.[0]?.disposable_income_self?.toString() || "",
          disposableIncomeSpouse:
            financialResult.data?.[0]?.disposable_income_spouse?.toString() ||
            "",
          disposableIncomeJoint:
            financialResult.data?.[0]?.disposable_income_joint?.toString() ||
            "",
          totalExpenditureFrequency:
            financialResult.data?.[0]?.expenditure_frequency || "Monthly",
        },

        // ASSETS & LIABILITIES - Properly mapped with current and last year values
        assetsLiabilities: {
          // Assets Current Year (12 assets)
          asset_0_curr: getAssetValue("Cash"),
          asset_1_curr: getAssetValue("Savings"),
          asset_2_curr: getAssetValue("Stocks and Bonds"),
          asset_3_curr: getAssetValue("Personal/Residential Property"),
          asset_4_curr: getAssetValue("Investment Property"),
          asset_5_curr: getAssetValue("Real Estate"),
          asset_6_curr: getAssetValue("Other Parental Property"),
          asset_7_curr: getAssetValue("Vehicle"),
          asset_8_curr: getAssetValue("Funds/Unit Trusts"),
          asset_9_curr: getAssetValue("Pensions"),
          asset_10_curr: getAssetValue("Business Shareholding"),
          asset_11_curr: getAssetValue("Net Business Interest"),

          // Assets Last Year
          asset_0_last: getAssetLastValue("Cash"),
          asset_1_last: getAssetLastValue("Savings"),
          asset_2_last: getAssetLastValue("Stocks and Bonds"),
          asset_3_last: getAssetLastValue("Personal/Residential Property"),
          asset_4_last: getAssetLastValue("Investment Property"),
          asset_5_last: getAssetLastValue("Real Estate"),
          asset_6_last: getAssetLastValue("Other Parental Property"),
          asset_7_last: getAssetLastValue("Vehicle"),
          asset_8_last: getAssetLastValue("Funds/Unit Trusts"),
          asset_9_last: getAssetLastValue("Pensions"),
          asset_10_last: getAssetLastValue("Business Shareholding"),
          asset_11_last: getAssetLastValue("Net Business Interest"),

          // Liabilities Current Year (7 liabilities)
          liab_0_curr: getLiabilityValue("Personal Loans"),
          liab_1_curr: getLiabilityValue("Margin Account"),
          liab_2_curr: getLiabilityValue("Residential Mortgage(s)"),
          liab_3_curr: getLiabilityValue("Loan Guarantees"),
          liab_4_curr: getLiabilityValue("Investment Property Mortgage(s)"),
          liab_5_curr: getLiabilityValue("Business Loans/security"),
          liab_6_curr: getLiabilityValue("Other (Please specify)"),

          // Liabilities Last Year
          liab_0_last: getLiabilityLastValue("Personal Loans"),
          liab_1_last: getLiabilityLastValue("Margin Account"),
          liab_2_last: getLiabilityLastValue("Residential Mortgage(s)"),
          liab_3_last: getLiabilityLastValue("Loan Guarantees"),
          liab_4_last: getLiabilityLastValue("Investment Property Mortgage(s)"),
          liab_5_last: getLiabilityLastValue("Business Loans/security"),
          liab_6_last: getLiabilityLastValue("Other (Please specify)"),

          // Business Names
          businessName1: businessName1,
          businessName2: businessName2,
          businessOther: businessOther,
        },

        propertyDetails:
          propertyResult.data && propertyResult.data.length > 0
            ? propertyResult.data.map((prop) => ({
                location: prop.location_details || "",
                purchaseDate: prop.purchase_date || "",
                purchasePrice: prop.purchase_price?.toString() || "",
                mortgage: prop.mortgage_amount?.toString() || "",
                currentValue: prop.current_market_value?.toString() || "",
                frequencyVisits: prop.visit_frequency || "",
              }))
            : [],

        bankDetails: {
          bankName: bankResult.data?.[0]?.bank_name || "",
          accountHeld: bankResult.data?.[0]?.account_tenure || "",
          address: bankResult.data?.[0]?.bank_address || "",
          iban: bankResult.data?.[0]?.bank_iban || "",
          accountNumber: bankResult.data?.[0]?.bank_account_number || "",
          relationship: bankResult.data?.[0]?.payor_relationship || "",
          referenceContact: bankResult.data?.[0]?.bank_reference || "",
          email: bankResult.data?.[0]?.bank_email || "",
        },

        policyBeneficiary:
          beneficiaryResult.data && beneficiaryResult.data.length > 0
            ? beneficiaryResult.data.map((bene) => ({
                name: bene.full_name || "",
                type: bene.beneficiary_type || "",
                relationship: bene.relationship_to_insured || "",
                dateOfBirth: bene.date_of_birth || "",
                passportNo: bene.passport_number || "",
                share: bene.allocated_share_percent?.toString() || "",
              }))
            : [],

        spouseDetails: {
          name: spouseResult.data?.[0]?.full_name || "",
          relationship: spouseResult.data?.[0]?.relationship || "",
          nationality: spouseResult.data?.[0]?.nationality || "",
          dateOfBirth: spouseResult.data?.[0]?.date_of_birth || "",
          contactNumber: spouseResult.data?.[0]?.phone_number || "",
          email: spouseResult.data?.[0]?.email_address || "",
          currentAddress: spouseResult.data?.[0]?.res_address || "",
          city: spouseResult.data?.[0]?.res_city || "",
          country: spouseResult.data?.[0]?.res_country || "",
          postalCode: spouseResult.data?.[0]?.res_zip || "",
          countryOfResidence:
            spouseResult.data?.[0]?.res_country_residency || "",
          permanentAddress: spouseResult.data?.[0]?.perm_address || "",
          permanentCity: spouseResult.data?.[0]?.perm_city || "",
          permanentCountry: spouseResult.data?.[0]?.perm_country || "",
          permanentPostalCode: spouseResult.data?.[0]?.perm_zip || "",
          smokingStatus: spouseResult.data?.[0]?.smoking_status || "",
          employmentRole: spouseResult.data?.[0]?.job_role || "",
          companyName: spouseResult.data?.[0]?.company_name || "",
        },

        dependentDetails:
          dependentResult.data && dependentResult.data.length > 0
            ? dependentResult.data.map((dep) => ({
                name: dep.full_name || "",
                relationship: dep.relationship || "",
                nationality: dep.nationality || "",
                dateOfBirth: dep.date_of_birth || "",
              }))
            : [],

        editMode: true,
        editId: inquiry.id,
      };

      // DEBUG: Log the mapped assets data
      console.log("=== MAPPED ASSETS DATA ===");
      console.log("asset_0_curr:", editFormData.assetsLiabilities.asset_0_curr);
      console.log("asset_1_curr:", editFormData.assetsLiabilities.asset_1_curr);
      console.log("liab_0_curr:", editFormData.assetsLiabilities.liab_0_curr);
      console.log(
        "businessName1:",
        editFormData.assetsLiabilities.businessName1,
      );

      localStorage.setItem("cis_edit_data", JSON.stringify(editFormData));
      localStorage.setItem("edit_mode", "true");
      localStorage.setItem("edit_id", inquiry.id);

      if (personalResult.data?.pdf_url) {
        localStorage.setItem("uploaded_pdf_url", personalResult.data.pdf_url);
      }

      setShowFullReviewModal(false);
      setShowModal(false);

      window.location.href = `${basePath}?edit=true&id=${inquiry.id}`;
    } catch (error) {
      console.error("Error preparing edit data:", error);
      alert("Failed to load data for editing: " + error.message);
    }
  };

  const handleArchive = async (id) => {
    if (!confirm("Are you sure you want to archive this inquiry?")) return;
    try {
      alert("Inquiry archived successfully!");
      fetchInquiries();
      fetchStats();
      setShowModal(false);
      setShowFullReviewModal(false);
    } catch (error) {
      console.error("Error archiving:", error);
      alert("Failed to archive inquiry");
    }
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const filteredInquiries = inquiries.filter((inquiry) =>
    inquiry.fullname.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const calculateAssetTotal = () => {
    if (!inquiryDetails?.assets) return 0;
    const assets = inquiryDetails.assets.filter(
      (a) => a.item_type === "asset" && !a.is_other,
    );
    return assets.reduce(
      (sum, a) => sum + (parseFloat(a.current_year_val) || 0),
      0,
    );
  };

  const calculateLiabilityTotal = () => {
    if (!inquiryDetails?.assets) return 0;
    const liabilities = inquiryDetails.assets.filter(
      (a) => a.item_type === "liability",
    );
    return liabilities.reduce(
      (sum, l) => sum + (parseFloat(l.current_year_val) || 0),
      0,
    );
  };

  const statsCards = [
    {
      title: "TOTAL CLIENTS",
      value: stats.totalInquiries,
      subtext: "All-time inquiries",
      icon: <Users size={24} />,
    },
    {
      title: "PDFS SENT",
      value: stats.pdfsSent,
      subtext: "This Month",
      icon: <Send size={24} />,
    },
    {
      title: "TOTAL ACTIVE",
      value: stats.totalActive || 0,
      subtext: "Active Accounts",
      icon: <Users size={24} />,
    },
    {
      title: "DEACTIVATED",
      value: stats.deactivated || 0,
      subtext: "Deactivated Accounts",
      icon: <XCircle size={24} />,
    },
  ];

  return (
    <div className="cis-container">
      <div className="cis-header">
        <h1 className="text-2xl font-bold text-slate-800">CIS Dashboard</h1>
        <div className="cis-header-actions">
          <div className="cis-search-wrapper">
            <Search className="cis-search-icon" />
            <input
              type="text"
              className="cis-search-input"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
          <button onClick={() => fetchInquiries()}>Retry</button>
        </div>
      )}

      <div className="cis-grid">
        {statsCards.map((stat, index) => (
          <div key={index} className="cis-card">
            <div className="cis-card-top">
              <div>
                <p className="cis-card-title">{stat.title}</p>
                <h2 className="cis-card-value">{stat.value}</h2>
              </div>
            </div>
            <p className="cis-card-subtext">{stat.subtext}</p>
            <div className="cis-icon-bg">{stat.icon}</div>
          </div>
        ))}
      </div>

      <div className="cis-table-container">
        <h2 className="cis-table-title">Clients</h2>
        {loading ? (
          <div className="loading-spinner">Loading inquiries...</div>
        ) : (
          <table className="cis-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Full Name</th>
                <th>Date Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredInquiries.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    style={{ textAlign: "center", padding: "40px" }}
                  >
                    No inquiries found
                  </td>
                </tr>
              ) : (
                filteredInquiries.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontSize: "12px", fontFamily: "monospace" }}>
                      {item.id.slice(0, 8)}...
                    </td>
                    <td>{item.fullname}</td>
                    <td>{item.date}</td>
                    <td>
                      <button
                        className="cis-action-btn"
                        onClick={() => handleViewInquiry(item)}
                      >
                        <Eye size={16} />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Summary View Modal */}
      {showModal && selectedInquiry && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Inquiry Summary</h3>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h4>Personal Information</h4>
                <p>
                  <strong>ID:</strong> {selectedInquiry.id}
                </p>
                <p>
                  <strong>Full Name:</strong> {selectedInquiry.fullname}
                </p>
                <p>
                  <strong>Email:</strong> {selectedInquiry.email}
                </p>
                <p>
                  <strong>Mobile:</strong> {selectedInquiry.mobile}
                </p>
                <p>
                  <strong>Date Submitted:</strong> {selectedInquiry.date}
                </p>
                <p>
                  <strong>Address:</strong>{" "}
                  {inquiryDetails?.personal?.residence_address || "N/A"},{" "}
                  {inquiryDetails?.personal?.residence_city || "N/A"},{" "}
                  {inquiryDetails?.personal?.residence_country || "N/A"}
                </p>
              </div>

              <div className="detail-section">
                <div
                  className="section-header-collapsible"
                  onClick={() => toggleSection("business")}
                >
                  <h4>Business / Employment Information</h4>
                  {expandedSections.business ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </div>
                {expandedSections.business && (
                  <div className="section-content">
                    {inquiryDetails?.business ? (
                      <>
                        <p>
                          <strong>Business Name:</strong>{" "}
                          {inquiryDetails.business.business_name || "N/A"}
                        </p>
                        <p>
                          <strong>Occupation:</strong>{" "}
                          {inquiryDetails.business.occupation || "N/A"}
                        </p>
                        <p>
                          <strong>Business Type:</strong>{" "}
                          {inquiryDetails.business.business_type || "N/A"}
                        </p>
                      </>
                    ) : (
                      <p>No business/employment information available</p>
                    )}
                  </div>
                )}
              </div>

              <div className="detail-section">
                <div
                  className="section-header-collapsible"
                  onClick={() => toggleSection("assets")}
                >
                  <h4>Assets and Liabilities</h4>
                  {expandedSections.assets ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </div>
                {expandedSections.assets && (
                  <div className="section-content">
                    <p>
                      <strong>Total Assets:</strong> $
                      {calculateAssetTotal().toFixed(2)}
                    </p>
                    <p>
                      <strong>Total Liabilities:</strong> $
                      {calculateLiabilityTotal().toFixed(2)}
                    </p>
                    <p>
                      <strong>Net Worth:</strong> $
                      {(
                        calculateAssetTotal() - calculateLiabilityTotal()
                      ).toFixed(2)}
                    </p>
                  </div>
                )}
              </div>

              <div className="detail-actions">
                <button
                  className="status-btn full-review"
                  onClick={() => {
                    setShowModal(false);
                    handleFullReview(selectedInquiry);
                  }}
                >
                  <FileText size={18} />
                  Full Review
                </button>
                <button
                  className="status-btn archive"
                  onClick={() => handleArchive(selectedInquiry.id)}
                >
                  <Archive size={18} />
                  Archive
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULL REVIEW MODAL - Complete All Data */}
      {showFullReviewModal && selectedInquiry && fullReviewData && (
        <div
          className="modal-overlay full-review-overlay"
          onClick={() => setShowFullReviewModal(false)}
        >
          <div
            className="modal-content full-review-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>
                Full Review -{" "}
                {fullReviewData.personal?.full_name || selectedInquiry.fullname}
              </h3>
              <div className="modal-header-actions">
                <button
                  className="icon-btn"
                  onClick={() => handleEdit(selectedInquiry)}
                >
                  <Edit size={18} />
                  Edit
                </button>
                <button
                  className="icon-btn"
                  onClick={() => setShowFullReviewModal(false)}
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="modal-body full-review-body">
              {/* 1. PERSONAL INFORMATION */}
              <div className="full-review-section">
                <h3>1. Personal Information</h3>
                <div className="info-grid">
                  <p>
                    <strong>Full Name:</strong>{" "}
                    {fullReviewData.personal?.full_name || "N/A"}
                  </p>
                  <p>
                    <strong>Father's Name:</strong>{" "}
                    {fullReviewData.personal?.fathers_name || "N/A"}
                  </p>
                  <p>
                    <strong>Mobile No:</strong>{" "}
                    {fullReviewData.personal?.mobile_no || "N/A"}
                  </p>
                  <p>
                    <strong>Email:</strong>{" "}
                    {fullReviewData.personal?.email || "N/A"}
                  </p>
                  <p>
                    <strong>Current Address:</strong>{" "}
                    {fullReviewData.personal?.residence_address || "N/A"}
                  </p>
                  <p>
                    <strong>City:</strong>{" "}
                    {fullReviewData.personal?.residence_city || "N/A"}
                  </p>
                  <p>
                    <strong>Country:</strong>{" "}
                    {fullReviewData.personal?.residence_country || "N/A"}
                  </p>
                  <p>
                    <strong>Postal Code:</strong>{" "}
                    {fullReviewData.personal?.residence_zip || "N/A"}
                  </p>
                  <p>
                    <strong>Residence Duration:</strong>{" "}
                    {fullReviewData.personal?.residence_duration || "N/A"}
                  </p>
                  <p>
                    <strong>Previous Address:</strong>{" "}
                    {fullReviewData.personal?.prev_residence_complete || "N/A"}
                  </p>
                  <p>
                    <strong>Secondary Address:</strong>{" "}
                    {fullReviewData.personal?.secondary_address || "N/A"}
                  </p>
                  <p>
                    <strong>Permanent Address:</strong>{" "}
                    {fullReviewData.personal?.permanent_address || "N/A"}
                  </p>
                  <p>
                    <strong>Tax Residency:</strong>{" "}
                    {fullReviewData.personal?.tax_residency || "N/A"}
                  </p>
                  <p>
                    <strong>TIN/SSN:</strong>{" "}
                    {fullReviewData.personal?.tin_ssn || "N/A"}
                  </p>
                  <p>
                    <strong>Citizenship:</strong>{" "}
                    {fullReviewData.personal?.citizenship || "N/A"}
                  </p>
                  <p>
                    <strong>Hobbies:</strong>{" "}
                    {fullReviewData.personal?.hobbies || "N/A"}
                  </p>
                </div>
              </div>

              {/* 2. TRAVEL DETAILS */}
              {fullReviewData.travel && fullReviewData.travel.length > 0 && (
                <div className="full-review-section">
                  <h3>2. Travel Details</h3>
                  {fullReviewData.travel.map((travel, idx) => (
                    <div key={idx} className="sub-section">
                      <p>
                        <strong>Country {idx + 1}:</strong>{" "}
                        {travel.country || "N/A"}
                      </p>
                      <p>
                        <strong>City:</strong> {travel.city || "N/A"}
                      </p>
                      <p>
                        <strong>Length of Stay:</strong>{" "}
                        {travel.length_of_stay || "N/A"}
                      </p>
                      <p>
                        <strong>Frequency:</strong> {travel.frequency || "N/A"}
                      </p>
                      <p>
                        <strong>Date of Travel:</strong>{" "}
                        {travel.date_of_travel || "N/A"}
                      </p>
                      <p>
                        <strong>Reason:</strong> {travel.reason || "N/A"}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* 3. SMOKING & ALCOHOL HABITS */}
              {fullReviewData.habits && (
                <div className="full-review-section">
                  <h3>3. Smoking & Alcohol Habits</h3>
                  <div className="info-grid">
                    <p>
                      <strong>Smoker Status:</strong>{" "}
                      {fullReviewData.habits.smoker_status || "N/A"}
                    </p>
                    <p>
                      <strong>Cigarettes per Day:</strong>{" "}
                      {fullReviewData.habits.cigarettes_per_day || "N/A"}
                    </p>
                    <p>
                      <strong>Previous Smoking History:</strong>{" "}
                      {fullReviewData.habits.previous_smoking_history || "N/A"}
                    </p>
                    <p>
                      <strong>Alcohol Type:</strong>{" "}
                      {fullReviewData.habits.alcohol_type || "N/A"}
                    </p>
                    <p>
                      <strong>Alcohol Measurement:</strong>{" "}
                      {fullReviewData.habits.alcohol_measurement || "N/A"}
                    </p>
                    <p>
                      <strong>Alcohol Frequency:</strong>{" "}
                      {fullReviewData.habits.alcohol_frequency || "N/A"}
                    </p>
                  </div>
                </div>
              )}

              {/* 4. PERSONAL MEDICAL DETAILS */}
              {fullReviewData.medical && (
                <div className="full-review-section">
                  <h3>4. Personal Medical Details</h3>
                  <div className="info-grid">
                    <p>
                      <strong>Weight:</strong>{" "}
                      {fullReviewData.medical.weight || "N/A"}
                    </p>
                    <p>
                      <strong>Height:</strong>{" "}
                      {fullReviewData.medical.height || "N/A"}
                    </p>
                    <p>
                      <strong>Exercise Details:</strong>{" "}
                      {fullReviewData.medical.exercise_details || "N/A"}
                    </p>
                    <p>
                      <strong>Health Disorders:</strong>{" "}
                      {fullReviewData.medical.health_disorders || "N/A"}
                    </p>
                    <p>
                      <strong>Medications:</strong>{" "}
                      {fullReviewData.medical.medications || "N/A"}
                    </p>
                    <p>
                      <strong>Physician Name:</strong>{" "}
                      {fullReviewData.medical.physician_name || "N/A"}
                    </p>
                    <p>
                      <strong>Physician Address:</strong>{" "}
                      {fullReviewData.medical.physician_address || "N/A"}
                    </p>
                    <p>
                      <strong>Physician Phone:</strong>{" "}
                      {fullReviewData.medical.physician_phone || "N/A"}
                    </p>
                    <p>
                      <strong>Years Attended:</strong>{" "}
                      {fullReviewData.medical.years_attended || "N/A"}
                    </p>
                    <p>
                      <strong>Last Visit Details:</strong>{" "}
                      {fullReviewData.medical.last_visit_details || "N/A"}
                    </p>
                  </div>
                </div>
              )}

              {/* 5. FAMILY MEDICAL HISTORY */}
              {fullReviewData.familyMedical &&
                fullReviewData.familyMedical.length > 0 && (
                  <div className="full-review-section">
                    <h3>5. Family Medical History</h3>
                    {fullReviewData.familyMedical.map((member, idx) => (
                      <div key={idx} className="sub-section">
                        <p>
                          <strong>Relationship:</strong>{" "}
                          {member.relationship || "N/A"}
                        </p>
                        <p>
                          <strong>Full Name:</strong>{" "}
                          {member.full_name || "N/A"}
                        </p>
                        <p>
                          <strong>Age:</strong> {member.age || "N/A"}
                        </p>
                        <p>
                          <strong>Medical History:</strong>{" "}
                          {member.medical_history || "N/A"}
                        </p>
                        <p>
                          <strong>Current Health Status:</strong>{" "}
                          {member.current_health_status || "N/A"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

              {/* 6. EXISTING/PENDING INSURANCE */}
              {fullReviewData.insurance &&
                fullReviewData.insurance.length > 0 && (
                  <div className="full-review-section">
                    <h3>6. Existing/Pending Insurance</h3>
                    {fullReviewData.insurance.map((ins, idx) => (
                      <div key={idx} className="sub-section">
                        <p>
                          <strong>Insurance Company:</strong>{" "}
                          {ins.insurance_company || "N/A"}
                        </p>
                        <p>
                          <strong>Insurance Type:</strong>{" "}
                          {ins.insurance_type || "N/A"}
                        </p>
                        <p>
                          <strong>Country/Year Issue:</strong>{" "}
                          {ins.country_year_issue || "N/A"}
                        </p>
                        <p>
                          <strong>Amount of Cover:</strong> $
                          {parseFloat(ins.amount_of_cover || 0).toFixed(2)}
                        </p>
                        <p>
                          <strong>Premium:</strong> $
                          {parseFloat(ins.premium || 0).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

              {/* 7. BUSINESS EMPLOYMENT INFORMATION */}
              {fullReviewData.business && (
                <div className="full-review-section">
                  <h3>7. Business/Employment Information</h3>
                  <div className="info-grid">
                    <p>
                      <strong>Business Name:</strong>{" "}
                      {fullReviewData.business.business_name || "N/A"}
                    </p>
                    <p>
                      <strong>Nature of Business:</strong>{" "}
                      {fullReviewData.business.business_nature || "N/A"}
                    </p>
                    <p>
                      <strong>Occupation:</strong>{" "}
                      {fullReviewData.business.occupation || "N/A"}
                    </p>
                    <p>
                      <strong>Business Type:</strong>{" "}
                      {fullReviewData.business.business_type || "N/A"}
                    </p>
                    <p>
                      <strong>Ownership %:</strong>{" "}
                      {fullReviewData.business.ownership_percent || "N/A"}%
                    </p>
                    <p>
                      <strong>Business Address:</strong>{" "}
                      {fullReviewData.business.business_address || "N/A"}
                    </p>
                    <p>
                      <strong>Business City:</strong>{" "}
                      {fullReviewData.business.business_city || "N/A"}
                    </p>
                    <p>
                      <strong>Business Country:</strong>{" "}
                      {fullReviewData.business.business_country || "N/A"}
                    </p>
                    <p>
                      <strong>Business Website:</strong>{" "}
                      {fullReviewData.business.business_website || "N/A"}
                    </p>
                    <p>
                      <strong>Business Phone:</strong>{" "}
                      {fullReviewData.business.business_phone || "N/A"}
                    </p>
                    <p>
                      <strong>Incorporation Date:</strong>{" "}
                      {fullReviewData.business.incorporation_date || "N/A"}
                    </p>
                    <p>
                      <strong>Previous Experience:</strong>{" "}
                      {fullReviewData.business.previous_experience || "N/A"}
                    </p>
                  </div>
                </div>
              )}

              {/* 8. INCOME SOURCES */}
              {fullReviewData.incomeSources &&
                fullReviewData.incomeSources.length > 0 && (
                  <div className="full-review-section">
                    <h3>8. Personal Income Statement</h3>
                    {fullReviewData.incomeSources.map((source, idx) => (
                      <div key={idx} className="sub-section">
                        <p>
                          <strong>Source {idx + 1}:</strong>{" "}
                          {source.source_name || "N/A"}
                        </p>
                        <p>
                          <strong>Frequency:</strong>{" "}
                          {source.frequency || "N/A"}
                        </p>
                        <p>
                          <strong>Self Amount:</strong> $
                          {parseFloat(source.self_amount || 0).toFixed(2)}
                        </p>
                        <p>
                          <strong>Spouse Amount:</strong> $
                          {parseFloat(source.spouse_amount || 0).toFixed(2)}
                        </p>
                        <p>
                          <strong>Joint Amount:</strong> $
                          {parseFloat(source.joint_amount || 0).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

              {/* 9. FINANCIAL SUMMARY */}
              {fullReviewData.financial && (
                <div className="full-review-section">
                  <h3>9. Financial Summary</h3>
                  <div className="info-grid">
                    <p>
                      <strong>Expenditure Frequency:</strong>{" "}
                      {fullReviewData.financial.expenditure_frequency || "N/A"}
                    </p>
                    <p>
                      <strong>Expenditure Self:</strong> $
                      {parseFloat(
                        fullReviewData.financial.expenditure_self || 0,
                      ).toFixed(2)}
                    </p>
                    <p>
                      <strong>Expenditure Spouse:</strong> $
                      {parseFloat(
                        fullReviewData.financial.expenditure_spouse || 0,
                      ).toFixed(2)}
                    </p>
                    <p>
                      <strong>Total Income Self:</strong> $
                      {parseFloat(
                        fullReviewData.financial.total_income_self || 0,
                      ).toFixed(2)}
                    </p>
                    <p>
                      <strong>Total Income Spouse:</strong> $
                      {parseFloat(
                        fullReviewData.financial.total_income_spouse || 0,
                      ).toFixed(2)}
                    </p>
                    <p>
                      <strong>Total Income Joint:</strong> $
                      {parseFloat(
                        fullReviewData.financial.total_income_joint || 0,
                      ).toFixed(2)}
                    </p>
                    <p>
                      <strong>Total Expenditure Joint:</strong> $
                      {parseFloat(
                        fullReviewData.financial.total_expenditure_joint || 0,
                      ).toFixed(2)}
                    </p>
                    <p>
                      <strong>Disposable Income Self:</strong> $
                      {parseFloat(
                        fullReviewData.financial.disposable_income_self || 0,
                      ).toFixed(2)}
                    </p>
                    <p>
                      <strong>Disposable Income Spouse:</strong> $
                      {parseFloat(
                        fullReviewData.financial.disposable_income_spouse || 0,
                      ).toFixed(2)}
                    </p>
                    <p>
                      <strong>Disposable Income Joint:</strong> $
                      {parseFloat(
                        fullReviewData.financial.disposable_income_joint || 0,
                      ).toFixed(2)}
                    </p>
                  </div>
                </div>
              )}

              {/* 10. ASSETS & LIABILITIES */}
              {fullReviewData.assets && fullReviewData.assets.length > 0 && (
                <div className="full-review-section">
                  <h3>10. Assets & Liabilities</h3>
                  <div className="assets-liabilities-grid">
                    <div>
                      <h4>Assets</h4>
                      {fullReviewData.assets
                        .filter((a) => a.item_type === "asset" && !a.is_other)
                        .map((asset, idx) => (
                          <p key={idx}>
                            <strong>{asset.category_name}:</strong> $
                            {parseFloat(asset.current_year_val || 0).toFixed(2)}
                          </p>
                        ))}
                    </div>
                    <div>
                      <h4>Liabilities</h4>
                      {fullReviewData.assets
                        .filter((a) => a.item_type === "liability")
                        .map((liab, idx) => (
                          <p key={idx}>
                            <strong>{liab.category_name}:</strong> $
                            {parseFloat(liab.current_year_val || 0).toFixed(2)}
                          </p>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 11. NET WORTH SUMMARY */}
              {fullReviewData.netWorth && (
                <div className="full-review-section">
                  <h3>11. Net Worth Summary</h3>
                  <div className="info-grid">
                    <p>
                      <strong>Total Assets (Current Year):</strong> $
                      {parseFloat(
                        fullReviewData.netWorth.total_assets_curr || 0,
                      ).toFixed(2)}
                    </p>
                    <p>
                      <strong>Total Liabilities (Current Year):</strong> $
                      {parseFloat(
                        fullReviewData.netWorth.total_liabilities_curr || 0,
                      ).toFixed(2)}
                    </p>
                    <p>
                      <strong>Net Worth (Current Year):</strong> $
                      {parseFloat(
                        fullReviewData.netWorth.net_worth_curr || 0,
                      ).toFixed(2)}
                    </p>
                  </div>
                </div>
              )}

              {/* 12. PROPERTY DETAILS */}
              {fullReviewData.property &&
                fullReviewData.property.length > 0 && (
                  <div className="full-review-section">
                    <h3>12. Property Details</h3>
                    {fullReviewData.property.map((prop, idx) => (
                      <div key={idx} className="sub-section">
                        <p>
                          <strong>Property {idx + 1}:</strong>{" "}
                          {prop.location_details || "N/A"}
                        </p>
                        <p>
                          <strong>Purchase Date:</strong>{" "}
                          {prop.purchase_date || "N/A"}
                        </p>
                        <p>
                          <strong>Purchase Price:</strong> $
                          {parseFloat(prop.purchase_price || 0).toFixed(2)}
                        </p>
                        <p>
                          <strong>Mortgage Amount:</strong> $
                          {parseFloat(prop.mortgage_amount || 0).toFixed(2)}
                        </p>
                        <p>
                          <strong>Current Market Value:</strong> $
                          {parseFloat(prop.current_market_value || 0).toFixed(
                            2,
                          )}
                        </p>
                        <p>
                          <strong>Visit Frequency:</strong>{" "}
                          {prop.visit_frequency || "N/A"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

              {/* 13. BANK DETAILS */}
              {fullReviewData.bank && (
                <div className="full-review-section">
                  <h3>13. Bank Details</h3>
                  <div className="info-grid">
                    <p>
                      <strong>Bank Name:</strong>{" "}
                      {fullReviewData.bank.bank_name || "N/A"}
                    </p>
                    <p>
                      <strong>Account Number:</strong>{" "}
                      {fullReviewData.bank.bank_account_number || "N/A"}
                    </p>
                    <p>
                      <strong>IBAN:</strong>{" "}
                      {fullReviewData.bank.bank_iban || "N/A"}
                    </p>
                    <p>
                      <strong>Bank Address:</strong>{" "}
                      {fullReviewData.bank.bank_address || "N/A"}
                    </p>
                  </div>
                </div>
              )}

              {/* 14. POLICY BENEFICIARIES */}
              {fullReviewData.beneficiary &&
                fullReviewData.beneficiary.length > 0 && (
                  <div className="full-review-section">
                    <h3>14. Policy Beneficiaries</h3>
                    {fullReviewData.beneficiary.map((bene, idx) => (
                      <div key={idx} className="sub-section">
                        <p>
                          <strong>Beneficiary {idx + 1}:</strong>{" "}
                          {bene.full_name || "N/A"}
                        </p>
                        <p>
                          <strong>Relationship:</strong>{" "}
                          {bene.relationship_to_insured || "N/A"}
                        </p>
                        <p>
                          <strong>Share:</strong>{" "}
                          {bene.allocated_share_percent || "0"}%
                        </p>
                      </div>
                    ))}
                  </div>
                )}

              {/* 15. SPOUSE DETAILS */}
              {fullReviewData.spouse && (
                <div className="full-review-section">
                  <h3>15. Spouse Details</h3>
                  <div className="info-grid">
                    <p>
                      <strong>Name:</strong>{" "}
                      {fullReviewData.spouse.full_name || "N/A"}
                    </p>
                    <p>
                      <strong>Relationship:</strong>{" "}
                      {fullReviewData.spouse.relationship || "N/A"}
                    </p>
                    <p>
                      <strong>Nationality:</strong>{" "}
                      {fullReviewData.spouse.nationality || "N/A"}
                    </p>
                    <p>
                      <strong>Date of Birth:</strong>{" "}
                      {fullReviewData.spouse.date_of_birth || "N/A"}
                    </p>
                    <p>
                      <strong>Contact:</strong>{" "}
                      {fullReviewData.spouse.phone_number || "N/A"}
                    </p>
                    <p>
                      <strong>Email:</strong>{" "}
                      {fullReviewData.spouse.email_address || "N/A"}
                    </p>
                    <p>
                      <strong>Smoking Status:</strong>{" "}
                      {fullReviewData.spouse.smoking_status || "N/A"}
                    </p>
                    <p>
                      <strong>Employment Role:</strong>{" "}
                      {fullReviewData.spouse.job_role || "N/A"}
                    </p>
                    <p>
                      <strong>Company:</strong>{" "}
                      {fullReviewData.spouse.company_name || "N/A"}
                    </p>
                  </div>
                </div>
              )}

              {/* 16. DEPENDENT DETAILS */}
              {fullReviewData.dependent &&
                fullReviewData.dependent.length > 0 && (
                  <div className="full-review-section">
                    <h3>16. Dependent Details</h3>
                    {fullReviewData.dependent.map((dep, idx) => (
                      <div key={idx} className="sub-section">
                        <p>
                          <strong>Dependent {idx + 1}:</strong>{" "}
                          {dep.full_name || "N/A"}
                        </p>
                        <p>
                          <strong>Relationship:</strong>{" "}
                          {dep.relationship || "N/A"}
                        </p>
                        <p>
                          <strong>Nationality:</strong>{" "}
                          {dep.nationality || "N/A"}
                        </p>
                        <p>
                          <strong>Date of Birth:</strong>{" "}
                          {dep.date_of_birth || "N/A"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowFullReviewModal(false)}
              >
                Close
              </button>
              <button
                className="btn-primary"
                onClick={() => handleEdit(selectedInquiry)}
              >
                <Edit size={16} />
                Edit Form
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CISDashboard;

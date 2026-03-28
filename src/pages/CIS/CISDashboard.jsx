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
    pendingReview: 0,
    declined: 0,
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

      // Get the user's role from your database
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

  // Fetch data from Supabase on component mount
  useEffect(() => {
    fetchInquiries();
    fetchStats();
  }, []);

  // Fetch all inquiries from personal_information table for the current user
  const fetchInquiries = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.log("No user logged in");
        setInquiries([]);
        setLoading(false);
        return;
      }

      console.log("Fetching inquiries for user:", user.id);

      // Fetch only records where user_id matches the logged-in user
      const { data, error } = await supabase
        .from("personal_information")
        .select("id, full_name, created_at, email, mobile_no")
        .eq("user_id", user.id) // 👈 Filter by user_id
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
      console.log(`Found ${formattedData.length} inquiries for user`);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  // Fetch statistics for the current user
  const fetchStats = async () => {
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setStats({
          totalInquiries: 0,
          pdfsSent: 0,
          pendingReview: 0,
          declined: 0,
        });
        return;
      }

      // Total inquiries for this user
      const { count: totalCount } = await supabase
        .from("personal_information")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id); // 👈 Filter by user_id

      // This month's submissions for this user
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: monthCount } = await supabase
        .from("personal_information")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id) // 👈 Filter by user_id
        .gte("created_at", startOfMonth.toISOString());

      setStats({
        totalInquiries: totalCount || 0,
        pdfsSent: monthCount || 0,
        pendingReview: 0,
        declined: 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // View inquiry details (summary view)
  const handleViewInquiry = async (inquiry) => {
    setSelectedInquiry(inquiry);
    setShowModal(true);

    try {
      // Verify ownership (optional but recommended)
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Fetch personal information - also check user_id matches
      const { data: personalData, error: personalError } = await supabase
        .from("personal_information")
        .select("*")
        .eq("id", inquiry.id)
        .eq("user_id", user.id) // 👈 Ensure user owns this record
        .single();

      if (personalError || !personalData) {
        console.error("Unauthorized or not found");
        alert("You don't have permission to view this inquiry");
        setShowModal(false);
        return;
      }

      // Fetch related data (these should cascade from the personal_info_id)
      const { data: businessData } = await supabase
        .from("business_employment_info")
        .select("*")
        .eq("personal_info_id", inquiry.id);

      // ... rest of your fetch code
    } catch (error) {
      console.error("Error fetching inquiry details:", error);
    }
  };

  // Full Review - fetch all data
  const handleFullReview = async (inquiry) => {
    setSelectedInquiry(inquiry);
    setShowFullReviewModal(true);

    try {
      console.log("Fetching full review data for:", inquiry.id);

      const [
        personal,
        travel,
        habits,
        medical,
        family,
        insurance,
        business,
        incomeSources,
        financial,
        assets,
        property,
        bank,
        beneficiary,
        spouse,
        dependent,
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

      setFullReviewData({
        personal: personal.data,
        travel: travel.data || [],
        habits: habits.data?.[0] || null,
        medical: medical.data?.[0] || null,
        familyMedical: family.data || [],
        insurance: insurance.data || [],
        business: business.data?.[0] || null,
        incomeSources: incomeSources.data || [],
        financial: financial.data?.[0] || null,
        assets: assets.data || [],
        property: property.data || [],
        bank: bank.data?.[0] || null,
        beneficiary: beneficiary.data || [],
        spouse: spouse.data?.[0] || null,
        dependent: dependent.data || [],
      });

      console.log("Full review data loaded");
    } catch (error) {
      console.error("Error fetching full review data:", error);
    }
  };

  // Handle Edit - fetch all data and redirect
  const handleEdit = async (inquiry) => {
    try {
      console.log("Fetching data for edit:", inquiry.id);

      // Get user role to determine redirect path
      const userRole = await getUserRole();
      console.log("User role:", userRole);

      // Determine the base path based on role
      let basePath = "/";
      if (userRole === "mp") {
        basePath = "/mp/cis";
      } else if (userRole === "al") {
        basePath = "/al/cis";
      } else if (userRole === "md") {
        basePath = "/md/cis";
      } else if (userRole === "ap") {
        basePath = "/ap/cis";
      } else {
        basePath = "/mp/cis";
      }

      // Fetch all related data
      const [
        personal,
        travel,
        habits,
        medical,
        family,
        insurance,
        business,
        incomeSources,
        financial,
        assets,
        property,
        bank,
        beneficiary,
        spouse,
        dependent,
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

      const editData = {
        personal: personal.data,
        travel: travel.data || [],
        habits: habits.data?.[0] || null,
        medical: medical.data?.[0] || null,
        familyMedical: family.data || [],
        insurance: insurance.data || [],
        business: business.data?.[0] || null,
        incomeSources: incomeSources.data || [],
        financial: financial.data?.[0] || null,
        assets: assets.data || [],
        property: property.data || [],
        bank: bank.data?.[0] || null,
        beneficiary: beneficiary.data || [],
        spouse: spouse.data?.[0] || null,
        dependent: dependent.data || [],
        editMode: true,
        editId: inquiry.id,
      };

      // Store data in localStorage
      localStorage.setItem("cis_edit_data", JSON.stringify(editData));
      localStorage.setItem("edit_mode", "true");
      localStorage.setItem("edit_id", inquiry.id);

      // Close any open modals
      setShowFullReviewModal(false);
      setShowModal(false);

      // Redirect to the appropriate CIS form page based on user role
      window.location.href = `${basePath}?edit=true`;
    } catch (error) {
      console.error("Error preparing edit data:", error);
      alert("Failed to load data for editing: " + error.message);
    }
  };

  // Archive inquiry
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

  // Toggle section expand/collapse
  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Filter inquiries based on search term
  const filteredInquiries = inquiries.filter((inquiry) =>
    inquiry.fullname.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Calculate totals for assets
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

  // Stats cards data
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
      title: "PENDING REVIEW",
      value: stats.pendingReview,
      subtext: "Awaiting Action",
      icon: <Clock size={24} />,
    },
    {
      title: "DECLINED",
      value: stats.declined,
      subtext: "Declined Applications",
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

      {/* DASHBOARD CARDS */}
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

      {/* TABLE SECTION */}
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
                {expandedSections.business && inquiryDetails?.business && (
                  <div className="section-content">
                    <p>
                      <strong>Business Name:</strong>{" "}
                      {inquiryDetails.business.business_name || "N/A"}
                    </p>
                    <p>
                      <strong>Occupation:</strong>{" "}
                      {inquiryDetails.business.occupation || "N/A"}
                    </p>
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

      {/* FULL REVIEW MODAL - All Detailed Data */}
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
              {/* ==================== PERSONAL INFORMATION ==================== */}
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
                    <strong>Citizenship:</strong>{" "}
                    {fullReviewData.personal?.citizenship || "N/A"}
                  </p>
                  <p>
                    <strong>Hobbies:</strong>{" "}
                    {fullReviewData.personal?.hobbies || "N/A"}
                  </p>
                </div>
              </div>

              {/* ==================== TRAVEL DETAILS ==================== */}
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
                        <strong>Reason:</strong> {travel.reason || "N/A"}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* ==================== HABITS ==================== */}
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
                      <strong>Alcohol Type:</strong>{" "}
                      {fullReviewData.habits.alcohol_type || "N/A"}
                    </p>
                    <p>
                      <strong>Alcohol Frequency:</strong>{" "}
                      {fullReviewData.habits.alcohol_frequency || "N/A"}
                    </p>
                  </div>
                </div>
              )}

              {/* ==================== MEDICAL DETAILS ==================== */}
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
                      <strong>Exercise:</strong>{" "}
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
                      <strong>Family Physician:</strong>{" "}
                      {fullReviewData.medical.physician_name || "N/A"}
                    </p>
                    <p>
                      <strong>Physician Phone:</strong>{" "}
                      {fullReviewData.medical.physician_phone || "N/A"}
                    </p>
                  </div>
                </div>
              )}

              {/* ==================== FAMILY MEDICAL HISTORY ==================== */}
              {fullReviewData.familyMedical &&
                fullReviewData.familyMedical.length > 0 && (
                  <div className="full-review-section">
                    <h3>5. Family Medical History</h3>
                    {fullReviewData.familyMedical.map((member, idx) => (
                      <div key={idx} className="sub-section">
                        <p>
                          <strong>{member.relationship}:</strong>{" "}
                          {member.full_name || "N/A"}
                        </p>
                        <p>
                          <strong>Age:</strong> {member.age || "N/A"} |{" "}
                          <strong>Medical History:</strong>{" "}
                          {member.medical_history || "N/A"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

              {/* ==================== INSURANCE ==================== */}
              {fullReviewData.insurance &&
                fullReviewData.insurance.length > 0 && (
                  <div className="full-review-section">
                    <h3>6. Existing/Pending Insurance</h3>
                    {fullReviewData.insurance.map((ins, idx) => (
                      <div key={idx} className="sub-section">
                        <p>
                          <strong>Company {idx + 1}:</strong>{" "}
                          {ins.insurance_company || "N/A"}
                        </p>
                        <p>
                          <strong>Type:</strong> {ins.insurance_type || "N/A"} |{" "}
                          <strong>Cover:</strong> ${ins.amount_of_cover || "0"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

              {/* ==================== BUSINESS EMPLOYMENT ==================== */}
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
                  </div>
                </div>
              )}

              {/* ==================== INCOME STATEMENT ==================== */}
              {fullReviewData.financial && (
                <div className="full-review-section">
                  <h3>8. Personal Income Statement</h3>
                  <div className="info-grid">
                    <p>
                      <strong>Total Income (Self):</strong> $
                      {fullReviewData.financial.total_income_self?.toFixed(2) ||
                        "0.00"}
                    </p>
                    <p>
                      <strong>Total Income (Spouse):</strong> $
                      {fullReviewData.financial.total_income_spouse?.toFixed(
                        2,
                      ) || "0.00"}
                    </p>
                    <p>
                      <strong>Total Income (Joint):</strong> $
                      {fullReviewData.financial.total_income_joint?.toFixed(
                        2,
                      ) || "0.00"}
                    </p>
                    <p>
                      <strong>Total Expenditure:</strong> $
                      {fullReviewData.financial.total_expenditure_joint?.toFixed(
                        2,
                      ) || "0.00"}
                    </p>
                    <p>
                      <strong>Disposable Income:</strong> $
                      {fullReviewData.financial.disposable_income_joint?.toFixed(
                        2,
                      ) || "0.00"}
                    </p>
                  </div>
                </div>
              )}

              {/* ==================== ASSETS & LIABILITIES ==================== */}
              {fullReviewData.assets && fullReviewData.assets.length > 0 && (
                <div className="full-review-section">
                  <h3>9. Assets and Liabilities</h3>
                  <div className="assets-liabilities-grid">
                    <div>
                      <h4>Assets</h4>
                      {fullReviewData.assets
                        .filter((a) => a.item_type === "asset" && !a.is_other)
                        .map((asset, idx) => (
                          <p key={idx}>
                            <strong>{asset.category_name}:</strong> $
                            {asset.current_year_val?.toFixed(2) || "0.00"}
                          </p>
                        ))}
                      {fullReviewData.assets
                        .filter((a) => a.is_other)
                        .map((biz, idx) => (
                          <p key={idx}>
                            <strong>Business Interest:</strong>{" "}
                            {biz.other_description}
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
                            {liab.current_year_val?.toFixed(2) || "0.00"}
                          </p>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ==================== PROPERTY DETAILS ==================== */}
              {fullReviewData.property &&
                fullReviewData.property.length > 0 && (
                  <div className="full-review-section">
                    <h3>10. Property Details</h3>
                    {fullReviewData.property.map((prop, idx) => (
                      <div key={idx} className="sub-section">
                        <p>
                          <strong>
                            Property {idx + 1} ({prop.property_category}):
                          </strong>{" "}
                          {prop.location_details || "N/A"}
                        </p>
                        <p>
                          <strong>Purchase Date:</strong>{" "}
                          {prop.purchase_date || "N/A"} |{" "}
                          <strong>Price:</strong> $
                          {prop.purchase_price?.toFixed(2) || "0.00"}
                        </p>
                        <p>
                          <strong>Mortgage:</strong> $
                          {prop.mortgage_amount?.toFixed(2) || "0.00"} |{" "}
                          <strong>Current Value:</strong> $
                          {prop.current_market_value?.toFixed(2) || "0.00"}
                        </p>
                        <p>
                          <strong>Visit Frequency:</strong>{" "}
                          {prop.visit_frequency || "N/A"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

              {/* ==================== BANK DETAILS ==================== */}
              {fullReviewData.bank && (
                <div className="full-review-section">
                  <h3>11. Bank Details</h3>
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

              {/* ==================== POLICY BENEFICIARIES ==================== */}
              {fullReviewData.beneficiary &&
                fullReviewData.beneficiary.length > 0 && (
                  <div className="full-review-section">
                    <h3>12. Policy Beneficiaries</h3>
                    {fullReviewData.beneficiary.map((bene, idx) => (
                      <div key={idx} className="sub-section">
                        <p>
                          <strong>Beneficiary {idx + 1}:</strong>{" "}
                          {bene.full_name || "N/A"}
                        </p>
                        <p>
                          <strong>Relationship:</strong>{" "}
                          {bene.relationship_to_insured || "N/A"} |{" "}
                          <strong>Share:</strong>{" "}
                          {bene.allocated_share_percent || "0"}%
                        </p>
                      </div>
                    ))}
                  </div>
                )}

              {/* ==================== SPOUSE DETAILS ==================== */}
              {fullReviewData.spouse && (
                <div className="full-review-section">
                  <h3>13. Spouse Details</h3>
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

              {/* ==================== DEPENDENT DETAILS ==================== */}
              {fullReviewData.dependent &&
                fullReviewData.dependent.length > 0 && (
                  <div className="full-review-section">
                    <h3>14. Dependent Details</h3>
                    {fullReviewData.dependent.map((dep, idx) => (
                      <div key={idx} className="sub-section">
                        <p>
                          <strong>Dependent {idx + 1}:</strong>{" "}
                          {dep.full_name || "N/A"}
                        </p>
                        <p>
                          <strong>Relationship:</strong>{" "}
                          {dep.relationship || "N/A"} |{" "}
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

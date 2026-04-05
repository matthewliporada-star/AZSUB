import React, { useState, useEffect } from "react";
import {
  Search,
  Users,
  FileText,
  Eye,
  X,
  ChevronDown,
  ChevronUp,
  Calendar,
  Mail,
  Phone,
  Briefcase,
  DollarSign,
  User,
  Heart,
  AlertCircle,
  CheckCircle,
  Archive,
  Home,
  MapPin,
  CreditCard,
  Shield,
  Users as UsersIcon,
  Baby,
  Car,
  Plane,
  Activity,
  Droplets,
  Coffee,
  Upload,
  RotateCcw,
} from "lucide-react";
import supabase from "../../config/supabaseClient.js";
import "./CIS.css";

const CISRecord = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [records, setRecords] = useState([]);
  const [archivedRecords, setArchivedRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showArchivedModal, setShowArchivedModal] = useState(false);
  const [stats, setStats] = useState({
    totalRecords: 0,
    activeRecords: 0,
    pdfUpload: 0,
    archived: 0,
  });
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [fullRecordData, setFullRecordData] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    personal: true,
    travel: false,
    habits: false,
    medical: false,
    familyMedical: false,
    insurance: false,
    business: false,
    incomeSources: false,
    financial: false,
    assets: false,
    property: false,
    bank: false,
    beneficiary: false,
    spouse: false,
    dependent: false,
  });

  useEffect(() => {
    fetchRecords();
    fetchStats();
    fetchArchivedRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.log("No user logged in");
        setRecords([]);
        setLoading(false);
        return;
      }

      const { data: personalData, error: personalError } = await supabase
        .from("personal_information")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_archived", false)
        .order("created_at", { ascending: false });

      if (personalError) throw personalError;

      if (!personalData || personalData.length === 0) {
        setRecords([]);
        setLoading(false);
        return;
      }

      setRecords(personalData);
    } catch (error) {
      console.error("Error fetching records:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchArchivedRecords = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: archivedData, error: archivedError } = await supabase
        .from("personal_information")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_archived", true)
        .order("archived_at", { ascending: false });

      if (!archivedError && archivedData) {
        setArchivedRecords(archivedData);
      }
    } catch (error) {
      console.error("Error fetching archived records:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setStats({
          totalRecords: 0,
          activeRecords: 0,
          pdfUpload: 0,
          archived: 0,
        });
        return;
      }

      const { count: totalCount } = await supabase
        .from("personal_information")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_archived", false);

      const { count: activeCount } = await supabase
        .from("personal_information")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_archived", false)
        .gte(
          "created_at",
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        );

      const { count: pdfCount } = await supabase
        .from("personal_information")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_archived", false)
        .not("pdf_url", "is", null);

      const { count: archivedCount } = await supabase
        .from("personal_information")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_archived", true);

      setStats({
        totalRecords: totalCount || 0,
        activeRecords: activeCount || 0,
        pdfUpload: pdfCount || 0,
        archived: archivedCount || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleArchive = async (record) => {
    if (
      !confirm(
        `Are you sure you want to archive ${record.full_name || "this record"}?`,
      )
    )
      return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("No user logged in");

      const { error: updateError } = await supabase
        .from("personal_information")
        .update({
          is_archived: true,
          archived_at: new Date().toISOString(),
          archived_by: user.id,
        })
        .eq("id", record.id)
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      alert("Record archived successfully!");
      setShowDetailModal(false);
      fetchRecords();
      fetchStats();
      fetchArchivedRecords();
    } catch (error) {
      console.error("Error archiving record:", error);
      alert("Failed to archive record: " + error.message);
    }
  };

  const handleUnarchive = async (record) => {
    if (!confirm(`Restore ${record.full_name || "this record"} from archive?`))
      return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("No user logged in");

      const { error: updateError } = await supabase
        .from("personal_information")
        .update({
          is_archived: false,
          archived_at: null,
          archived_by: null,
        })
        .eq("id", record.id)
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      alert("Record restored successfully!");
      fetchRecords();
      fetchStats();
      fetchArchivedRecords();

      if (showArchivedModal) {
        await fetchArchivedRecords();
      }
    } catch (error) {
      console.error("Error restoring record:", error);
      alert("Failed to restore record: " + error.message);
    }
  };

  const handleViewRecord = async (record) => {
    setSelectedRecord(record);
    setShowDetailModal(true);
    setFullRecordData(null);

    try {
      console.log("Fetching full data for record ID:", record.id);

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
          .eq("id", record.id)
          .single(),
        supabase
          .from("travel_details")
          .select("*")
          .eq("personal_info_id", record.id),
        supabase
          .from("smoking_alcohol_habits")
          .select("*")
          .eq("personal_info_id", record.id),
        supabase
          .from("personal_medical_details")
          .select("*")
          .eq("personal_info_id", record.id),
        supabase
          .from("family_medical_history")
          .select("*")
          .eq("personal_info_id", record.id),
        supabase
          .from("existing_pending")
          .select("*")
          .eq("personal_info_id", record.id),
        supabase
          .from("business_employment_info")
          .select("*")
          .eq("personal_info_id", record.id),
        supabase
          .from("income_sources")
          .select("*")
          .eq("personal_info_id", record.id),
        supabase
          .from("financial_summary")
          .select("*")
          .eq("personal_info_id", record.id),
        supabase
          .from("assets_liabilities")
          .select("*")
          .eq("personal_info_id", record.id),
        supabase
          .from("assets_net_worth_summary")
          .select("*")
          .eq("personal_info_id", record.id),
        supabase
          .from("property_details")
          .select("*")
          .eq("personal_info_id", record.id),
        supabase
          .from("bank_details")
          .select("*")
          .eq("personal_info_id", record.id),
        supabase
          .from("policy_beneficiaries")
          .select("*")
          .eq("personal_info_id", record.id),
        supabase
          .from("spouse_details")
          .select("*")
          .eq("personal_info_id", record.id),
        supabase
          .from("dependent_details")
          .select("*")
          .eq("personal_info_id", record.id),
      ]);

      setFullRecordData({
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

      console.log("Full data loaded successfully");
    } catch (error) {
      console.error("Error fetching full data:", error);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const formatCurrency = (amount) => {
    if (!amount) return "$0";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateTotalAssets = () => {
    if (!fullRecordData?.assets) return 0;
    return fullRecordData.assets
      .filter((a) => a.item_type === "asset" && !a.is_other)
      .reduce((sum, a) => sum + (parseFloat(a.current_year_val) || 0), 0);
  };

  const calculateTotalLiabilities = () => {
    if (!fullRecordData?.assets) return 0;
    return fullRecordData.assets
      .filter((a) => a.item_type === "liability")
      .reduce((sum, a) => sum + (parseFloat(a.current_year_val) || 0), 0);
  };

  const filteredRecords = records.filter(
    (record) =>
      record.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredArchivedRecords = archivedRecords.filter(
    (record) =>
      record.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const statsCards = [
    {
      title: "TOTAL RECORDS",
      value: stats.totalRecords,
      subtext: "All registered clients",
      icon: <Users size={24} />,
      color: "#3b82f6",
      onClick: null,
    },
    {
      title: "ACTIVE RECORDS",
      value: stats.activeRecords,
      subtext: "Last 30 days",
      icon: <CheckCircle size={24} />,
      color: "#10b981",
      onClick: null,
    },
    {
      title: "PDF UPLOAD",
      value: stats.pdfUpload,
      subtext: "Documents uploaded",
      icon: <Upload size={24} />,
      color: "#f59e0b",
      onClick: null,
    },
    {
      title: "ARCHIVED/DEACTIVATE",
      value: stats.archived,
      subtext: "Archived records",
      icon: <Archive size={24} />,
      color: "#8b5cf6",
      onClick: () => setShowArchivedModal(true),
    },
  ];

  return (
    <div className="cis-container record-dashboard">
      <div className="cis-header">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Record Dashboard
          </h1>
          <p className="text-slate-500 mt-1">
            View and manage all client records
          </p>
        </div>
        <div className="cis-header-actions">
          <div className="cis-search-wrapper">
            <Search className="cis-search-icon" />
            <input
              type="text"
              className="cis-search-input"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
          <button onClick={() => fetchRecords()}>Retry</button>
        </div>
      )}

      <div className="cis-grid">
        {statsCards.map((stat, index) => (
          <div
            key={index}
            className={`cis-card record-stat-card ${stat.onClick ? "clickable" : ""}`}
            onClick={stat.onClick}
            style={{ cursor: stat.onClick ? "pointer" : "default" }}
          >
            <div className="cis-card-top">
              <div>
                <p className="cis-card-title">{stat.title}</p>
                <h2 className="cis-card-value">{stat.value}</h2>
              </div>
              <div
                className="stat-icon"
                style={{
                  backgroundColor: `${stat.color}15`,
                  color: stat.color,
                }}
              >
                {stat.icon}
              </div>
            </div>
            <p className="cis-card-subtext">{stat.subtext}</p>
          </div>
        ))}
      </div>

      <div className="cis-table-container">
        <h2 className="cis-table-title">Active Records</h2>
        {loading ? (
          <div className="loading-spinner">Loading records...</div>
        ) : (
          <div className="table-responsive">
            <table className="cis-table record-table">
              <thead>
                <tr>
                  <th>Client Name</th>
                  <th>Contact Info</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      style={{ textAlign: "center", padding: "60px" }}
                    >
                      <div className="no-data">
                        <FileText size={48} strokeWidth={1} />
                        <p>No records found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => (
                    <tr key={record.id} className="record-row">
                      <td>
                        <div className="client-info">
                          <div className="client-avatar">
                            {record.full_name?.charAt(0) || "U"}
                          </div>
                          <div>
                            <div className="client-name">
                              {record.full_name || "N/A"}
                            </div>
                            <div className="client-id">
                              ID: {record.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="contact-info">
                          <div>
                            <Mail size={14} /> {record.email || "N/A"}
                          </div>
                          <div>
                            <Phone size={14} /> {record.mobile_no || "N/A"}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="date-info">
                          <Calendar size={14} />
                          {formatDate(record.created_at)}
                        </div>
                      </td>
                      <td>
                        <button
                          className="cis-action-btn view-btn"
                          onClick={() => handleViewRecord(record)}
                        >
                          <Eye size={16} />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Archived Records Modal */}
      {showArchivedModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowArchivedModal(false)}
        >
          <div
            className="modal-content archived-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title">
                <Archive size={20} />
                <h3>Archived Records</h3>
              </div>
              <button
                className="modal-close"
                onClick={() => setShowArchivedModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body archived-modal-body">
              {archivedRecords.length === 0 ? (
                <div className="no-data">
                  <Archive size={48} strokeWidth={1} />
                  <p>No archived records found</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="cis-table archived-table">
                    <thead>
                      <tr>
                        <th>Client Name</th>
                        <th>Contact Info</th>
                        <th>Archived Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredArchivedRecords.map((record) => (
                        <tr key={record.id} className="archived-row">
                          <td>
                            <div className="client-info">
                              <div className="client-avatar archived-avatar">
                                {record.full_name?.charAt(0) || "U"}
                              </div>
                              <div>
                                <div className="client-name">
                                  {record.full_name || "N/A"}
                                </div>
                                <div className="client-id">
                                  ID: {record.id.slice(0, 8)}...
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="contact-info">
                              <div>
                                <Mail size={14} /> {record.email || "N/A"}
                              </div>
                              <div>
                                <Phone size={14} /> {record.mobile_no || "N/A"}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="date-info">
                              <Archive size={14} />
                              {formatDateTime(record.archived_at)}
                            </div>
                          </td>
                          <td>
                            <button
                              className="btn-unarchive"
                              onClick={() => handleUnarchive(record)}
                            >
                              <RotateCcw size={16} />
                              Restore
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowArchivedModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Record Detail Modal */}
      {showDetailModal && selectedRecord && fullRecordData && (
        <div
          className="modal-overlay"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="modal-content full-record-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title">
                <FileText size={20} />
                <h3>Complete Client Record</h3>
              </div>
              <button
                className="modal-close"
                onClick={() => setShowDetailModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body full-record-body">
              {/* Header Section */}
              <div className="record-header">
                <div className="record-avatar-large">
                  {fullRecordData.personal?.full_name?.charAt(0) || "U"}
                </div>
                <div className="record-header-info">
                  <h2>{fullRecordData.personal?.full_name || "N/A"}</h2>
                  <div className="record-meta">
                    <span>Record ID: {selectedRecord.id}</span>
                    <span>
                      Created: {formatDate(selectedRecord.created_at)}
                    </span>
                    {selectedRecord.archived_at && (
                      <span>
                        Archived: {formatDate(selectedRecord.archived_at)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 1. PERSONAL INFORMATION */}
              <div className="detail-section">
                <div
                  className="section-header-collapsible"
                  onClick={() => toggleSection("personal")}
                >
                  <div className="section-title">
                    <User size={18} />
                    <h4>1. Personal Information</h4>
                  </div>
                  {expandedSections.personal ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </div>
                {expandedSections.personal && (
                  <div className="section-content info-grid">
                    <div className="info-item">
                      <label>Full Name</label>
                      <p>{fullRecordData.personal?.full_name || "N/A"}</p>
                    </div>
                    <div className="info-item">
                      <label>Father's Name</label>
                      <p>{fullRecordData.personal?.fathers_name || "N/A"}</p>
                    </div>
                    <div className="info-item">
                      <label>Mobile Number</label>
                      <p>{fullRecordData.personal?.mobile_no || "N/A"}</p>
                    </div>
                    <div className="info-item">
                      <label>Email</label>
                      <p>{fullRecordData.personal?.email || "N/A"}</p>
                    </div>
                    <div className="info-item">
                      <label>Current Address</label>
                      <p>
                        {fullRecordData.personal?.residence_address || "N/A"}
                      </p>
                    </div>
                    <div className="info-item">
                      <label>City</label>
                      <p>{fullRecordData.personal?.residence_city || "N/A"}</p>
                    </div>
                    <div className="info-item">
                      <label>Country</label>
                      <p>
                        {fullRecordData.personal?.residence_country || "N/A"}
                      </p>
                    </div>
                    <div className="info-item">
                      <label>Postal Code</label>
                      <p>{fullRecordData.personal?.residence_zip || "N/A"}</p>
                    </div>
                    <div className="info-item">
                      <label>Residence Duration</label>
                      <p>
                        {fullRecordData.personal?.residence_duration || "N/A"}
                      </p>
                    </div>
                    <div className="info-item">
                      <label>Previous Address</label>
                      <p>
                        {fullRecordData.personal?.prev_residence_complete ||
                          "N/A"}
                      </p>
                    </div>
                    <div className="info-item">
                      <label>Previous City</label>
                      <p>
                        {fullRecordData.personal?.prev_residence_city || "N/A"}
                      </p>
                    </div>
                    <div className="info-item">
                      <label>Previous Country</label>
                      <p>
                        {fullRecordData.personal?.prev_residence_country ||
                          "N/A"}
                      </p>
                    </div>
                    <div className="info-item">
                      <label>Secondary Address</label>
                      <p>
                        {fullRecordData.personal?.secondary_address || "N/A"}
                      </p>
                    </div>
                    <div className="info-item">
                      <label>Permanent Address</label>
                      <p>
                        {fullRecordData.personal?.permanent_address || "N/A"}
                      </p>
                    </div>
                    <div className="info-item">
                      <label>Tax Residency</label>
                      <p>{fullRecordData.personal?.tax_residency || "N/A"}</p>
                    </div>
                    <div className="info-item">
                      <label>TIN/SSN</label>
                      <p>{fullRecordData.personal?.tin_ssn || "N/A"}</p>
                    </div>
                    <div className="info-item">
                      <label>Citizenship</label>
                      <p>{fullRecordData.personal?.citizenship || "N/A"}</p>
                    </div>
                    <div className="info-item">
                      <label>Hobbies</label>
                      <p>{fullRecordData.personal?.hobbies || "N/A"}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. TRAVEL DETAILS */}
              <div className="detail-section">
                <div
                  className="section-header-collapsible"
                  onClick={() => toggleSection("travel")}
                >
                  <div className="section-title">
                    <Plane size={18} />
                    <h4>2. Travel Details</h4>
                  </div>
                  {expandedSections.travel ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </div>
                {expandedSections.travel && (
                  <div className="section-content">
                    {fullRecordData.travel?.length > 0 ? (
                      fullRecordData.travel.map((travel, idx) => (
                        <div key={idx} className="sub-section">
                          <p>
                            <strong>Country:</strong> {travel.country || "N/A"}
                          </p>
                          <p>
                            <strong>City:</strong> {travel.city || "N/A"}
                          </p>
                          <p>
                            <strong>Length of Stay:</strong>{" "}
                            {travel.length_of_stay || "N/A"}
                          </p>
                          <p>
                            <strong>Frequency:</strong>{" "}
                            {travel.frequency || "N/A"}
                          </p>
                          <p>
                            <strong>Date of Travel:</strong>{" "}
                            {travel.date_of_travel || "N/A"}
                          </p>
                          <p>
                            <strong>Reason:</strong> {travel.reason || "N/A"}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="no-data">No travel details available</p>
                    )}
                  </div>
                )}
              </div>

              {/* 3. SMOKING & ALCOHOL HABITS */}
              <div className="detail-section">
                <div
                  className="section-header-collapsible"
                  onClick={() => toggleSection("habits")}
                >
                  <div className="section-title">
                    <Droplets size={18} />
                    <h4>3. Smoking & Alcohol Habits</h4>
                  </div>
                  {expandedSections.habits ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </div>
                {expandedSections.habits && (
                  <div className="section-content info-grid">
                    <div className="info-item">
                      <label>Smoker Status</label>
                      <p>{fullRecordData.habits?.smoker_status || "N/A"}</p>
                    </div>
                    <div className="info-item">
                      <label>Cigarettes per Day</label>
                      <p>
                        {fullRecordData.habits?.cigarettes_per_day || "N/A"}
                      </p>
                    </div>
                    <div className="info-item">
                      <label>Previous Smoking History</label>
                      <p>
                        {fullRecordData.habits?.previous_smoking_history ||
                          "N/A"}
                      </p>
                    </div>
                    <div className="info-item">
                      <label>Alcohol Type</label>
                      <p>{fullRecordData.habits?.alcohol_type || "N/A"}</p>
                    </div>
                    <div className="info-item">
                      <label>Alcohol Measurement</label>
                      <p>
                        {fullRecordData.habits?.alcohol_measurement || "N/A"}
                      </p>
                    </div>
                    <div className="info-item">
                      <label>Alcohol Frequency</label>
                      <p>{fullRecordData.habits?.alcohol_frequency || "N/A"}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. PERSONAL MEDICAL DETAILS */}
              <div className="detail-section">
                <div
                  className="section-header-collapsible"
                  onClick={() => toggleSection("medical")}
                >
                  <div className="section-title">
                    <Heart size={18} />
                    <h4>4. Personal Medical Details</h4>
                  </div>
                  {expandedSections.medical ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </div>
                {expandedSections.medical && (
                  <div className="section-content info-grid">
                    <div className="info-item">
                      <label>Weight</label>
                      <p>{fullRecordData.medical?.weight || "N/A"}</p>
                    </div>
                    <div className="info-item">
                      <label>Height</label>
                      <p>{fullRecordData.medical?.height || "N/A"}</p>
                    </div>
                    <div className="info-item">
                      <label>Exercise Details</label>
                      <p>{fullRecordData.medical?.exercise_details || "N/A"}</p>
                    </div>
                    <div className="info-item">
                      <label>Health Disorders</label>
                      <p>
                        {fullRecordData.medical?.health_disorders || "None"}
                      </p>
                    </div>
                    <div className="info-item">
                      <label>Medications</label>
                      <p>{fullRecordData.medical?.medications || "None"}</p>
                    </div>
                    <div className="info-item">
                      <label>Physician Name</label>
                      <p>{fullRecordData.medical?.physician_name || "N/A"}</p>
                    </div>
                    <div className="info-item">
                      <label>Physician Address</label>
                      <p>
                        {fullRecordData.medical?.physician_address || "N/A"}
                      </p>
                    </div>
                    <div className="info-item">
                      <label>Physician Phone</label>
                      <p>{fullRecordData.medical?.physician_phone || "N/A"}</p>
                    </div>
                    <div className="info-item">
                      <label>Years Attended</label>
                      <p>{fullRecordData.medical?.years_attended || "N/A"}</p>
                    </div>
                    <div className="info-item">
                      <label>Last Visit Details</label>
                      <p>
                        {fullRecordData.medical?.last_visit_details || "N/A"}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* 5. FAMILY MEDICAL HISTORY */}
              <div className="detail-section">
                <div
                  className="section-header-collapsible"
                  onClick={() => toggleSection("familyMedical")}
                >
                  <div className="section-title">
                    <UsersIcon size={18} />
                    <h4>5. Family Medical History</h4>
                  </div>
                  {expandedSections.familyMedical ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </div>
                {expandedSections.familyMedical && (
                  <div className="section-content">
                    {fullRecordData.familyMedical?.length > 0 ? (
                      fullRecordData.familyMedical.map((member, idx) => (
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
                      ))
                    ) : (
                      <p className="no-data">
                        No family medical history available
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* 6. EXISTING/PENDING INSURANCE */}
              <div className="detail-section">
                <div
                  className="section-header-collapsible"
                  onClick={() => toggleSection("insurance")}
                >
                  <div className="section-title">
                    <Shield size={18} />
                    <h4>6. Existing/Pending Insurance</h4>
                  </div>
                  {expandedSections.insurance ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </div>
                {expandedSections.insurance && (
                  <div className="section-content">
                    {fullRecordData.insurance?.length > 0 ? (
                      fullRecordData.insurance.map((ins, idx) => (
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
                            <strong>Amount of Cover:</strong>{" "}
                            {formatCurrency(ins.amount_of_cover)}
                          </p>
                          <p>
                            <strong>Premium:</strong>{" "}
                            {formatCurrency(ins.premium)}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="no-data">
                        No insurance information available
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* 7. BUSINESS EMPLOYMENT INFORMATION */}
              <div className="detail-section">
                <div
                  className="section-header-collapsible"
                  onClick={() => toggleSection("business")}
                >
                  <div className="section-title">
                    <Briefcase size={18} />
                    <h4>7. Business Employment Information</h4>
                  </div>
                  {expandedSections.business ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </div>
                {expandedSections.business && (
                  <div className="section-content info-grid">
                    <div className="info-item">
                      <label>Business Name</label>
                      <p>{fullRecordData.business?.business_name || "N/A"}</p>
                    </div>
                    <div className="info-item">
                      <label>Nature of Business</label>
                      <p>{fullRecordData.business?.business_nature || "N/A"}</p>
                    </div>
                    <div className="info-item">
                      <label>Occupation</label>
                      <p>{fullRecordData.business?.occupation || "N/A"}</p>
                    </div>
                    <div className="info-item">
                      <label>Business Type</label>
                      <p>{fullRecordData.business?.business_type || "N/A"}</p>
                    </div>
                    <div className="info-item">
                      <label>Ownership %</label>
                      <p>
                        {fullRecordData.business?.ownership_percent || "N/A"}%
                      </p>
                    </div>
                    <div className="info-item">
                      <label>Business Address</label>
                      <p>
                        {fullRecordData.business?.business_address || "N/A"}
                      </p>
                    </div>
                    <div className="info-item">
                      <label>Business City</label>
                      <p>{fullRecordData.business?.business_city || "N/A"}</p>
                    </div>
                    <div className="info-item">
                      <label>Business Country</label>
                      <p>
                        {fullRecordData.business?.business_country || "N/A"}
                      </p>
                    </div>
                    <div className="info-item">
                      <label>Business Website</label>
                      <p>
                        {fullRecordData.business?.business_website || "N/A"}
                      </p>
                    </div>
                    <div className="info-item">
                      <label>Business Phone</label>
                      <p>{fullRecordData.business?.business_phone || "N/A"}</p>
                    </div>
                    <div className="info-item">
                      <label>Incorporation Date</label>
                      <p>
                        {fullRecordData.business?.incorporation_date || "N/A"}
                      </p>
                    </div>
                    <div className="info-item">
                      <label>Previous Experience</label>
                      <p>
                        {fullRecordData.business?.previous_experience || "N/A"}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* 8. INCOME SOURCES */}
              <div className="detail-section">
                <div
                  className="section-header-collapsible"
                  onClick={() => toggleSection("incomeSources")}
                >
                  <div className="section-title">
                    <DollarSign size={18} />
                    <h4>8. Income Sources</h4>
                  </div>
                  {expandedSections.incomeSources ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </div>
                {expandedSections.incomeSources && (
                  <div className="section-content">
                    {fullRecordData.incomeSources?.length > 0 ? (
                      fullRecordData.incomeSources.map((source, idx) => (
                        <div key={idx} className="sub-section">
                          <p>
                            <strong>Source:</strong>{" "}
                            {source.source_name || "N/A"}
                          </p>
                          <p>
                            <strong>Frequency:</strong>{" "}
                            {source.frequency || "N/A"}
                          </p>
                          <p>
                            <strong>Self Amount:</strong>{" "}
                            {formatCurrency(source.self_amount)}
                          </p>
                          <p>
                            <strong>Spouse Amount:</strong>{" "}
                            {formatCurrency(source.spouse_amount)}
                          </p>
                          <p>
                            <strong>Joint Amount:</strong>{" "}
                            {formatCurrency(source.joint_amount)}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="no-data">No income sources available</p>
                    )}
                  </div>
                )}
              </div>

              {/* 9. FINANCIAL SUMMARY */}
              <div className="detail-section">
                <div
                  className="section-header-collapsible"
                  onClick={() => toggleSection("financial")}
                >
                  <div className="section-title">
                    <DollarSign size={18} />
                    <h4>9. Financial Summary</h4>
                  </div>
                  {expandedSections.financial ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </div>
                {expandedSections.financial && (
                  <div className="section-content info-grid">
                    <div className="info-item">
                      <label>Expenditure Frequency</label>
                      <p>
                        {fullRecordData.financial?.expenditure_frequency ||
                          "N/A"}
                      </p>
                    </div>
                    <div className="info-item">
                      <label>Expenditure Self</label>
                      <p>
                        {formatCurrency(
                          fullRecordData.financial?.expenditure_self,
                        )}
                      </p>
                    </div>
                    <div className="info-item">
                      <label>Expenditure Spouse</label>
                      <p>
                        {formatCurrency(
                          fullRecordData.financial?.expenditure_spouse,
                        )}
                      </p>
                    </div>
                    <div className="info-item">
                      <label>Total Income Self</label>
                      <p>
                        {formatCurrency(
                          fullRecordData.financial?.total_income_self,
                        )}
                      </p>
                    </div>
                    <div className="info-item">
                      <label>Total Income Spouse</label>
                      <p>
                        {formatCurrency(
                          fullRecordData.financial?.total_income_spouse,
                        )}
                      </p>
                    </div>
                    <div className="info-item">
                      <label>Total Income Joint</label>
                      <p>
                        {formatCurrency(
                          fullRecordData.financial?.total_income_joint,
                        )}
                      </p>
                    </div>
                    <div className="info-item">
                      <label>Total Expenditure Joint</label>
                      <p>
                        {formatCurrency(
                          fullRecordData.financial?.total_expenditure_joint,
                        )}
                      </p>
                    </div>
                    <div className="info-item">
                      <label>Disposable Income Self</label>
                      <p>
                        {formatCurrency(
                          fullRecordData.financial?.disposable_income_self,
                        )}
                      </p>
                    </div>
                    <div className="info-item">
                      <label>Disposable Income Spouse</label>
                      <p>
                        {formatCurrency(
                          fullRecordData.financial?.disposable_income_spouse,
                        )}
                      </p>
                    </div>
                    <div className="info-item">
                      <label>Disposable Income Joint</label>
                      <p>
                        {formatCurrency(
                          fullRecordData.financial?.disposable_income_joint,
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* 10. ASSETS & LIABILITIES */}
              <div className="detail-section">
                <div
                  className="section-header-collapsible"
                  onClick={() => toggleSection("assets")}
                >
                  <div className="section-title">
                    <Home size={18} />
                    <h4>10. Assets & Liabilities</h4>
                  </div>
                  {expandedSections.assets ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </div>
                {expandedSections.assets && (
                  <div className="section-content">
                    <div className="assets-liabilities-grid">
                      <div>
                        <h4>Assets</h4>
                        {fullRecordData.assets
                          ?.filter(
                            (a) => a.item_type === "asset" && !a.is_other,
                          )
                          .map((asset, idx) => (
                            <p key={idx}>
                              <strong>{asset.category_name}:</strong>{" "}
                              {formatCurrency(asset.current_year_val)}
                            </p>
                          ))}
                        <p className="total">
                          <strong>Total Assets:</strong>{" "}
                          {formatCurrency(calculateTotalAssets())}
                        </p>
                      </div>
                      <div>
                        <h4>Liabilities</h4>
                        {fullRecordData.assets
                          ?.filter((a) => a.item_type === "liability")
                          .map((liab, idx) => (
                            <p key={idx}>
                              <strong>{liab.category_name}:</strong>{" "}
                              {formatCurrency(liab.current_year_val)}
                            </p>
                          ))}
                        <p className="total">
                          <strong>Total Liabilities:</strong>{" "}
                          {formatCurrency(calculateTotalLiabilities())}
                        </p>
                      </div>
                    </div>
                    <div className="net-worth-summary">
                      <p>
                        <strong>Net Worth:</strong>{" "}
                        {formatCurrency(
                          calculateTotalAssets() - calculateTotalLiabilities(),
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* 11. PROPERTY DETAILS */}
              <div className="detail-section">
                <div
                  className="section-header-collapsible"
                  onClick={() => toggleSection("property")}
                >
                  <div className="section-title">
                    <Home size={18} />
                    <h4>11. Property Details</h4>
                  </div>
                  {expandedSections.property ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </div>
                {expandedSections.property && (
                  <div className="section-content">
                    {fullRecordData.property?.length > 0 ? (
                      fullRecordData.property.map((prop, idx) => (
                        <div key={idx} className="sub-section">
                          <p>
                            <strong>Location:</strong>{" "}
                            {prop.location_details || "N/A"}
                          </p>
                          <p>
                            <strong>Purchase Date:</strong>{" "}
                            {prop.purchase_date || "N/A"}
                          </p>
                          <p>
                            <strong>Purchase Price:</strong>{" "}
                            {formatCurrency(prop.purchase_price)}
                          </p>
                          <p>
                            <strong>Mortgage Amount:</strong>{" "}
                            {formatCurrency(prop.mortgage_amount)}
                          </p>
                          <p>
                            <strong>Current Market Value:</strong>{" "}
                            {formatCurrency(prop.current_market_value)}
                          </p>
                          <p>
                            <strong>Visit Frequency:</strong>{" "}
                            {prop.visit_frequency || "N/A"}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="no-data">No property details available</p>
                    )}
                  </div>
                )}
              </div>

              {/* 12. BANK DETAILS */}
              <div className="detail-section">
                <div
                  className="section-header-collapsible"
                  onClick={() => toggleSection("bank")}
                >
                  <div className="section-title">
                    <CreditCard size={18} />
                    <h4>12. Bank Details</h4>
                  </div>
                  {expandedSections.bank ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </div>
                {expandedSections.bank && (
                  <div className="section-content info-grid">
                    <div className="info-item">
                      <label>Bank Name</label>
                      <p>{fullRecordData.bank?.bank_name || "N/A"}</p>
                    </div>
                    <div className="info-item">
                      <label>Account Number</label>
                      <p>{fullRecordData.bank?.bank_account_number || "N/A"}</p>
                    </div>
                    <div className="info-item">
                      <label>IBAN</label>
                      <p>{fullRecordData.bank?.bank_iban || "N/A"}</p>
                    </div>
                    <div className="info-item">
                      <label>Bank Address</label>
                      <p>{fullRecordData.bank?.bank_address || "N/A"}</p>
                    </div>
                    <div className="info-item">
                      <label>Account Tenure</label>
                      <p>{fullRecordData.bank?.account_tenure || "N/A"}</p>
                    </div>
                    <div className="info-item">
                      <label>Payor Relationship</label>
                      <p>{fullRecordData.bank?.payor_relationship || "N/A"}</p>
                    </div>
                    <div className="info-item">
                      <label>Bank Reference</label>
                      <p>{fullRecordData.bank?.bank_reference || "N/A"}</p>
                    </div>
                    <div className="info-item">
                      <label>Bank Email</label>
                      <p>{fullRecordData.bank?.bank_email || "N/A"}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* 13. POLICY BENEFICIARIES */}
              <div className="detail-section">
                <div
                  className="section-header-collapsible"
                  onClick={() => toggleSection("beneficiary")}
                >
                  <div className="section-title">
                    <UsersIcon size={18} />
                    <h4>13. Policy Beneficiaries</h4>
                  </div>
                  {expandedSections.beneficiary ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </div>
                {expandedSections.beneficiary && (
                  <div className="section-content">
                    {fullRecordData.beneficiary?.length > 0 ? (
                      fullRecordData.beneficiary.map((bene, idx) => (
                        <div key={idx} className="sub-section">
                          <p>
                            <strong>Name:</strong> {bene.full_name || "N/A"}
                          </p>
                          <p>
                            <strong>Type:</strong>{" "}
                            {bene.beneficiary_type || "N/A"}
                          </p>
                          <p>
                            <strong>Relationship:</strong>{" "}
                            {bene.relationship_to_insured || "N/A"}
                          </p>
                          <p>
                            <strong>Date of Birth:</strong>{" "}
                            {bene.date_of_birth || "N/A"}
                          </p>
                          <p>
                            <strong>Passport Number:</strong>{" "}
                            {bene.passport_number || "N/A"}
                          </p>
                          <p>
                            <strong>Share %:</strong>{" "}
                            {bene.allocated_share_percent || "0"}%
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="no-data">
                        No beneficiary information available
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* 14. SPOUSE DETAILS */}
              <div className="detail-section">
                <div
                  className="section-header-collapsible"
                  onClick={() => toggleSection("spouse")}
                >
                  <div className="section-title">
                    <User size={18} />
                    <h4>14. Spouse Details</h4>
                  </div>
                  {expandedSections.spouse ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </div>
                {expandedSections.spouse && (
                  <div className="section-content info-grid">
                    <div className="info-item">
                      <label>Name</label>
                      <p>{fullRecordData.spouse?.full_name || "N/A"}</p>
                    </div>
                    <div className="info-item">
                      <label>Relationship</label>
                      <p>{fullRecordData.spouse?.relationship || "N/A"}</p>
                    </div>
                    <div className="info-item">
                      <label>Nationality</label>
                      <p>{fullRecordData.spouse?.nationality || "N/A"}</p>
                    </div>
                    <div className="info-item">
                      <label>Date of Birth</label>
                      <p>{fullRecordData.spouse?.date_of_birth || "N/A"}</p>
                    </div>
                    <div className="info-item">
                      <label>Contact Number</label>
                      <p>{fullRecordData.spouse?.phone_number || "N/A"}</p>
                    </div>
                    <div className="info-item">
                      <label>Email</label>
                      <p>{fullRecordData.spouse?.email_address || "N/A"}</p>
                    </div>
                    <div className="info-item">
                      <label>Smoking Status</label>
                      <p>{fullRecordData.spouse?.smoking_status || "N/A"}</p>
                    </div>
                    <div className="info-item">
                      <label>Employment Role</label>
                      <p>{fullRecordData.spouse?.job_role || "N/A"}</p>
                    </div>
                    <div className="info-item">
                      <label>Company Name</label>
                      <p>{fullRecordData.spouse?.company_name || "N/A"}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* 15. DEPENDENT DETAILS */}
              <div className="detail-section">
                <div
                  className="section-header-collapsible"
                  onClick={() => toggleSection("dependent")}
                >
                  <div className="section-title">
                    <Baby size={18} />
                    <h4>15. Dependent Details</h4>
                  </div>
                  {expandedSections.dependent ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </div>
                {expandedSections.dependent && (
                  <div className="section-content">
                    {fullRecordData.dependent?.length > 0 ? (
                      fullRecordData.dependent.map((dep, idx) => (
                        <div key={idx} className="sub-section">
                          <p>
                            <strong>Name:</strong> {dep.full_name || "N/A"}
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
                      ))
                    ) : (
                      <p className="no-data">
                        No dependent information available
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowDetailModal(false)}
              >
                Close
              </button>
              {!selectedRecord?.is_archived && (
                <button
                  className="btn-archive"
                  onClick={() => handleArchive(selectedRecord)}
                >
                  <Archive size={16} />
                  Archive Record
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CISRecord;

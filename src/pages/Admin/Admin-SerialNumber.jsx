import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import supabase from "../../config/supabaseClient";
import "./Style/SerialNumber.css";

const AdminSerialNumber = () => {
  const navigate = useNavigate();
  const { darkMode } = useApp();

  const [totalUsers, setTotalUsers] = useState(0);
  const [serial_numbers, setserial_numbers] = useState([]);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  // ===== CARD COUNTS =====
  const [unusedDefault, setUnusedDefault] = useState(0);
  const [unusedAllianz, setUnusedAllianz] = useState(0);
  const [usedSerials, setUsedSerials] = useState(0);
  // Add this with your other useState hooks
  const [filterType, setFilterType] = useState("All");
  // ===== IMPORT =====
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [serial_type, setserial_type] = useState("Default");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedSerial, setSelectedSerial] = useState(null);
  // ===== SORTING =====
  const [sortField, setSortField] = useState(null); // 'is_issued' or 'serial_type'
  const [sortOrder, setSortOrder] = useState("asc"); // 'asc' or 'desc'

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  /* ================= AUTH CHECK ================= */
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        alert("You need to login first");
        navigate("/");
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("account_type")
        .eq("id", session.user.id)
        .single();

      if (error || profile?.account_type?.toLowerCase() !== "admin") {
        alert("Access denied");
        navigate("/");
        return;
      }

      setUser(session.user);
      await fetchTotalUsers();
      await fetchserial_numbers();
      await fetchSerialCardCounts();
    };

    checkAdmin();
  }, [navigate]);

  /* ================= COUNTS ================= */
  const fetchTotalUsers = async () => {
    const { count, error } = await supabase
      .from("serial_number")
      .select("*", { count: "exact", head: true });

    if (error) console.error(error);
    setTotalUsers(count || 0);
  };

  const fetchSerialCardCounts = async () => {
    const { count: defaultUnused } = await supabase
      .from("serial_number")
      .select("*", { count: "exact", head: true })
      .is("Confirm", null)
      .eq("serial_type", "Default");

    const { count: allianzUnused } = await supabase
      .from("serial_number")
      .select("*", { count: "exact", head: true })
      .is("Confirm", null)
      .eq("serial_type", "Allianz Well");

    const { count: used } = await supabase
      .from("serial_number")
      .select("*", { count: "exact", head: true })
      .eq("is_issued", true);

    setUnusedDefault(defaultUnused || 0);
    setUnusedAllianz(allianzUnused || 0);
    setUsedSerials(used || 0);
  };

  /* ================= TABLE (via Backend API to bypass RLS) ================= */
  const fetchserial_numbers = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/admin/serial-numbers');
      const result = await response.json();

      if (result.success) {
        console.log("Fetched serial numbers from backend:", result.data);
        setserial_numbers(result.data || []);

        // Also update card counts from backend response
        if (result.counts) {
          setTotalUsers(result.counts.total || 0);
          setUnusedDefault(result.counts.unusedDefault || 0);
          setUnusedAllianz(result.counts.unusedAllianz || 0);
          setUsedSerials(result.counts.usedSerials || 0);
        }
      } else {
        console.error("Backend error:", result.message);
      }
    } catch (err) {
      console.error("Error fetching serial numbers from API:", err);
    }
  };

  /* ================= IMPORT ================= */
  const handleSubmit = async () => {
    if (!selectedFile) return;
    setUploading(true)
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const lines = e.target.result.split("\n").filter(line => line.trim());
        if (lines.length <= 1) throw new Error("CSV is empty or invalid");

        const { data: existingData } = await supabase
          .from("serial_number")
          .select("serial_number");

        const existingSerials = existingData
          ? existingData.map(d => Number(d.serial_number))
          : [];

        const payload = lines.slice(1)
          .map(row => {
            const [serial] = row.split(",");
            const serialNum = Number(serial);

            if (!serialNum || existingSerials.includes(serialNum)) return null;

            return {
              serial_number: serialNum,
              is_issued: null,
              Confirm: null,
              ResponseID: null,
              serial_type: serial_type,
              date: new Date().toISOString(),
            };
          })
          .filter(Boolean);

        if (!payload.length) {
          alert("All serial numbers already exist.");
          return;
        }

        const { error } = await supabase
          .from("serial_number")
          .insert(payload);

        if (error) throw error;

        await fetchserial_numbers();
        await fetchTotalUsers();
        await fetchSerialCardCounts();

        setShowImportModal(false);
        setSelectedFile(null);
        setserial_type("Default");
        alert("Import successful ✅");

      } catch (err) {
        alert(err.message || "Import failed ❌");
      } finally {
        setUploading(false);
      }
    };

    reader.readAsText(selectedFile);
  };

/* ================= VIEW MODAL LOGIC ================= */  const handleView = (serial) => {
    setSelectedSerial(serial);
    setShowViewModal(true);
  }

  return (
    <div className={`dashboard-content ${darkMode ? "dark-mode" : ""}`} style={{ padding: '40px 50px' }}>
      {/* Header Row */}
      <div className="header-row" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="title" style={{ fontSize: "28px", fontWeight: "700", color: "#333" }}>Serial Numbers</h1>
          <p className="subtitle" style={{ color: "#777" }}>Manage and track all serial numbers</p>
        </div>
      </div>

      {/* ================= CARDS ================= */}
      <div className="admin-cards-grid" style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "20px",
        marginBottom: "30px"
      }}>
        <div className="card admin-card stats-card" style={{ background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
          <p style={{ color: "#64748b", fontSize: "14px", fontWeight: "600", marginBottom: "5px" }}>Total Serial Numbers</p>
          <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a", margin: 0 }}>{totalUsers}</h2>
        </div>
        <div className="card admin-card stats-card" style={{ background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
          <p style={{ color: "#64748b", fontSize: "14px", fontWeight: "600", marginBottom: "5px" }}>Unused (Default)</p>
          <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a", margin: 0 }}>{unusedDefault}</h2>
        </div>
        <div className="card admin-card stats-card" style={{ background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
          <p style={{ color: "#64748b", fontSize: "14px", fontWeight: "600", marginBottom: "5px" }}>Unused (Allianz Well)</p>
          <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a", margin: 0 }}>{unusedAllianz}</h2>
        </div>
        <div className="card admin-card stats-card used" style={{ background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
          <p style={{ color: "#64748b", fontSize: "14px", fontWeight: "600", marginBottom: "5px" }}>Used Serials</p>
          <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a", margin: 0 }}>{usedSerials}</h2>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="content-container animate-spring delay-2" style={{
        background: "white",
        borderRadius: "16px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        padding: "24px",
        border: "1px solid rgba(0,0,0,0.05)"
      }}>
        <div className="table-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            {/* ================= FILTER CONTROLS ================= */}
            <div className="filter-button-group">
              {["All", "Default", "Allianz Well", "Manual"].map((type) => (
                <button
                  key={type}
                  className={`filter-btn ${filterType === type ? "active" : ""}`}
                  onClick={() => {
                    setFilterType(type);
                    setCurrentPage(1);
                  }}
                >
                  {type === "All" ? "Show All" : type}
                </button>
              ))}
            </div>
          </div>
          <button className="import-btn" onClick={() => setShowImportModal(true)} style={{
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.2)"
          }}>
            <i className="fa-solid fa-file-csv"></i> Import CSV
          </button>
        </div>

        <div className="table-container">
          <table className="serial-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", fontSize: "13px" }}>Serial Number</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", fontSize: "13px" }}>Confirm</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", fontSize: "13px" }}>Issued</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", fontSize: "13px" }}>Requested By</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", fontSize: "13px" }}>Serial Type</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", fontSize: "13px" }}>Date</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", fontSize: "13px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                // 1. First, Filter the data based on your buttons (All, Default, Allianz, etc.)
                const filteredData = serial_numbers.filter((item) => {
                  if (filterType === "All") return true;
                  return item.serial_type === filterType;
                });

                // 2. Second, Sort the filtered data
                const sortedData = [...filteredData].sort((a, b) => {
                  if (!sortField) return 0;
                  let aValue, bValue;
                  if (sortField === "is_issued") {
                    aValue = a.is_issued ? 1 : 0;
                    bValue = b.is_issued ? 1 : 0;
                  } else if (sortField === "serial_type") {
                    aValue = (a.serial_type || "").toLowerCase();
                    bValue = (b.serial_type || "").toLowerCase();
                  }

                  if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
                  if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
                  return 0;
                });

                // 3. Third, Calculate Pagination for the 10 records
                const recordsPerPage = 10;
                const lastIndex = currentPage * recordsPerPage;
                const firstIndex = lastIndex - recordsPerPage;
                const currentRecords = sortedData.slice(firstIndex, lastIndex);

                // 4. Render Logic
                if (currentRecords.length === 0) {
                  return (
                    <tr>
                      <td colSpan="8" style={{ textAlign: "center", padding: "40px", color: "#666" }}>
                        No records found for "{filterType}"
                      </td>
                    </tr>
                  );
                }

                return currentRecords.map((item, index) => (
                  <tr key={item.serial_id || index} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    {/* We use firstIndex + index + 1 so that Page 2 starts at 17, 18, etc. */}
                    <td style={{ padding: "16px 12px", color: "#1e293b", fontWeight: "500", fontSize: "14px" }}>{item.serial_number}</td>
                    <td style={{ padding: "16px 12px", color: "#475569", fontSize: "14px" }}>{(item.is_issued || item.submissionStatus === 'Issued') ? "Yes" : "-"}</td>
                    <td style={{ padding: "16px 12px", color: "#475569", fontSize: "14px" }}>{(item.Confirm || item.submissionStatus === 'Issued') ? "Yes" : "-"}</td>
                    <td style={{ padding: "16px 12px", color: "#475569", fontSize: "14px" }}>
                      {item.issuer ? (
                        <span
                          style={{ color: '#2563eb', cursor: 'pointer', fontWeight: '500', textDecoration: 'underline' }}
                          onClick={() => navigate("/admin/ManageUsers")}
                        >
                          {item.issuer.first_name} {item.issuer.last_name}
                        </span>
                      ) : item.submissionProfile ? (
                        <span
                          style={{ color: '#2563eb', cursor: 'pointer', fontWeight: '500', textDecoration: 'underline' }}
                          onClick={() => navigate("/admin/ManageUsers")}
                        >
                          {item.submissionProfile.first_name} {item.submissionProfile.last_name}
                        </span>
                      ) : (item.RequestedBy || item.ResponseID || "-")}
                    </td>
                    <td style={{ padding: "16px 12px" }}>
                      <span className={`type-badge ${item.serial_type?.replace(/\s+/g, '-').toLowerCase()}`} style={{
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "500",
                        backgroundColor: item.serial_type === 'Default' ? '#e0f2fe' : '#f0fdf4',
                        color: item.serial_type === 'Default' ? '#0369a1' : '#15803d'
                      }}>
                        {item.serial_type}
                      </span>
                    </td>
                    <td style={{ padding: "16px 12px", color: "#475569", fontSize: "14px" }}>{new Date(item.date).toLocaleString()}</td>
                    <td style={{ padding: "16px 12px" }}>
                      <button className="view-btn" onClick={() => handleView(item)} style={{
                        backgroundColor: 'transparent',
                        color: '#3b82f6',
                        border: '1px solid #3b82f6',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}>
                        View
                      </button>
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
        {/* ================= PAGINATION CONTROLS ================= */}
        <div className="pagination-wrapper" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px" }}>
          <button
            className="pagination-arrow-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px"
            }}
          >
            <i className="fa-solid fa-chevron-left"></i> Previous
          </button>

          <div className="pagination-info" style={{ fontSize: "14px" }}>
            <span className="current-page-text" style={{ fontWeight: "600" }}>{currentPage}</span>
            <span className="total-pages-text"> of {Math.ceil(
              serial_numbers.filter(i => filterType === "All" || i.serial_type === filterType).length / 16
            ) || 1}</span>
          </div>

          <button
            className="pagination-arrow-btn"
            disabled={currentPage >= Math.ceil(
              serial_numbers.filter(i => filterType === "All" || i.serial_type === filterType).length / 16
            )}
            onClick={() => setCurrentPage(prev => prev + 1)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px"
            }}
          >
            Next <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>

      {/* ================= MODAL ================= */}
      {showViewModal && selectedSerial && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-title">Serial Tracking</div>
            <div className="modal-form">

              {/* Basic Info Section */}
              <div style={{ marginBottom: "15px", fontSize: "14px", lineHeight: "1.6" }}>
                <p><strong>Serial Number:</strong> {selectedSerial.serial_number}</p>
                <p><strong>Serial Type:</strong> {selectedSerial.serial_type}</p>
                <p><strong>Requested by:</strong> {
                  selectedSerial.issuer ?
                    `${selectedSerial.issuer.first_name} ${selectedSerial.issuer.last_name}` :
                    selectedSerial.submissionProfile ?
                      `${selectedSerial.submissionProfile.first_name} ${selectedSerial.submissionProfile.last_name}` :
                      (selectedSerial.RequestedBy || selectedSerial.ResponseID || "Not yet taken")
                }</p>
                <p><strong>Request Date:</strong> {new Date(selectedSerial.date).toLocaleDateString()}</p>
              </div>

              {/* Tracking Status Section */}
              <div className="hierarchy-section" style={{ borderTop: '1px solid #eee', marginTop: '15px', paddingTop: '15px' }}>
                <h3 style={{ fontSize: "16px", marginBottom: "10px" }}>Tracking Status</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div className="hierarchy-card">
                    <span><span style={{ color: "var(--success-color)", marginRight: "10px" }}>●</span>Serial Created</span>
                    <span>{new Date(selectedSerial.date).toLocaleString()}</span>
                  </div>
                  <div className="hierarchy-card">
                    <span><span style={{ color: (selectedSerial.is_issued || selectedSerial.submissionStatus === 'Issued') ? "var(--success-color)" : "#ccc", marginRight: "10px" }}>●</span>Serial Confirm</span>
                    <span className={`status-badge ${(selectedSerial.is_issued || selectedSerial.submissionStatus === 'Issued') ? 'active' : 'inactive'}`}>
                      {(selectedSerial.is_issued || selectedSerial.submissionStatus === 'Issued') ? "Confirmed" : "In Progress"}
                    </span>
                  </div>
                  <div className="hierarchy-card">
                    <span><span style={{ color: (selectedSerial.ResponseID || selectedSerial.submissionStatus === 'Issued') ? "var(--success-color)" : "#ccc", marginRight: "10px" }}>●</span>Serial Issued</span>
                    <span className={`status-badge ${(selectedSerial.ResponseID || selectedSerial.submissionStatus === 'Issued') ? 'active' : 'inactive'}`}>
                      {(selectedSerial.ResponseID || selectedSerial.submissionStatus === 'Issued') ? "Completed" : "Pending"}
                    </span>
                  </div>
                </div>
              </div>

              {/* --- NEW: ATTACHED DOCUMENTS SECTION (NON-VIEWABLE) --- */}
              <div className="file-info-section" style={{ borderTop: '1px solid #eee', marginTop: '15px', paddingTop: '15px' }}>
                <h3 style={{ fontSize: "16px", marginBottom: "10px" }}>Attached Documents</h3>
                {selectedSerial.file_name ? (
                  <div className="hierarchy-card" style={{ backgroundColor: '#f9f9f9', cursor: 'not-allowed' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '13px' }}>
                        📄 {selectedSerial.file_name}
                      </span>
                      <span style={{ fontSize: '11px', color: '#666' }}>
                        Type: {selectedSerial.file_type || 'Unknown'} | Added: {new Date(selectedSerial.file_added_date || selectedSerial.date).toLocaleDateString()}
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#d9534f', fontStyle: 'italic' }}>
                      View Restricted
                    </span>
                  </div>
                ) : (
                  <div style={{ fontSize: '13px', color: '#999', textAlign: 'center', padding: '10px' }}>
                    No files uploaded for this serial.
                  </div>
                )}
              </div>
              {/* ----------------------------------------------------- */}

            </div>

            <div className="modal-buttons">
              <button className="modal-close" onClick={() => setShowViewModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {showImportModal && (
        <div className="modal-overlay" style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.45)", display: "flex",
          justifyContent: "center", alignItems: "center", zIndex: 1000
        }}>
          <div className="modal-content" style={{
            background: darkMode ? "#1e293b" : "#fff", borderRadius: "8px", width: "100%", maxWidth: "600px", minHeight: "350px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)", overflow: "visible", display: "flex", flexDirection: "column",
            border: darkMode ? "1px solid #334155" : "none"
          }}>
            <div className="modal-title" style={{
              padding: "20px 24px", borderBottom: darkMode ? "1px solid #334155" : "1px solid #e2e8f0",
              fontSize: "20px", fontWeight: "700", color: darkMode ? "#f8fafc" : "#003266", margin: 0,
              borderTopLeftRadius: "8px", borderTopRightRadius: "8px",
              backgroundColor: darkMode ? "#0f172a" : "transparent"
            }}>
              Import CSV
            </div>

            <div className="modal-form" style={{ padding: "24px", flexGrow: 1, display: "flex", flexDirection: "column", overflow: "visible" }}>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                style={{
                  display: "block", width: "100%", padding: "8px",
                  border: darkMode ? "1px solid #334155" : "1px solid #cbd5e1", borderRadius: "8px",
                  fontSize: "14px", color: darkMode ? "#f8fafc" : "#334155", marginBottom: "16px",
                  boxSizing: "border-box", backgroundColor: darkMode ? "#0f172a" : "#fff"
                }}
              />
              <label style={{
                display: "block", fontSize: "11px", fontWeight: "600",
                color: darkMode ? "#94a3b8" : "#64748b", textTransform: "uppercase", marginBottom: "6px"
              }}>
                Serial Type
              </label>

              <div
                style={{ position: "relative" }}
                tabIndex={0}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) {
                    setIsDropdownOpen(false);
                  }
                }}
              >
                <div
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    width: "100%", padding: "10px",
                    border: isDropdownOpen ? (darkMode ? "1px solid #475569" : "1px solid #cbd5e1") : (darkMode ? "1px solid #334155" : "1px solid #cbd5e1"),
                    borderRadius: isDropdownOpen ? "8px 8px 0 0" : "8px",
                    fontSize: "14px", color: darkMode ? "#f8fafc" : "#003266", boxSizing: "border-box",
                    backgroundColor: darkMode ? "#0f172a" : "#fff", cursor: "pointer",
                    boxShadow: isDropdownOpen ? "0 0 0 1px rgba(0, 0, 0, 0.05)" : "none",
                    transition: "all 0.2s",
                    fontWeight: "500"
                  }}
                >
                  {serial_type || "Select Type"}
                  <i
                    className={`fa-solid fa-chevron-${isDropdownOpen ? 'up' : 'down'}`}
                    style={{ color: darkMode ? '#94a3b8' : '#003266', fontSize: '12px', transition: "transform 0.2s" }}
                  ></i>
                </div>
                {isDropdownOpen && (
                  <div className="custom-scrollbar-hide" style={{
                    position: "absolute", top: "100%", left: 0, width: "100%",
                    marginTop: "-1px", backgroundColor: darkMode ? "#1e293b" : "#fff",
                    border: darkMode ? "1px solid #334155" : "1px solid #cbd5e1", borderRadius: "0 0 8px 8px",
                    boxShadow: darkMode ? "0 4px 12px rgba(0, 0, 0, 0.5)" : "0 4px 12px rgba(0, 0, 0, 0.1)",
                    zIndex: 2000, overflowY: "auto", overflowX: "hidden", maxHeight: "150px",
                    scrollbarWidth: "none", msOverflowStyle: "none"
                  }}>
                    {["Default", "Allianz Well"].map((type) => (
                      <div
                        key={type}
                        onClick={() => {
                          setserial_type(type);
                          setIsDropdownOpen(false);
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = type === serial_type
                            ? (darkMode ? '#3b82f6' : '#002244')
                            : (darkMode ? '#334155' : '#f8fafc');
                          e.target.style.color = type === serial_type
                            ? '#ffffff'
                            : (darkMode ? '#f8fafc' : '#003266');
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = type === serial_type
                            ? (darkMode ? '#2563eb' : '#003266')
                            : (darkMode ? '#1e293b' : '#ffffff');
                          e.target.style.color = type === serial_type
                            ? '#ffffff'
                            : (darkMode ? '#cbd5e1' : '#334155');
                        }}
                        style={{
                          padding: "12px 14px", cursor: "pointer", fontSize: "14px",
                          color: type === serial_type ? "#ffffff" : (darkMode ? "#cbd5e1" : "#334155"),
                          backgroundColor: type === serial_type ? (darkMode ? "#2563eb" : "#003266") : (darkMode ? "#1e293b" : "#ffffff"),
                          fontWeight: type === serial_type ? "600" : "400",
                          borderBottom: darkMode ? "1px solid #334155" : "1px solid #e2e8f0",
                          transition: "background-color 0.2s, color 0.2s"
                        }}
                      >
                        {type}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-buttons" style={{
              padding: "16px 24px", borderTop: darkMode ? "1px solid #334155" : "1px solid #e2e8f0",
              display: "flex", justifyContent: "flex-end", gap: "12px",
              borderBottomLeftRadius: "8px", borderBottomRightRadius: "8px",
              backgroundColor: darkMode ? "#0f172a" : "#f8fafc"
            }}>
              <button
                className="modal-close"
                onClick={() => {
                  setShowImportModal(false);
                  setIsDropdownOpen(false);
                }}
                style={{
                  padding: "8px 16px", borderRadius: "8px", border: darkMode ? "1px solid #475569" : "1px solid #e2e8f0",
                  backgroundColor: darkMode ? "#1e293b" : "#fff", color: darkMode ? "#cbd5e1" : "#475569", fontSize: "14px",
                  fontWeight: "500", cursor: "pointer"
                }}
              >
                Cancel
              </button>
              <button
                className="modal-submit"
                onClick={handleSubmit}
                disabled={uploading}
                style={{
                  padding: "8px 24px", borderRadius: "8px", border: "none",
                  backgroundColor: darkMode ? "#2563eb" : "#003266", color: "#fff", fontSize: "14px",
                  fontWeight: "600", cursor: uploading ? "not-allowed" : "pointer",
                  opacity: uploading ? 0.7 : 1
                }}
              >
                {uploading ? "Uploading..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSerialNumber;
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

  /* ================= TABLE ================= */
  const fetchserial_numbers = async () => {
    const { data, error } = await supabase
      .from("serial_number")
      .select("*")
      .order("date", { ascending: false });

    if (error) console.error(error);
    else setserial_numbers(data || []);
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
    <div className="dashboard-content" style={{ padding: '40px 50px' }}>
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
            <div className="filter-button-group" style={{ display: "flex", gap: "8px" }}>
              {["All", "Default", "Allianz Well", "Manual"].map((type) => (
                <button
                  key={type}
                  className={`filter-btn ${filterType === type ? "active" : ""}`}
                  onClick={() => {
                    setFilterType(type);
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: "8px 16px",
                    cursor: "pointer",
                    borderRadius: "6px",
                    border: "1px solid #e2e8f0",
                    backgroundColor: filterType === type ? "#0f172a" : "#fff",
                    color: filterType === type ? "#fff" : "#64748b",
                    fontSize: "13px",
                    fontWeight: "500",
                    transition: "all 0.2s ease"
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
                <th style={{ padding: "12px", textAlign: "left", color: "#64748b", fontWeight: "600", fontSize: "13px" }}>#</th>
                <th style={{ padding: "12px", textAlign: "left", color: "#64748b", fontWeight: "600", fontSize: "13px" }}>Serial Number</th>
                <th style={{ padding: "12px", textAlign: "left", color: "#64748b", fontWeight: "600", fontSize: "13px" }}>Confirm</th>
                <th style={{ padding: "12px", textAlign: "left", color: "#64748b", fontWeight: "600", fontSize: "13px" }}>Issued</th>
                <th style={{ padding: "12px", textAlign: "left", color: "#64748b", fontWeight: "600", fontSize: "13px" }}>Response ID</th>
                <th style={{ padding: "12px", textAlign: "left", color: "#64748b", fontWeight: "600", fontSize: "13px" }}>Serial Type</th>
                <th style={{ padding: "12px", textAlign: "left", color: "#64748b", fontWeight: "600", fontSize: "13px" }}>Date</th>
                <th style={{ padding: "12px", textAlign: "left", color: "#64748b", fontWeight: "600", fontSize: "13px" }}>Action</th>
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
                    <td style={{ padding: "16px 12px", color: "#475569", fontSize: "14px" }}>{firstIndex + index + 1}</td>
                    <td style={{ padding: "16px 12px", color: "#1e293b", fontWeight: "500", fontSize: "14px" }}>{item.serial_number}</td>
                    <td style={{ padding: "16px 12px", color: "#475569", fontSize: "14px" }}>{item.is_issued ? "Yes" : "-"}</td>
                    <td style={{ padding: "16px 12px", color: "#475569", fontSize: "14px" }}>{item.Confirm ? "Yes" : "-"}</td>
                    <td style={{ padding: "16px 12px", color: "#475569", fontSize: "14px" }}>{item.ResponseID || "-"}</td>
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
              border: "none",
              background: "transparent",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
              color: currentPage === 1 ? "#cbd5e1" : "#64748b",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px"
            }}
          >
            <i className="fa-solid fa-chevron-left"></i> Previous
          </button>

          <div className="pagination-info" style={{ fontSize: "14px", color: "#64748b" }}>
            <span className="current-page-text" style={{ fontWeight: "600", color: "#0f172a" }}>{currentPage}</span>
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
              border: "none",
              background: "transparent",
              cursor: currentPage >= Math.ceil(serial_numbers.length / 10) ? "not-allowed" : "pointer",
              color: currentPage >= Math.ceil(serial_numbers.length / 10) ? "#cbd5e1" : "#64748b",
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
          <div className="modal" style={{ width: "450px" }}> {/* Slightly wider for better table fit */}
            <h2>Serial Tracking</h2>
            <div style={{ marginBottom: "15px", fontSize: "14px", lineHeight: "1.6" }}>
              <p><strong>Serial Number:</strong> {selectedSerial.serial_number}</p>
              <p><strong>Serial Type:</strong> {selectedSerial.serial_type}</p>
              <p><strong>Requested by:</strong> {selectedSerial.ResponseID || "Not yet taken"}</p>
              <p><strong>Request Date:</strong> {new Date(selectedSerial.date).toLocaleDateString()}</p>
            </div>
            <hr style={{ border: "0.5px solid #eee", margin: "15px 0" }} />
            <h3 style={{ fontSize: "16px", marginBottom: "10px" }}>Tracking Status</h3>
            <ul style={{ listStyle: "none", paddingLeft: 0, fontSize: "14px" }}>
              <li style={{ marginBottom: "8px" }}>
                <span style={{ color: "var(--success-color)", marginRight: "10px" }}>●</span>
                <strong>Serial Created:</strong> {new Date(selectedSerial.date).toLocaleString()}
              </li>
              <li style={{ marginBottom: "8px" }}>
                <span style={{ color: selectedSerial.is_issued ? "var(--success-color)" : "#ccc", marginRight: "10px" }}>●</span>
                <strong>Serial confirm:</strong> {selectedSerial.is_issued ? "Confirmed" : "In Progress"}
              </li>
              <li style={{ marginBottom: "8px" }}>
                <span style={{ color: selectedSerial.ResponseID ? "var(--success-color)" : "#ccc", marginRight: "10px" }}>●</span>
                <strong>Serial Issued:</strong> {selectedSerial.ResponseID ? "Completed" : "Pending"}
              </li>
            </ul>
            <div className="modal-buttons" style={{ marginTop: "20px" }}>
              <button className="cancel-btn" onClick={() => setShowViewModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showImportModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Import CSV</h2>

            <input
              type="file"
              accept=".csv"
              onChange={(e) => setSelectedFile(e.target.files[0])}
            />

            <label>Serial Type</label>
            <select
              value={serial_type}
              onChange={(e) => setserial_type(e.target.value)}
              className="file-type-select"
            >
              <option value="Default">Default</option>
              <option value="Allianz Well">Allianz Well</option>
            </select>

            <div className="modal-buttons">
              <button
                className="cancel-btn"
                onClick={() => setShowImportModal(false)}
              >
                Cancel
              </button>
              <button
                className="submit-btn"
                onClick={handleSubmit}
                disabled={uploading}
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
// - Updated Actions Column (Text + Colors)
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import supabase from "../../config/supabaseClient";
import { logActivity } from "../../utils/logActivity";
import "./Style/Policies.css";
import { toTitleCase } from "../../utils/textUtils";

const AdminPolicies = () => {
  const navigate = useNavigate();
  const { darkMode } = useApp();
  const [user, setUser] = useState(null);
  const [viewArchived, setViewArchived] = useState(false);

  // Policies Data
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Agencies Data
  const [agencies, setAgencies] = useState([]);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPolicy, setCurrentPolicy] = useState(null);

  const [formData, setFormData] = useState({
    policy_name: "",
    form_type: "VUL",
    active_status: true,
    agency: "",
    request_type: "manual",
  });

  // --- Requirements State ---
  const [requirements, setRequirements] = useState([]);

  // Confirmation Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [policyToToggle, setPolicyToToggle] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    checkAdmin();
    fetchAgencies();
  }, [navigate]);

  const checkAdmin = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      alert("Please login first");
      navigate("/");
      return;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("account_type")
      .eq("id", session.user.id)
      .single();

    const accountType = profile?.account_type?.toString().trim().toUpperCase();
    if (
      !accountType ||
      (accountType !== "ADMIN" && accountType !== "SUPER_ADMIN")
    ) {
      alert("Access denied");
      navigate("/");
      return;
    }
    setUser(session.user);
    fetchPolicies();
  };

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("policy")
        .select(`*, agency_details:agency (agency_id, name)`)
        .order("policy_id", { ascending: false });

      if (error) throw error;
      setPolicies(data || []);
    } catch (err) {
      console.error(err);
      alert(`Failed to fetch policies: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgencies = async () => {
    const { data } = await supabase
      .from("agency")
      .select("*")
      .order("name", { ascending: true });
    setAgencies(data || []);
  };

  // --- Requirements Logic ---
  const addRequirement = () => {
    setRequirements([
      ...requirements,
      { id: `req_${Date.now()}`, label: "", required: true },
    ]);
  };

  const removeRequirement = (index) => {
    const newReqs = [...requirements];
    newReqs.splice(index, 1);
    setRequirements(newReqs);
  };

  const updateRequirement = (index, field, value) => {
    const newReqs = [...requirements];
    newReqs[index][field] = value;
    setRequirements(newReqs);
  };

  // Handle Form Input
  const handleChange = (e) => {
    let value = e.target.value;
    if (e.target.name === "policy_name") value = toTitleCase(value);
    setFormData({ ...formData, [e.target.name]: value });
  };

  // Open Modal
  const openAddModal = () => {
    setIsEditing(false);
    setFormData({
      policy_name: "",
      form_type: "VUL",
      active_status: true,
      agency: "",
      request_type: "manual",
    });
    setRequirements([]);
    setCurrentPolicy(null);
    setShowModal(true);
  };

  const openEditModal = (policy) => {
    setIsEditing(true);
    setCurrentPolicy(policy);
    setFormData({
      policy_name: policy.policy_name,
      form_type: policy.form_type || "VUL",
      active_status: policy.active_status,
      agency: policy.agency || "",
      request_type: policy.request_type || "manual",
    });
    setRequirements(policy.requirements || []);
    setShowModal(true);
  };

  // Submit Policy
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.policy_name) {
      alert("Please fill in all fields");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        policy_name: formData.policy_name,
        policy_type: formData.policy_name,
        form_type: formData.form_type,
        active_status: formData.active_status,
        agency: formData.agency || null,
        request_type: formData.request_type,
        requirements: requirements,
      };

      if (isEditing && currentPolicy) {
        const { error } = await supabase
          .from("policy")
          .update(payload)
          .eq("policy_id", currentPolicy.policy_id);
        if (error) throw error;

        await logActivity(
          "POLICY_UPDATE",
          `Updated policy: ${formData.policy_name}`,
        );
        alert("Policy updated successfully!");
      } else {
        const { error } = await supabase.from("policy").insert([payload]);
        if (error) throw error;

        await logActivity(
          "POLICY_CREATE",
          `Created new policy: ${formData.policy_name}`,
        );
        alert("Policy added successfully!");
      }

      setShowModal(false);
      fetchPolicies();
    } catch (err) {
      console.error(err);
      alert("Operation failed: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const openConfirmModal = (policy) => {
    setPolicyToToggle(policy);
    setShowConfirmModal(true);
  };

  const confirmToggleStatus = async () => {
    if (!policyToToggle) return;
    try {
      const newStatus = !policyToToggle.active_status;
      const { error } = await supabase
        .from("policy")
        .update({ active_status: newStatus })
        .eq("policy_id", policyToToggle.policy_id);

      if (error) throw error;

      await logActivity(
        "POLICY_STATUS_CHANGE",
        `Changed status of policy ${policyToToggle.policy_name} to ${newStatus ? "Active" : "Archived"}`,
      );

      setShowConfirmModal(false);
      setPolicyToToggle(null);
      fetchPolicies();
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  const filteredPolicies = policies.filter((policy) =>
    viewArchived ? !policy.active_status : policy.active_status,
  );

  return (
    <div className="dashboard-content" style={{ padding: "40px 50px" }}>
      {/* Header Row */}
      <div
        className="header-row"
        style={{
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1
            className="title"
            style={{
              fontSize: "28px",
              fontWeight: "700",
              color: "#333",
              marginBottom: "4px",
            }}
          >
            Policy Management
          </h1>
          <p className="subtitle" style={{ color: "#666" }}>
            Manage system policies and requirements
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className="add-policy-btn"
            onClick={() => setViewArchived(!viewArchived)}
            style={{
              backgroundColor: viewArchived ? "#475569" : "#003266",
              color: "white",
              border: "none",
              padding: "10px 16px",
              borderRadius: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontWeight: "500",
            }}
          >
            <i
              className={`fa-solid ${viewArchived ? "fa-list-check" : "fa-box-archive"}`}
            ></i>
            {viewArchived ? " View Active" : " View Archived"}
          </button>
          <button
            className="add-policy-btn"
            onClick={openAddModal}
            style={{
              backgroundColor: "#2563eb",
              color: "white",
              border: "none",
              padding: "10px 16px",
              borderRadius: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontWeight: "600",
              boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.2)",
            }}
          >
            <i className="fa-solid fa-plus"></i> Add New Policy
          </button>
        </div>
      </div>

      {loading ? (
        <p className="loader">Loading policies...</p>
      ) : (
        <div
          className="content-container animate-spring delay-2"
          style={{
            background: "white",
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            padding: "24px",
            border: "1px solid rgba(0,0,0,0.05)",
          }}
        >
          <div className="table-container">
            <table
              className="policies-table"
              style={{ width: "100%", borderCollapse: "collapse" }}
            >
              <thead>
                <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      fontWeight: "600",
                      fontSize: "13px",
                    }}
                  >
                    Actions
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      fontWeight: "600",
                      fontSize: "13px",
                    }}
                  >
                    Policy Name
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      fontWeight: "600",
                      fontSize: "13px",
                    }}
                  >
                    Form Type
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      fontWeight: "600",
                      fontSize: "13px",
                    }}
                  >
                    Requirements
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      fontWeight: "600",
                      fontSize: "13px",
                    }}
                  >
                    Request Type
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      fontWeight: "600",
                      fontSize: "13px",
                    }}
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPolicies.map((policy) => (
                  <tr
                    key={policy.policy_id}
                    style={{ borderBottom: "1px solid #f1f5f9" }}
                  >
                    <td
                      style={{
                        padding: "16px 12px",
                        fontWeight: "500",
                        color: "#1e293b",
                      }}
                    >
                      {policy.policy_name}
                    </td>
                    <td style={{ padding: "16px 12px" }}>
                      <span
                        className="policy-type-badge"
                        style={{
                          backgroundColor: "#f1f5f9",
                          color: "#475569",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "600",
                        }}
                      >
                        {policy.form_type || "N/A"}
                      </span>
                    </td>
                    <td style={{ padding: "16px 12px" }}>
                      <small
                        className="files-count-badge"
                        style={{
                          color: "#666",
                          background: "#f8fafc",
                          padding: "4px 8px",
                          borderRadius: "20px",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        {policy.requirements?.length || 0} files required
                      </small>
                    </td>
                    <td style={{ padding: "16px 12px", color: "#475569" }}>
                      {toTitleCase(policy.request_type) || "-"}
                    </td>
                    <td style={{ padding: "16px 12px" }}>
                      <span
                        className={`status-badge ${policy.active_status ? "status-active" : "status-inactive"}`}
                        style={{
                          padding: "4px 10px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "500",
                          backgroundColor: policy.active_status
                            ? "#dcfce7"
                            : "#f1f5f9",
                          color: policy.active_status ? "#166534" : "#64748b",
                        }}
                      >
                        {policy.active_status ? "Active" : "Archived"}
                      </span>
                    </td>

                    {/* --- UPDATED ACTIONS COLUMN (TEXT + COLORS) --- */}
                    <td style={{ padding: "16px 12px" }}>
                      <div
                        className="policy-actions"
                        style={{ display: "flex", gap: "8px" }}
                      >
                        <button
                          className={
                            policy.active_status
                              ? "policy-action-archive"
                              : "policy-action-restore"
                          }
                          onClick={() => openConfirmModal(policy)}
                          style={{
                            backgroundColor: policy.active_status
                              ? "#fff1f2"
                              : "#f0fdf4", // Red for Archive, Green for Restore
                            color: policy.active_status ? "#be123c" : "#15803d",
                            border: `1px solid ${policy.active_status ? "#fecdd3" : "#bbf7d0"}`,
                            padding: "6px 12px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "12px",
                            fontWeight: "600",
                          }}
                        >
                          <i
                            className={`fa-solid ${policy.active_status ? "fa-box-archive" : "fa-rotate-left"}`}
                          ></i>
                          {policy.active_status ? "Archive" : "Restore"}
                        </button>

                        <button
                          className="policy-action-edit"
                          onClick={() => openEditModal(policy)}
                          style={{
                            backgroundColor: "#eff6ff",
                            color: "#2563eb",
                            border: "1px solid #bfdbfe",
                            padding: "6px 12px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "12px",
                            fontWeight: "600",
                          }}
                        >
                          <i className="fa-solid fa-pen"></i>
                          Edit
                        </button>
                      </div>
                    </td>
                    {/* ------------------------------------------- */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD/EDIT MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-title">
              {isEditing ? "Edit Policy" : "Add New Policy"}
            </div>

            <form className="modal-form" onSubmit={handleSubmit}>
              <div>
                <div className="input-group">
                  <label>Policy Name</label>
                  <input
                    name="policy_name"
                    value={formData.policy_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="name-row">
                  <div className="input-group">
                    <label>Request Type</label>
                    <select
                      name="request_type"
                      value={formData.request_type}
                      onChange={handleChange}
                    >
                      <option value="Manual">Manual</option>
                      <option value="System">System</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Form Type</label>
                    <select
                      name="form_type"
                      value={formData.form_type}
                      onChange={handleChange}
                      required
                    >
                      <option value="VUL">VUL</option>
                      <option value="IHP">IHP</option>
                      <option value="TRAD">TRAD</option>
                    </select>
                  </div>
                </div>
                <div className="input-group">
                  <label>Agency</label>
                  <select
                    name="agency"
                    value={formData.agency}
                    onChange={handleChange}
                  >
                    <option value="">-- No Agency --</option>
                    {agencies.map((a) => (
                      <option key={a.agency_id} value={a.agency_id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* REQUIREMENTS BUILDER */}
                <div
                  className="input-group"
                  style={{
                    marginTop: "15px",
                    borderTop: "1px solid #eee",
                    paddingTop: "15px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "10px",
                    }}
                  >
                    <label style={{ margin: 0 }}>Document Requirements</label>
                    <button
                      type="button"
                      onClick={addRequirement}
                      style={{
                        fontSize: "12px",
                        padding: "4px 8px",
                        cursor: "pointer",
                        background: "#e3f2fd",
                        color: "#0055b8",
                        border: "1px solid #b3d7ff",
                        borderRadius: "4px",
                      }}
                    >
                      + Add File Slot
                    </button>
                  </div>

                  {requirements.length === 0 && (
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#999",
                        fontStyle: "italic",
                      }}
                    >
                      No specific documents defined. (Will use defaults)
                    </p>
                  )}

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    {requirements.map((req, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          gap: "8px",
                          alignItems: "center",
                        }}
                      >
                        <input
                          type="text"
                          placeholder="Document Name (e.g. Valid ID)"
                          value={req.label}
                          onChange={(e) =>
                            updateRequirement(idx, "label", e.target.value)
                          }
                          required
                          style={{ flex: 1, padding: "6px", fontSize: "13px" }}
                        />
                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            fontSize: "12px",
                            cursor: "pointer",
                            margin: 0,
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={req.required}
                            onChange={(e) =>
                              updateRequirement(
                                idx,
                                "required",
                                e.target.checked,
                              )
                            }
                          />
                          Req?
                        </label>
                        <button
                          type="button"
                          onClick={() => removeRequirement(idx)}
                          style={{
                            background: "#ffebeb",
                            color: "#dc3545",
                            border: "1px solid #ffc9c9",
                            borderRadius: "4px",
                            padding: "4px 8px",
                            cursor: "pointer",
                          }}
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-buttons">
                <button
                  type="button"
                  className="modal-close"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="modal-submit"
                  disabled={submitting}
                >
                  Save Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM MODAL */}
      {showConfirmModal && policyToToggle && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "400px" }}>
            <div className="modal-title">Confirm Action</div>
            <p style={{ textAlign: "center", margin: "20px 0" }}>
              Are you sure you want to{" "}
              <strong>
                {policyToToggle.active_status ? "archive" : "restore"}
              </strong>{" "}
              "{policyToToggle.policy_name}"?
            </p>
            <div className="modal-buttons">
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="modal-submit"
                onClick={confirmToggleStatus}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPolicies;

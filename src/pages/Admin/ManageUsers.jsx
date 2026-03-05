import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import supabase from "../../config/supabaseClient";
import { logActivity } from "../../utils/logActivity";
import "./Style/AdminLayout.css";
import "./Style/ManageUsers.css";

import LogoImage from "../../assets/logo1.png";

const ManageUsers = () => {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useApp();

  // -- Auth & User State --
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);

  // -- UI State --
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // -- Modals --
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // -- Form Data --
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    position: "MD",
    password: "",
    reportsTo: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [modalError, setModalError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // -- Hierarchy Helper Data --
  const [potentialUplines, setPotentialUplines] = useState([]);
  const [viewingSupervisor, setViewingSupervisor] = useState(null);
  const [viewingSubordinates, setViewingSubordinates] = useState([]);

  // -- Role Statistics --
  const [roleCounts, setRoleCounts] = useState({
    AL: 0, AP: 0, MD: 0, MP: 0, ADMIN: 0
  });

  // -- Filter State --
  const [showInactive, setShowInactive] = useState(false);

  // -- Initialization --
  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert("You need to login first");
      navigate("/");
      return;
    }
    const type = session.user.user_metadata?.account_type;
    // Basic check, adjust if case sensitivity needed
    if (!type || type.toLowerCase() !== "admin") {
      alert("You do not have access to this page");
      navigate("/");
      return;
    }
    setUser(session.user);
    fetchUsers();
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching users:", error.message);
      } else {
        setUsers(data || []);
        calculateRoleCounts(data || []);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const calculateRoleCounts = (userData) => {
    const counts = { AL: 0, AP: 0, MD: 0, MP: 0, ADMIN: 0 };
    userData.forEach((u) => {
      const role = u.account_type?.toUpperCase();
      // Handle 'ADMIN' variations if any
      const normalizedRole = role === 'ADMIN' ? 'ADMIN' : role;
      if (counts.hasOwnProperty(normalizedRole)) {
        counts[normalizedRole]++;
      }
    });
    setRoleCounts(counts);
  };

  // -- Hierarchy Logic --
  const fetchPotentialUplines = useCallback(async (role, excludeUserId = null) => {
    const roleMap = { "AP": "AL", "AL": "MP" };
    const uplineRole = roleMap[role];
    if (!uplineRole) {
      setPotentialUplines([]);
      return;
    }
    const { data, error } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, account_type")
      .eq("account_type", uplineRole)
      .neq("id", excludeUserId || "");

    if (!error) setPotentialUplines(data || []);
  }, []);

  useEffect(() => {
    if (showAddModal) {
      fetchPotentialUplines(formData.position, isEditMode ? selectedUser?.id : null);
    }
  }, [formData.position, showAddModal, isEditMode, selectedUser, fetchPotentialUplines]);

  // -- Form Handlers --
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;

    // Capitalize the first letter for First Name and Last Name
    if (name === "firstName" || name === "lastName") {
      finalValue = value.charAt(0).toUpperCase() + value.slice(1);
    }

    setFormData({
      ...formData,
      [name]: finalValue
    });
  };

  const generatePassword = () => {
    if (!formData.lastName.trim()) {
      setModalError("Please enter last name first");
      return;
    }

    // 1. Get the first two letters of the last name
    const firstTwo = formData.lastName.trim().substring(0, 2);
    const formattedName = `${firstTwo.charAt(0).toUpperCase()}${firstTwo.length > 1 ? firstTwo.charAt(1).toLowerCase() : 'x'}`;

    // 2. Get current Month (MM) and Year (YYYY)
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = now.getFullYear();

    // 3. Combine to create #Ca022026
    const pwd = `#${formattedName}${month}${year}`;

    setFormData({ ...formData, password: pwd });
    setModalError("");
  };

  const closeModal = () => {
    setShowAddModal(false);
    setShowViewModal(false);
    setIsEditMode(false);
    setSelectedUser(null);
    setFormData({
      firstName: "", lastName: "", email: "", position: "MD", password: "", reportsTo: ""
    });
    setModalError("");
    setSuccessMsg("");
    setViewingSupervisor(null);
    setViewingSubordinates([]);
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setFormData({
      firstName: "", lastName: "", email: "", position: "MD", password: "", reportsTo: ""
    });
    setShowAddModal(true);
  };

  const openEditModal = async (u) => {
    setIsEditMode(true);
    setSelectedUser(u);
    setFormData({
      firstName: u.first_name,
      lastName: u.last_name,
      email: u.email,
      position: u.account_type,
      password: "", // Don't show password
      reportsTo: "",
    });

    // Fetch current supervisor
    const { data } = await supabase
      .from("user_hierarchy")
      .select("report_to_id")
      .eq("user_id", u.id)
      .eq("is_active", true)
      .maybeSingle();

    if (data) setFormData(prev => ({ ...prev, reportsTo: data.report_to_id }));

    setShowAddModal(true);
  };

  const openViewModal = async (u) => {
    setSelectedUser(u);
    setShowViewModal(true);

    // Fetch hierarchy info for view
    const [supRes, subRes] = await Promise.all([
      supabase.from("user_hierarchy").select("profiles:report_to_id(first_name, last_name, account_type)").eq("user_id", u.id).eq("is_active", true).maybeSingle(),
      supabase.from("user_hierarchy").select("profiles:user_id(first_name, last_name, account_type)").eq("report_to_id", u.id).eq("is_active", true)
    ]);

    setViewingSupervisor(supRes.data?.profiles || null);
    setViewingSubordinates(subRes.data?.map(d => d.profiles).filter(Boolean) || []);
  };

  const submitUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setModalError("");
    setSuccessMsg("");

    try {
      let userIdToProcess = selectedUser?.id;

      if (isEditMode) {
        // UPDATE
        const { error } = await supabase
          .from("profiles")
          .update({
            first_name: formData.firstName,
            last_name: formData.lastName,
            account_type: formData.position
          })
          .eq("id", userIdToProcess);

        if (error) throw error;
        await logActivity("USER_UPDATE", `Updated user details for ${formData.firstName} ${formData.lastName}`);
        setSuccessMsg("User updated successfully!");
      } else {
        // CREATE
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              first_name: formData.firstName,
              last_name: formData.lastName,
              account_type: formData.position,
              status: "Active"
            },
          },
        });

        if (authError) throw authError;
        userIdToProcess = authData.user?.id;

        if (userIdToProcess) {
          const { error: profileError } = await supabase.from("profiles").insert([{
            id: userIdToProcess,
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            account_type: formData.position,
            status: "Active"
          }]);
          if (profileError) throw profileError;
        }

        await logActivity("USER_CREATE", `Created new user ${formData.firstName} ${formData.lastName} (${formData.position})`);
        setSuccessMsg("User created successfully!");
      }

      // Handle Hierarchy Update
      if (formData.reportsTo && userIdToProcess) {
        // Deactivate old
        await supabase.from("user_hierarchy").update({ is_active: false }).eq("user_id", userIdToProcess);
        // Insert new
        await supabase.from("user_hierarchy").insert({
          user_id: userIdToProcess,
          report_to_id: formData.reportsTo,
          assigned_by: user.id,
          is_active: true
        });
      }

      fetchUsers();
      setTimeout(closeModal, 1500);

    } catch (err) {
      console.error("Error submitting user:", err);
      setModalError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userItem) => {
    const newStatus = userItem.status === "Active" ? "Inactive" : "Active";
    const confirmMsg = `Are you sure you want to set ${userItem.first_name} to ${newStatus}?`;

    if (window.confirm(confirmMsg)) {
      try {
        const { error } = await supabase
          .from("profiles")
          .update({ status: newStatus })
          .eq("id", userItem.id);

        if (error) throw error;

        await logActivity("USER_UPDATE", `Changed status of ${userItem.first_name} ${userItem.last_name} to ${newStatus}`);
        fetchUsers();
      } catch (err) {
        console.error("Error updating status:", err);
        alert("Failed to update status");
      }
    }
  };

  const handleResetPassword = async (userItem) => {
    if (!userItem.last_name) return;

    const firstTwo = userItem.last_name.trim().substring(0, 2);
    const formattedName = `${firstTwo.charAt(0).toUpperCase()}${firstTwo.length > 1 ? firstTwo.charAt(1).toLowerCase() : 'x'}`;
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const defaultPwd = `#${formattedName}${month}${year}`;

    const confirmMsg = `Are you sure you want to reset the password for ${userItem.first_name} to the default: ${defaultPwd}?\n\nNote: For security reasons, the system will send a secure password recovery email to ${userItem.email} instead of sending the plaintext password.`;

    if (window.confirm(confirmMsg)) {
      try {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(userItem.email);

        if (resetError) throw resetError;

        // Change the user's status to Active
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ status: "Active" })
          .eq("id", userItem.id);

        if (updateError) throw updateError;

        await logActivity("USER_UPDATE", `Sent password reset email and activated ${userItem.first_name} ${userItem.last_name}`);

        alert(`Password reset email sent to ${userItem.email} and user account has been Activated.`);
        fetchUsers(); // Refresh the list
      } catch (err) {
        console.error("Error resetting password:", err);
        alert("Failed to send reset email: " + err.message);
      }
    }
  };

  // -- Render Helpers --
  const filteredUsers = users.filter(u => {
    const status = u.status || "Active";
    return showInactive ? status === "Inactive" : status === "Active";
  });



  return (
    <div className="dashboard-content" style={{ padding: '40px 50px' }}>
      <div className="header-row">
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#333" }}>Manage Users</h1>
          <p style={{ color: "#777" }}>Create, update, and manage user accounts</p>
        </div>
        <div className="header-actions">
          <button
            className="btn-secondary"
            onClick={() => setShowInactive(!showInactive)}
          >
            {showInactive ? "View Active Users" : "View Inactive Users"}
          </button>
          <button className="add-btn" onClick={openAddModal}>
            + Add User
          </button>
        </div>
      </div>

      {/* ROLE STATISTICS CARDS */}
      <div className="role-cards-grid">
        <div className="role-card animate-spring delay-1">
          <h3>AGENCY LEADERS (AL)</h3>
          <div className="count">{roleCounts.AL}</div>
        </div>
        <div className="role-card animate-spring delay-2">
          <h3>AGENCY PARTNERS (AP)</h3>
          <div className="count">{roleCounts.AP}</div>
        </div>
        <div className="role-card animate-spring delay-3">
          <h3>MANAGING DIRECTORS (MD)</h3>
          <div className="count">{roleCounts.MD}</div>
        </div>
        <div className="role-card animate-spring delay-4">
          <h3>MANAGEMENT PARTNERS (MP)</h3>
          <div className="count">{roleCounts.MP}</div>
        </div>
        <div className="role-card animate-spring delay-5">
          <h3>ADMINS</h3>
          <div className="count">{roleCounts.ADMIN}</div>
        </div>
      </div>

      {/* USERS TABLE CONTAINER */}
      <div className="content-container animate-spring delay-1">
        <div className="container-header" style={{ background: 'transparent', borderBottom: 'none', padding: '20px 0 10px 0' }}>
          <h2 style={{ fontSize: '18px', margin: 0 }}>User Database ({showInactive ? "Inactive" : "Active"})</h2>
        </div>
        <div className="container-body">
          <table className="user-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Last Name</th>
                <th>First Name</th>
                <th>Position</th>
                <th>Status</th>
                <th style={{ textAlign: "center" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "20px", color: "#666" }}>
                    No {showInactive ? "inactive" : "active"} users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u, index) => (
                  <tr key={u.id}>
                    <td>{index + 1}</td>
                    <td>{u.last_name}</td>
                    <td>{u.first_name}</td>
                    <td><span style={{ fontWeight: "600" }}>{u.account_type}</span></td>
                    <td>
                      <span className={`status-badge ${u.status === "Active" ? "active" : "inactive"}`}>
                        {u.status || "Active"}
                      </span>
                    </td>
                    <td className="action-cell">
                      {/* 1. Only show View/Update if the user is ACTIVE */}
                      {!showInactive && (
                        <>
                          <button className="btn-view" onClick={() => openViewModal(u)} title="View Details">
                            <i className="fa-solid fa-eye"></i> View
                          </button>
                          <button className="btn-update" onClick={() => openEditModal(u)} title="Edit User">
                            <i className="fa-solid fa-pen"></i> Update
                          </button>
                        </>
                      )}

                      {/* 2. Show Reset Password if user is INACTIVE */}
                      {showInactive && (
                        <button
                          className="btn-update"
                          onClick={() => handleResetPassword(u)}
                          title="Send Password Reset Email"
                          style={{ backgroundColor: 'var(--primary-color)', marginRight: '8px' }}
                        >
                          <i className="fa-solid fa-key"></i> Reset Password
                        </button>
                      )}

                      {/* 3. Main Action Toggle: Shows 'Deactivate' for Active list, 'Activate' for Inactive list */}
                      <button
                        className="btn-delete"
                        onClick={() => toggleUserStatus(u)}
                        title={u.status === "Active" ? "Deactivate" : "Activate"}
                        style={{
                          backgroundColor: u.status === "Active" ? "var(--danger-color)" : "var(--success-color)"
                        }}
                      >
                        <i className={`fa-solid ${u.status === "Active" ? "fa-ban" : "fa-check"}`}></i>{" "}
                        {u.status === "Active" ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-title">
              {isEditMode ? "Edit User" : "Add New User"}
            </div>

            <form className="modal-form" onSubmit={submitUser}>
              <div className="name-row">
                <div className="input-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="e.g. John"
                    required
                    value={formData.firstName}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="input-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="e.g. Smith"
                    required
                    value={formData.lastName}
                    onChange={handleFormChange}
                  />
                </div>
              </div>

              {!isEditMode && (
                <div className="input-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleFormChange}
                  />
                </div>
              )}

              <div className="password-position-row">
                {!isEditMode && (
                  <div className="input-group">
                    <label>Password</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        required
                        value={formData.password}
                        readOnly
                      />
                      <button
                        type="button"
                        className="generate-btn"
                        onClick={generatePassword}
                      >
                        Generate
                      </button>
                    </div>
                  </div>
                )}

                <div className="input-group">
                  <label>Position</label>
                  <select name="position" value={formData.position} onChange={handleFormChange}>
                    <option value="Admin">Admin</option>
                    <option value="MP">Managing Partner (MP)</option>
                    <option value="AL">Agency Leader (AL)</option>
                    <option value="AP">Agency Partner (AP)</option>
                    <option value="MD">Managing Director (MD)</option>
                  </select>
                </div>
              </div>

              {(formData.position === 'AP' || formData.position === 'AL') && (
                <div className="input-group">
                  <label>Reports To</label>
                  <select name="reportsTo" value={formData.reportsTo} onChange={handleFormChange}>
                    <option value="">-- Select Supervisor --</option>
                    {potentialUplines.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.first_name} {u.last_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {modalError && (
                <p className="modal-error" style={{ color: 'var(--danger-color)', fontSize: '14px' }}>
                  {modalError}
                </p>
              )}
              {successMsg && (
                <p className="modal-success" style={{ color: 'var(--success-color)', fontSize: '14px' }}>
                  {successMsg}
                </p>
              )}

              <div className="modal-buttons">
                <button type="button" className="modal-close" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="modal-submit" disabled={loading}>
                  {loading ? "Processing..." : (isEditMode ? "Update" : "Create")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-title">View User Details</div>

            <div className="modal-form">
              <div className="name-row">
                <div className="input-group"><label>Name</label><input type="text" value={`${selectedUser.first_name} ${selectedUser.last_name}`} readOnly /></div>
                <div className="input-group"><label>Email</label><input type="text" value={selectedUser.email} readOnly /></div>
              </div>
              <div className="name-row">
                <div className="input-group"><label>Position</label><input type="text" value={selectedUser.account_type} readOnly /></div>
                <div className="input-group"><label>Status</label><input type="text" value={selectedUser.status} readOnly /></div>
              </div>

              {/* Hierarchy View */}
              <div className="hierarchy-section" style={{ borderTop: '1px solid var(--border-color)', marginTop: '20px', paddingTop: '20px' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '15px', color: 'var(--primary-color)' }}>Hierarchy</h3>
                <div className="hierarchy-item" style={{ marginBottom: '20px' }}>
                  <label>Reports To</label>
                  <div className="hierarchy-card">
                    {viewingSupervisor ? (
                      <><span>{viewingSupervisor.first_name} {viewingSupervisor.last_name}</span><span className="status-badge active">{viewingSupervisor.account_type}</span></>
                    ) : <span style={{ color: '#999' }}>No supervisor assigned</span>}
                  </div>
                </div>

                <div className="hierarchy-item">
                  <label>Direct Reports ({viewingSubordinates.length})</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                    {viewingSubordinates.map((sub, idx) => (
                      <div key={idx} className="hierarchy-card">
                        <span>{sub.first_name} {sub.last_name}</span>
                        <span className="status-badge active" style={{ fontSize: '10px' }}>{sub.account_type}</span>
                      </div>
                    ))}
                    {viewingSubordinates.length === 0 && <div className="hierarchy-card"><span style={{ color: '#999' }}>No direct reports found</span></div>}
                  </div>
                </div>

              </div>
            </div>
            <div className="modal-buttons">
              <button type="button" className="modal-close" onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageUsers;
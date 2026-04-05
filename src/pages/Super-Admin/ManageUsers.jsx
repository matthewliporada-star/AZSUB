import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import supabase from "../../config/supabaseClient";
import { logActivity } from "../../utils/logActivity";
import "./Style/AdminLayout.css";
import "./Style/ManageUsers.css";

import LogoImage from "../../assets/logo1.png";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const insertProfileWithRetry = async (profileData, maxAttempts = 8) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const { error } = await supabase
      .from("profiles")
      .upsert(profileData, { onConflict: "id" });

    if (!error) return;

    const message = error?.message || error?.msg || String(error);
    const isForeignKeyError =
      message.includes("profiles_id_fkey") ||
      message.includes("foreign key constraint");

    if (!isForeignKeyError || attempt === maxAttempts) {
      throw error;
    }

    // Exponential backoff: 500ms, 1s, 1.5s, 2s, 2.5s, 3s, 3.5s
    await sleep(500 * attempt);
  }
};

const ManageUsers = () => {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useApp();

  // -- Auth & User State --
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]); // store all for counts/cross-check

  // -- UI State --
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // -- Modals --
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showResetSuccessModal, setShowResetSuccessModal] = useState(false);
  const [resetSuccessData, setResetSuccessData] = useState({
    user: "",
    password: "",
    email: "",
  });

  // -- Form Data --
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    position: "Admin",
    password: "",
    reportsTo: "",
    intermediary_code: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [modalError, setModalError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // -- Hierarchy Helper Data --
  const [potentialUplines, setPotentialUplines] = useState([]);
  const [viewingSupervisor, setViewingSupervisor] = useState(null);
  const [viewingCreatedAccounts, setViewingCreatedAccounts] = useState([]);

  // -- Role Statistics --
  const [roleCounts, setRoleCounts] = useState({
    AL: 0,
    AP: 0,
    MD: 0,
    MP: 0,
    ADMIN: 0,
    SUPER_ADMIN: 0,
  });

  // -- Filter State --
  const [showInactive, setShowInactive] = useState(false);

  // -- Initialization --
  useEffect(() => {
    checkAdmin();
    fetchNotifications();
  }, []);

  // Subscribe to real-time notifications
  useEffect(() => {
    const subscription = supabase
      .channel("admin_notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "admin_notifications" },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev]);
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from("admin_notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (!error) {
        setNotifications(data || []);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await supabase
        .from("admin_notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n,
        ),
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      // Get all unread notifications
      const unreadIds = notifications
        .filter((n) => !n.is_read)
        .map((n) => n.id);

      if (unreadIds.length === 0) return;

      // Update all unread notifications
      await supabase
        .from("admin_notifications")
        .update({ is_read: true })
        .in("id", unreadIds);

      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  };

  const checkAdmin = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      alert("You need to login first");
      navigate("/");
      return;
    }

    let type = session.user.user_metadata?.account_type;

    if (!type) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("account_type")
        .eq("id", session.user.id)
        .single();

      if (!profileError && profile?.account_type) {
        type = profile.account_type;
      }
    }

    const normalizedType = type
      ?.toString()
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "_");
    const isAllowed = normalizedType === "SUPER_ADMIN";

    if (!normalizedType || !isAllowed) {
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
        const allUserData = data || [];
        setAllUsers(allUserData);
        setUsers(allUserData);
        calculateRoleCounts(allUserData);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const calculateRoleCounts = (userData) => {
    const counts = { AL: 0, AP: 0, MD: 0, MP: 0, ADMIN: 0, SUPER_ADMIN: 0 };
    userData.forEach((u) => {
      const role = u.account_type?.toUpperCase();
      const normalizedRole =
        role === "ADMIN"
          ? "ADMIN"
          : role === "SUPER_ADMIN"
            ? "SUPER_ADMIN"
            : role;
      if (counts.hasOwnProperty(normalizedRole)) {
        counts[normalizedRole]++;
      }
    });
    setRoleCounts(counts);
  };

  // -- Hierarchy Logic --
  const fetchPotentialUplines = useCallback(
    async (role, excludeUserId = null) => {
      const roleMap = { AP: "AL", AL: "MP" };
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
    },
    [],
  );

  useEffect(() => {
    if (showAddModal) {
      fetchPotentialUplines(
        formData.position,
        isEditMode ? selectedUser?.id : null,
      );
    }
  }, [
    formData.position,
    showAddModal,
    isEditMode,
    selectedUser,
    fetchPotentialUplines,
  ]);

  // -- Form Handlers --
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;

    if (name === "firstName" || name === "lastName") {
      finalValue = value.charAt(0).toUpperCase() + value.slice(1);
    }

    // For intermediary_code, ensure it's numeric and max 8 digits
    if (name === "intermediary_code") {
      finalValue = value.replace(/[^0-9]/g, "").slice(0, 8);
    }

    setFormData({
      ...formData,
      [name]: finalValue,
    });
  };

  const generatePassword = () => {
    if (!formData.lastName.trim()) {
      setModalError("Please enter last name first");
      return;
    }

    const firstTwo = formData.lastName.trim().substring(0, 2);
    const formattedName = `${firstTwo.charAt(0).toUpperCase()}${firstTwo.length > 1 ? firstTwo.charAt(1).toLowerCase() : "x"}`;
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
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
      firstName: "",
      lastName: "",
      email: "",
      position: "Admin",
      password: "",
      reportsTo: "",
      intermediary_code: "",
    });
    setModalError("");
    setSuccessMsg("");
    setViewingSupervisor(null);
    setViewingCreatedAccounts([]);
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      position: "Admin",
      password: "",
      reportsTo: "",
      intermediary_code: "",
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
      password: "",
      reportsTo: "",
      intermediary_code: u.intermediary_code || "", // Add this line
    });

    const { data } = await supabase
      .from("user_hierarchy")
      .select("report_to_id")
      .eq("user_id", u.id)
      .eq("is_active", true)
      .maybeSingle();

    if (data)
      setFormData((prev) => ({ ...prev, reportsTo: data.report_to_id }));

    setShowAddModal(true);
  };

  const openViewModal = async (u) => {
    setSelectedUser(u);
    setShowViewModal(true);

    const userId = u.id;

    const [supRes, createdRes] = await Promise.all([
      supabase
        .from("user_hierarchy")
        .select(
          "profiles:report_to_id(id, first_name, last_name, account_type)",
        )
        .eq("user_id", userId)
        .eq("is_active", true)
        .maybeSingle(),
      supabase
        .from("profiles")
        .select("id, first_name, last_name, account_type, status")
        .eq("created_by", userId)
        .order("created_at", { ascending: false }),
    ]);

    const supervisor = supRes.data?.profiles || null;

    const createdByAccounts = (createdRes.data || [])
      .filter((p) => p.id && p.id !== userId)
      .map((p) => ({ ...p }));

    const rolePriority = {
      MP: 0,
      AL: 1,
      AP: 2,
      MD: 3,
      ADMIN: 4,
      SUPER_ADMIN: 5,
    };
    const sortedCreatedByAccounts = [...createdByAccounts].sort((a, b) => {
      const aRole = (a.account_type || "").toUpperCase();
      const bRole = (b.account_type || "").toUpperCase();
      return (rolePriority[aRole] ?? 99) - (rolePriority[bRole] ?? 99);
    });

    setViewingSupervisor(supervisor);
    setViewingCreatedAccounts(sortedCreatedByAccounts);
  };

  const submitUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setModalError("");
    setSuccessMsg("");

    try {
      let userIdToProcess = selectedUser?.id;

      if (isEditMode) {
        const { error } = await supabase
          .from("profiles")
          .update({
            first_name: formData.firstName,
            last_name: formData.lastName,
            account_type: formData.position,
            intermediary_code: formData.intermediary_code
              ? parseInt(formData.intermediary_code)
              : null, // Add this line
          })
          .eq("id", userIdToProcess);

        if (error) throw error;
        await logActivity(
          "USER_UPDATE",
          `Updated user details for ${formData.firstName} ${formData.lastName}`,
        );
        setSuccessMsg("User updated successfully!");
      } else {
        const { data: authData, error: authError } = await supabase.auth.signUp(
          {
            email: formData.email,
            password: formData.password,
            options: {
              data: {
                first_name: formData.firstName,
                last_name: formData.lastName,
                account_type: formData.position,
                status: "Active",
                intermediary_code: formData.intermediary_code, // Add this line
              },
            },
          },
        );

        if (authError) throw authError;
        userIdToProcess = authData.user?.id;

        if (!userIdToProcess) {
          throw new Error("Signup succeeded but did not return a user ID.");
        }

        await insertProfileWithRetry({
          id: userIdToProcess,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          account_type: formData.position,
          status: "Active",
          intermediary_code: formData.intermediary_code
            ? parseInt(formData.intermediary_code)
            : null, // Add this line
        });

        await logActivity(
          "USER_CREATE",
          `Created new user ${formData.firstName} ${formData.lastName} (${formData.position})`,
        );
        setSuccessMsg("User created successfully!");
      }

      if (formData.reportsTo && userIdToProcess) {
        await supabase
          .from("user_hierarchy")
          .update({ is_active: false })
          .eq("user_id", userIdToProcess);
        await supabase.from("user_hierarchy").insert({
          user_id: userIdToProcess,
          report_to_id: formData.reportsTo,
          assigned_by: user.id,
          is_active: true,
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

        await logActivity(
          "USER_UPDATE",
          `Changed status of ${userItem.first_name} ${userItem.last_name} to ${newStatus}`,
        );
        fetchUsers();
      } catch (err) {
        console.error("Error updating status:", err);
        alert("Failed to update status");
      }
    }
  };

  const handleResetPassword = async (userItem) => {
    if (!userItem.last_name) return;

    const confirmMsg = `Are you sure you want to:\n\n1. Reset password to DEFAULT FORMAT\n2. Activate account\n3. Send reset email\n\nUser: ${userItem.first_name} ${userItem.last_name}`;

    if (window.confirm(confirmMsg)) {
      try {
        setLoading(true);

        // Call backend to reset password
        console.log("Calling backend to reset password...");
        const resetResponse = await fetch(
          "http://localhost:3000/api/admin/reset-password",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: userItem.id,
              email: userItem.email,
              lastName: userItem.last_name,
            }),
          },
        );

        const resetResult = await resetResponse.json();

        if (!resetResult.success) {
          throw new Error(resetResult.message || "Failed to reset password");
        }

        console.log("✅ Backend reset successful:", resetResult);

        // Step 2: Update status to Active (even if status is already Active, this ensures it)
        const { error: statusError } = await supabase
          .from("profiles")
          .update({ status: "Active" })
          .eq("id", userItem.id);

        if (statusError) throw statusError;
        console.log("✅ Status updated to Active");

        // NOTE: backend already sends the reset email (and includes the generated password),
        // avoid calling `resetPasswordForEmail` again on the client or we'll hit Supabase rate limits.
        //
        // Step 4: Log the activity
        const newPassword =
          resetResult.generatedPassword || resetResult.password;

        await logActivity(
          "PASSWORD_RESET",
          `Password reset to ${newPassword}, account activated and email sent to ${userItem.first_name} ${userItem.last_name}`,
        );

        // Step 5: Create admin notification
        await supabase.from("admin_notifications").insert({
          user_id: user.id,
          message: `✅ Account Activated: ${userItem.first_name} ${userItem.last_name} | Password: ${newPassword}`,
          type: "password_reset",
          target_user_id: userItem.id,
          is_read: false,
        });

        setResetSuccessData({
          user: `${userItem.first_name} ${userItem.last_name}`,
          password: newPassword,
          email: userItem.email,
        });
        setShowResetSuccessModal(true);
        await fetchUsers();
      } catch (err) {
        console.error("❌ Error resetting password:", err);

        // if supabase returns a rate-limit message, just re-display it without the backend-warning
        const msg = err.message || "Unknown error";
        alert("Failed to reset password:\n\n" + msg);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleResendResetEmail = async (userItem) => {
    if (!userItem.last_name) return;

    const confirmMsg = `Are you sure you want to resend the password reset email to ${userItem.first_name} ${userItem.last_name}?`;

    if (window.confirm(confirmMsg)) {
      try {
        setLoading(true);

        // Just resend the password reset email without changing status
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(
          userItem.email,
          {
            redirectTo: `${window.location.origin}/reset-password`,
          },
        );

        if (resetError) throw resetError;

        // Log the activity
        await logActivity(
          "PASSWORD_RESET_RESEND",
          `Password reset email resent to ${userItem.first_name} ${userItem.last_name}`,
        );

        // Create admin notification
        await supabase.from("admin_notifications").insert({
          user_id: user.id,
          message: `Password reset email resent to ${userItem.first_name} ${userItem.last_name}`,
          type: "password_reset",
          target_user_id: userItem.id,
          is_read: false,
        });

        alert(`Password reset email resent to ${userItem.email}.`);
        await fetchUsers();
      } catch (err) {
        console.error("Error resending reset email:", err);
        alert("Failed to resend email: " + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  // -- Render Helpers --
  const filteredUsers = users.filter((u) => {
    const status = u.status || "Active";
    const isStatusMatch = showInactive
      ? status === "Inactive"
      : status === "Active";
    const isAdmin = u.account_type?.toUpperCase() === "ADMIN";
    return isStatusMatch && isAdmin;
  });

  const unreadNotificationsCount = notifications.filter(
    (n) => !n.is_read,
  ).length;

  return (
    <div className="dashboard-content" style={{ padding: "40px 50px" }}>
      <div className="header-row">
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#333" }}>
            Manage Users
          </h1>
          <p style={{ color: "#777" }}>
            Create, update, and manage user accounts
          </p>
        </div>
        <div
          className="header-actions"
          style={{
            position: "relative",
            alignItems: "center",
            display: "flex",
            gap: "10px",
          }}
        >
          <button
            className="btn-secondary"
            onClick={() => setShowInactive(!showInactive)}
          >
            {showInactive ? "View Active Users" : "View Inactive Users"}
          </button>
          <button className="add-btn" onClick={openAddModal}>
            + Add User
          </button>

          {/* Notification Bell */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                background: "none",
                border: "1.5px solid #d0d5dd",
                borderRadius: "8px",
                width: "38px",
                height: "38px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                position: "relative",
                color: "#344054",
                fontSize: "16px",
                backgroundColor: "#fff",
                flexShrink: 0,
              }}
              title="Notifications"
            >
              <i className="fa-solid fa-bell"></i>
              {unreadNotificationsCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-4px",
                    right: "-4px",
                    background: "#ef4444",
                    color: "white",
                    borderRadius: "50%",
                    width: "18px",
                    height: "18px",
                    fontSize: "11px",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    lineHeight: 1,
                  }}
                >
                  {unreadNotificationsCount > 9
                    ? "9+"
                    : unreadNotificationsCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "calc(100% + 8px)",
                  width: "320px",
                  background: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  zIndex: 9999,
                  maxHeight: "420px",
                  overflowY: "auto",
                }}
              >
                <div
                  style={{
                    padding: "14px 16px",
                    borderBottom: "1px solid #e2e8f0",
                    fontWeight: "700",
                    fontSize: "14px",
                    color: "#101828",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>Notifications</span>
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "center",
                    }}
                  >
                    {unreadNotificationsCount > 0 && (
                      <>
                        <span
                          style={{
                            fontSize: "12px",
                            color: "#6b7280",
                            fontWeight: "500",
                          }}
                        >
                          {unreadNotificationsCount} unread
                        </span>
                        <button
                          onClick={markAllNotificationsAsRead}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#3b82f6",
                            cursor: "pointer",
                            fontSize: "11px",
                            fontWeight: "600",
                            padding: "2px 6px",
                            textDecoration: "underline",
                            transition: "color 0.2s",
                          }}
                          onMouseEnter={(e) =>
                            (e.target.style.color = "#2563eb")
                          }
                          onMouseLeave={(e) =>
                            (e.target.style.color = "#3b82f6")
                          }
                          title="Mark all notifications as read"
                        >
                          Mark All
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {notifications.length === 0 ? (
                  <div
                    style={{
                      padding: "24px 16px",
                      color: "#6b7280",
                      fontSize: "14px",
                      textAlign: "center",
                    }}
                  >
                    <i
                      className="fa-solid fa-bell-slash"
                      style={{
                        fontSize: "24px",
                        marginBottom: "8px",
                        display: "block",
                        opacity: 0.4,
                      }}
                    ></i>
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      style={{
                        padding: "12px 16px",
                        borderBottom: "1px solid #f1f5f9",
                        background: notification.is_read ? "white" : "#eff6ff",
                        transition: "background 0.2s",
                        display: "flex",
                        gap: "10px",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          alignItems: "flex-start",
                          flex: 1,
                        }}
                      >
                        <span
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: notification.is_read
                              ? "transparent"
                              : "#3b82f6",
                            flexShrink: 0,
                            marginTop: "5px",
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: "13px",
                              color: "#1e293b",
                              lineHeight: "1.4",
                            }}
                          >
                            {notification.message}
                          </div>
                          <div
                            style={{
                              fontSize: "11px",
                              color: "#94a3b8",
                              marginTop: "4px",
                            }}
                          >
                            {new Date(notification.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      {!notification.is_read && (
                        <button
                          onClick={() =>
                            markNotificationAsRead(notification.id)
                          }
                          style={{
                            background: "none",
                            border: "none",
                            color: "#3b82f6",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "600",
                            padding: "4px 8px",
                            flexShrink: 0,
                            marginLeft: "8px",
                          }}
                          title="Mark as read"
                        >
                          ✓ Mark Read
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
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
        <div className="role-card animate-spring delay-6">
          <h3>SUPER ADMINS</h3>
          <div className="count">{roleCounts.SUPER_ADMIN}</div>
        </div>
      </div>

      {/* USERS TABLE CONTAINER */}
      <div className="content-container animate-spring delay-1">
        <div
          className="container-header"
          style={{
            background: "transparent",
            borderBottom: "none",
            padding: "20px 0 10px 0",
          }}
        >
          <h2 style={{ fontSize: "18px", margin: 0 }}>
            User Database ({showInactive ? "Inactive" : "Active"})
          </h2>
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
                  <td
                    colSpan="6"
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      color: "#666",
                    }}
                  >
                    No {showInactive ? "inactive" : "active"} users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u, index) => (
                  <tr key={u.id}>
                    <td>{index + 1}</td>
                    <td>{u.last_name}</td>
                    <td>{u.first_name}</td>
                    <td>
                      <span style={{ fontWeight: "600" }}>
                        {u.account_type}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${u.status === "Active" ? "active" : "inactive"}`}
                      >
                        {u.status || "Active"}
                      </span>
                    </td>
                    <td className="action-cell">
                      {!showInactive && (
                        <>
                          <button
                            className="btn-view"
                            onClick={() => openViewModal(u)}
                            title="View Details"
                          >
                            <i className="fa-solid fa-eye"></i> View
                          </button>
                          <button
                            className="btn-update"
                            onClick={() => openEditModal(u)}
                            title="Edit User"
                          >
                            <i className="fa-solid fa-pen"></i> Update
                          </button>
                        </>
                      )}

                      {showInactive && (
                        <button
                          className="btn-update"
                          onClick={() => handleResetPassword(u)}
                          title="Send Password Reset Email"
                          style={{
                            backgroundColor: "var(--primary-color)",
                            marginRight: "8px",
                          }}
                        >
                          <i className="fa-solid fa-key"></i> Reset Password
                        </button>
                      )}

                      <button
                        className="btn-delete"
                        onClick={() => toggleUserStatus(u)}
                        title={
                          u.status === "Active" ? "Deactivate" : "Activate"
                        }
                        style={{
                          backgroundColor:
                            u.status === "Active"
                              ? "var(--danger-color)"
                              : "var(--success-color)",
                        }}
                      >
                        <i
                          className={`fa-solid ${u.status === "Active" ? "fa-ban" : "fa-check"}`}
                        ></i>{" "}
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
                  <select
                    name="position"
                    value={formData.position}
                    onChange={handleFormChange}
                  >
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>
              {formData.position && (
                <div className="input-group">
                  <label>Intermediary Code</label>
                  <input
                    type="text"
                    name="intermediary_code"
                    value={formData.intermediary_code}
                    onChange={handleFormChange}
                    placeholder="Enter 8-digit code"
                    maxLength="8"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    title="Please enter numbers only (max 8 digits)"
                  />
                  <small
                    style={{
                      color: "#6b7280",
                      fontSize: "11px",
                      marginTop: "4px",
                      display: "block",
                    }}
                  >
                    Max 8 digits, numbers only
                  </small>
                </div>
              )}
              {(formData.position === "AP" || formData.position === "AL") && (
                <div className="input-group">
                  <label>Reports To</label>
                  <select
                    name="reportsTo"
                    value={formData.reportsTo}
                    onChange={handleFormChange}
                  >
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
                <p
                  className="modal-error"
                  style={{ color: "var(--danger-color)", fontSize: "14px" }}
                >
                  {modalError}
                </p>
              )}
              {successMsg && (
                <p
                  className="modal-success"
                  style={{ color: "var(--success-color)", fontSize: "14px" }}
                >
                  {successMsg}
                </p>
              )}

              <div className="modal-buttons">
                <button
                  type="button"
                  className="modal-close"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="modal-submit"
                  disabled={loading}
                >
                  {loading ? "Processing..." : isEditMode ? "Update" : "Create"}
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
                <div className="input-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={`${selectedUser.first_name} ${selectedUser.last_name}`}
                    readOnly
                  />
                </div>
                <div className="input-group">
                  <label>Email</label>
                  <input type="text" value={selectedUser.email} readOnly />
                </div>
              </div>
              <div className="name-row">
                <div className="input-group">
                  <label>Position</label>
                  <input
                    type="text"
                    value={selectedUser.account_type}
                    readOnly
                  />
                </div>
                <div className="input-group">
                  <label>Status</label>
                  <input type="text" value={selectedUser.status} readOnly />
                </div>
              </div>
              <div className="input-group" style={{ marginTop: "10px" }}>
                <label>Intermediary Code</label>
                <input
                  type="text"
                  value={selectedUser.intermediary_code || "N/A"}
                  readOnly
                />
              </div>

              <div
                className="hierarchy-section"
                style={{
                  borderTop: "1px solid var(--border-color)",
                  marginTop: "20px",
                  paddingTop: "20px",
                }}
              >
                <h3
                  style={{
                    fontSize: "16px",
                    marginBottom: "15px",
                    color: "var(--primary-color)",
                  }}
                >
                  Hierarchy
                </h3>

                <div className="hierarchy-item" style={{ marginTop: "20px" }}>
                  <label>
                    Created Accounts ({viewingCreatedAccounts.length})
                  </label>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      marginTop: "10px",
                    }}
                  >
                    {viewingCreatedAccounts.map((sub, idx) => (
                      <div key={idx} className="hierarchy-card">
                        <span>
                          {sub.first_name} {sub.last_name}
                        </span>
                        <span
                          className="status-badge active"
                          style={{ fontSize: "10px" }}
                        >
                          {sub.account_type}
                        </span>
                      </div>
                    ))}
                    {viewingCreatedAccounts.length === 0 && (
                      <div className="hierarchy-card">
                        <span style={{ color: "#999" }}>
                          No created accounts found
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-buttons">
              <button
                type="button"
                className="modal-close"
                onClick={closeModal}
              >
                Close
              </button>
              {selectedUser && selectedUser.status === "Active" && (
                <button
                  type="button"
                  className="modal-submit"
                  onClick={() => handleResendResetEmail(selectedUser)}
                  style={{ backgroundColor: "var(--primary-color)" }}
                  disabled={loading}
                >
                  <i className="fa-solid fa-envelope"></i>{" "}
                  {loading ? "Sending..." : "Resend Reset Email"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Success Modal */}
      {showResetSuccessModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            backdropFilter: "blur(4px)",
            animation: "fadeIn 0.3s ease-out",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
              maxWidth: "480px",
              width: "100%",
              margin: "20px",
              overflow: "hidden",
              animation: "slideUp 0.3s ease-out",
            }}
          >
            {/* Header with gradient */}
            <div
              style={{
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                padding: "40px 32px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  background: "rgba(255, 255, 255, 0.2)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  backdropFilter: "blur(10px)",
                }}
              >
                <i
                  className="fa-solid fa-check"
                  style={{
                    color: "#fff",
                    fontSize: "32px",
                  }}
                ></i>
              </div>
              <h2
                style={{
                  color: "#fff",
                  fontSize: "24px",
                  fontWeight: "800",
                  margin: "0 0 8px 0",
                  letterSpacing: "-0.5px",
                }}
              >
                Password Reset Successful!
              </h2>
              <p
                style={{
                  color: "rgba(255, 255, 255, 0.9)",
                  fontSize: "14px",
                  margin: 0,
                }}
              >
                Account activated and ready to use
              </p>
            </div>

            {/* Content */}
            <div style={{ padding: "32px" }}>
              {/* User Info */}
              <div
                style={{
                  background: "#f0fdf4",
                  border: "1px solid #dcfce7",
                  borderRadius: "12px",
                  padding: "16px",
                  marginBottom: "24px",
                }}
              >
                <div
                  style={{
                    color: "#6b7280",
                    fontSize: "12px",
                    fontWeight: "600",
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                    marginBottom: "8px",
                  }}
                >
                  User Account
                </div>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#1f2937",
                  }}
                >
                  {resetSuccessData.user}
                </div>
              </div>

              {/* Status */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                  marginBottom: "24px",
                }}
              >
                <div
                  style={{
                    background: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    borderRadius: "12px",
                    padding: "16px",
                  }}
                >
                  <div
                    style={{
                      color: "#1e40af",
                      fontSize: "11px",
                      fontWeight: "600",
                      letterSpacing: "0.5px",
                      textTransform: "uppercase",
                      marginBottom: "8px",
                    }}
                  >
                    Status
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <i
                      className="fa-solid fa-check-circle"
                      style={{
                        color: "#3b82f6",
                        fontSize: "16px",
                      }}
                    ></i>
                    <span
                      style={{
                        fontSize: "15px",
                        fontWeight: "700",
                        color: "#1e40af",
                      }}
                    >
                      ACTIVE
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    background: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    borderRadius: "12px",
                    padding: "16px",
                  }}
                >
                  <div
                    style={{
                      color: "#1e40af",
                      fontSize: "11px",
                      fontWeight: "600",
                      letterSpacing: "0.5px",
                      textTransform: "uppercase",
                      marginBottom: "8px",
                    }}
                  >
                    Default Password
                  </div>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: "700",
                      color: "#1e40af",
                      fontFamily: "Courier New, monospace",
                      letterSpacing: "1px",
                    }}
                  >
                    {resetSuccessData.password}
                  </div>
                </div>
              </div>

              {/* Password Box */}
              <div
                style={{
                  background: "#f3e8ff",
                  border: "2px solid #d8b4fe",
                  borderRadius: "12px",
                  padding: "20px",
                  marginBottom: "24px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                  }}
                >
                  <i
                    className="fa-solid fa-lightbulb"
                    style={{
                      color: "#a855f7",
                      fontSize: "18px",
                      marginTop: "2px",
                      flexShrink: 0,
                    }}
                  ></i>
                  <div>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#6b21a8",
                        marginBottom: "6px",
                      }}
                    >
                      Quick Start
                    </div>
                    <ul
                      style={{
                        fontSize: "13px",
                        color: "#7e22ce",
                        margin: 0,
                        paddingLeft: "20px",
                        lineHeight: "1.6",
                      }}
                    >
                      <li>User can login with the default password above</li>
                      <li>
                        A reset link was sent to:{" "}
                        <strong>{resetSuccessData.email}</strong>
                      </li>
                      <li>User should set a new password on first login</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Email Sent Info */}
              <div
                style={{
                  background: "#fef3c7",
                  border: "1px solid #fcd34d",
                  borderRadius: "12px",
                  padding: "12px 16px",
                  marginBottom: "24px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <i
                  className="fa-solid fa-envelope"
                  style={{
                    color: "#d97706",
                    fontSize: "16px",
                    flexShrink: 0,
                  }}
                ></i>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#92400e",
                    fontWeight: "500",
                  }}
                >
                  Reset email sent to <strong>{resetSuccessData.email}</strong>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => setShowResetSuccessModal(false)}
                style={{
                  width: "100%",
                  background:
                    "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  color: "#fff",
                  border: "none",
                  padding: "14px 20px",
                  borderRadius: "10px",
                  fontSize: "15px",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
                  letterSpacing: "0.3px",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow =
                    "0 8px 20px rgba(16, 185, 129, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow =
                    "0 4px 12px rgba(16, 185, 129, 0.3)";
                }}
              >
                <i
                  className="fa-solid fa-check"
                  style={{ marginRight: "8px" }}
                ></i>
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ManageUsers;

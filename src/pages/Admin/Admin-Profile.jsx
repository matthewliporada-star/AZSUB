import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import supabase from "../../config/supabaseClient";
import "./Style/Profile.css?v=1.0";

const AdminProfile = () => {
  const navigate = useNavigate();
  const { darkMode } = useApp();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Profile Form State
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    Middle: "",
    gender: "",
    birthday: "",
    email: "",
    contact_number: "",
    Address: "",
    civil_status: ""
  });

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        alert("You need to login first");
        navigate("/");
        return;
      }

      const type = session.user.user_metadata?.account_type;
      if (!type || type.toLowerCase() !== "admin") {
        alert("You do not have access to this page");
        navigate("/");
        return;
      }

      setUser(session.user);
      fetchUserProfile(session.user.id);
    };

    checkAdmin();
  }, [navigate]);

  const fetchUserProfile = async (userId) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (data) {
      setProfile(data);
      setFormData({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        Middle: data.Middle || "",
        gender: data.gender || "",
        birthday: data.birthday || "",
        email: data.email || "",
        contact_number: data.contact_number || "",
        Address: data.Address || "",
        civil_status: data.civil_status || ""
      });
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from("profiles")
      .update(formData)
      .eq("id", user.id);

    if (error) {
      alert("Error updating profile: " + error.message);
    } else {
      alert("Profile updated successfully!");
      setIsModalOpen(false);
      fetchUserProfile(user.id);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }

    try {
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwordData.oldPassword,
      });

      if (reauthError) {
        alert("Verification failed: Current password is incorrect.");
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (updateError) throw updateError;

      alert("Password updated successfully!");
      setIsPasswordModalOpen(false);
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div>
      <div className="profile-card">
        
        {/* HEADER SECTION */}
        <div className="profile-header">
          <div className="profile-header-left">
            <div className="profile-avatar-large">
              {profile?.last_name?.charAt(0).toUpperCase() || "A"}
            </div>
            <div className="user-text-container">
              <h2>{profile?.first_name} {profile?.last_name}</h2>
              <span className="badge-admin">Administrator Account</span>
            </div>
          </div>
          <div className="btn-group">
            <button className="update-btn btn-outline" onClick={() => setIsPasswordModalOpen(true)}>
              <i className="fa-solid fa-shield-halved"></i> Security
            </button>
            <button className="update-btn btn-primary" onClick={() => setIsModalOpen(true)}>
              <i className="fa-solid fa-pen-to-square"></i> Update Info
            </button>
          </div>
        </div>

        {/* PROFILE INFORMATION GRID */}
        <div className="profile-info-grid">
          {/* Personal Section */}
          <div className="info-section">
            <div className="section-title-wrapper">
              <h3>Personal Information</h3>
            </div>
            <div className="info-group-stack">
              <div className="info-item">
                <span className="info-label">Full Name</span>
                <span className="info-value">{profile?.first_name} {profile?.Middle !== "N/A" ? profile?.Middle : ""} {profile?.last_name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Gender</span>
                <span className="info-value">{profile?.gender || "Not specified"}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Birthday</span>
                <span className="info-value">{profile?.birthday || "N/A"}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Civil Status</span>
                <span className="info-value">{profile?.civil_status || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="info-section">
            <div className="section-title-wrapper">
              <h3>Contact & Location</h3>
            </div>
            <div className="info-group-stack">
              <div className="info-item full-width">
                <span className="info-label">Email Address</span>
                <span className="info-value">{profile?.email}</span>
              </div>
              <div className="info-item full-width">
                <span className="info-label">Phone Number</span>
                <span className="info-value">{profile?.contact_number || "N/A"}</span>
              </div>
              <div className="info-item full-width">
                <span className="info-label">Office Address</span>
                <span className="info-value">{profile?.Address || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: UPDATE PROFILE */}
{isModalOpen && (
  <div className="modal-overlay">
    <div className="modal-card">
      <div className="modal-header">
        <div className="modal-header-icon">
          <i className="fa-solid fa-user-pen"></i>
        </div>
        <div className="modal-header-text">
          <h3>Update Profile Information</h3>
          <p className="modal-subtitle">Modify your personal details and contact information.</p>
        </div>
        <button className="close-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
      </div>

      <form onSubmit={handleUpdate}>
        <div className="modal-body">
          <div className="form-grid-layout">
            
            {/* Row 1: Names */}
            <div className="input-box">
              <label>First Name</label>
              <input type="text" placeholder="First Name" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} />
            </div>
            <div className="input-box">
              <label>Last Name</label>
              <input type="text" placeholder="Last Name" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} />
            </div>
            <div className="input-box">
              <label>Middle Name</label>
              <input type="text" placeholder="Middle Name" value={formData.Middle} onChange={(e) => setFormData({ ...formData, Middle: e.target.value })} />
            </div>

            {/* Row 2: Status & Gender */}
            <div className="input-box">
              <label>Gender</label>
              <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div className="input-box">
              <label>Civil Status</label>
              <select value={formData.civil_status} onChange={(e) => setFormData({ ...formData, civil_status: e.target.value })}>
                <option value="">Select Status</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Widowed">Widowed</option>
                <option value="Divorced">Divorced</option>
              </select>
            </div>
            <div className="input-box">
              <label>Birthday</label>
              <input type="date" value={formData.birthday} onChange={(e) => setFormData({ ...formData, birthday: e.target.value })} />
            </div>

            {/* Row 3: Contact */}
            <div className="input-box full-width">
              <label>Email Address</label>
              <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <div className="input-box full-width">
              <label>Contact Number</label>
              <input type="text" placeholder="Contact Number" value={formData.contact_number} onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })} />
            </div>

            {/* Row 4: Address */}
            <div className="input-box full-width">
              <label>Office/Home Address</label>
              <input type="text" placeholder="Complete Address" value={formData.Address} onChange={(e) => setFormData({ ...formData, Address: e.target.value })} />
            </div>
          </div>
        </div>

        <div className="modal-actions-footer">
          <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Discard Changes</button>
          <button type="submit" className="btn-save-security">Save Profile</button>
        </div>
      </form>
    </div>
  </div>
)}

{isPasswordModalOpen && (
  <div className="modal-overlay">
    <div className="modal-card"> {/* Changed from modal-content security-modal to modal-card */}
      <div className="modal-header">
        <div className="modal-header-icon">
          <i className="fa-solid fa-shield-lock"></i>
        </div>
        <div className="modal-header-text">
          <h3>Change Password</h3>
          <p className="modal-subtitle">Ensure your account stays secure with a strong password.</p>
        </div>
        <button className="close-btn" onClick={() => setIsPasswordModalOpen(false)}>&times;</button>
      </div>

      <form onSubmit={handleChangePassword}>
        <div className="modal-body">
          <div className="password-form-stack">
            <div className="input-box"> {/* Standardized to input-box */}
              <label>Current Password</label>
              <div className="input-wrapper">
                <i className="fa-solid fa-key"></i>
                <input
                  type="password"
                  placeholder="Enter current password"
                  required
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                />
              </div>
            </div>

            <div className="password-divider-text">New Security Credentials</div>

            <div className="input-box"> {/* Standardized to input-box */}
              <label>New Password</label>
              <div className="input-wrapper">
                <i className="fa-solid fa-lock"></i>
                <input
                  type="password"
                  placeholder="Minimum 8 characters"
                  required
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                />
              </div>
            </div>

            <div className="input-box"> {/* Standardized to input-box */}
              <label>Confirm New Password</label>
              <div className="input-wrapper">
                <i className="fa-solid fa-circle-check"></i>
                <input
                  type="password"
                  placeholder="Repeat new password"
                  required
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="modal-actions-footer">
          <button type="button" className="btn-cancel" onClick={() => setIsPasswordModalOpen(false)}>
            Discard Changes
          </button>
          <button type="submit" className="btn-save-security">
            Update Password
          </button>
        </div>
      </form>
    </div>
  </div>
)}
    </div>
  );
}

export default AdminProfile;
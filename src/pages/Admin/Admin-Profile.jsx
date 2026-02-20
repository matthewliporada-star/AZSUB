import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import supabase from "../../config/supabaseClient";
import "./Style/Profile.css";

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
    const { data, error } = await supabase
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
      // Step 1: Re-authenticate user by signing in again with old password
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwordData.oldPassword,
      });

      if (reauthError) {
        alert("Verification failed: Current password is incorrect.");
        return;
      }

      // Step 2: Update password
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
    <div className="dashboard-content" style={{ padding: '40px 50px' }}>
      {/* MAIN CONTENT */}
      <div className="profile-card" style={{ maxWidth: '800px', margin: '0 auto', background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <div className="profile-header" style={{ borderBottom: '1px solid #eee', paddingBottom: '20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div className="profile-avatar-large" style={{ width: '80px', height: '80px', background: '#0f172a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '32px', fontWeight: 'bold' }}>
              {profile?.last_name?.charAt(0).toUpperCase() || "A"}
            </div>
            <div>
              <h2 style={{ margin: 0, color: '#333' }}>{profile?.first_name} {profile?.last_name}</h2>
              <p style={{ margin: 0, color: '#777' }}>Administrator Account</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="update-btn" onClick={() => setIsPasswordModalOpen(true)} style={{ background: '#475569', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>
              Change Password
            </button>
            <button className="update-btn" onClick={() => setIsModalOpen(true)} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>
              <i className="fa-solid fa-pen-to-square" style={{ marginRight: '8px' }}></i> Update Info
            </button>
          </div>
        </div>

        <table className="profile-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {[
              { label: "Last Name", value: profile?.last_name },
              { label: "First Name", value: profile?.first_name },
              { label: "Middle Name/Suffix", value: profile?.Middle },
              { label: "Gender", value: profile?.gender },
              { label: "Birthday", value: profile?.birthday },
              { label: "Email", value: profile?.email },
              { label: "Contact", value: profile?.contact_number },
              { label: "Address", value: profile?.Address },
              { label: "Civil Status", value: profile?.civil_status }
            ].map((row, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #f8f9fa' }}>
                <td style={{ padding: '16px', width: '30%', color: '#64748b', fontWeight: '500' }}>{row.label}</td>
                <td style={{ padding: '16px', color: '#333', fontWeight: '600' }}>{row.value || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PROFILE UPDATE MODAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-title" style={{ padding: '22px 35px', borderBottom: '1px solid var(--border-color)', background: '#f7f9fc' }}>Update Profile Information</div>
            <form onSubmit={handleUpdate} className="profile-form modal-form">
              <div className="form-grid">
                <input type="text" placeholder="First Name" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} />
                <input type="text" placeholder="Last Name" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} />
                <input type="text" placeholder="Middle Name" value={formData.Middle} onChange={(e) => setFormData({ ...formData, Middle: e.target.value })} />

                <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>

                <input type="date" value={formData.birthday} onChange={(e) => setFormData({ ...formData, birthday: e.target.value })} />
                <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                <input type="text" placeholder="Contact Number" value={formData.contact_number} onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })} />
                <input type="text" placeholder="Address" value={formData.Address} onChange={(e) => setFormData({ ...formData, Address: e.target.value })} />

                <select value={formData.civil_status} onChange={(e) => setFormData({ ...formData, civil_status: e.target.value })}>
                  <option value="">Select Civil Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Annulled">Annulled</option>
                </select>
              </div>
              <div className="modal-buttons" style={{ padding: '18px 35px', borderTop: '1px solid var(--border-color)', background: '#f7f9fc' }}>
                <button type="button" className="modal-close" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="modal-submit">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD MODAL */}
      {isPasswordModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content password-modal">
            <div className="modal-title" style={{ padding: '22px 35px', borderBottom: '1px solid var(--border-color)', background: '#f7f9fc' }}>Change Password</div>
            <form onSubmit={handleChangePassword} className="modal-form">
              <p className="modal-subtitle" style={{ padding: '20px 35px 0 35px', marginBottom: '15px' }}>Verify your current password to update security.</p>
              <div className="password-form-stack">
                <div className="input-group">
                  <label>Old Password</label>
                  <input
                    type="password"
                    placeholder="Current password"
                    required
                    value={passwordData.oldPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                  />
                </div>
                <hr className="password-divider" />
                <div className="input-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    placeholder="Minimum 6 characters"
                    required
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    required
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-buttons" style={{ padding: '18px 35px', borderTop: '1px solid var(--border-color)', background: '#f7f9fc' }}>
                <button type="button" className="modal-close" onClick={() => setIsPasswordModalOpen(false)}>Cancel</button>
                <button type="submit" className="modal-submit">Update Password</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfile;
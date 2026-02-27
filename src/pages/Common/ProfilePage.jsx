import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import supabase from "../../config/supabaseClient";
import "./Style/Profile.css?v=2.2";

const ProfilePage = () => {
    const navigate = useNavigate();
    const { darkMode, loadUser, setCurrentUser } = useApp();
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const getMaxDate = () => {
        const today = new Date();
        const eighteenYearsAgo = new Date(
            today.getFullYear() - 18,
            today.getMonth(),
            today.getDate()
        );
        // Format to YYYY-MM-DD for the input 'max' attribute
        return eighteenYearsAgo.toISOString().split("T")[0];
    };
    // FIX: Move these inside the component
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        id: "", // Added this to track the user ID for the query
        first_name: "",
        last_name: "",
        Middle: "",
        gender: "",
        birthday: "",
        email: "",
        contact_number: "",
        Address: "",
        avatar_url: "" // Added this
    });

    // Password Form State
    const [passwordData, setPasswordData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    // Add body class so CSS can fill the main-content background
    // Removed `document.body.classList.add('page-profile')` to prevent it from leaking into the MP layout.

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                navigate("/");
                return;
            }

            setUser(session.user);
            fetchUserProfile(session.user.id);
        };

        fetchUser();
    }, [navigate]);

    const fetchUserProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", userId)
                .single();

            if (error) throw error;

            if (data) {
                // Update the display state
                setProfile(data);

                // Update the editable form state
                setFormData({
                    id: data.id, // CRITICAL: Required for the .eq('id', formData.id) in handleUpdate
                    first_name: data.first_name || "",
                    last_name: data.last_name || "",
                    Middle: data.Middle || "",
                    gender: data.gender || "",
                    birthday: data.birthday || "",
                    email: data.email || "",
                    // Ensure contact_number is a string for the input field, even if null
                    contact_number: data.contact_number ? data.contact_number.toString() : "",
                    Address: data.Address || "",
                    avatar_url: data.avatar_url || ""
                });

                // Set the preview URL so the modal shows the current image immediately
                if (data.avatar_url) {
                    setPreviewUrl(data.avatar_url);
                }
            }
        } catch (err) {
            console.error("Error fetching profile:", err.message);
        }
    };
    const isUnder18 = (dateString) => {
        if (!dateString) return false;
        const today = new Date();
        const birthDate = new Date(dateString);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age < 18;
    };
    const handleUpdate = async (e) => {
        e.preventDefault();
        setUploading(true);

        try {
            // Start with the existing URL from the database
            let finalAvatarUrl = formData.avatar_url;

            // 1. If a new file was selected, upload it to Supabase Storage
            if (file) {
                const fileExt = file.name.split('.').pop();
                // Using user id + timestamp to keep filenames unique
                const fileName = `${formData.id}-${Date.now()}.${fileExt}`;
                const filePath = `avatars/${fileName}`;

                // Upload the file to the 'avatars' bucket
                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                // Get the public URL for the newly uploaded image
                const { data: publicUrlData } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(filePath);

                finalAvatarUrl = publicUrlData.publicUrl;
            }

            // 2. Prepare the update payload based on your table columns
            const updatePayload = {
                first_name: formData.first_name,
                last_name: formData.last_name,
                Middle: formData.Middle, // Matches your 'Middle' column
                gender: formData.gender,
                birthday: formData.birthday,
                email: formData.email,
                Address: formData.Address, // Matches your 'Address' column
                avatar_url: finalAvatarUrl, // Updated image URL
                // Since contact_number is int8, we remove any formatting and convert to Number
                contact_number: formData.contact_number ? parseInt(formData.contact_number) : null
            };

            // 3. Perform the update in the 'profiles' table
            const { error: updateError } = await supabase
                .from('profiles')
                .update(updatePayload)
                .eq('id', formData.id);

            if (updateError) throw updateError;

            // 1. Manually update the context state immediately for instant UI feedback
            setCurrentUser(prev => ({
                ...prev,
                avatarUrl: finalAvatarUrl,
                name: `${formData.first_name} ${formData.last_name}`.trim(),
                firstName: formData.first_name,
                lastName: formData.last_name
            }));

            // 2. Refresh global user state through the API as a background sync
            await loadUser();

            // 3. Refresh local profile state to update the page view
            if (formData.id) {
                await fetchUserProfile(formData.id);
            }

            setIsModalOpen(false);

            // Short timeout to allow the UI to re-render before showing the blocking alert
            setTimeout(() => {
                alert("Profile updated successfully!");
            }, 100);
        } catch (error) {
            console.error("Update error:", error);
            alert(error.message || "An error occurred while updating your profile.");
        } finally {
            setUploading(false);
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
        <div className="page-profile-wrapper">
            <div className="profile-page-content">
                {/* BACK BUTTON */}
                <div style={{ marginBottom: '16px' }}>
                    <button
                        onClick={() => navigate(-1)}
                        className="btn-back"
                        style={{
                            background: 'none',
                            border: 'none',
                            color: darkMode ? '#94a3b8' : '#64748b',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '14px',
                            fontWeight: '600'
                        }}
                    >
                        <i className="fa-solid fa-arrow-left"></i> Back to Dashboard
                    </button>
                </div>

                <div className="profile-card animate-spring">
                    {/* HEADER SECTION */}
                    <div className="profile-header">
                        <div className="profile-header-left">
                            <div className="profile-avatar-large">
                                {profile?.avatar_url ? (
                                    <img
                                        src={profile.avatar_url}
                                        alt="Profile"
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            borderRadius: '50%'
                                        }}
                                    />
                                ) : (
                                    profile?.last_name?.charAt(0).toUpperCase() || "U"
                                )}
                            </div>
                            <div className="user-text-container">
                                <h2>{profile?.first_name} {profile?.last_name}</h2>
                                <span className="badge-admin">
                                    {profile?.account_type ? `${profile.account_type} Account` : "User Account"}
                                </span>
                            </div>
                        </div>
                        <div className="profile-header-actions">
                            <button className="btn-security" onClick={() => setIsPasswordModalOpen(true)}>
                                <i className="fa-solid fa-shield-halved"></i> Security
                            </button>
                            <button className="btn-update" onClick={() => setIsModalOpen(true)}>
                                <i className="fa-solid fa-pen-to-square"></i> Update Info
                            </button>
                        </div>
                    </div>

                    {/* PROFILE INFORMATION GRID */}
                    <div className="profile-info-grid">
                        {/* Personal Section */}
                        <div className="info-section">
                            <div className="info-section-title">Personal Information</div>
                            <div className="info-group-stack">
                                <div className="info-item">
                                    <span className="info-label">Full Name</span>
                                    <span className="info-value">{profile?.first_name} {profile?.Middle && profile?.Middle !== "N/A" ? profile?.Middle : ""} {profile?.last_name}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Gender</span>
                                    <span className="info-value">{profile?.gender || "Not specified"}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Birthday</span>
                                    <span className="info-value">{profile?.birthday || "N/A"}</span>
                                </div>
                            </div>
                        </div>

                        {/* Contact Section */}
                        <div className="info-section">
                            <div className="info-section-title">Contact & Location</div>
                            <div className="info-group-stack">
                                <div className="info-item full-width">
                                    <span className="info-label">Email Address</span>
                                    <span className="info-value">{profile?.email}</span>
                                </div>
                                <div className="info-item full-width">
                                    <span className="info-label">Phone Number</span>
                                    <span className="info-value">+63 {profile?.contact_number || "N/A"}</span>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

                {/* MODAL: UPDATE PROFILE */}
                {isModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-card wide-modal">
                            <div className="modal-header">
                                <div className="header-content" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                    <div className="modal-header-icon">
                                        <i className="fa-solid fa-user-pen"></i>
                                    </div>
                                    <div className="modal-header-text">
                                        <h3>Update Profile Information</h3>
                                        <p className="modal-subtitle">Modify your personal details and contact information.</p>
                                    </div>
                                </div>
                                <button className="close-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
                            </div>

                            <form onSubmit={handleUpdate}>
                                <div className="modal-body-split">

                                    {/* LEFT: FORM FIELDS */}
                                    <div className="modal-form-inputs">

                                        <h4 className="section-title">Personal Details</h4>

                                        <div className="form-grid-layout">
                                            <div className="input-box">
                                                <label>First Name</label>
                                                <input type="text" placeholder="e.g. John" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} />
                                            </div>
                                            <div className="input-box">
                                                <label>Middle Name</label>
                                                <input type="text" placeholder="Middle Name" value={formData.Middle} onChange={(e) => setFormData({ ...formData, Middle: e.target.value })} />
                                            </div>
                                            <div className="input-box">
                                                <label>Last Name</label>
                                                <input type="text" placeholder="e.g. Doe" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} />
                                            </div>

                                            <div className="input-box">
                                                <label>Gender</label>
                                                <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })}>
                                                    <option value="">Select</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                </select>
                                            </div>
                                            <div className="input-box">
                                                <label>Birthday</label>
                                                <input
                                                    type="date"
                                                    value={formData.birthday}
                                                    max={getMaxDate()}
                                                    onChange={(e) => {
                                                        const selectedDate = e.target.value;
                                                        if (selectedDate > getMaxDate()) {
                                                            alert("You must be at least 18 years old.");
                                                            return;
                                                        }
                                                        setFormData({ ...formData, birthday: selectedDate });
                                                    }}
                                                />
                                                {isUnder18(formData.birthday) && (
                                                    <span className="error-text" style={{ display: "block", marginTop: "4px", fontSize: "12px", color: darkMode ? "#f87171" : "#ef4444" }}>Must be 18+ years old</span>
                                                )}
                                            </div>
                                        </div>

                                        <h4 className="section-title full-width" style={{ marginTop: "8px" }}>Contact Information</h4>

                                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                            <div className="input-box full-width">
                                                <label>Email Address</label>
                                                <input type="email" placeholder="john.doe@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                                            </div>

                                            <div className="input-box full-width">
                                                <label>Contact Number</label>
                                                <div className="contact-input-container">
                                                    <span className="country-code">+63</span>
                                                    <input
                                                        type="text"
                                                        className="phone-input"
                                                        placeholder="912 345 6789"
                                                        value={formData.contact_number}
                                                        maxLength="10"
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (/^\d*$/.test(val)) setFormData({ ...formData, contact_number: val });
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* RIGHT: PHOTO UPLOAD */}
                                    <div className="modal-preview-sidebar">
                                        <label className="preview-label" style={{ display: "block", fontSize: "11px", fontWeight: "700", color: darkMode ? "#94a3b8" : "#475569", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "16px", width: "100%", textAlign: "center" }}>Profile Picture</label>
                                        <div className="avatar-upload-wrapper">
                                            <div className={`large-avatar-preview ${!previewUrl ? 'is-empty' : ''}`}>
                                                {previewUrl ? (
                                                    <img src={previewUrl} alt="Profile" className="preview-img" />
                                                ) : (
                                                    <div className="empty-avatar-placeholder">
                                                        <i className="fa-solid fa-user"></i>
                                                    </div>
                                                )}

                                                <label htmlFor="file-upload" className="upload-overlay">
                                                    <i className="fa-solid fa-camera"></i>
                                                    <span style={{ fontSize: "12px", marginTop: "4px" }}>{previewUrl ? "Change Photo" : "Upload Photo"}</span>
                                                </label>
                                            </div>

                                            <input
                                                id="file-upload"
                                                type="file"
                                                hidden
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const selectedFile = e.target.files[0];
                                                    if (selectedFile) {
                                                        setFile(selectedFile);
                                                        setPreviewUrl(URL.createObjectURL(selectedFile));
                                                    }
                                                }}
                                            />
                                        </div>
                                        <p className="preview-hint">JPG or PNG. Max 5MB.</p>
                                    </div>

                                </div>

                                <div className="modal-actions-footer">
                                    <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Discard</button>
                                    <button
                                        type="submit"
                                        className="btn-save-security"
                                        disabled={uploading || isUnder18(formData.birthday)}
                                        style={{ opacity: (uploading || isUnder18(formData.birthday)) ? 0.7 : 1 }}
                                    >
                                        {uploading ? <><i className="fa-solid fa-spinner fa-spin"></i> Saving...</> : "Save Profile"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}


                {isPasswordModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-card">
                            <div className="modal-header">
                                <div className="modal-header-text" style={{ flexGrow: 1, textAlign: "center", marginRight: "-20px" }}>
                                    <h3>Change Password</h3>
                                    <p className="modal-subtitle">Ensure your account stays secure with a strong password.</p>
                                </div>
                                <button className="close-btn" onClick={() => setIsPasswordModalOpen(false)}>&times;</button>
                            </div>

                            <form onSubmit={handleChangePassword}>
                                <div className="modal-body">
                                    <div className="password-form-stack">

                                        <div className="input-box">
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

                                        <div className="password-divider-text">
                                            New Security Credentials
                                            <div className="divider-line"></div>
                                        </div>

                                        <div className="input-box">
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

                                        <div className="input-box">
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
        </div>
    );
};

export default ProfilePage;

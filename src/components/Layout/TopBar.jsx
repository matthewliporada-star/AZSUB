import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import supabase from '../../config/supabaseClient';
import './TopBar.css';

import logoLight from '../../assets/2.png';
import logoDark from '../../assets/White logo.png';

const TopBar = ({ sidebarOpen = true }) => {
    const { isConnected, currentUser, darkMode, toggleDarkMode } = useApp();
    const location = useLocation();
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);

    // Check if on AP, AL, or Admin pages
    const isDashboardPage = location.pathname.startsWith('/ap') || location.pathname.startsWith('/al') || location.pathname.startsWith('/admin');

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
            navigate('/');
        }
    };

    // Mock user for display if not logged in
    const displayUser = currentUser || {
        name: 'User',
        role: '',
        firstName: 'U'
    };


    return (
        <div className="top-bar">
            <div className="top-bar-content">
                <div className="left-section">
                    <div className="top-bar-logo"></div>
                </div>

                <div className="center-section" style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
                    {!sidebarOpen && (
                        <img
                            src={darkMode ? logoDark : logoLight}
                            alt="Caelum"
                            style={{ height: '50px', width: 'auto', transition: 'all 0.3s ease' }}
                        />
                    )}
                </div>
                <div className="right-section" style={{ display: 'flex', alignItems: 'center', gap: '20px', marginLeft: 'auto' }}>
                    <button
                        className="dark-mode-toggle"
                        onClick={toggleDarkMode}
                        title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '18px',
                            marginRight: '10px',
                            transition: 'color 0.3s ease'
                        }}
                    >
                        <i className={`fa-solid ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
                    </button>

                    {isDashboardPage && (
                        <div className="profile-section" style={{ position: 'relative' }}>
                            <div
                                className="profile-trigger"
                                onClick={() => setShowDropdown(!showDropdown)}
                                style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                            >
                                <div className="profile-icon">
                                    {/* Placeholder Icon */}
                                    <div className="avatar-circle">
                                        {(displayUser.firstName || displayUser.name || displayUser.username || 'U').charAt(0).toUpperCase()}
                                    </div>
                                </div>

                                <div className="profile-info" style={{ textAlign: 'left' }}>
                                    <div className="profile-name" style={{ fontWeight: '600', fontSize: '0.9rem' }}>{displayUser.name || displayUser.username}</div>
                                    <div className="profile-role" style={{ fontSize: '0.75rem' }}>{displayUser.role}</div>
                                </div>
                            </div>

                            {showDropdown && (
                                <div className="profile-dropdown">
                                    <div className="dropdown-item" onClick={() => navigate('/profile')}>Profile</div>
                                    {location.pathname.startsWith('/admin') && (
                                        <div className="dropdown-item" onClick={() => navigate('/admin/SerialNumber')}>Serial Number</div>
                                    )}
                                    <div className="dropdown-item logout-item" onClick={handleLogout}>Logout</div>
                                </div>
                            )}

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TopBar;
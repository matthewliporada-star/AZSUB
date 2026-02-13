import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import supabase from '../../config/supabaseClient';
import './TopBar.css';

import topLogo from '../../assets/2.png';

const TopBar = ({ sidebarOpen = true }) => {
    const { isConnected, currentUser, darkMode, toggleDarkMode } = useApp();
    const location = useLocation();
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);

    // Check if on AP or AL pages
    const isDashboardPage = location.pathname.startsWith('/ap') || location.pathname.startsWith('/al');

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
        name: 'archie verania',
        role: 'AL',
        firstName: 'archie'
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
                            src={topLogo}
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
                            color: darkMode ? '#FFBD42' : '#64748b',
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
                                    <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {(displayUser.firstName || displayUser.name || displayUser.username || 'U').charAt(0).toUpperCase()}
                                    </div>
                                </div>
                                <div className="profile-info" style={{ textAlign: 'left' }}>
                                    <div className="profile-name" style={{ fontWeight: '600', fontSize: '0.9rem' }}>{displayUser.name || displayUser.username}</div>
                                    <div className="profile-role" style={{ fontSize: '0.75rem', opacity: 0.8 }}>{displayUser.role}</div>
                                </div>
                            </div>

                            {showDropdown && (
                                <div className="profile-dropdown" style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: 0,
                                    marginTop: '10px',
                                    background: 'white',
                                    padding: '10px',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    minWidth: '150px',
                                    zIndex: 1000
                                }}>
                                    <div className="dropdown-item" style={{ padding: '8px 12px', cursor: 'pointer', borderRadius: '4px' }} onClick={() => console.log('Profile clicked')}>Profile</div>
                                    <div className="dropdown-item" style={{ padding: '8px 12px', cursor: 'pointer', borderRadius: '4px', color: 'red' }} onClick={handleLogout}>Logout</div>
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
// MDLayout.jsx - Admin-styled layout for Management Directors
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import './MD_Styles.css';
// Import logos (adjust paths as needed)
import sidebarLogo from '../../assets/White logo.png';
import topLogo from '../../assets/2.png';

const MDLayout = ({ children, title = 'Dashboard' }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { currentUser, userRole, darkMode, toggleDarkMode } = useApp();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const mdMenuItems = [
        {
            path: '/md/dashboard',
            label: 'Dashboard',
            icon: <i className="fa-solid fa-chart-pie"></i>
        },
        {
            path: '/md/mp-performance',
            label: 'Management Partners',
            icon: <i className="fa-solid fa-briefcase"></i>
        },
        {
            path: '/md/al-performance',
            label: 'Agency Leaders',
            icon: <i className="fa-solid fa-users"></i>
        },
        {
            path: '/md/ap-performance',
            label: 'Agency Partners',
            icon: <i className="fa-solid fa-user-group"></i>
        }
    ];

    const handleLogout = async () => {
        localStorage.removeItem('mdData');
        navigate('/');
    };

    return (
        <div className="md-layout">
            {/* SIDEBAR */}
            <aside className={`md-sidebar ${sidebarOpen ? '' : 'collapsed'}`}>
                <button
                    className="md-sidebar-toggle"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
                >
                    <i className={`fa-solid ${sidebarOpen ? 'fa-chevron-left' : 'fa-chevron-right'}`}></i>
                </button>

                <div className="sidebar-header">
                    <Link to="/md/dashboard" className="sidebar-logo" title="MD Dashboard">
                        {sidebarOpen ? (
                            <img src={sidebarLogo} alt="Caelum Logo" className="sidebar-logo-img" />
                        ) : (
                            <img src={sidebarLogo} alt="C" className="sidebar-logo-img collapsed" />
                        )}
                    </Link>
                </div>

                <div className="sidebar-menu">
                    {mdMenuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            <div className="sidebar-icon">{item.icon}</div>
                            {sidebarOpen && <span>{item.label}</span>}
                        </Link>
                    ))}
                </div>

                <div className="sidebar-footer">
                    {/* Optional footer content if needed */}
                </div>
            </aside>

            {/* HEADER */}
            <header className={`md-header ${sidebarOpen ? '' : 'expanded'}`}>
                <div className="md-header-content">
                    <div className="header-left">
                        {sidebarOpen && <h1 className="header-title-inline">{title}</h1>}
                    </div>

                    <div className="header-center-logo">
                        {!sidebarOpen && (
                            <img src={topLogo} alt="Logo" className="header-logo-img" />
                        )}
                    </div>

                    <div className="md-header-user">
                        <button
                            className="md-dark-mode-toggle"
                            onClick={toggleDarkMode}
                            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginRight: '15px', fontSize: '18px', color: darkMode ? '#e2e8f0' : '#64748b', transition: 'color 0.3s' }}
                        >
                            <i className={`fa-solid ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
                        </button>
                        <button
                            className="md-user-profile-btn"
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                        >
                            <div className="md-user-avatar">
                                {currentUser?.name ? (
                                    <span>{currentUser.name.charAt(0).toUpperCase()}</span>
                                ) : (
                                    <i className="fa-solid fa-user"></i>
                                )}
                            </div>
                            <span>{currentUser?.name || 'Management Director'} - {userRole || 'MD'}</span>
                        </button>

                        {showProfileMenu && (
                            <div className="md-profile-dropdown">
                                <div className="md-dropdown-item" onClick={() => navigate('/profile')}>
                                    <i className="fa-solid fa-user"></i> Profile
                                </div>
                                <hr className="md-dropdown-divider" />
                                <button onClick={handleLogout} className="md-dropdown-item md-logout-item">
                                    <i className="fa-solid fa-right-from-bracket"></i> Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className={`main-content ${sidebarOpen ? '' : 'expanded'}`}>
                <div className="container">
                    {/* Page Title - Only when Sidebar Closed */}
                    {!sidebarOpen && (
                        <div className="md-dashboard-header">
                            <h1>{title}</h1>
                        </div>
                    )}
                    {children}
                </div>
            </main>
        </div>
    );
};

export default MDLayout;
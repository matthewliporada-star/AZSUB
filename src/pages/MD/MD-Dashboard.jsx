import supabase from "../../config/supabaseClient";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useApp();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className={`page create ${darkMode ? 'dark-mode' : ''}`} style={{
      minHeight: '100vh',
      padding: '20px',
      background: darkMode ? '#161B22' : '#fff',
      color: darkMode ? '#f1f5f9' : '#333'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Welcome MD</h2>
        <button
          onClick={toggleDarkMode}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '24px',
            color: darkMode ? '#e2e8f0' : '#64748b'
          }}
        >
          <i className={`fa-solid ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
        </button>
      </div>

      <button
        onClick={handleLogout}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          background: "#003781",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: "600"
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default Dashboard;

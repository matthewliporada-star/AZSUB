// src/pages/Common/WaitingForAccess.jsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import supabase from "../../config/supabaseClient";

const WaitingForAccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const accessType = searchParams.get("type");
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [cisAccess, setCisAccess] = useState("Disable");
  const [azSubAccess, setAzSubAccess] = useState("Disable");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/verify-identity");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name, account_type")
        .eq("id", session.user.id)
        .single();

      if (profile) {
        setUserName(`${profile.first_name} ${profile.last_name}`);
        setUserRole(profile.account_type);
      }

      const { data: accessData } = await supabase
        .from("user_access")
        .select("cis_access, az_sub_access")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (accessData) {
        setCisAccess(accessData.cis_access || "Disable");
        setAzSubAccess(accessData.az_sub_access || "Disable");
      }
    } catch (err) {
      console.error("Error checking user:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Clear any stored session data
    localStorage.clear();
    sessionStorage.clear();
    // Redirect to landing page (intermediary code page)
    navigate("/verify-identity");
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(255,255,255,0.3)',
          borderTopColor: '#fff',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const isCISOnly = accessType === "cis";
  const hasCISAccess = cisAccess === "Enable";
  const hasAZSubAccess = azSubAccess === "Enable";

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      margin: 0,
      zIndex: 9999
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '48px 40px',
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        animation: 'fadeInUp 0.5s ease-out'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px'
        }}>
          <i className="fa-solid fa-clock" style={{ fontSize: '40px', color: 'white' }}></i>
        </div>
        
        {isCISOnly ? (
          <>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1f2937', marginBottom: '16px' }}>CIS Access Required</h1>
            <p style={{ color: '#6b7280', fontSize: '15px', lineHeight: 1.6, marginBottom: '16px' }}>
              Hello <strong>{userName || "User"}</strong>,
            </p>
            <p style={{ color: '#6b7280', fontSize: '15px', lineHeight: 1.6, marginBottom: '16px' }}>
              Your account as <strong>{userRole}</strong> does not have CIS access enabled.
            </p>
          </>
        ) : (
          <>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1f2937', marginBottom: '16px' }}>Waiting for Access</h1>
            <p style={{ color: '#6b7280', fontSize: '15px', lineHeight: 1.6, marginBottom: '16px' }}>
              Hello <strong>{userName || "User"}</strong>,
            </p>
            <p style={{ color: '#6b7280', fontSize: '15px', lineHeight: 1.6, marginBottom: '16px' }}>
              Your account as <strong>{userRole}</strong> is currently pending access approval.
            </p>
          </>
        )}
        
        
        
        <p style={{
          background: '#eff6ff',
          padding: '16px',
          borderRadius: '12px',
          color: '#1e40af',
          fontSize: '13px',
          margin: '20px 0'
        }}>
          Please contact your administrator to enable access.
        </p>
        
        <button onClick={handleLogout} style={{
          background: '#ef4444',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '12px',
          fontSize: '16px',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          transition: 'all 0.3s ease',
          width: '100%',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#dc2626';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#ef4444';
          e.currentTarget.style.transform = 'translateY(0)';
        }}>
          <i className="fa-solid fa-sign-out-alt"></i>
          Logout
        </button>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
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

export default WaitingForAccess;
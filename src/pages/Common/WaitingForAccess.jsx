// src/pages/Common/WaitingForAccess.jsx - Simplified version
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createPortal } from "react-dom";
import supabase from "../../config/supabaseClient";

const WaitingForAccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserAccess();
  }, []);

  const checkUserAccess = async () => {
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

      const cis = accessData?.cis_access || "Disable";
      const azSub = accessData?.az_sub_access || "Disable";
      
      const role = profile?.account_type?.toLowerCase();

      // If user has any access, redirect appropriately
      if (cis === "Enable" || azSub === "Enable") {
        if (cis === "Enable" && azSub === "Disable") {
          navigate(`/${role}/cis/CISDashboard`, { replace: true });
        } else {
          navigate(`/${role}/dashboard`, { replace: true });
        }
        return;
      }

      setLoading(false);
    } catch (err) {
      console.error("Error checking user:", err);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    sessionStorage.clear();
    navigate("/verify-identity");
  };

  if (loading) {
    return createPortal(
      <div style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#ffffff",
        zIndex: 999999,
      }}>
        <div style={{
          width: "40px",
          height: "40px",
          border: "4px solid #f3f4f6",
          borderTop: "4px solid #003781",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }} />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div style={{
      position: "fixed",
      inset: 0,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "linear-gradient(to bottom right, #003781 0%, #002557 100%)",
      padding: "20px",
      zIndex: 999999,
    }}>
      <div style={{
        background: "white",
        borderRadius: "24px",
        padding: "48px 40px",
        maxWidth: "500px",
        width: "100%",
        textAlign: "center",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
      }}>
        <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#1f2937", marginBottom: "16px" }}>
          Access Required
        </h1>
        <p style={{ color: "#6b7280", fontSize: "15px", marginBottom: "16px" }}>
          Hello <strong>{userName || "User"}</strong>,
        </p>
        <p style={{ color: "#6b7280", fontSize: "15px", marginBottom: "16px" }}>
          Your account as <strong>{userRole}</strong> does not have the required access.
        </p>
        <p style={{
          background: "#eff6ff",
          padding: "16px",
          borderRadius: "12px",
          color: "#1e40af",
          fontSize: "13px",
          margin: "20px 0",
        }}>
          Please contact your administrator to enable access.
        </p>
        <button
          onClick={handleLogout}
          style={{
            background: "#ef4444",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: "12px",
            fontSize: "16px",
            fontWeight: 600,
            cursor: "pointer",
            width: "100%",
          }}
        >
          Logout
        </button>
      </div>
    </div>,
    document.body
  );
};

export default WaitingForAccess;
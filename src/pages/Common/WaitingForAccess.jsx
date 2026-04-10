// src/pages/Common/WaitingForAccess.jsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createPortal } from "react-dom"; // ← ADD THIS
import supabase from "../../config/supabaseClient";

const WaitingForAccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const accessType = searchParams.get("type");
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [cisAccess, setCisAccess] = useState("Disable");
  const [azSubAccess, setAzSubAccess] = useState("Disable");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkUserAndRedirect();
  }, []);

  const checkUserAndRedirect = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

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

      setCisAccess(cis);
      setAzSubAccess(azSub);

      const role = profile?.account_type?.toLowerCase();

      if (cis === "Enable" && azSub === "Disable") {
        navigate(`/${role}/cis/CISDashboard`, { replace: true });
        return;
      }

      if (
        (cis === "Disable" && azSub === "Enable") ||
        (cis === "Enable" && azSub === "Enable")
      ) {
        navigate(`/${role}/dashboard`, { replace: true });
        return;
      }

      setChecking(false);
    } catch (err) {
      console.error("Error checking user:", err);
      setChecking(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    sessionStorage.clear();
    navigate("/verify-identity");
  };

  // ← UPDATED: uses createPortal to escape any parent layout
  if (checking) {
    return createPortal(
      <div
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#ffffff",
          zIndex: 999999,
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            border: "4px solid #f3f4f6",
            borderTop: "4px solid #003781",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            boxSizing: "border-box",
          }}
        />
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          body { overflow: hidden; }
        `}</style>
      </div>,
      document.body, // ← Renders outside the layout tree entirely
    );
  }

  const isCISOnly = accessType === "cis";
  const hasCISAccess = cisAccess === "Enable";
  const hasAZSubAccess = azSubAccess === "Enable";

  return createPortal(
    // ← ALSO portal the main waiting UI
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background:
          "linear-gradient(to bottom right, #003781 0%, #002557 100%)",
        padding: "20px",
        zIndex: 999999,
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "24px",
          padding: "48px 40px",
          maxWidth: "500px",
          width: "100%",
          textAlign: "center",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          animation: "fadeInUp 0.5s ease-out",
        }}
      >
        <div
          style={{
            width: "80px",
            height: "80px",
            background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
          }}
        >
          <i
            className="fa-solid fa-clock"
            style={{ fontSize: "40px", color: "white" }}
          ></i>
        </div>

        {isCISOnly ? (
          <>
            <h1
              style={{
                fontSize: "28px",
                fontWeight: 800,
                color: "#1f2937",
                marginBottom: "16px",
              }}
            >
              CIS Access Required
            </h1>
            <p
              style={{
                color: "#6b7280",
                fontSize: "15px",
                lineHeight: 1.6,
                marginBottom: "16px",
              }}
            >
              Hello <strong>{userName || "User"}</strong>,
            </p>
            <p
              style={{
                color: "#6b7280",
                fontSize: "15px",
                lineHeight: 1.6,
                marginBottom: "16px",
              }}
            >
              Your account as <strong>{userRole}</strong> does not have CIS
              access enabled.
            </p>
          </>
        ) : (
          <>
            <h1
              style={{
                fontSize: "28px",
                fontWeight: 800,
                color: "#1f2937",
                marginBottom: "16px",
              }}
            >
              Waiting for Access
            </h1>
            <p
              style={{
                color: "#6b7280",
                fontSize: "15px",
                lineHeight: 1.6,
                marginBottom: "16px",
              }}
            >
              Hello <strong>{userName || "User"}</strong>,
            </p>
            <p
              style={{
                color: "#6b7280",
                fontSize: "15px",
                lineHeight: 1.6,
                marginBottom: "16px",
              }}
            >
              Your account as <strong>{userRole}</strong> is currently pending
              access approval.
            </p>
          </>
        )}

        <p
          style={{
            background: "#eff6ff",
            padding: "16px",
            borderRadius: "12px",
            color: "#1e40af",
            fontSize: "13px",
            margin: "20px 0",
          }}
        >
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
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            transition: "all 0.3s ease",
            width: "100%",
            justifyContent: "center",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#dc2626";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#ef4444";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <i className="fa-solid fa-sign-out-alt"></i>
          Logout
        </button>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>,
    document.body, // ← Same portal target
  );
};

export default WaitingForAccess;

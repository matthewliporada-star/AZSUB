// src/components/ProtectedRoute.jsx
import { useEffect, useState, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { createPortal } from "react-dom";
import supabase from "../config/supabaseClient";

const FullScreenLoader = () => {
  return createPortal(
    <div style={{ 
      position: 'fixed', 
      inset: 0,
      width: '100vw', 
      height: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: '#ffffff',
      zIndex: 999999,
    }}>
      <div style={{
        width: '50px',
        height: '50px',
        border: '4px solid #f3f4f6',
        borderTop: '4px solid #003781',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }} />
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        body { overflow: hidden; }
      `}</style>
    </div>,
    document.body  // ← Renders OUTSIDE your layout tree entirely
  );
};

const ProtectedRoute = ({ children, requiredRole }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [redirectPath, setRedirectPath] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setRedirectPath("/login");
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("account_type")
          .eq("id", session.user.id)
          .single();

        const role = profile?.account_type?.toLowerCase();

        if (requiredRole && role !== requiredRole.toLowerCase() && 
            role !== "super_admin" && role !== "admin") {
          setRedirectPath("/waiting");
          return;
        }

        const { data: accessData } = await supabase
          .from("user_access")
          .select("cis_access, az_sub_access")
          .eq("user_id", session.user.id)
          .maybeSingle();

        const cis = accessData?.cis_access || "Disable";
        const azSub = accessData?.az_sub_access || "Disable";
        
        const isCISRoute = location.pathname.includes("/cis");

        if (role !== "super_admin" && role !== "admin") {
          if (cis === "Enable" && azSub === "Disable" && !isCISRoute) {
            setRedirectPath(`/${role}/cis/CISDashboard`);
            return;
          }
          if (azSub === "Enable" && cis === "Disable" && isCISRoute) {
            setRedirectPath(`/${role}/dashboard`);
            return;
          }
          if (cis === "Disable" && azSub === "Disable") {
            setRedirectPath("/waiting");
            return;
          }
        }

        setHasAccess(true);
      } catch (err) {
        console.error("Error checking access:", err);
        setHasAccess(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [location.pathname, requiredRole]);

  if (isLoading) {
    return <FullScreenLoader />;  // ← Uses portal, escapes layout
  }

  if (redirectPath && location.pathname !== redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

  if (!hasAccess) {
    return <Navigate to="/waiting" replace />;
  }

  return children;
};

export default ProtectedRoute;
// src/components/ProtectedRoute.jsx
import { useEffect, useState } from "react";
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
        width: '40px',
        height: '40px',
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
    document.body
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
        console.log("=== ProtectedRoute Debug ===");
        console.log("Path:", location.pathname);
        console.log("Required Role:", requiredRole);
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("No session, redirect to login");
          setRedirectPath("/login");
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("account_type")
          .eq("id", session.user.id)
          .single();

        const role = profile?.account_type?.toLowerCase();
        console.log("User Role:", role);

        // Check role requirement
        if (requiredRole && role !== requiredRole.toLowerCase() && 
            role !== "super_admin" && role !== "admin") {
          console.log(`Role mismatch: required ${requiredRole}, user has ${role}`);
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
        console.log("CIS Access:", cis);
        console.log("AZ Sub Access:", azSub);
        console.log("Is CIS Route:", isCISRoute);

        // Super Admin and Admin have full access
        if (role === "super_admin" || role === "admin") {
          console.log("Admin access granted");
          setHasAccess(true);
          return;
        }

        // For regular users
        // If it's a CIS route
        if (isCISRoute) {
          if (cis === "Enable") {
            console.log("CIS access granted");
            setHasAccess(true);
          } else {
            console.log("CIS access denied");
            setRedirectPath("/waiting?type=cis");
          }
        } 
        // If it's a regular AZ Sub route
        else {
          if (azSub === "Enable") {
            console.log("AZ Sub access granted");
            setHasAccess(true);
          } else if (cis === "Enable") {
            // User has CIS but trying to access non-CIS route
            console.log("User has CIS only, redirecting to CIS dashboard");
            setRedirectPath(`/${role}/cis/CISDashboard`);
          } else {
            console.log("No access granted");
            setRedirectPath("/waiting");
          }
        }
      } catch (err) {
        console.error("Error checking access:", err);
        setRedirectPath("/waiting");
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [location.pathname, requiredRole]);

  if (isLoading) {
    return <FullScreenLoader />;
  }

  if (redirectPath && location.pathname !== redirectPath) {
    console.log("Redirecting to:", redirectPath);
    return <Navigate to={redirectPath} replace />;
  }

  if (!hasAccess) {
    console.log("No access, redirect to waiting");
    return <Navigate to="/waiting" replace />;
  }

  console.log("Access granted, rendering children");
  return children;
};

export default ProtectedRoute;
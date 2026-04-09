// src/components/ProtectedRoute.jsx
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import supabase from "../config/supabaseClient";

const ProtectedRoute = ({ children, requiredRole }) => {
  const [hasAccess, setHasAccess] = useState(null);
  const location = useLocation();

  useEffect(() => {
    checkAccess();
  }, [location.pathname]);

  const checkAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setHasAccess(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("account_type")
        .eq("id", session.user.id)
        .single();

      const role = profile?.account_type?.toUpperCase();
      
      if (role === "SUPER_ADMIN" || role === "ADMIN") {
        setHasAccess(true);
        return;
      }

      if (requiredRole && role !== requiredRole) {
        setHasAccess(false);
        return;
      }

      const { data: accessData } = await supabase
        .from("user_access")
        .select("cis_access, az_sub_access")
        .eq("user_id", session.user.id)
        .maybeSingle();

      const cis = accessData?.cis_access || "Disable";
      const azSub = accessData?.az_sub_access || "Disable";
      
      const isOnlyCISAccess = cis === "Enable" && azSub === "Disable";
      const isCISRoute = location.pathname.includes("/cis");
      
      if (isOnlyCISAccess && !isCISRoute) {
        const rolePath = role?.toLowerCase();
        window.location.replace(`/${rolePath}/cis/CISDashboard`);
        return;
      }
      
      if (isCISRoute) {
        setHasAccess(cis === "Enable");
        return;
      }
      
      const hasAtLeastOneAccess = cis === "Enable" || azSub === "Enable";
      setHasAccess(hasAtLeastOneAccess);
    } catch (err) {
      console.error("Error checking access:", err);
      setHasAccess(false);
    }
  };

  if (hasAccess === null) {
    return null; // No loading, just wait
  }

  if (!hasAccess) {
    return <Navigate to="/waiting" replace />;
  }

  return children;
};

export default ProtectedRoute;
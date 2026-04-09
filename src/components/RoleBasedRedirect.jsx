// src/components/RoleBasedRedirect.jsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import supabase from "../config/supabaseClient";

const RoleBasedRedirect = () => {
  const [redirectPath, setRedirectPath] = useState(null);

  useEffect(() => {
    const checkAccessAndRedirect = async () => {
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
        
        if (!role) {
          setRedirectPath("/login");
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
        
        if (isOnlyCISAccess) {
          window.location.replace(`/${role}/cis/CISDashboard`);
          return;
        }
        
        setRedirectPath(`/${role}/dashboard`);
      } catch (err) {
        console.error("Error in role redirect:", err);
        setRedirectPath("/login");
      }
    };

    checkAccessAndRedirect();
  }, []);

  if (!redirectPath) {
    return null;
  }

  return <Navigate to={redirectPath} replace />;
};

export default RoleBasedRedirect;
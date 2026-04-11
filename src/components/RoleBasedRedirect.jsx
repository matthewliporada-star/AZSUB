// src/components/RoleBasedRedirect.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../config/supabaseClient";

const RoleBasedRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAccessAndRedirect = async () => {
      try {
        console.log("=== RoleBasedRedirect Debug ===");
        
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          console.log("No session, redirect to login");
          navigate("/login", { replace: true });
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("account_type")
          .eq("id", session.user.id)
          .single();

        const role = profile?.account_type?.toLowerCase();
        console.log("User Role:", role);
        
        const { data: accessData } = await supabase
          .from("user_access")
          .select("cis_access, az_sub_access")
          .eq("user_id", session.user.id)
          .maybeSingle();

        const cis = accessData?.cis_access || "Disable";
        const azSub = accessData?.az_sub_access || "Disable";
        
        console.log("CIS Access:", cis);
        console.log("AZ Sub Access:", azSub);

        // Super Admin and Admin go to dashboard
        if (role === "super_admin" || role === "admin") {
          console.log("Admin, redirect to dashboard");
          navigate(`/${role}/dashboard`, { replace: true });
          return;
        }

        // CIS only access
        if (cis === "Enable" && azSub === "Disable") {
          console.log("CIS only, redirect to CIS Dashboard");
          navigate(`/${role}/cis/CISDashboard`, { replace: true });
          return;
        }
        
        // AZ Sub access (with or without CIS)
        if (azSub === "Enable") {
          console.log("AZ Sub access, redirect to dashboard");
          navigate(`/${role}/dashboard`, { replace: true });
          return;
        }
        
        // No access
        console.log("No access, redirect to waiting");
        navigate("/waiting", { replace: true });
      } catch (err) {
        console.error("Error in role redirect:", err);
        navigate("/login", { replace: true });
      }
    };

    checkAccessAndRedirect();
  }, [navigate]);

  return null;
};

export default RoleBasedRedirect;
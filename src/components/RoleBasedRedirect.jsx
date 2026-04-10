// src/components/RoleBasedRedirect.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../config/supabaseClient";

const RoleBasedRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAccessAndRedirect = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          navigate("/login", { replace: true });
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("account_type")
          .eq("id", session.user.id)
          .single();

        const role = profile?.account_type?.toLowerCase();
        
        const { data: accessData } = await supabase
          .from("user_access")
          .select("cis_access, az_sub_access")
          .eq("user_id", session.user.id)
          .maybeSingle();

        const cis = accessData?.cis_access || "Disable";
        const azSub = accessData?.az_sub_access || "Disable";

        // Admin override
        if (role === "super_admin" || role === "admin") {
          navigate(`/${role}/dashboard`, { replace: true });
          return;
        }

        // Logic for AL and other specific roles
        if (cis === "Enable" && azSub === "Disable") {
          navigate(`/${role}/cis/CISDashboard`, { replace: true });
        } else if (azSub === "Enable") {
          navigate(`/${role}/dashboard`, { replace: true });
        } else {
          navigate("/waiting", { replace: true });
        }

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
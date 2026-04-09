import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import LeftImage from "../../assets/1.png";
import LogoImage from "../../assets/2.png";
import "./Login.css";
import supabase from "../../config/supabaseClient";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUserRole, setCurrentUser, darkMode, toggleDarkMode } = useApp();

  // --- Forced Verification Check ---
  useEffect(() => {
    const isVerified = localStorage.getItem("is_verified") === "true";
    if (!isVerified) {
      navigate("/verify-identity", { replace: true });
    }
  }, [navigate]);

  // --- Form States ---
  const [identifier, setIdentifier] = useState(location.state?.email || ""); // email or username
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // --- Persistent Security States ---
  const [attempts, setAttempts] = useState(() =>
    parseInt(localStorage.getItem("login_attempts") || "0"),
  );
  const [isSecondChance, setIsSecondChance] = useState(
    () => localStorage.getItem("is_second_chance") === "true",
  );
  const [cooldown, setCooldown] = useState(0);

  // --- Intercept Password Recovery Callback ---
  useEffect(() => {
    const handlePasswordRecovery = async () => {
      // Supabase appends the session via hash fragment for password recovery
      const hash = window.location.hash;
      if (hash && hash.includes("type=recovery")) {
        setLoading(true);
        setError("");
        try {
          // Wait briefly to ensure Supabase client processes the hash and establishes the session
          const {
            data: { session },
            error: sessionError,
          } = await supabase.auth.getSession();
          if (sessionError || !session)
            throw new Error("Invalid or expired recovery link.");

          // 1. Fetch user's profile to get last name for generating default password
          const { data: profile } = await supabase
            .from("profiles")
            .select("first_name, last_name")
            .eq("id", session.user.id)
            .single();

          if (!profile || !profile.last_name)
            throw new Error("User profile incomplete. Cannot reset.");

          // 2. Generate Default Password: #FirstTwoLettersOfLastNameMMYYYY
          const firstTwo = profile.last_name.trim().substring(0, 2);
          const formattedName = `${firstTwo.charAt(0).toUpperCase()}${firstTwo.length > 1 ? firstTwo.charAt(1).toLowerCase() : "x"}`;
          const now = new Date();
          const month = String(now.getMonth() + 1).padStart(2, "0");
          const year = now.getFullYear();
          const defaultPwd = `#${formattedName}${month}${year}`;

          // 3. Forcefully Update the Password
          const { error: updateError } = await supabase.auth.updateUser({
            password: defaultPwd,
          });
          if (updateError) throw updateError;

          // 4. Log the activity
          await supabase.from("activity_logs").insert({
            action: "USER_UPDATE",
            details: `Password automatically reset to default via recovery link for ${profile.first_name} ${profile.last_name}`,
            performed_by: session.user.id,
          });

          // 5. Create admin notification
          await supabase.from("admin_notifications").insert({
            message: `${profile.first_name} ${profile.last_name} has reset their password and activated their account`,
            type: "password_reset_completed",
            target_user_id: session.user.id,
            is_read: false,
          });

          await supabase.auth.signOut();
          window.location.hash = ""; // Clear hash
          setError(""); // Clear error just in case
          alert(
            `Success! Your password has been reset to the default format.\nYour default password is: ${defaultPwd}\n\nPlease log in using this password.`,
          );
        } catch (err) {
          console.error("Recovery Error:", err);
          setError(err.message || "Failed to reset password from link.");
          await supabase.auth.signOut(); // Ensure clean state on failure
        } finally {
          setLoading(false);
          navigate("/login", { replace: true });
        }
      }
    };

    handlePasswordRecovery();
  }, [navigate]);

  // --- Cooldown & Body Class Effects ---
  useEffect(() => {
    document.body.classList.add("login-page");

    // Check for existing cooldown on mount
    const expiry = localStorage.getItem("cooldown_expiry");
    if (expiry) {
      const remaining = Math.ceil((parseInt(expiry) - Date.now()) / 1000);
      if (remaining > 0) setCooldown(remaining);
      else localStorage.removeItem("cooldown_expiry");
    }

    return () => document.body.classList.remove("login-page");
  }, []);

  // --- Timer Logic ---
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            localStorage.removeItem("cooldown_expiry");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Sync attempts and stage to localStorage
  useEffect(() => {
    localStorage.setItem("login_attempts", attempts.toString());
    localStorage.setItem("is_second_chance", isSecondChance.toString());
  }, [attempts, isSecondChance]);

  const handleIdentifierChange = (e) => {
    const val = e.target.value;
    if (/^[a-zA-Z0-9@._\-+]*$/.test(val)) setIdentifier(val);
  };

  // --- Failure Logic (Cooldown vs Deactivation with Logging) ---
  const handleFailure = async (lookupId) => {
    const newCount = attempts + 1;

    if (newCount >= 5) {
      if (!isSecondChance) {
        // STAGE 1: Trigger 30s Cooldown
        const expiryTime = Date.now() + 30 * 1000;
        localStorage.setItem("cooldown_expiry", expiryTime.toString());
        setAttempts(0);
        setCooldown(30);
        setIsSecondChance(true);
        setError("Too many failed attempts. Please wait 30 seconds.");
      } else {
        // STAGE 2: Set Account to Inactive + Activity Log
        setError("Your account is inactive. Please contact support.");
        setAttempts(0);
        setIsSecondChance(false);
        localStorage.removeItem("login_attempts");
        localStorage.removeItem("is_second_chance");

        try {
          // 1. Fetch User ID to ensure we link the log correctly
          const { data: targetUser } = await supabase
            .from("profiles")
            .select("id")
            .or(`email.eq.${lookupId},username.eq.${lookupId}`)
            .single();

          if (targetUser) {
            // 2. Update Status to Inactive
            await supabase
              .from("profiles")
              .update({ status: "Inactive" })
              .eq("id", targetUser.id);

            // 3. Insert Activity Log
            await supabase.from("activity_logs").insert({
              action: "USER_DEACTIVATED",
              details: `Account auto-deactivated: ${lookupId}`,
              performed_by: targetUser.id,
            });
          }
        } catch (err) {
          console.error("Critical error during lockout logging:", err);
        }
      }
    } else {
      setAttempts(newCount);
      const remaining = 5 - newCount;
      setError(
        `Incorrect credentials. ${remaining} attempts left ${isSecondChance ? "before lockout" : "before cooldown"}.`,
      );
    }
  };

  // --- Main Login Function ---
  const handleLogin = async (e) => {
    e.preventDefault();
    if (cooldown > 0 || loading) return;
    setError("");
    setLoading(true);

    try {
      // 1. PRE-CHECK: Status validation
      const { data: profileCheck, error: fetchError } = await supabase
        .from("profiles")
        .select("id, email, status, account_type")
        .or(`email.eq.${identifier},username.eq.${identifier}`)
        .single();

      // Block if already inactive
      if (profileCheck?.status === "Inactive") {
        setError("Your account is inactive. Please contact support.");
        setLoading(false);
        return;
      }

      // If user not found, trigger failure logic
      if (fetchError || !profileCheck) {
        await handleFailure(identifier);
        setLoading(false);
        return;
      }

      // 2. AUTHENTICATION
      const { data: authData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: profileCheck.email,
          password,
        });

      if (signInError) {
        await handleFailure(identifier);
        setLoading(false);
        return;
      }

      // 3. SUCCESS: Clear security states
      setAttempts(0);
      setIsSecondChance(false);
      localStorage.removeItem("login_attempts");
      localStorage.removeItem("is_second_chance");
      localStorage.removeItem("cooldown_expiry");

      // 4. GET FULL PROFILE & REDIRECT
      const { data: fullProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authData.user.id)
        .single();

      const role = fullProfile.account_type?.toUpperCase();
      setUserRole(role);
      setCurrentUser({
        ...fullProfile,
        email: authData.user.email,
        role: role,
        name:
          `${fullProfile.first_name || ""} ${fullProfile.last_name || ""}`.trim() ||
          fullProfile.username,
        avatarUrl: fullProfile.avatar_url,
      });

      if (fullProfile.status === "Waiting for Access") {
        navigate("/waiting");
        return;
      }

      const routeMap = {
        ADMIN: "/admin",
        AL: "/al",
        AP: "/ap",
        MP: "/mp",
        MD: "/md",
        SUPER_ADMIN: "/super-admin",
      };
      navigate(`${routeMap[role] || ""}/dashboard`);
    } catch (err) {
      console.error("Login system error:", err);
      setError("A system error occurred. Please try again.");
    } finally {
      setLoading(true);
    }
  };

  return (
    <div className="login-wrapper">
      <button
        className="login-dark-mode-toggle"
        onClick={toggleDarkMode}
        title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {darkMode ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        )}
      </button>
      <div className="login-container">
        <div className="login-left-panel">
          <img src={LeftImage} alt="Insurance Image" className="animate-cfs" />
          <h2>Explore Our Insurance Solutions</h2>
          <p>
            At Caelum, we offer insurance plans in the Philippines to address
            Filipinos' most common financial needs. Whatever your financial
            need, we are with you in your journey to a more secure tomorrow.
          </p>
        </div>

        <div className="login-right-panel">
          <img src={LogoImage} alt="Allianz Logo" className="logo" />
          <p className="description">
            Everything you need to know about your Caelum policy
          </p>

          <h2 className="signin-prompt">SIGN IN</h2>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter your username or email"
                value={identifier}
                onChange={handleIdentifierChange}
                // Fix: Either remove "disabled=" or give it a boolean value
                disabled={false}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={cooldown > 0}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7c.44 0 .87-.03 1.28-.09" />
                      <line x1="2" y1="2" x2="22" y2="22" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && <p className="error-text">{error}</p>}

            <button
              type="submit"
              className="signin-button"
              disabled={cooldown > 0}
            >
              {cooldown > 0 ? `COOLDOWN: ${cooldown}s` : "SIGN IN"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;

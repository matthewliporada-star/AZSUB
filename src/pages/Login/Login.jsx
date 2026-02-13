import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import LeftImage from "../../assets/1.png";
import LogoImage from "../../assets/2.png";
import "./Login.css";
import supabase from "../../config/supabaseClient";

function Login() {
  const navigate = useNavigate();
  const { setUserRole, setCurrentUser, darkMode, toggleDarkMode } = useApp();

  // --- Cooldown States ---
  const [attempts, setAttempts] = useState(0);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    document.body.classList.add("login-page");
    return () => {
      document.body.classList.remove("login-page");
    };
  }, []);

  // --- Cooldown Timer Logic ---
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    } else if (cooldown === 0 && attempts >= 5) {
      setAttempts(0); // Reset attempts after timer ends
    }
    return () => clearInterval(timer);
  }, [cooldown, attempts]);

  const [identifier, setIdentifier] = useState(""); // email or username
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // Helper to handle failed attempts
  const handleFailure = (msg) => {
    const newCount = attempts + 1;
    setAttempts(newCount);
    if (newCount >= 5) {
      setCooldown(300);
      setError("Too many failed attempts. Please wait 5 mins.");
    } else {
      setError(`${msg} (Attempt ${newCount}/5)`);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (cooldown > 0) return; // Prevent submission during cooldown
    setError("");

    let email = identifier;

    // If the identifier is not an email, look it up as username
    if (!identifier.includes("@")) {
      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("email")
        .eq("username", identifier)
        .single();

      if (fetchError || !data?.email) {
        handleFailure("Username not found");
        return;
      }

      email = data.email;
    }

    // Sign in with email and password
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      handleFailure(signInError.message);
      return;
    }

    const user = data.user;
    if (!user) {
      handleFailure("Login failed. Try again.");
      return;
    }

    // Success! Reset attempts
    setAttempts(0);

    // Fetch the latest account_type from profiles table
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("account_type, id, username, first_name, last_name, status")
      .eq("id", user.id)
      .single();

    if (profileError || !profileData) {
      setError("Could not fetch user profile.");
      return;
    }

    // Check if account is inactive
    if (profileData.status === "Inactive") {
      const accountType = profileData.account_type?.toLowerCase();
      if (accountType === "ap") {
        setError("Your account is inactive. Contact the Agency Leader");
      } else if (accountType === "al") {
        setError("Your Account is Inactive. Contact the Admin");
      } else {
        setError("Your account is inactive. Please contact support.");
      }
      return;
    }

    const accountType = profileData.account_type?.toLowerCase();

    setUserRole(accountType?.toUpperCase());

    setCurrentUser({
      id: profileData.id,
      username: profileData.username,
      name: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() || profileData.username,
      firstName: profileData.first_name,
      lastName: profileData.last_name,
      email: user.email,
      role: accountType?.toUpperCase()
    });

    switch (accountType) {
      case "admin":
        navigate("/admin/dashboard");
        break;
      case "al":
        navigate("/al/dashboard");
        break;
      case "ap":
        navigate("/ap/dashboard");
        break;
      case "mp":
        navigate("/mp/dashboard");
        break;
      case "md":
        navigate("/md/dashboard");
        break;
      default:
        setError("Unknown account type.");
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
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        )}
      </button>
      <div className="login-container">
        <div className="login-left-panel">
          <img src={LeftImage} alt="Insurance Image" />
          <h2>Explore Our Insurance Solutions</h2>
          <p>
            At Caelum, we offer insurance plans in the Philippines to address Filipinos' most common financial needs. Whatever your financial need, we are with you in your journey to a more secure tomorrow.
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
                onChange={(e) => setIdentifier(e.target.value)}
                disabled={cooldown > 0}
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7c.44 0 .87-.03 1.28-.09" />
                      <line x1="2" y1="2" x2="22" y2="22" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              {cooldown > 0 ? `COLDOWN : ${cooldown}s` : "SIGN IN"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
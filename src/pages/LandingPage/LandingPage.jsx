import { useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../config/supabaseClient";
import LogoImage from "../../assets/2.png";
import "./LandingPage.css";

function LandingPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCodeChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 8);
    setCode(val);
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (code.length < 1) {
      setError("Please enter your intermediary code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Temporary hardcoded bypass for requested code
      if (code === "") {
      return;
      }

      // Search for the code in profiles
      const numericCode = parseInt(code);

      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("email, first_name, last_name")
        .eq("intermediary_code", numericCode)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (data) {
        // Success: Set verification flag and redirect to login
        localStorage.setItem("is_verified", "true");
        navigate("/login", { state: { email: data.email } });
      } else {
        setError("Invalid intermediary code. Please try again.");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError("A system error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-identity-wrapper">
      <header className="verify-identity-header">
        <img src={LogoImage} alt="CFS Logo" className="verify-identity-logo-small" />
        <span className="verify-identity-brand-text">Caelum Financials Solution</span>
      </header>

      <main className="verify-identity-main">
        <div className="verify-identity-card">
          <img src={LogoImage} alt="CFS Logo" className="verify-identity-logo-large" />
          <h1>Verify Your Identity</h1>
          <p className="verify-identity-subtitle">
            Please enter your uniquely assigned intermediary code to access the portal.
          </p>

          <form className="verify-identity-form" onSubmit={handleSubmit}>
            <div className="verify-identity-input-group">
              <input
                type="text"
                className="verify-identity-input"
                placeholder="Enter your intermediary code*"
                value={code}
                onChange={handleCodeChange}
                disabled={loading}
                inputMode="numeric"
                pattern="[0-9]*"
              />
              {error && <p className="verify-error-msg">{error}</p>}
            </div>

            <button
              type="submit"
              className="verify-identity-submit"
              disabled={loading || code.length === 0}
            >
              {loading ? "Verifying..." : "Continue"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default LandingPage;

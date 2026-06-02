import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api/axios";
import "./Login.css";

export default function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await API.post("accounts/login/", { email, password });
      const { access, role, must_change_password } = res.data;

      localStorage.setItem("access_token", access);
      localStorage.setItem("role", role);

      const mustChange = must_change_password === true || must_change_password === "true";
      localStorage.setItem("must_change_password", mustChange);

      if (mustChange) { navigate("/change-password"); return; }

      switch (role) {
        case "STUDENT": navigate("/student");        break;
        case "ADMIN":   navigate("/admin");          break;
        case "WP_SUP":  navigate("/wp-supervisor");  break;
        case "AC_SUP":  navigate("/ac-supervisor");  break;
        default:        navigate("/");
      }
    } catch (err) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("role");
      localStorage.removeItem("must_change_password");
      setError(
        err.response?.data?.detail ||
        err.response?.data?.error  ||
        "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
 
      <div className="login-grid" aria-hidden="true" />

      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >

        <div className="login-header">
          <h1>Welcome back</h1>
          <p>Sign in to your account to continue</p>
        </div>
 
        <AnimatePresence>
          {error && (
            <motion.div
              className="login-error"
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: "1rem" }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.2 }}
            >
              <span className="login-error-icon">!</span>
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="login-form" noValidate>

          <div className="login-field">
            <label htmlFor="login-email" className="login-label">Email address</label>
            <input
              id="login-email"
              type="email"
              className="login-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="login-password" className="login-label">Password</label>
            <div className="login-pw-wrap">
              <input
                id="login-password"
                type={showPw ? "text" : "password"}
                className="login-input login-input--pw"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="login-pw-toggle"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <motion.button
            type="submit"
            className="login-submit"
            disabled={loading}
            whileHover={!loading ? { scale: 1.015 } : {}}
            whileTap={!loading  ? { scale: 0.985 } : {}}
          >
            {loading ? (
              <span className="login-submit-inner">
                <span className="login-btn-spinner" />
                Signing in…
              </span>
            ) : (
              "Sign in"
            )}
          </motion.button>

        </form>

        <p className="login-footer">
          Having trouble?{" "}
          <a>Sorry about that.</a>
        </p>
      </motion.div>
    </div>
  );
}
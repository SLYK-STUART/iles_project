import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { ArrowLeft, Lock } from "lucide-react";
import "./ChangePassword.css";

export default function ChangePassword() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");  
  };

  const handleSubmit = async () => {
    setError("");

    if (!form.old_password) {
      setError("Old password is required");
      return;
    }
    if (!form.new_password) {
      setError("New password is required");
      return;
    }
    if (form.new_password !== form.confirm_password) {
      setError("New passwords do not match");
      return;
    }
    if (form.new_password.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await API.post("admin/auth/change_password/", {
        old_password: form.old_password,
        new_password: form.new_password
      });

      setSuccess(true);
      
      setTimeout(() => {
        localStorage.clear();
        navigate("/login");
      }, 2000);

    } catch (err) {
      console.error(err.response?.data);
      setError(
        err.response?.data?.error || 
        err.response?.data?.detail || 
        "Failed to change password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-container">
      <div className="change-password-card">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="form-header">
          <Lock size={40} />
          <h1>Change Password</h1>
          <p>You must update your password before continuing</p>
        </div>

        {error && <div className="error-box">{error}</div>}
        {success && (
          <div className="success-box">
            Password changed successfully! Redirecting to login...
          </div>
        )}

        <div className="form-content">
          <div className="input-group">
            <label>Old Password</label>
            <input
              type="password"
              name="old_password"
              placeholder="Enter current password"
              value={form.old_password}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label>New Password</label>
            <input
              type="password"
              name="new_password"
              placeholder="Enter new password"
              value={form.new_password}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              name="confirm_password"
              placeholder="Confirm new password"
              value={form.confirm_password}
              onChange={handleChange}
            />
          </div>

          <button 
            className="submit-btn" 
            onClick={handleSubmit} 
            disabled={loading}
          >
            {loading ? "Updating Password..." : "Change Password"}
          </button>
        </div>
      </div>
    </div>
  );
}
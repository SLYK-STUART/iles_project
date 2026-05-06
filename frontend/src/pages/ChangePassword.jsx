import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setError("");

    if (form.new_password !== form.confirm_password) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await API.post("admin/auth/change_password/", {
        old_password: form.old_password,
        new_password: form.new_password
      });

      alert("Password changed successfully");
 
      localStorage.clear();
      navigate("/login");

    } catch (err) {
      console.error(err.response?.data);
      setError(err.response?.data?.error || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-container">
      <div className="change-password-card">
        <h2>Change Password</h2>
        <p>You must update your password before continuing</p>

        {error && <div className="error-box">{error}</div>}

        <input
          type="password"
          name="old_password"
          placeholder="Old Password"
          value={form.old_password}
          onChange={handleChange}
        />

        <input
          type="password"
          name="new_password"
          placeholder="New Password"
          value={form.new_password}
          onChange={handleChange}
        />

        <input
          type="password"
          name="confirm_password"
          placeholder="Confirm New Password"
          value={form.confirm_password}
          onChange={handleChange}
        />

        <button onClick={handleSubmit} disabled={loading}>
          {loading ? "Updating..." : "Change Password"}
        </button>
      </div>
    </div>
  );
}
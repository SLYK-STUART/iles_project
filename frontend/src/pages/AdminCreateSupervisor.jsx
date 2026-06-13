import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { ArrowLeft, UserPlus } from "lucide-react";
import "./AdminCreateSupervisor.css";

export default function AdminCreateSupervisor() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role: "WP_SUP",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setError("");
    setResult(null);

    if (!form.first_name || !form.last_name || !form.email) {
      setError("All fields are required");
      return;
    }

    setLoading(true);

    try {
      const res = await API.post("admin/create-supervisor/", form);
      setResult(res.data.user);

      setForm({
        first_name: "",
        last_name: "",
        email: "",
        role: "WP_SUP",
      });
    } catch (err) {
      console.error(err.response?.data);
      setError(JSON.stringify(err.response?.data));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-form">
 
      <header className="admin-topbar">
        <div className="admin-topbar-left">
          <div className="admin-topbar-badge">AS</div>
          <div className="admin-topbar-title">Create Supervisor</div>
        </div>

        <div className="admin-topbar-right">
          <button className="admin-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} />
            Back
          </button>
        </div>
      </header>
 
      <h2>Create Supervisor</h2>

      {error && <div className="error-box">{error}</div>}

      <input
        name="first_name"
        placeholder="First Name"
        value={form.first_name}
        onChange={handleChange}
      />

      <input
        name="last_name"
        placeholder="Last Name"
        value={form.last_name}
        onChange={handleChange}
      />

      <input
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
      />

      <select name="role" value={form.role} onChange={handleChange}>
        <option value="WP_SUP">Workplace Supervisor</option>
        <option value="AC_SUP">Academic Supervisor</option>
      </select>

      <button onClick={handleSubmit} disabled={loading}>
        <UserPlus size={16} />
        {loading ? "Creating..." : "Create Supervisor"}
      </button>

      {result && (
        <div className="success-box">
          <h3>Supervisor Created ✔</h3>
          <p><strong>Name:</strong> {result.name}</p>
          <p><strong>Email:</strong> {result.email}</p>
          <p><strong>Role:</strong> {result.role}</p>
          <p><strong>Temp Password:</strong> {result.temp_password}</p>
        </div>
      )}
    </div>
  );
}
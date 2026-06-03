import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { ArrowLeft, UserPlus, Mail, User } from "lucide-react";
import "./AdminCreateStudent.css";

export default function AdminCreateStudent() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    placement_id: ""
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!form.first_name.trim()) return "First name is required";
    if (!form.last_name.trim()) return "Last name is required";
    if (!form.email.trim()) return "Valid email is required";
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const payload = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
      };

      if (form.placement_id && form.placement_id.trim() !== "") {
        payload.placement_id = parseInt(form.placement_id);
      }

      const res = await API.post("admin/create-student/", payload);
      setResult(res.data);

      setForm({
        first_name: "",
        last_name: "",
        email: "",
        placement_id: ""
      });

    } catch (err) {
      console.error(err.response?.data);
      setError(
        err.response?.data?.detail ||
        err.response?.data?.email?.[0] ||
        JSON.stringify(err.response?.data) ||
        "Failed to create student"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
 
      <div className="admin-topbar">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="topbar-title">
          <h1>Create Student</h1>
          <p>Register a new student into the system</p>
        </div>

        <div className="topbar-icon">
          <UserPlus size={20} />
        </div>
      </div>
 
      <div className="admin-content">
 
        {error && (
          <div className="alert error">
            {error}
          </div>
        )}

        {result && (
          <div className="alert success">
            <strong>Student created successfully!</strong>
            <div className="alert-details">
              <p><User size={14} /> {result.student?.name}</p>
              <p><Mail size={14} /> {result.student?.email}</p>
              <p><strong>Temp Password:</strong> {result.student?.temp_password}</p>
            </div>
          </div>
        )}
 
        <div className="form-card">

          <div className="form-section">
            <h3>Student Information</h3>

            <div className="form-grid">

              <div className="input-group">
                <label>First Name</label>
                <input
                  name="first_name"
                  placeholder="Enter first name"
                  value={form.first_name}
                  onChange={handleChange}
                />
              </div>

              <div className="input-group">
                <label>Last Name</label>
                <input
                  name="last_name"
                  placeholder="Enter last name"
                  value={form.last_name}
                  onChange={handleChange}
                />
              </div>

              <div className="input-group full">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="student@example.com"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

            </div>
          </div>
 
          <div className="form-actions">
            <button
              className="submit-btn"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Creating Student..." : "Create Student"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
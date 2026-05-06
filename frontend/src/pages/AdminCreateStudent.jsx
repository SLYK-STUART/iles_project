import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { ArrowLeft, UserPlus } from "lucide-react";
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
    <div className="admin-create-container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={20} />
        Back
      </button>

      <div className="form-card">
        <div className="form-header">
          <UserPlus size={32} />
          <h1>Create New Student</h1>
          <p>Fill in the details to register a new student</p>
        </div>

        {error && <div className="error-box">{error}</div>}
        {result && (
          <div className="success-box">
            <h3>Student Created Successfully!</h3>
            <p><strong>Name:</strong> {result.student?.name}</p>
            <p><strong>Email:</strong> {result.student?.email}</p>
            <p><strong>Temporary Password:</strong> {result.student?.temp_password}</p>
          </div>
        )}

        <div className="form-content">
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

          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="student@example.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>

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
  );
}
import { useState } from "react";
import API from "../api/axios";
import "./AdminCreateStudent.css";

export default function AdminCreateStudent() {
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
    if (!form.email.trim()) return "Email is required";

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
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
      };
 
      if (form.placement_id && form.placement_id.trim() !== "") {
        payload.placement_id = parseInt(form.placement_id);
      }

      console.log("Sending payload:", payload);

      const res = await API.post("admin/create-student/", payload);

      setResult(res.data);
 
      setForm({
        first_name: "",
        last_name: "",
        email: "",
      });

    } catch (err) {
      console.error("Full Error:", err.response?.data);

      if (err.response?.data) {
        setError(JSON.stringify(err.response.data));
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-form">
      <h2>Create Student</h2>

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


      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Creating..." : "Create Student"}
      </button>

      {result && (
        <div className="success-box">
          <h3>Student Created ✔</h3>
          <p><strong>Name:</strong>{result.student.name}</p>
          <p><strong>Email:</strong> {result.student.email}</p>
          <p><strong>Temp Password:</strong> {result.student.temp_password}</p>
        </div>
      )}
    </div>
  );
}
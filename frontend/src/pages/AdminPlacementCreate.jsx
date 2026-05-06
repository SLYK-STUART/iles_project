import { useEffect, useState } from "react";
import API from "../api/axios";
import "./AdminPlacementCreate.css";

export default function AdminPlacementCreate() {
  const [form, setForm] = useState({
    student: "",
    company: "",
    workplace_supervisor: "",
    academic_supervisor: "",
    start_date: "",
    end_date: "",
    description: ""
  });

  const [data, setData] = useState({
    students: [],
    supervisors: [],
    companies: []
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
 
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await API.get("admin/placements/form-data/");
        setData(res.data);
      } catch (err) {
        setError("Failed to load form data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
 
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const res = await API.post("admin/placements/create/", form);

      setMessage("Placement created successfully ✔");
 
      setForm({
        student: "",
        company: "",
        workplace_supervisor: "",
        academic_supervisor: "",
        start_date: "",
        end_date: "",
        description: ""
      });

    } catch (err) {
      console.log(err.response?.data);
      setError(
        err.response?.data?.detail ||
        JSON.stringify(err.response?.data) ||
        "Failed to create placement"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="loading">Loading data...</p>;

  return (
    <div className="placement-container">
      <h1>Allocate Internship</h1>
      <p className="subtitle">Assign students to companies and supervisors</p>

      {error && <div className="error-box">{error}</div>}
      {message && <div className="success-box">{message}</div>}

      <form onSubmit={handleSubmit} className="placement-form">
 
        <select
          name="student"
          value={form.student}
          onChange={handleChange}
          required
        >
          <option value="">Select Student</option>
          {data.students.map(s => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
 
        <select
          name="company"
          value={form.company}
          onChange={handleChange}
          required
        >
          <option value="">Select Company</option>
          {data.companies.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
 
        <select
          name="workplace_supervisor"
          value={form.workplace_supervisor}
          onChange={handleChange}
        >
          <option value="">Workplace Supervisor</option>
          {data.supervisors
            .filter(s => s.role === "WP_SUP")
            .map(s => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
        </select>
 
        <select
          name="academic_supervisor"
          value={form.academic_supervisor}
          onChange={handleChange}
        >
          <option value="">Academic Supervisor</option>
          {data.supervisors
            .filter(s => s.role === "AC_SUP")
            .map(s => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
        </select>
 
        <input
          type="date"
          name="start_date"
          value={form.start_date}
          onChange={handleChange}
          required
        />

        <input
          type="date"
          name="end_date"
          value={form.end_date}
          onChange={handleChange}
          required
        />
 
        <textarea
          name="description"
          placeholder="Description (optional)"
          value={form.description}
          onChange={handleChange}
        />

        <button type="submit" disabled={saving}>
          {saving ? "Creating..." : "Create Placement"}
        </button>
      </form>
    </div>
  );
}
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { ArrowLeft } from "lucide-react";
import "./AdminPlacementCreate.css";

export default function AdminPlacementCreate() {
  const navigate = useNavigate();

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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get("admin/placements/form-data/");
        setData(res.data);
      } catch (err) {
        console.error(err);
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
      await API.post("admin/placements/create/", form);
      setMessage("Placement created successfully!");

      // Reset form
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
      setError(
        err.response?.data?.detail ||
        JSON.stringify(err.response?.data) ||
        "Failed to create placement"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="loading">Loading form data...</p>;

  return (
    <div className="placement-container">
      {/* Back Button */}
      <button className="back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={20} />
        Back to Dashboard
      </button>

      <div className="form-wrapper">
        <h1>Allocate Internship Placement</h1>
        <p className="subtitle">Assign a student to a company and supervisors</p>

        {error && <div className="error-box">{error}</div>}
        {message && <div className="success-box">{message}</div>}

        <form onSubmit={handleSubmit} className="placement-form">
          
          <div className="form-group">
            <label>Student <span className="required">*</span></label>
            <select name="student" value={form.student} onChange={handleChange} required>
              <option value="">Select Student</option>
              {data.students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Company <span className="required">*</span></label>
            <select name="company" value={form.company} onChange={handleChange} required>
              <option value="">Select Company</option>
              {data.companies.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Workplace Supervisor</label>
            <select name="workplace_supervisor" value={form.workplace_supervisor} onChange={handleChange}>
              <option value="">Select Workplace Supervisor</option>
              {data.supervisors
                .filter(s => s.role === "WP_SUP")
                .map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="form-group">
            <label>Academic Supervisor</label>
            <select name="academic_supervisor" value={form.academic_supervisor} onChange={handleChange}>
              <option value="">Select Academic Supervisor</option>
              {data.supervisors
                .filter(s => s.role === "AC_SUP")
                .map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Date <span className="required">*</span></label>
              <input
                type="date"
                name="start_date"
                value={form.start_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>End Date <span className="required">*</span></label>
              <input
                type="date"
                name="end_date"
                value={form.end_date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description / Notes</label>
            <textarea
              name="description"
              placeholder="Additional information about this placement..."
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="submit-btn" disabled={saving}>
            {saving ? "Creating Placement..." : "Create Internship Placement"}
          </button>
        </form>
      </div>
    </div>
  );
}
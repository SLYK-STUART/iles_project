import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import {
  ArrowLeft,
  Building2,
  Calendar,
  GraduationCap,
  UserCheck,
  Briefcase,
  Save,
} from "lucide-react";
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
    description: "",
  });

  const [data, setData] = useState({
    students: [],
    supervisors: [],
    companies: [],
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
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      await API.post("admin/placements/create/", form);

      setMessage("Placement created successfully!");

      setForm({
        student: "",
        company: "",
        workplace_supervisor: "",
        academic_supervisor: "",
        start_date: "",
        end_date: "",
        description: "",
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

  if (loading) {
    return (
      <div className="sd-loading">
        <div className="sd-spinner" />
        <p>Loading placement form...</p>
      </div>
    );
  }

  return (
    <div className="admin-placement-page">
      <header className="sd-topbar">
        <div className="sd-topbar-left">
          <span className="sd-logo-mark">AP</span>
          <h1>Create Placement</h1>
        </div>

        <div className="sd-topbar-right">
          <button
            className="sd-btn sd-btn-ghost"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>
      </header>

      <main className="sd-main">
        <div className="sd-welcome">
          <h2>Create Internship Placement</h2>
          <p className="sd-subtitle">
            Assign a student to an internship company and supervisors.
          </p>
        </div>

        {(data.students.length > 0 ||
          data.companies.length > 0 ||
          data.supervisors.length > 0) && (
          <section className="sd-section">
            <div className="sd-stats-grid placement-stats-grid">
              <div className="sd-stat-card">
                <span className="sd-stat-label">Students</span>
                <span className="sd-stat-num">{data.students.length}</span>
              </div>

              <div className="sd-stat-card">
                <span className="sd-stat-label">Companies</span>
                <span className="sd-stat-num">{data.companies.length}</span>
              </div>

              <div className="sd-stat-card">
                <span className="sd-stat-label">Academic Supervisors</span>
                <span className="sd-stat-num">
                  {
                    data.supervisors.filter(
                      (s) => s.role === "AC_SUP"
                    ).length
                  }
                </span>
              </div>

              <div className="sd-stat-card">
                <span className="sd-stat-label">Workplace Supervisors</span>
                <span className="sd-stat-num">
                  {
                    data.supervisors.filter(
                      (s) => s.role === "WP_SUP"
                    ).length
                  }
                </span>
              </div>
            </div>
          </section>
        )}

        {error && (
          <div className="sd-error-banner">
            {error}
          </div>
        )}

        {message && (
          <div className="sd-success-banner">
            {message}
          </div>
        )}

        <section className="sd-section">
          <h3 className="sd-section-title">
            Placement Information
          </h3>

          <form
            onSubmit={handleSubmit}
            className="placement-form"
          >
            <div className="placement-grid">
              <div className="placement-field">
                <label>
                  <GraduationCap size={16} />
                  Student
                </label>

                <select
                  name="student"
                  value={form.student}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Student</option>

                  {data.students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="placement-field">
                <label>
                  <Building2 size={16} />
                  Company
                </label>

                <select
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Company</option>

                  {data.companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="placement-field">
                <label>
                  <Briefcase size={16} />
                  Workplace Supervisor
                </label>

                <select
                  name="workplace_supervisor"
                  value={form.workplace_supervisor}
                  onChange={handleChange}
                >
                  <option value="">
                    Select Workplace Supervisor
                  </option>

                  {data.supervisors
                    .filter((s) => s.role === "WP_SUP")
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="placement-field">
                <label>
                  <UserCheck size={16} />
                  Academic Supervisor
                </label>

                <select
                  name="academic_supervisor"
                  value={form.academic_supervisor}
                  onChange={handleChange}
                >
                  <option value="">
                    Select Academic Supervisor
                  </option>

                  {data.supervisors
                    .filter((s) => s.role === "AC_SUP")
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="placement-dates">
              <div className="placement-field">
                <label>
                  <Calendar size={16} />
                  Start Date
                </label>

                <input
                  type="date"
                  name="start_date"
                  value={form.start_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="placement-field">
                <label>
                  <Calendar size={16} />
                  End Date
                </label>

                <input
                  type="date"
                  name="end_date"
                  value={form.end_date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="placement-field">
              <label>Description / Notes</label>

              <textarea
                name="description"
                rows={6}
                placeholder="Additional placement notes..."
                value={form.description}
                onChange={handleChange}
              />
            </div>

            <div className="placement-actions">
              <button
                type="submit"
                className="sd-btn placement-submit-btn"
                disabled={saving}
              >
                <Save size={16} />
                {saving
                  ? "Creating Placement..."
                  : "Create Placement"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
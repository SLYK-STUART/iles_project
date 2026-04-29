import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import "./Logbook.css";

export default function Logbook() {
  const navigate = useNavigate();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    week_number: "",
    activities: "",
    challenges: "",
    learning_outcomes: "",
  });

  const [editForm, setEditForm] = useState(form);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await API.get("logbook/logs/");
      setLogs(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "week_number"
          ? value.replace(/[^0-9]/g, "")
          : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("logbook/logs/", {
        ...form,
        week_number: Number(form.week_number),
      });

      fetchLogs();

      setForm({
        week_number: "",
        activities: "",
        challenges: "",
        learning_outcomes: "",
      });

    } catch (err) {
      console.error(err);
      alert("Failed to create log");
    }
  };

  const submitLog = async (id) => {
    try {
      await API.post(`logbook/logs/${id}/submit/`);
      fetchLogs();
    } catch {
      alert("Failed to submit log");
    }
  };

  const deleteLog = async (id) => {
    try {
      await API.delete(`logbook/logs/${id}/`);
      fetchLogs();
    } catch {
      alert("Delete failed");
    }
  };

  const startEdit = (log) => {
    setEditingId(log.id);
    setEditForm(log);
  };

  const saveEdit = async (id) => {
    try {
      await API.put(`logbook/logs/${id}/`, {
        ...editForm,
        week_number: Number(editForm.week_number),
      });
      setEditingId(null);
      fetchLogs();
    } catch {
      alert("Update failed");
    }
  };

  const total = logs.length;
  const draft = logs.filter(l => l.status === "DRAFT").length;
  const submitted = logs.filter(l => l.status === "SUBMITTED").length;
  const approved = logs.filter(l => l.status === "APPROVED").length;

  if (loading) return <p className="loading">Loading...</p>;

  return (
    <div className="dashboard">

      {/* ================= SIDEBAR ================= */}
      <div className="sidebar">
        <h2>Logbook</h2>
        <ul>
          <li onClick={() => navigate("/student")}>Dashboard</li>
          <li className="active">Logbook</li>
          <li>Reports</li>
          <li>Profile</li>
        </ul>
      </div>

      {/* ================= MAIN ================= */}
      <div className="main">

        <h1>Your Logbook</h1>

        {/* ================= STATS ================= */}
        <div className="cards">
          <div className="card">
            <h3>Total Logs</h3>
            <p>{total}</p>
          </div>

          <div className="card">
            <h3>Draft</h3>
            <p>{draft}</p>
          </div>

          <div className="card">
            <h3>Submitted</h3>
            <p>{submitted}</p>
          </div>

          <div className="card">
            <h3>Approved</h3>
            <p>{approved}</p>
          </div>
        </div>

        <div className="chart-section">
          <h2>Create New Log</h2>

          <form className="logbook-form" onSubmit={handleSubmit}>
            <input
              type="number"
              name="week_number"
              placeholder="Week Number"
              value={form.week_number}
              onChange={handleChange}
              required
            />

            <textarea
              name="activities"
              placeholder="Activities"
              value={form.activities}
              onChange={handleChange}
              required
            />

            <textarea
              name="challenges"
              placeholder="Challenges"
              value={form.challenges}
              onChange={handleChange}
            />

            <textarea
              name="learning_outcomes"
              placeholder="Learning Outcomes"
              value={form.learning_outcomes}
              onChange={handleChange}
            />

            <button className="btn-primary">Create Log</button>
          </form>
        </div>

        <div className="activity">
          <h2>Your Logs</h2>

          {logs.length === 0 ? (
            <p>No logs yet</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="log-card">

                {editingId === log.id ? (
                  <>
                    <input
                      value={editForm.week_number}
                      onChange={(e) =>
                        setEditForm({ ...editForm, week_number: e.target.value })
                      }
                    />

                    <textarea
                      value={editForm.activities}
                      onChange={(e) =>
                        setEditForm({ ...editForm, activities: e.target.value })
                      }
                    />

                    <div className="log-actions">
                      <button onClick={() => saveEdit(log.id)}>Save</button>
                      <button onClick={() => setEditingId(null)}>Cancel</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="log-header">
                      <span>Week {log.week_number}</span>
                      <span className={`status ${log.status.toLowerCase()}`}>
                        {log.status}
                      </span>
                    </div>

                    <p><strong>Activities</strong></p>
                    <ul className="activities-list">
                      {log.activities.split("\n").map((item, i) => (
                        <li key={i}>{item.trim()}</li>
                      ))}
                    </ul>

                    <div className="log-actions">
                      {log.status === "DRAFT" && (
                        <>
                          <button onClick={() => startEdit(log)}>Edit</button>
                          <button onClick={() => deleteLog(log.id)}>Delete</button>
                          <button onClick={() => submitLog(log.id)}>
                            Submit
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}

              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import "./Logbook.css";

export default function Logbook() {
  const navigate = useNavigate();

  const [weeks, setWeeks] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    activities: "",
    challenges: "",
    learning_outcomes: "",
  });

  const [editForm, setEditForm] = useState({
    activities: "",
    challenges: "",
    learning_outcomes: "",
  });

  const [currentWeek, setCurrentWeek] = useState(null);
 
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await API.get("accounts/student/dashboard/");
      setWeeks(res.data.weeks || []);
      setProgress(res.data.progress || {});

      const current = res.data.weeks?.find((w) => w.is_current);
      setCurrentWeek(current || null);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      alert("Failed to load logbook data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
 
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentWeek || currentWeek.locked) {
      alert("You cannot create a log for this week.");
      return;
    }
    if (!form.activities.trim()) {
      alert("Activities field is required.");
      return;
    }

    try {
      await API.post("logbook/logs/", {
        week_start_date: currentWeek.week_start,
        activities: form.activities.trim(),
        challenges: form.challenges.trim(),
        learning_outcomes: form.learning_outcomes.trim(),
      });

      alert("✅ Log created successfully!");
      fetchData();

      setForm({ activities: "", challenges: "", learning_outcomes: "" });
    } catch (err) {
      const errorMsg =
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.detail ||
        "Failed to create log.";
      alert(errorMsg);
    }
  }; 

  const submitLog = async (id) => {
    if (!confirm("Submit this log? You will not be able to edit it afterwards.")) return;

    try {
      await API.post(`logbook/logs/${id}/submit/`);
      alert("✅ Log submitted successfully!");
      fetchData();
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Failed to submit log.";
      alert(`❌ ${errorMsg}`);
    }
  };
 
  const deleteLog = async (id) => {
    if (!confirm("Delete this log? This action cannot be undone.")) return;

    try {
      await API.delete(`logbook/logs/${id}/`);
      fetchData();
    } catch (err) {
      console.errror(err);
      alert("Failed to delete log.");
    }
  };
 
  const startEdit = (week) => {
    setEditingId(week.log_id);
    setEditForm({
      activities: week.activities || "Activities",
      challenges: week.challenges || "Challenges",
      learning_outcomes: week.learning_outcomes || "Lessons",
    });
  };
 
  const saveEdit = async (id) => {
    if (!editForm.activities.trim()) {
      alert("Activities field is required.");
      return;
    }

    try {
      await API.put(`logbook/logs/${id}/`, {
        activities: editForm.activities.trim(),
        challenges: editForm.challenges.trim(),
        learning_outcomes: editForm.learning_outcomes.trim(),
      });

      setEditingId(null);
      fetchData();
      alert("✅ Log updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update log.");
    }
  };

  const cancelEdit = () => setEditingId(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  if (loading) return <p className="loading">Loading logbook...</p>;

  return (
    <div className="dashboard">
      <div className="header">
        <button onClick={() => navigate("/student")}>⬅ Back to Dashboard</button>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <div className="main">
        <h1>Your Logbook</h1>
 
        <div className="progress-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress.percentage || 0}%` }}
            />
          </div>
          <p>{progress.percentage || 0}% Completed</p>
        </div>
 
        <div className="chart-section">
          <h2>Create Weekly Log</h2>

          {currentWeek && !currentWeek.has_log && !currentWeek.locked ? (
            <>
              <p>
                Week: {new Date(currentWeek.week_start).toDateString()} →{" "}
                {new Date(currentWeek.week_end).toDateString()}
              </p>

              <form onSubmit={handleSubmit} className="logbook-form">
                <textarea
                  placeholder="Activities (required)"
                  value={form.activities}
                  onChange={(e) => setForm({ ...form, activities: e.target.value })}
                  required
                />
                <textarea
                  placeholder="Challenges faced"
                  value={form.challenges}
                  onChange={(e) => setForm({ ...form, challenges: e.target.value })}
                />
                <textarea
                  placeholder="Learning outcomes"
                  value={form.learning_outcomes}
                  onChange={(e) => setForm({ ...form, learning_outcomes: e.target.value })}
                />
                <button type="submit" className="btn-primary">
                  Create Log
                </button>
              </form>
            </>
          ) : (
            <p style={{ color: "gray" }}>
              You can only create a log for the current unlocked week.
            </p>
          )}
        </div>
 
        <div className="activity">
          <h2>Weekly Timeline</h2>

          {weeks.map((week, index) => (
            <div key={index} className="log-card">
              <div className="log-header">
                <span>
                  {new Date(week.week_start).toDateString()} →{" "}
                  {new Date(week.week_end).toDateString()}
                </span>
                <span className={`status ${week.status?.toLowerCase() || ""}`}>
                  {week.status || "Unknown"}
                </span>
              </div>

              {week.missed && <p style={{ color: "red" }}>⚠ Missed week — locked</p>}

              {!week.has_log && !week.is_current && (
                <p style={{ color: "gray" }}>No log created</p>
              )}

              {week.has_log && (
                <>
                  {editingId === week.log_id ? (
                     <div className="edit-mode">
                      <textarea
                        value={editForm.activities}
                        onChange={(e) => setEditForm({ ...editForm, activities: e.target.value })}
                      />
                      <textarea
                        value={editForm.challenges}
                        onChange={(e) => setEditForm({ ...editForm, challenges: e.target.value })}
                      />
                      <textarea
                        value={editForm.learning_outcomes}
                        onChange={(e) => setEditForm({ ...editForm, learning_outcomes: e.target.value })}
                      />

                      <div className="log-actions">
                        <button onClick={() => saveEdit(week.log_id)}>Save Changes</button>
                        <button onClick={cancelEdit}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                     <div className="log-actions">
                      {week.status === "DRAFT" && (
                        <>
                          <button onClick={() => startEdit(week)}>Edit</button>
                          <button onClick={() => deleteLog(week.log_id)}>Delete</button>
                          <button onClick={() => submitLog(week.log_id)}>Submit</button>
                        </>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
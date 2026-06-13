import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import "./Logbook.css";

const STATUS_META = {
  APPROVED:  { label: "Approved",  cls: "approved"  },
  SUBMITTED: { label: "Submitted", cls: "submitted" },
  REJECTED:  { label: "Rejected",  cls: "rejected"  },
  DRAFT:     { label: "Draft",     cls: "draft"     },
  MISSED:    { label: "Missed",    cls: "missed"    },
};

function StatusBadge({ status }) {
  const meta = STATUS_META[status?.toUpperCase()] || { label: status || "Unknown", cls: "pending" };
  return <span className={`lb-badge lb-badge--${meta.cls}`}>{meta.label}</span>;
}

function LogField({ label, value }) {
  if (!value) return null;
  return (
    <div className="lb-log-field">
      <span className="lb-log-field-label">{label}</span>
      <p className="lb-log-field-value">{value}</p>
    </div>
  );
}

export default function Logbook() {
  const navigate = useNavigate();

  const [weeks, setWeeks]           = useState([]);
  const [progress, setProgress]     = useState({});
  const [loading, setLoading]       = useState(false);
  const [editingId, setEditingId]   = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [toast, setToast]           = useState(null);

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
 
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };
 
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
      showToast("Failed to load logbook data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentWeek || currentWeek.locked) return;
    if (!form.activities.trim()) {
      showToast("Activities field is required.", "error");
      return;
    }
    try {
      await API.post("logbook/logs/", {
        week_start_date: currentWeek.week_start,
        activities: form.activities.trim(),
        challenges: form.challenges.trim(),
        learning_outcomes: form.learning_outcomes.trim(),
      });
      showToast("Log created successfully!");
      fetchData();
      setForm({ activities: "", challenges: "", learning_outcomes: "" });
    } catch (err) {
      const msg =
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.detail ||
        "Failed to create log.";
      showToast(msg, "error");
    }
  };
 
  const submitLog = async (id) => {
    if (!window.confirm("Submit this log? You will not be able to edit it afterwards.")) return;
    try {
      await API.post(`logbook/logs/${id}/submit/`);
      showToast("Log submitted successfully!");
      fetchData();
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Failed to submit log.";
      showToast(msg, "error");
    }
  };
 
  const deleteLog = async (id) => {
    if (!window.confirm("Delete this log? This action cannot be undone.")) return;
    try {
      await API.delete(`logbook/logs/${id}/`);
      showToast("Log deleted.");
      fetchData();
    } catch (err) {
      console.error(err);
      showToast("Failed to delete log.", "error");
    }
  };
 
  const startEdit = (week) => {
    setEditingId(week.log_id);
    setExpandedId(week.log_id);
    setEditForm({
      activities:        week.activities        || "",
      challenges:        week.challenges        || "",
      learning_outcomes: week.learning_outcomes || "",
    });
  };

  const saveEdit = async (id) => {
    if (!editForm.activities.trim()) {
      showToast("Activities field is required.", "error");
      return;
    }
    try {
      await API.put(`logbook/logs/${id}/`, {
        activities:        editForm.activities.trim(),
        challenges:        editForm.challenges.trim(),
        learning_outcomes: editForm.learning_outcomes.trim(),
      });
      setEditingId(null);
      fetchData();
      showToast("Log updated successfully!");
    } catch (err) {
      console.error(err);
      showToast("Failed to update log.", "error");
    }
  };

  const cancelEdit = () => setEditingId(null);

  const toggleExpand = (id) =>
    setExpandedId((prev) => (prev === id ? null : id));
 
  if (loading) {
    return (
      <div className="lb-loading">
        <div className="lb-spinner" />
        <p>Loading logbook…</p>
      </div>
    );
  }

  const totalWeeks   = progress.total_weeks || weeks.length || 0;
  const pct          = progress.percentage  || 0;
  const approvedPct  = totalWeeks ? Math.round(((progress.approved  || 0) / totalWeeks) * 100) : 0;
  const submittedPct = totalWeeks ? Math.round(((progress.submitted || 0) / totalWeeks) * 100) : 0;
  const rejectedPct  = totalWeeks ? Math.round(((progress.rejected  || 0) / totalWeeks) * 100) : 0;

  const canCreate =
    currentWeek && !currentWeek.has_log && !currentWeek.locked;

  return (
    <div className="logbook-page">
 
      {toast && (
        <div className={`lb-toast lb-toast--${toast.type}`}>
          {toast.type === "success" ? "✓" : "✕"} {toast.message}
        </div>
      )}
 
      <header className="sd-topbar">
        <div className="sd-topbar-left">
          <span className="sd-logo-mark">LB</span>
          <h1>My Logbook</h1>
        </div>
        <nav className="sd-topbar-right">
          <button className="sd-btn sd-btn-ghost" onClick={() => navigate("/student")}>
            ← Dashboard
          </button>
          <button
            className="sd-btn sd-btn-danger"
            onClick={() => { localStorage.clear(); navigate("/"); }}
          >
            Logout
          </button>
        </nav>
      </header>

      <main className="lb-main">
 
        <section className="sd-section">
          <p className="sd-section-title">Overall progress</p>
          <div className="lb-progress-header">
            <span className="lb-progress-pct">{pct}%</span>
            <span className="lb-progress-label">of internship logged</span>
          </div>
          <div className="lb-bar-track">
            <div className="lb-bar-fill approved"  style={{ width: `${approvedPct}%`  }} />
            <div className="lb-bar-fill submitted" style={{ width: `${submittedPct}%` }} />
            <div className="lb-bar-fill rejected"  style={{ width: `${rejectedPct}%`  }} />
          </div>
          <div className="lb-progress-legend">
            <span className="lb-legend-dot approved" >{progress.approved  || 0} approved</span>
            <span className="lb-legend-dot submitted">{progress.submitted || 0} submitted</span>
            <span className="lb-legend-dot pending"  >{progress.pending   || 0} pending</span>
            <span className="lb-legend-dot rejected" >{progress.rejected  || 0} rejected</span>
          </div>
        </section>
 
        <section className="sd-section">
          <p className="sd-section-title">Create weekly log</p>

          {canCreate ? (
            <>
              <div className="lb-current-week-banner">
                <span className="lb-current-week-label">Current week</span>
                <span className="lb-current-week-dates">
                  {new Date(currentWeek.week_start).toDateString()} → {new Date(currentWeek.week_end).toDateString()}
                </span>
              </div>

              <form onSubmit={handleSubmit} className="lb-form">
                <div className="lb-field">
                  <label className="lb-field-label">
                    Activities <span className="lb-required">*</span>
                  </label>
                  <textarea
                    className="lb-textarea"
                    placeholder="Describe what you worked on this week…"
                    value={form.activities}
                    onChange={(e) => setForm({ ...form, activities: e.target.value })}
                    rows={4}
                    required
                  />
                </div>
                <div className="lb-field">
                  <label className="lb-field-label">Challenges faced</label>
                  <textarea
                    className="lb-textarea"
                    placeholder="Any difficulties or blockers you encountered…"
                    value={form.challenges}
                    onChange={(e) => setForm({ ...form, challenges: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="lb-field">
                  <label className="lb-field-label">Learning outcomes</label>
                  <textarea
                    className="lb-textarea"
                    placeholder="What did you learn or achieve this week…"
                    value={form.learning_outcomes}
                    onChange={(e) => setForm({ ...form, learning_outcomes: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="lb-form-footer">
                  <button type="submit" className="sd-btn lb-btn-primary">
                    Create log
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="lb-locked-notice">
              <span className="lb-locked-icon">🔒</span>
              <div>
                <p className="lb-locked-title">
                  {currentWeek?.has_log
                    ? "Log already created for this week."
                    : currentWeek?.locked
                    ? "This week is locked."
                    : "You can only create a log for the current unlocked week."}
                </p>
                <p className="lb-locked-sub">
                  You can view and manage past entries in the timeline below.
                </p>
              </div>
            </div>
          )}
        </section>
 
        <section className="sd-section">
          <p className="sd-section-title">Weekly timeline</p>

          {weeks.length === 0 ? (
            <div className="lb-empty">
              <span className="lb-empty-icon">📋</span>
              <p className="lb-empty-title">No weeks found</p>
              <p className="lb-empty-sub">Your internship weeks will appear here once assigned.</p>
            </div>
          ) : (
            <div className="lb-timeline">
              {weeks.map((week, index) => {
                const isEditing  = editingId === week.log_id;
                const isExpanded = expandedId === week.log_id;
                const weekNum    = index + 1;
                const startStr   = new Date(week.week_start).toDateString();
                const endStr     = new Date(week.week_end).toDateString();

                return (
                  <div
                    key={week.log_id || index}
                    className={`lb-week-card ${week.is_current ? "is-current" : ""} ${week.missed ? "is-missed" : ""}`}
                  > 
                    <div
                      className="lb-week-header"
                      onClick={() => week.has_log && !isEditing && toggleExpand(week.log_id)}
                      style={{ cursor: week.has_log ? "pointer" : "default" }}
                    >
                      <div className="lb-week-header-left">
                        <span className="lb-week-num">W{weekNum}</span>
                        <div className="lb-week-info">
                          <span className="lb-week-dates">{startStr} → {endStr}</span>
                          {week.is_current && <span className="lb-current-pip">current</span>}
                        </div>
                      </div>
                      <div className="lb-week-header-right">
                        <StatusBadge status={week.missed ? "MISSED" : week.status} />
                        {week.has_log && (
                          <span className="lb-chevron" style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>
                            ▾
                          </span>
                        )}
                      </div>
                    </div>
 
                    {week.missed && (
                      <p className="lb-missed-notice">⚠ Missed week — log window has closed.</p>
                    )}
 
                    {!week.has_log && !week.is_current && !week.missed && (
                      <p className="lb-no-log">No log created for this week.</p>
                    )}
 
                    {week.has_log && (isExpanded || isEditing) && (
                      <div className="lb-week-body">
                        {isEditing ? ( 
                          <div className="lb-edit-mode">
                            <div className="lb-field">
                              <label className="lb-field-label">Activities <span className="lb-required">*</span></label>
                              <textarea
                                className="lb-textarea"
                                value={editForm.activities}
                                onChange={(e) => setEditForm({ ...editForm, activities: e.target.value })}
                                rows={4}
                              />
                            </div>
                            <div className="lb-field">
                              <label className="lb-field-label">Challenges</label>
                              <textarea
                                className="lb-textarea"
                                value={editForm.challenges}
                                onChange={(e) => setEditForm({ ...editForm, challenges: e.target.value })}
                                rows={3}
                              />
                            </div>
                            <div className="lb-field">
                              <label className="lb-field-label">Learning outcomes</label>
                              <textarea
                                className="lb-textarea"
                                value={editForm.learning_outcomes}
                                onChange={(e) => setEditForm({ ...editForm, learning_outcomes: e.target.value })}
                                rows={3}
                              />
                            </div>
                            <div className="lb-action-row">
                              <button className="sd-btn lb-btn-primary" onClick={() => saveEdit(week.log_id)}>
                                Save changes
                              </button>
                              <button className="sd-btn sd-btn-ghost" onClick={cancelEdit}>
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : ( 
                          <div className="lb-read-mode">
                            <LogField label="Activities"        value={week.activities} />
                            <LogField label="Challenges"        value={week.challenges} />
                            <LogField label="Learning outcomes" value={week.learning_outcomes} />

                            {week.status === "DRAFT" && (
                              <div className="lb-action-row">
                                <button className="sd-btn lb-btn-primary" onClick={() => submitLog(week.log_id)}>
                                  Submit log
                                </button>
                                <button className="sd-btn sd-btn-ghost" onClick={() => startEdit(week)}>
                                  Edit
                                </button>
                                <button className="sd-btn lb-btn-delete" onClick={() => deleteLog(week.log_id)}>
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./StudentDashboard.css";
import Divider from "./Divider";

function ScoreRing({ score, max = 100 }) {
  const r = 36;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - score / max);
  const color = score >= 70 ? "#1D9E75" : score >= 50 ? "#EF9F27" : "#E24B4A";

  return (
    <div className="ring-wrap">
      <svg width="90" height="90" viewBox="0 0 90 90">
        <circle
          cx="45" cy="45" r={r}
          fill="none" stroke="var(--sd-track)" strokeWidth="8"
        />
        <circle
          cx="45" cy="45" r={r}
          fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
        />
      </svg>
      <div className="ring-center">
        <span className="ring-score">{score}</span>
        <span className="ring-denom">/{max}</span>
      </div>
    </div>
  );
}

function InternshipCountdown({ startDate, endDate }) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();
  const totalMs = end - start;
  const remainMs = Math.max(0, end - now);
  const elapsedMs = Math.min(totalMs, now - start);
  const daysLeft = Math.max(0, Math.round(remainMs / 86400000));
  const weeksLeft = Math.max(0, Math.floor(daysLeft / 7));
  const pct = totalMs > 0 ? Math.min(100, Math.max(0, Math.round((elapsedMs / totalMs) * 100))) : 0;

  return (
    <div className="countdown-card">
      <div className="countdown-nums">
        <div className="countdown-block">
          <span className="countdown-num">{daysLeft}</span>
          <span className="countdown-sub">days remaining</span>
        </div>
        <div className="countdown-divider" />
        <div className="countdown-block">
          <span className="countdown-num">{weeksLeft}</span>
          <span className="countdown-sub">weeks remaining</span>
        </div>
      </div>
      <div className="countdown-bar-track">
        <div className="countdown-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <p className="countdown-label">
        <strong>{pct}%</strong> of internship period elapsed
      </p>
    </div>
  );
}

function WeekTimeline({ weeks }) {
  const statusClass = (w) => {
    if (w.is_current) return "current";
    return w.status?.toLowerCase() || "pending";
  };

  const statusLabel = (w) => {
    if (w.is_current) return "Current";
    return w.status || "Pending";
  };

  return (
    <div className="week-timeline">
      {weeks.map((w, i) => (
        <div
          key={w.id || i}
          className={`week-pill ${statusClass(w)}`}
          title={`Week ${i + 1} — ${statusLabel(w)}`}
        >
          W{i + 1}
          {w.is_current && <span className="week-dot" />}
        </div>
      ))}
    </div>
  );
}

function ProgressBar({ approved, submitted, pending, rejected, total }) {
  const approvedPct = total ? Math.round((approved / total) * 100) : 0;
  const submittedPct = total ? Math.round((submitted / total) * 100) : 0;
  const rejectedPct = total ? Math.round((rejected / total) * 100) : 0;

  return (
    <div className="progress-bar-section">
      <div className="progress-bar-header">
        <span className="progress-bar-title">Log progress</span>
        <span className="progress-bar-fraction">{approved} of {total} weeks approved</span>
      </div>
      <div className="progress-bar-track">
        <div className="progress-bar-fill approved" style={{ width: `${approvedPct}%` }} />
        <div className="progress-bar-fill submitted" style={{ width: `${submittedPct}%` }} />
        <div className="progress-bar-fill rejected" style={{ width: `${rejectedPct}%` }} />
      </div>
      <div className="progress-legend">
        <span className="legend-item approved">Approved {approved}</span>
        <span className="legend-item submitted">Submitted {submitted}</span>
        <span className="legend-item pending">Pending {pending}</span>
        <span className="legend-item rejected">Rejected {rejected}</span>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await API.get("accounts/student/dashboard/");
        setData(res.data);
        setError(null);
      } catch (err) {
        console.error("DASHBOARD ERROR:", err);
        setError(err.response?.data?.error || "Failed to load dashboard. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="sd-loading"><div className="sd-spinner" /><p>Loading dashboard…</p></div>;
  if (error) {
    return (
      <div className="sd-error-container">
        <p className="sd-error">{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }
  if (!data) return <p className="sd-error">No data available</p>;

  const progress = data?.progress || {};
  const placement = data?.placement || {};
  const weeks = data?.weeks || [];
  const evaluations = data?.evaluations || {};
  const hasEvaluation = evaluations?.final_score != null;
  const totalWeeks = progress.total_weeks || weeks.length || 0;

  return (
    <div className="student-dashboard">
 
      <header className="sd-topbar">
        <div className="sd-topbar-left">
          <span className="sd-logo-mark">SD</span>
          <h1>Student Dashboard</h1>
        </div>
        <nav className="sd-topbar-right">
          <button className="sd-btn sd-btn-ghost" onClick={() => navigate("/student/reviews")}>
            Reviews
          </button>
          <button className="sd-btn sd-btn-ghost" onClick={() => navigate("/logbook")}>
            📖 My Logbook
          </button>
          <button
            className="sd-btn sd-btn-danger"
            onClick={() => { localStorage.clear(); navigate("/login"); }}
          >
            Logout
          </button>
        </nav>
      </header>

      <main className="sd-main">
 
        <div className="sd-welcome">
          <h2>Welcome back, <span className="sd-name">{data?.student_profile?.name || "Student"}</span></h2>
          {placement.company && (
            <p className="sd-subtitle">Interning at <strong>{placement.company}</strong></p>
          )}
        </div>
 
        <section className="sd-section">
          <div className="sd-stats-grid">
            <div className="sd-stat-card">
              <span className="sd-stat-label">Total weeks</span>
              <span className="sd-stat-num">{totalWeeks}</span>
            </div>
            <div className="sd-stat-card approved">
              <span className="sd-stat-label">Approved</span>
              <span className="sd-stat-num">{progress.approved || 0}</span>
              <span className="sd-stat-badge approved">✓ on track</span>
            </div>
            <div className="sd-stat-card submitted">
              <span className="sd-stat-label">Submitted</span>
              <span className="sd-stat-num">{progress.submitted || 0}</span>
              <span className="sd-stat-badge submitted">⏳ awaiting</span>
            </div>
            <div className="sd-stat-card rejected">
              <span className="sd-stat-label">Rejected</span>
              <span className="sd-stat-num">{progress.rejected || 0}</span>
              {(progress.rejected || 0) > 0 && (
                <span className="sd-stat-badge rejected">⚠ needs fix</span>
              )}
            </div>
          </div>

          <ProgressBar
            approved={progress.approved || 0}
            submitted={progress.submitted || 0}
            pending={progress.pending || 0}
            rejected={progress.rejected || 0}
            total={totalWeeks}
          />
        </section>

        <Divider spacing="sm" />
 
        {weeks.length > 0 && (
          <section className="sd-section">
            <h3 className="sd-section-title">Week-by-week status</h3>
            <WeekTimeline weeks={weeks} />
            <div className="week-legend">
              <span className="week-legend-item approved">Approved</span>
              <span className="week-legend-item submitted">Submitted</span>
              <span className="week-legend-item rejected">Rejected</span>
              <span className="week-legend-item current">Current</span>
              <span className="week-legend-item pending">Pending</span>
            </div>
          </section>
        )}

        <Divider spacing="sm" />
 
        <section className="sd-section sd-info-grid">
          <div className="sd-card">
            <h3 className="sd-card-title">Student profile</h3>
            <dl className="sd-dl">
              <div className="sd-dl-row">
                <dt>Name</dt>
                <dd>{data?.student_profile?.name || "N/A"}</dd>
              </div>
              <div className="sd-dl-row">
                <dt>Email</dt>
                <dd>{data?.student_profile?.email || "N/A"}</dd>
              </div>
              <div className="sd-dl-row">
                <dt>Phone</dt>
                <dd>{data?.student_profile?.phone || "N/A"}</dd>
              </div>
            </dl>
          </div>

          <div className="sd-card">
            <h3 className="sd-card-title">Internship details</h3>
            <dl className="sd-dl">
              <div className="sd-dl-row">
                <dt>Company</dt>
                <dd>{placement.company || "N/A"}</dd>
              </div>
              <div className="sd-dl-row">
                <dt>Start date</dt>
                <dd>{placement.start_date || "N/A"}</dd>
              </div>
              <div className="sd-dl-row">
                <dt>End date</dt>
                <dd>{placement.end_date || "N/A"}</dd>
              </div>
              <div className="sd-dl-row">
                <dt>Academic supervisor</dt>
                <dd>{placement.academic_supervisor || "N/A"}</dd>
              </div>
              <div className="sd-dl-row">
                <dt>Workplace supervisor</dt>
                <dd>{placement.workplace_supervisor || "N/A"}</dd>
              </div>
            </dl>
          </div>
        </section>

        <Divider spacing="sm" />
 
        {placement.start_date && placement.end_date && (
          <section className="sd-section">
            <h3 className="sd-section-title">Internship countdown</h3>
            <InternshipCountdown
              startDate={placement.start_date}
              endDate={placement.end_date}
            />
          </section>
        )}

        <Divider spacing="sm" />
 
        {hasEvaluation && (
          <section className="sd-section">
            <h3 className="sd-section-title">Final evaluation results</h3>
            <div className="sd-eval-layout">
              <div className="sd-eval-score-card">
                <ScoreRing score={evaluations.final_score} />
                {evaluations.final_grade && (
                  <span className="sd-grade-pill">Grade: {evaluations.final_grade}</span>
                )}
                <span className="sd-eval-overall-label">Overall score</span>
              </div>

              <div className="sd-eval-details">
                {evaluations.ac_evaluation && (
                  <div className="sd-eval-card">
                    <h4 className="sd-eval-card-title">Academic supervisor</h4>
                    <p className="sd-eval-by">by {evaluations.ac_evaluation.evaluator_name}</p>
                    <div className="sd-criteria-list">
                      {evaluations.ac_evaluation.items?.map(item => (
                        <div key={item.id} className="sd-criterion">
                          <span>{item.criteria_name}</span>
                          <span className="sd-criterion-score">
                            {item.score}
                            <small> ({item.criteria_weight}%)</small>
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="sd-eval-total">Total: <strong>{evaluations.ac_evaluation.total_score}</strong></p>
                  </div>
                )}

                {evaluations.wp_evaluation && (
                  <div className="sd-eval-card">
                    <h4 className="sd-eval-card-title">Workplace supervisor</h4>
                    <p className="sd-eval-by">by {evaluations.wp_evaluation.evaluator_name}</p>
                    <div className="sd-criteria-list">
                      {evaluations.wp_evaluation.items?.map(item => (
                        <div key={item.id} className="sd-criterion">
                          <span>{item.criteria_name}</span>
                          <span className="sd-criterion-score">
                            {item.score}
                            <small> ({item.criteria_weight}%)</small>
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="sd-eval-total">Total: <strong>{evaluations.wp_evaluation.total_score}</strong></p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        <Divider spacing="sm" />
 
        <section className="sd-section">
          <h3 className="sd-section-title">Log progress overview</h3>
          <div className="sd-chart-wrap">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={[
                { name: "Approved", value: progress.approved || 0 },
                { name: "Submitted", value: progress.submitted || 0 },
                { name: "Pending", value: progress.pending || 0 },
                { name: "Rejected", value: progress.rejected || 0 },
              ]} barSize={40}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "var(--sd-text-muted)", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--sd-text-muted)", fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: "var(--sd-track)" }}
                  contentStyle={{ background: "var(--sd-surface)", border: "0.5px solid var(--sd-border)", borderRadius: 8, fontSize: 13 }}
                />
                <Bar dataKey="value" fill="var(--sd-accent)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <Divider spacing="sm" />
 
        <section className="sd-section">
          <h3 className="sd-section-title">Recent activity</h3>
          {data?.recent_activity?.length > 0 ? (
            <div className="sd-activity-list">
              {data.recent_activity.map((item, index) => (
                <div key={index} className="sd-activity-item">
                  <span className="sd-activity-dot" />
                  <div className="sd-activity-body">
                    <p>{item.message}</p>
                    <time>{new Date(item.date).toLocaleString()}</time>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="sd-empty-state">
              <div className="sd-empty-icon">🕐</div>
              <p className="sd-empty-title">No activity yet</p>
              <p className="sd-empty-sub">Your logbook updates and supervisor reviews will appear here.</p>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import {
  Users,
  ClipboardList,
  CheckCircle,
  LogOut,
  FileText,
  Award,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import "./SupervisorDashboard.css";

export default function SupervisorDashboard() {
  const navigate = useNavigate();

  const [pendingLogs, setPendingLogs] = useState([]);
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({});
  const [activity, setActivity] = useState([]);
  const [supervisorName, setSupervisorName] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showAllStudents, setShowAllStudents] = useState(false);
  const [showAllLogs, setShowAllLogs] = useState(false);
  const [showAllActivity, setShowAllActivity] = useState(false);

  const fetchData = async () => {
    setLoading(true);

    try {
      const res = await API.get("logbook/wp-dashboard/");
      const data = res.data;

      setSupervisorName(data.supervisor_name || "Supervisor");
      setStudents(data.students || []);
      setPendingLogs(data.pending_logs || []);
      setStats(data.stats || {});
      setActivity(data.recent_activity || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleReviewLog = (logId) => {
    navigate(`/wp-supervisor/log/${logId}`);
  };

  const handleEvaluate = (placementId) => {
    navigate(`/wp-supervisor/evaluate/${placementId}`);
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "Unknown time";

    const date = new Date(timeStr);
    const diffMins = Math.floor((new Date() - date) / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hrs ago`;

    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="sd-loading">
        <div className="sd-spinner" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sd-error-container">
        <p className="sd-error">{error}</p>
        <button className="sd-btn" onClick={fetchData}>
          Retry
        </button>
      </div>
    );
  }

  const totalStudents = stats.total_students || 0;
  const pendingReviews = stats.pending_reviews || 0;
  const completedEvaluations =
    stats.completed_evaluations || 0;

  const chartData = [
    {
      name: "Pending",
      value: pendingReviews,
    },
    {
      name: "Evaluated",
      value: completedEvaluations,
    },
  ];

  return (
    <div className="student-dashboard">

      <header className="sd-topbar">
        <div className="sd-topbar-left">
          <span className="sd-logo-mark">WP</span>
          <h1>Workplace Supervisor Dashboard</h1>
        </div>

        <div className="sd-topbar-right">
          <button
            className="sd-btn sd-btn-danger"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>

      <main className="sd-main">

        <div className="sd-welcome">
          <h2>
            Welcome back,
            <span className="sd-name">
              {" "}
              {supervisorName}
            </span>
          </h2>

          <p className="sd-subtitle">
            Manage student logbooks and evaluations
          </p>
        </div>

        <section className="sd-section">

          <div className="sd-stats-grid">

            <div className="sd-stat-card">
              <Users size={24} />
              <span className="sd-stat-label">
                Students
              </span>
              <span className="sd-stat-num">
                {totalStudents}
              </span>
            </div>

            <div className="sd-stat-card submitted">
              <ClipboardList size={24} />
              <span className="sd-stat-label">
                Pending Reviews
              </span>
              <span className="sd-stat-num">
                {pendingReviews}
              </span>
            </div>

            <div className="sd-stat-card approved">
              <Award size={24} />
              <span className="sd-stat-label">
                Evaluations
              </span>
              <span className="sd-stat-num">
                {completedEvaluations}
              </span>
            </div>

          </div>

        </section>

        <div className="sd-info-grid">

          <div className="sd-card">
            <div className="sup-card-header">
              <h3 className="sd-card-title">
                Assigned Students
              </h3>

              <button
                className="sd-btn sd-btn-ghost"
                onClick={() =>
                  setShowAllStudents(!showAllStudents)
                }
              >
                {showAllStudents
                  ? "Show Less"
                  : "View All"}
              </button>
            </div>

            {(showAllStudents
              ? students
              : students.slice(0, 5)
            ).map((student) => (
              <div
                key={student.placement_id}
                className="sd-activity-item"
              >
                <div className="sd-activity-body">
                  <p>{student.student_name}</p>

                  <small>
                    {student.company}
                  </small>

                  {student.missed_weeks > 0 && (
                    <span className="missed-badge">
                      {student.missed_weeks}
                      {" "}weeks missed
                    </span>
                  )}
                </div>

                <button
                  className="sd-btn"
                  onClick={() =>
                    handleEvaluate(
                      student.placement_id
                    )
                  }
                >
                  Evaluate
                </button>
              </div>
            ))}
          </div>

          <div className="sd-card">

            <div className="sup-card-header">
              <h3 className="sd-card-title">
                Pending Logs
              </h3>

              <button
                className="sd-btn sd-btn-ghost"
                onClick={() =>
                  setShowAllLogs(!showAllLogs)
                }
              >
                {showAllLogs
                  ? "Show Less"
                  : "View All"}
              </button>
            </div>

            {(showAllLogs
              ? pendingLogs
              : pendingLogs.slice(0, 5)
            ).map((log) => (
              <div
                key={log.id}
                className="sd-activity-item"
              >
                <div className="sd-activity-body">
                  <p>
                    {log.student_name}
                  </p>

                  <small>
                    Week of{" "}
                    {new Date(
                      log.week_start_date
                    ).toDateString()}
                  </small>
                </div>

                <button
                  className="sd-btn"
                  onClick={() =>
                    handleReviewLog(log.id)
                  }
                >
                  Review
                </button>
              </div>
            ))}
          </div>

        </div>

        <section className="sd-section">
          <h3 className="sd-section-title">
            Performance Overview
          </h3>

          <div className="sd-chart-wrap">
            <ResponsiveContainer
              width="100%"
              height={250}
            >
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />

                <Bar
                  dataKey="value"
                  fill="var(--sd-accent)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="sd-section">

          <div className="sup-card-header">
            <h3 className="sd-section-title">
              Recent Activity
            </h3>

            <button
              className="sd-btn sd-btn-ghost"
              onClick={() =>
                setShowAllActivity(
                  !showAllActivity
                )
              }
            >
              {showAllActivity
                ? "Show Less"
                : "View All"}
            </button>
          </div>

          {(showAllActivity
            ? activity
            : activity.slice(0, 6)
          ).map((item, index) => (
            <div
              key={index}
              className="sd-activity-item"
            >
              <span className="sd-activity-dot" />

              <div className="sd-activity-body">
                <p>{item.message}</p>
                <time>
                  {formatTime(item.time)}
                </time>
              </div>
            </div>
          ))}

        </section>

      </main>
    </div>
  );
}
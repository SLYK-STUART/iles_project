import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import {
  Users,
  ClipboardList,
  CheckCircle,
  LogOut,
  Clock,
  FileText
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

import "./SupervisorDashboard.css";

export default function SupervisorDashboard() {
  const [pendingLogs, setPendingLogs] = useState([]);
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [supervisorName, setSupervisorName] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // ================= FETCH DASHBOARD DATA =================
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
      console.error("DASHBOARD ERROR:", err.response?.data || err.message);
      alert("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ================= HELPERS =================
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleReview = (logId) => {
    navigate(`/wp-supervisor/log/${logId}`);
  };

  const handleEvaluate = (placementId) => {
    navigate(`/wp-supervisor/evaluate/${placementId}`);
  };

  const formatTime = (time) => {
    if (!time) return "";

    const date = new Date(time);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;

    return date.toLocaleDateString();
  };

  const getActivityIcon = (type) => {
    if (type === "log") return <FileText size={16} />;
    if (type === "evaluation") return <CheckCircle size={16} />;
    return <Clock size={16} />;
  };

  if (loading) return <p className="loading">Loading dashboard...</p>;

  // ================= STATS =================
  const totalStudents = stats?.total_students || 0;
  const pendingCount = stats?.pending_reviews || 0;
  const completedEvaluations = stats?.completed_evaluations || 0;

  const chartData = [
    { name: "Pending", value: pendingCount },
    { name: "Evaluated", value: completedEvaluations },
  ];

  return (
    <div className="sup-container">

      {/* ================= HEADER ================= */}
      <div className="sup-header-bar">
        <div>
          <h2>Welcome, {supervisorName} 👋</h2>
          <p>Manage students, reviews, and evaluations</p>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={18} /> Logout
        </button>
      </div>

      {/* ================= STATS ================= */}
      <div className="sup-stats">

        <div className="card">
          <Users size={40} />
          <h3>Students</h3>
          <p>{totalStudents}</p>
        </div>

        <div className="card">
          <ClipboardList size={40} />
          <h3>Pending Reviews</h3>
          <p>{pendingCount}</p>
        </div>

        <div className="card">
          <CheckCircle size={40} />
          <h3>Evaluations</h3>
          <p>{completedEvaluations}</p>
        </div>

      </div>

      {/* ================= MAIN GRID ================= */}
      <div className="sup-grid">

        {/* -------- STUDENTS -------- */}
        <div className="panel">
          <h3>Assigned Students</h3>

          {students.length === 0 ? (
            <p className="empty-text">No students assigned</p>
          ) : (
            students.slice(0, 3).map((s) => (
              <div key={s.placement_id} className="item">
                <div>
                  <p>{s.student_name}</p>
                  <small>{s.company}</small>
                </div>

                <button onClick={() => handleEvaluate(s.placement_id)}>
                  Evaluate
                </button>
              </div>
            ))
          )}

          <button
            className="view-all"
            onClick={() => navigate("/students")}
          >
            View All Students
          </button>
        </div>

        {/* -------- PENDING LOGS -------- */}
        <div className="panel">
          <h3>Pending Reviews</h3>

          {pendingLogs.length === 0 ? (
            <p className="empty-text">No pending logs</p>
          ) : (
            pendingLogs.slice(0, 3).map((log) => (
              <div key={log.id} className="item">
                <div>
                  <p>Week {log.week_number}</p>
                  <small>{log.student_name}</small>
                </div>

                <button onClick={() => handleReview(log.id)}>
                  Review
                </button>
              </div>
            ))
          )}

          <button
            className="view-all"
            onClick={() => navigate("/logs")}
          >
            View All Logs
          </button>
        </div>

        {/* -------- CHART -------- */}
        <div className="panel">
          <h3>Evaluation Overview</h3>

          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* ================= ACTIVITY ================= */}
      <div className="panel">
        <h3>Recent Activity</h3>

        {activity.length === 0 ? (
          <p className="empty-text">No recent activity</p>
        ) : (
          <div className="activity-list">
            {activity.map((a, index) => (
              <div key={index} className="activity-item">
                <div className="activity-icon">
                  {getActivityIcon(a.type)}
                </div>

                <div className="activity-content">
                  <p>{a.message}</p>
                  <small>{formatTime(a.time)}</small>
                </div>
              </div>
            ))}
          </div>
        )}

        <button className="view-all">
          View All Activity
        </button>
      </div>

      {/* ================= QUICK ACTIONS ================= */}
      <div className="quick-actions">
        <button onClick={() => navigate("/students")}>
          View Students
        </button>

        <button onClick={() => navigate("/logs")}>
          Review Logs
        </button>

        <button onClick={() => navigate("/reports")}>
          Reports
        </button>
      </div>

    </div>
  );
}
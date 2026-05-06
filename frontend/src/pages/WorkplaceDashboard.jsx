import { useEffect, useState } from "react";
import API from "../api/axios";
import {
  Users, ClipboardList, CheckCircle, LogOut, Clock, FileText, Award, Calendar
} from "lucide-react";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

import "./SupervisorDashboard.css";

export default function SupervisorDashboard() {
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
    setError(null);
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
      setError("Failed to load dashboard. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const handleReviewLog = (logId) => {
    window.location.href = `/wp-supervisor/log/${logId}`;
  };

  const handleEvaluate = (placementId) => {
    window.location.href = `/wp-supervisor/evaluate/${placementId}`;
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "Unknown time";
    const date = new Date(timeStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hrs ago`;
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  };

  if (loading) return <p className="loading">Loading dashboard...</p>;
  if (error) return <p className="error">{error}</p>;

  const totalStudents = stats.total_students || 0;
  const pendingReviews = stats.pending_reviews || 0;
  const completedEvaluations = stats.completed_evaluations || 0;

  const chartData = [
    { name: "Pending Reviews", value: pendingReviews },
    { name: "Evaluations Done", value: completedEvaluations },
  ];

  return (
    <div className="sup-container">
 
      <div className="sup-header-bar">
        <div>
          <h2>Welcome, {supervisorName}</h2>
          <p>Manage student logs and performance evaluations</p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={18} /> Logout
        </button>
      </div>
 
      <div className="sup-stats">
        <div className="card">
          <Users size={40} />
          <h3>My Students</h3>
          <p className="stat-number">{totalStudents}</p>
        </div>

        <div className="card">
          <ClipboardList size={40} />
          <h3>Pending Logs</h3>
          <p className="stat-number">{pendingReviews}</p>
        </div>

        <div className="card">
          <Award size={40} />
          <h3>Evaluations Done</h3>
          <p className="stat-number">{completedEvaluations}</p>
        </div>
      </div>

      <div className="sup-main-grid">
 
        <div className="panel students-panel">
          <div className="panel-header">
            <h3>Assigned Students</h3>
            <button onClick={() => setShowAllStudents(!showAllStudents)}>
              {showAllStudents ? "Show Less" : "View All"}
            </button>
          </div>

          {(showAllStudents ? students : students.slice(0, 5)).map((student) => (
            <div key={student.placement_id} className="student-item">
              <div className="student-info">
                <p className="student-name">{student.student_name}</p>
                <small>{student.company}</small>
                {student.missed_weeks > 0 && (
                  <span className="missed-badge">
                    {student.missed_weeks} weeks missed
                  </span>
                )}
              </div>

              <div className="student-actions">
                <button 
                  className="action-btn evaluate-btn"
                  onClick={() => handleEvaluate(student.placement_id)}
                >
                  View(Evaluate)
                </button>
              </div>
            </div>
          ))}
        </div>
 
        <div className="panel logs-panel">
          <div className="panel-header">
            <h3>Pending Log Reviews</h3>
            <button onClick={() => setShowAllLogs(!showAllLogs)}>
              {showAllLogs ? "Show Less" : "View All"}
            </button>
          </div>

          {(showAllLogs ? pendingLogs : pendingLogs.slice(0, 5)).map((log) => (
            <div key={log.id} className="log-item">
              <div>
                <p><strong>{log.student_name}</strong></p>
                <small>Week of {new Date(log.week_start_date).toDateString()}</small>
              </div>
              <button 
                className="action-btn review-btn"
                onClick={() => handleReviewLog(log.id)}
              >
                Review
              </button>
            </div>
          ))}
        </div>
 
        <div className="panel chart-panel">
          <h3>Performance Overview</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
 
      <div className="panel activity-panel">
        <div className="panel-header">
          <h3>Recent Activity</h3>
          <button onClick={() => setShowAllActivity(!showAllActivity)}>
            {showAllActivity ? "Show Less" : "View All"}
          </button>
        </div>

        {(showAllActivity ? activity : activity.slice(0, 6)).map((a, index) => (
          <div key={index} className="activity-item">
            <div className="activity-icon">
              {a.type === "submission" && <FileText size={20} color="#60a5fa" />}
              {a.type === "approval" && <CheckCircle size={20} color="#22c55e" />}
              {a.type === "evaluation" && <Award size={20} color="#a855f7" />}
            </div>
            <div className="activity-content">
              <p>{a.message}</p>
              <small>{formatTime(a.time)}</small>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
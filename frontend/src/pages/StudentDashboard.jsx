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

  if (loading) return <p className="loading">Loading dashboard...</p>;
  if (error) {
    return (
      <div className="error-container">
        <p className="error">{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }
  if (!data) return <p className="error">No data available</p>;

  const progress = data?.progress || {};
  const placement = data?.placement || {};
  const weeks = data?.weeks || [];
  const evaluations = data?.evaluations || {};

  const chartData = [
    { name: "Approved", value: progress.approved || 0 },
    { name: "Submitted", value: progress.submitted || 0 },
    { name: "Pending", value: progress.pending || 0 },
    { name: "Rejected", value: progress.rejected || 0 },
  ];

  const hasEvaluation = evaluations?.final_score !== null && evaluations?.final_score !== undefined;

  return (
    <div className="student-dashboard">
 
      <div className="topbar">
        <div className="topbar-left">
          <h1>Student Dashboard</h1>
        </div>
        <div className="topbar-right">
          <button className="reviews-btn" onClick={() => navigate("/student/reviews")}>
            Reviews
          </button>
          <button className="logbook-btn" onClick={() => navigate("/logbook")}>
            📖 My Logbook
          </button>
          <button 
            className="logout-btn"
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/login");
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div className="main-content">
        <div className="welcome">
          <h2>Welcome back, <span>{data?.student_profile?.name || "Student"}</span></h2>
        </div>
 
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Weeks</h3>
            <p className="stat-number">{progress.total_weeks || weeks.length || 0}</p>
          </div>
          <div className="stat-card approved">
            <h3>Approved</h3>
            <p className="stat-number">{progress.approved || 0}</p>
          </div>
          <div className="stat-card submitted">
            <h3>Submitted</h3>
            <p className="stat-number">{progress.submitted || 0}</p>
          </div>
          <div className="stat-card rejected">
            <h3>Rejected</h3>
            <p className="stat-number">{progress.rejected || 0}</p>
          </div>
        </div>
 
        <div className="info-grid">
          <div className="profile-card">
            <h3>Student Profile</h3>
            <p><strong>Name:</strong> {data?.student_profile?.name || "N/A"}</p>
            <p><strong>Email:</strong> {data?.student_profile?.email || "N/A"}</p>
            <p><strong>Phone:</strong> {data?.student_profile?.phone || "N/A"}</p>
          </div>

          <div className="placement-card">
            <h3>Internship Details</h3>
            <p><strong>Company:</strong> {placement.company || "N/A"}</p>
            <p><strong>Start Date:</strong> {placement.start_date || "N/A"}</p>
            <p><strong>End Date:</strong> {placement.end_date || "N/A"}</p>
            <p><strong>Academic Supervisor:</strong> {placement.academic_supervisor || "N/A"}</p>
            <p><strong>Workplace Supervisor:</strong> {placement.workplace_supervisor || "N/A"}</p>
          </div>
        </div>
 
        {hasEvaluation && (
          <div className="evaluation-section">
            <h3>Final Evaluation Results</h3>
            
            <div className="final-score-card">
              <h2>Overall Score: <span className="score">{evaluations.final_score}</span>/100</h2>
              {evaluations.final_grade && (
                <h3 className="final-grade">Grade: {evaluations.final_grade}</h3>
              )}
            </div>

            {evaluations.ac_evaluation && (
              <div className="eval-card">
                <h4>Academic Supervisor Evaluation</h4>
                <p className="evaluator">by {evaluations.ac_evaluation.evaluator_name}</p>
                <div className="criteria-list">
                  {evaluations.ac_evaluation.items?.map(item => (
                    <div key={item.id} className="criterion-item">
                      <span>{item.criteria_name}</span>
                      <span className="score">{item.score} <small>({item.criteria_weight}%)</small></span>
                    </div>
                  ))}
                </div>
                <p><strong>Total:</strong> {evaluations.ac_evaluation.total_score}</p>
              </div>
            )}

            {evaluations.wp_evaluation && (
              <div className="eval-card">
                <h4>Workplace Supervisor Evaluation</h4>
                <p className="evaluator">by {evaluations.wp_evaluation.evaluator_name}</p>
                <div className="criteria-list">
                  {evaluations.wp_evaluation.items?.map(item => (
                    <div key={item.id} className="criterion-item">
                      <span>{item.criteria_name}</span>
                      <span className="score">{item.score} <small>({item.criteria_weight}%)</small></span>
                    </div>
                  ))}
                </div>
                <p><strong>Total:</strong> {evaluations.wp_evaluation.total_score}</p>
              </div>
            )}
          </div>
        )}
 
        <div className="chart-section">
          <h3>Log Progress Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
 
        <div className="activity-section">
          <h3>Recent Activity</h3>
          {data?.recent_activity?.length > 0 ? (
            <div className="activity-list">
              {data.recent_activity.map((item, index) => (
                <div key={index} className="activity-item">
                  <p>{item.message}</p>
                  <small>{new Date(item.date).toLocaleString()}</small>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-activity">No recent activity yet.</p>
          )}
        </div>
 
        {weeks.length > 0 && (
          <div className="week-summary">
            <h3>Current Week Status</h3>
            <div className="current-week">
              {weeks.find(w => w.is_current) ? (
                <p>
                  <strong>Current Week:</strong>{" "}
                  {new Date(weeks.find(w => w.is_current).week_start).toDateString()}
                </p>
              ) : (
                <p>No current week found</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
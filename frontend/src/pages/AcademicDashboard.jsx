import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

import {
  Users, FileText, CheckCircle, XCircle, Award, ArrowRight
} from "lucide-react";

import "./AcademicDashboard.css";

const COLORS = ['#22c55e', '#ef4444', '#3b82f6'];

export default function AcademicDashboard() {
  const [data, setData] = useState(null);
  const [showAllPlacements, setShowAllPlacements] = useState(false);
  const [showAllLogs, setShowAllLogs] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await API.get("logbook/academic-dashboard/");
        console.log("Academic Dashboard Data:", res.data);
        setData(res.data);
        setError(null);
      } catch (err) {
        console.error("Academic Dashboard Error:", err);
        setError("Failed to load dashboard. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <p className="loading">Loading dashboard...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!data) return <p className="error">No data available</p>;

  const placementsToShow = showAllPlacements 
    ? data.placements || []
    : (data.placements_preview || data.placements?.slice(0, 4) || []);

  const recentLogs = showAllLogs 
    ? data.recent_logs || []
    : (data.recent_logs?.slice(0, 6) || []);

  const pieData = [
    { name: "Approved", value: data.stats?.approved_logs || 0 },
    { name: "Rejected", value: data.stats?.rejected_logs || 0 },
  ];

  const barData = [
    { name: "Total Logs", value: data.stats?.total_logs || 0 },
    { name: "Approved", value: data.stats?.approved_logs || 0 },
    { name: "Rejected", value: data.stats?.rejected_logs || 0 },
  ];

  return (
    <div className="acad-container">

      <div className="header">
        <div>
          <h1>Academic Supervisor Dashboard</h1>
          <p>Monitor student progress and performance</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <Users size={32} />
          <h3>Placements</h3>
          <p className="stat-number">{data.stats?.total_placements || 0}</p>
        </div>
        <div className="stat-card">
          <FileText size={32} />
          <h3>Total Logs</h3>
          <p className="stat-number">{data.stats?.total_logs || 0}</p>
        </div>
        <div className="stat-card success">
          <CheckCircle size={32} />
          <h3>Approved</h3>
          <p className="stat-number">{data.stats?.approved_logs || 0}</p>
        </div>
        <div className="stat-card danger">
          <XCircle size={32} />
          <h3>Rejected</h3>
          <p className="stat-number">{data.stats?.rejected_logs || 0}</p>
        </div>
      </div>

      <div className="main-grid">

        <div className="panel placements-panel">
          <div className="panel-header">
            <h2>My Students</h2>
            <button 
              className="toggle-btn"
              onClick={() => setShowAllPlacements(!showAllPlacements)}
            >
              {showAllPlacements ? "Show Less" : "View All"}
            </button>
          </div>

          {placementsToShow.length === 0 ? (
            <p className="empty-text">No placements assigned yet.</p>
          ) : (
            placementsToShow.map((placement) => (
              <div key={placement.placement_id} className="placement-card">
                <div className="placement-top">
                  <div>
                    <strong>{placement.student_name}</strong>
                    <p className="company">{placement.company}</p>
                  </div>

                  {placement.pending_evaluation ? (
                    <button 
                      className="btn-evaluate prominent"
                      onClick={() => navigate(`/ac-supervisor/evaluate/${placement.placement_id}`)}
                    >
                      <Award size={18} />
                      View(Evaluate)
                      <ArrowRight size={16} />
                    </button>
                  ) : (
                    <button 
                      className="btn-evaluate secondary"
                      onClick={() => navigate(`/ac-supervisor/evaluate/${placement.placement_id}`)}
                    >
                      View(Evaluate)
                    </button>
                  )}
                </div>

                <div className="progress-container">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${placement.progress || 0}%` }}
                    />
                  </div>
                  <small>{placement.progress || 0}% of placement completed</small>
                </div>

                <div className="placement-stats">
                  <span>Logs: <strong>{placement.stats?.total_logs || 0}</strong></span>
                  <span>Approved: <strong className="approved">{placement.stats?.approved || 0}</strong></span>
                  <span>Rejected: <strong className="rejected">{placement.stats?.rejected || 0}</strong></span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="panel analytics-panel">
          <h2>Performance Analytics</h2>

          <div className="charts">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>

            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="panel logs-panel">
        <div className="panel-header">
          <h2>Recent Student Logs</h2>
          <button 
            className="toggle-btn"
            onClick={() => setShowAllLogs(!showAllLogs)}
          >
            {showAllLogs ? "Show Less" : "View All"}
          </button>
        </div>

        {recentLogs.length === 0 ? (
          <p className="empty-text">No recent logs available.</p>
        ) : (
          recentLogs.map((log) => (
            <div key={log.id} className="log-item">
              <div>
                <strong>{log.student_name}</strong>
                <p>Week starting {new Date(log.week_start_date).toDateString()}</p>
              </div>
              <span className={`status-badge ${log.status.toLowerCase()}`}>
                {log.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
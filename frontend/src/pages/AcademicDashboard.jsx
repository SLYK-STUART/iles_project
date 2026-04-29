import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

import {
  Users, FileText, CheckCircle, XCircle
} from "lucide-react";

import "./AcademicDashboard.css";

export default function AcademicDashboard() {
  const [data, setData] = useState(null);
  const [showAllPlacements, setShowAllPlacements] = useState(false);
  const [showAllLogs, setShowAllLogs] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    API.get("logbook/academic-dashboard/")
      .then(res => setData(res.data))
      .catch(() => alert("Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="loading">Loading dashboard...</p>;
  if (!data) return null;

  const placements = showAllPlacements
    ? data.placements_all
    : data.placements_preview;

  const logs = showAllLogs
    ? data.logs_all
    : data.logs_preview;

  const pieData = [
    { name: "Approved", value: data.stats.approved_logs },
    { name: "Rejected", value: data.stats.rejected_logs },
  ];

  const barData = [
    { name: "Logs", value: data.stats.total_logs },
    { name: "Approved", value: data.stats.approved_logs },
    { name: "Rejected", value: data.stats.rejected_logs },
  ];

  return (
    <div className="acad-container">
      
      <div className="header">
        <div>
          <h1>Academic Dashboard</h1>
          <p>Track performance, logs, and evaluations</p>
        </div>
      </div>

      <div className="stats-grid">

        <div className="stat-card">
          <Users size={32} />
          <h3>Placements</h3>
          <p>{data.stats.total_placements}</p>
        </div>

        <div className="stat-card">
          <FileText size={32} />
          <h3>Total Logs</h3>
          <p>{data.stats.total_logs}</p>
        </div>

        <div className="stat-card success">
          <CheckCircle size={32} />
          <h3>Approved</h3>
          <p>{data.stats.approved_logs}</p>
        </div>

        <div className="stat-card danger">
          <XCircle size={32} />
          <h3>Rejected</h3>
          <p>{data.stats.rejected_logs}</p>
        </div>

      </div>

      <div className="grid">

        <div className="panel">
          <h2>Placements</h2>

          {placements.map(p => (
            <div key={p.placement_id} className="placement-card">

              <div className="top">
                <div>
                  <strong>{p.student_name}</strong>
                  <p>{p.company}</p>
                </div>

                {p.pending_evaluation && (
                  <button
                    className="btn-primary"
                    onClick={() => navigate(`/ac-supervisor/evaluate/${p.placement_id}`)}
                  >
                    Evaluate
                  </button>
                )}
              </div>

              <div className="progress">
                <div style={{ width: `${p.progress}%` }} />
              </div>
              <small>{p.progress}% complete</small>

              <div className="mini">
                <span>Logs: {p.stats.total_logs}</span>
                <span>✔ {p.stats.approved}</span>
                <span>✖ {p.stats.rejected}</span>
              </div>

            </div>
          ))}

          <button onClick={() => setShowAllPlacements(!showAllPlacements)}>
            {showAllPlacements ? "Show Less" : "View All"}
          </button>
        </div>

        <div className="panel">
          <h2>Analytics</h2>

          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" />
            </BarChart>
          </ResponsiveContainer>

          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} dataKey="value" outerRadius={80}>
                <Cell />
                <Cell />
              </Pie>
            </PieChart>
          </ResponsiveContainer>

        </div>

      </div>

      <div className="panel">
        <h2>Recent Logs</h2>

        {logs.map(log => (
          <div key={log.id} className="log-item">
            <div>
              <strong>{log.student}</strong>
              <p>Week {log.week}</p>
            </div>

            <span className={`status-badge ${log.status.toLowerCase()}`}>
              {log.status}
            </span>
          </div>
        ))}

        <button onClick={() => setShowAllLogs(!showAllLogs)}>
          {showAllLogs ? "Show Less" : "View All Logs"}
        </button>
      </div>

    </div>
  );
}
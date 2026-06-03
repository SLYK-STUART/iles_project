import { useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import {
  Users,
  BarChart3,
  FileText,
  LogOut,
  Activity,
  Clock,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const fetchDashboard = async () => {
    try {
      const res = await API.get("logbook/admin-dashboard/");
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load admin dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (loading) return <p className="loading">Loading dashboard...</p>;
  if (error) return <p className="error">{error}</p>;

  const logStatusData = [
    { name: "Submitted", value: data.logs.submitted },
    { name: "Approved", value: data.logs.approved },
    { name: "Rejected", value: data.logs.rejected },
  ];

  const placementStatusData = [
    { name: "Pending", value: data.placements.pending, fill: "#f59e0b" },
    { name: "Active", value: data.placements.active, fill: "#3b82f6" },
    { name: "Completed", value: data.placements.completed, fill: "#22c55e" },
    { name: "Cancelled", value: data.placements.cancelled, fill: "#ef4444" },
  ];

  return (
  <div className="admin-dashboard">
 
    <header className="ad-topbar">
      <div className="ad-topbar-left">
        <span className="ad-logo-mark">AD</span>
        <h1>Administrator Dashboard</h1>
      </div>

      <nav className="ad-topbar-right">
        <button
          className="ad-btn ad-btn-ghost"
          onClick={() => navigate("/admin/users")}
        >
          Manage Users
        </button>

        <button
          className="ad-btn ad-btn-ghost"
          onClick={() => navigate("/admin/overview")}
        >
          System Overview
        </button>

        <button
          className="ad-btn ad-btn-ghost"
          onClick={() => navigate("/admin/placements")}
        >
          Internships
        </button>

        <button
          className="ad-btn ad-btn-danger"
          onClick={handleLogout}
        >
          Logout
        </button>
      </nav>
    </header>

    <main className="ad-main">
 
      <div className="ad-welcome">
        <h2>Administrator Dashboard</h2>
        <p className="ad-subtitle">
          Monitor placements, users, and internship activity.
        </p>
      </div>
 
      <section className="ad-section">
        <div className="ad-stats-grid">

          <div className="ad-stat-card">
            <span className="ad-stat-label">Submitted Logs</span>
            <span className="ad-stat-num">
              {data.logs.submitted}
            </span>
          </div>

          <div className="ad-stat-card approved">
            <span className="ad-stat-label">Approved Logs</span>
            <span className="ad-stat-num">
              {data.logs.approved}
            </span>
          </div>

          <div className="ad-stat-card rejected">
            <span className="ad-stat-label">Rejected Logs</span>
            <span className="ad-stat-num">
              {data.logs.rejected}
            </span>
          </div>

          <div className="ad-stat-card">
            <span className="ad-stat-label">Active Placements</span>
            <span className="ad-stat-num">
              {data.placements.active}
            </span>
          </div>

        </div>
      </section>

      {/* Quick Actions */}
      <section className="ad-section">
        <h3 className="ad-section-title">
          Quick Actions
        </h3>

        <div className="ad-actions-grid">

          <div
            className="ad-action-card"
            onClick={() => navigate("/admin/users")}
          >
            <Users size={20} />
            <h4>Manage Users</h4>
            <p>Students, supervisors & roles</p>
          </div>

          <div
            className="ad-action-card"
            onClick={() => navigate("/admin/overview")}
          >
            <BarChart3 size={20} />
            <h4>System Overview</h4>
            <p>Analytics & statistics</p>
          </div>

          <div
            className="ad-action-card"
            onClick={() => navigate("/admin/placements")}
          >
            <FileText size={20} />
            <h4>Internships</h4>
            <p>Manage placements</p>
          </div>

        </div>
      </section>
 
      <section className="ad-section">
        <h3 className="ad-section-title">
          Analytics
        </h3>

        <div className="ad-chart-grid">

          <div className="ad-card">
            <h4>Log Status Overview</h4>

            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={logStatusData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="ad-card">
            <h4>Placement Status</h4>

            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={placementStatusData}
                  dataKey="value"
                  innerRadius={70}
                  outerRadius={110}
                >
                  {placementStatusData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.fill}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

        </div>
      </section>
 
      <section className="ad-section">
        <h3 className="ad-section-title">
          Recent Updates
        </h3>

        <div className="ad-recent-grid">

          <div className="ad-card">
            <h4>Recent Users</h4>

            {data.recent_users?.length ? (
              data.recent_users.map(user => (
                <div
                  key={user.id}
                  className="ad-activity-item"
                >
                  <span className="ad-activity-dot" />

                  <div className="ad-activity-body">
                    <p>{user.name}</p>
                    <small>{user.role}</small>
                    <time>{user.joined}</time>
                  </div>
                </div>
              ))
            ) : (
              <div className="ad-empty-state">
                <p>No recent users</p>
              </div>
            )}
          </div>

          <div className="ad-card">
            <h4>Recent Activities</h4>

            {data.recent_activities?.length ? (
              data.recent_activities.map((activity, idx) => (
                <div
                  key={idx}
                  className="ad-activity-item"
                >
                  <span className="ad-activity-dot" />

                  <div className="ad-activity-body">
                    <p>{activity.title}</p>
                    <time>{activity.time}</time>
                  </div>
                </div>
              ))
            ) : (
              <div className="ad-empty-state">
                <p>No recent activity</p>
              </div>
            )}
          </div>

        </div>
      </section>

    </main>
  </div>
);
    
}
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
    <div className="admin-container">

      {/* ================= HEADER ================= */}
      <div className="admin-header">
        <div>
          <h1>Administrator Dashboard</h1>
          <p>System Overview • Real-time Insights</p>
        </div>

        <button
          className="logout-btn"
          onClick={() => {
            handleLogout()
          }}
        >
          Logout
        </button>
      </div>

    {/* ================= ACTION CARDS ================= */}
      <div className="admin-actions">

        <div className="action-card" onClick={() => navigate("/admin/users")}>
          <h3>Manage Users</h3>
          <p>Students, supervisors & roles</p>
        </div>

        <div className="action-card" onClick={() => navigate("/admin/overview")}>
          <h3>System Overview</h3>
          <p>Full analytics & statistics</p>
        </div>

        <div className="action-card" onClick={() => navigate("/admin/placements")}>
          <h3>Internships</h3>
          <p>Add Internships</p>
        </div>

      </div>

    {/* ================= CHARTS SIDE BY SIDE ================= */}
      <div className="charts-grid">

        <div className="chart-box">
          <h3>Log Status Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={logStatusData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-box">
          <h3>Placement Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={placementStatusData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                dataKey="value"
              >
                {placementStatusData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>

    {/* ================= RECENT SECTION SIDE BY SIDE ================= */}
      <div className="recent-grid">

        {/* RECENT USERS */}
        <div className="section">
          <h3>Recent Users</h3>

          {data.recent_users?.length ? (
            data.recent_users.map((user) => (
              <div key={user.id} className="recent-item">
                <div>
                  <strong>{user.name}</strong>
                  <span>{user.role}</span>
                </div>
                <small>{user.joined}</small>
              </div>
            ))
          ) : (
            <p>No recent users</p>
          )}
        </div>

      {/* RECENT ACTIVITIES */}
        <div className="section">
          <h3>Recent Activities</h3>

          {data.recent_activities?.length ? (
            data.recent_activities.map((act, index) => (
              <div key={index} className="activity-item">
                <div>
                  <strong>{act.title}</strong>
                </div>
                <small>{act.time}</small>
              </div>
            ))
          ) : (
            <p>No recent activity</p>
          )}
        </div>

      </div>

    </div>
  );
}
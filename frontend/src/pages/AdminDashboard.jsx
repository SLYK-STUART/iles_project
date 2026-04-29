import { useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserCheck,
  Briefcase,
  Building2,
  FileText,
  Award,
  Activity,
  Clock,
  AlertTriangle,
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

  if (loading) return <p className="loading">Loading dashboard...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!data) return <p className="empty">No data available</p>;

  const logStatusData = [
    { name: "Submitted", value: data.submitted_logs, fill: "#eab308" },
    { name: "Approved", value: data.approved_logs, fill: "#22c55e" },
    { name: "Rejected", value: data.rejected_logs, fill: "#ef4444" },
  ];

  const placementStatusData = [
    { name: "Pending", value: data.pending_placements, fill: "#f59e0b" },
    { name: "Active", value: data.active_placements, fill: "#3b82f6" },
    { name: "Completed", value: data.completed_placements, fill: "#22c55e" },
    { name: "Cancelled", value: data.cancelled_placements, fill: "#ef4444" },
  ];

  return (
    <div className="admin-container">
      <h1 className="admin-title">Administrator Dashboard</h1>
      <p className="welcome-text">System Overview • Real-time Insights</p>

      <div className="stats-grid">
        <div className="stat-card">
          <Users size={32} />
          <h3>Total Users</h3>
          <p className="number">{data.total_users}</p>
        </div>

        <div className="stat-card">
          <UserCheck size={32} />
          <h3>Students</h3>
          <p className="number">{data.total_students}</p>
        </div>

        <div className="stat-card">
          <Award size={32} />
          <h3>Academic Sup.</h3>
          <p className="number">{data.total_ac_supervisors}</p>
        </div>

        <div className="stat-card">
          <Award size={32} />
          <h3>Workplace Sup.</h3>
          <p className="number">{data.total_wp_supervisors}</p>
        </div>

        <div className="stat-card">
          <Building2 size={32} />
          <h3>Companies</h3>
          <p className="number">{data.total_companies}</p>
        </div>

        <div className="stat-card">
          <Briefcase size={32} />
          <h3>Total Placements</h3>
          <p className="number">{data.total_placements}</p>
        </div>

        <div className="stat-card">
          <Activity size={32} />
          <h3>Active Placements</h3>
          <p className="number">{data.active_placements}</p>
        </div>

        <div className="stat-card highlight">
          <Clock size={32} />
          <h3>Pending Logs</h3>
          <p className="number">{data.pending_logs}</p>
        </div>

        <div className="stat-card">
          <Award size={32} />
          <h3>Approval Rate</h3>
          <p className="number">{data.approval_rate}%</p>
        </div>

        <div className="stat-card">
          <AlertTriangle size={32} />
          <h3>No Placement</h3>
          <p className="number">{data.students_without_placement}</p>
        </div>

        <div className="stat-card">
          <FileText size={32} />
          <h3>Total Logs</h3>
          <p className="number">{data.total_logs}</p>
        </div>

        <div className="stat-card">
          <Award size={32} />
          <h3>Total Evaluations</h3>
          <p className="number">{data.total_evaluations}</p>
        </div>

        <div className="stat-card" onClick={() => navigate("/admin/users")} style={{ cursor: "pointer"}}>
          <useCog size={32} />
          <h3>User Management</h3>
          <p className="number">{data.total_users}</p>
          <small style={{color: "#94a3b8"}}>Manage users and roles</small>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-box">
          <h3>Log Status Overview</h3>
          <ResponsiveContainer width="100%" height={320}>
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
          <ResponsiveContainer width="100%" height={320}>
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
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="recent-section">
        <h3>Recent Users</h3>
        {data.recent_users && data.recent_users.length > 0 ? (
          <div className="recent-list">
            {data.recent_users.map((user) => (
              <div key={user.id} className="recent-item">
                <div>
                  <strong>{user.name}</strong>
                  <span className="role-badge">{user.role}</span>
                </div>
                <span className="date">Joined {user.joined}</span>
              </div>
            ))}
          </div>
        ) : (
          <p>No recent users</p>
        )}
      </div>
    </div>
  );
}
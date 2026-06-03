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
  PieChart,
  Pie,
  Cell,
} from "recharts";

import {
  Users,
  FileText,
  CheckCircle,
  XCircle,
  Award,
  ArrowRight,
  LogOut,
} from "lucide-react";

import "./AcademicDashboard.css";

const COLORS = ["#22c55e", "#ef4444"];

export default function AcademicDashboard() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [showAllPlacements, setShowAllPlacements] = useState(false);
  const [showAllLogs, setShowAllLogs] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await API.get("logbook/academic-dashboard/");
        setData(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
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
        <div className="sd-error">{error}</div>
      </div>
    );
  }

  const placementsToShow = showAllPlacements
    ? data.placements || []
    : (data.placements || []).slice(0, 4);

  const recentLogs = showAllLogs
    ? data.recent_logs || []
    : (data.recent_logs || []).slice(0, 6);

  const pieData = [
    {
      name: "Approved",
      value: data.stats?.approved_logs || 0,
    },
    {
      name: "Rejected",
      value: data.stats?.rejected_logs || 0,
    },
  ];

  const barData = [
    {
      name: "Total",
      value: data.stats?.total_logs || 0,
    },
    {
      name: "Approved",
      value: data.stats?.approved_logs || 0,
    },
    {
      name: "Rejected",
      value: data.stats?.rejected_logs || 0,
    },
  ];

  return (
    <div className="academic-dashboard">
 
      <header className="sd-topbar">
        <div className="sd-topbar-left">
          <div className="sd-logo-mark">AS</div>
          <h1>Academic Supervisor</h1>
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
          <h2>Academic Dashboard</h2>
          <p className="sd-subtitle">
            Monitor student progress, weekly logs and evaluations.
          </p>
        </div>
 
        <section className="sd-section">
          <div className="sd-section-title">
            Overview
          </div>

          <div className="sd-stats-grid">
            <div className="sd-stat-card">
              <div className="sd-stat-label">Placements</div>
              <div className="sd-stat-num">
                {data.stats?.total_placements || 0}
              </div>
            </div>

            <div className="sd-stat-card">
              <div className="sd-stat-label">Total Logs</div>
              <div className="sd-stat-num">
                {data.stats?.total_logs || 0}
              </div>
            </div>

            <div className="sd-stat-card">
              <div className="sd-stat-label">Approved</div>
              <div className="sd-stat-num">
                {data.stats?.approved_logs || 0}
              </div>
              <span className="sd-stat-badge approved">
                Approved
              </span>
            </div>

            <div className="sd-stat-card">
              <div className="sd-stat-label">Rejected</div>
              <div className="sd-stat-num">
                {data.stats?.rejected_logs || 0}
              </div>
              <span className="sd-stat-badge rejected">
                Rejected
              </span>
            </div>
          </div>
        </section>
 
        <section className="sd-section">
          <div className="panel-header">
            <div className="sd-section-title">
              Assigned Students
            </div>

            <button
              className="sd-btn sd-btn-ghost"
              onClick={() =>
                setShowAllPlacements(!showAllPlacements)
              }
            >
              {showAllPlacements ? "Show Less" : "View All"}
            </button>
          </div>

          {placementsToShow.length === 0 ? (
            <div className="sd-empty-state">
              <div className="sd-empty-title">
                No placements assigned
              </div>
            </div>
          ) : (
            <div className="acad-placement-grid">
              {placementsToShow.map((placement) => (
                <div
                  key={placement.placement_id}
                  className="acad-placement-card"
                >
                  <div className="acad-placement-top">
                    <div>
                      <h4>{placement.student_name}</h4>
                      <p>{placement.company}</p>
                    </div>

                    <button
                      className="sd-btn"
                      onClick={() =>
                        navigate(
                          `/ac-supervisor/evaluate/${placement.placement_id}`
                        )
                      }
                    >
                      <Award size={15} />
                      Evaluate
                      <ArrowRight size={15} />
                    </button>
                  </div>

                  <div className="progress-bar-track">
                    <div
                      className="progress-bar-fill approved"
                      style={{
                        width: `${placement.progress || 0}%`,
                      }}
                    />
                  </div>

                  <div className="acad-progress-text">
                    {placement.progress || 0}% completed
                  </div>

                  <div className="acad-stats-row">
                    <span>
                      Logs: {placement.stats?.total_logs || 0}
                    </span>

                    <span className="approved-text">
                      Approved: {placement.stats?.approved || 0}
                    </span>

                    <span className="rejected-text">
                      Rejected: {placement.stats?.rejected || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
 
        <section className="sd-info-grid">

          <div className="sd-card">
            <div className="sd-card-title">
              Log Statistics
            </div>

            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="value"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="sd-card">
            <div className="sd-card-title">
              Approval Ratio
            </div>

            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  outerRadius={90}
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index]}
                    />
                  ))}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

        </section>
 
        <section className="sd-section">

          <div className="panel-header">
            <div className="sd-section-title">
              Recent Student Logs
            </div>

            <button
              className="sd-btn sd-btn-ghost"
              onClick={() =>
                setShowAllLogs(!showAllLogs)
              }
            >
              {showAllLogs ? "Show Less" : "View All"}
            </button>
          </div>

          {recentLogs.length === 0 ? (
            <div className="sd-empty-state">
              <div className="sd-empty-title">
                No recent logs available
              </div>
            </div>
          ) : (
            <div className="sd-activity-list">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="sd-activity-item"
                >
                  <div className="sd-activity-dot" />

                  <div className="sd-activity-body">
                    <p>
                      <strong>{log.student_name}</strong>
                    </p>

                    <time>
                      Week starting{" "}
                      {new Date(
                        log.week_start_date
                      ).toDateString()}
                    </time>
                  </div>

                  <span
                    className={`sd-stat-badge ${log.status.toLowerCase()}`}
                  >
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
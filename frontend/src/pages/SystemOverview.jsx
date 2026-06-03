import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import {
  Users,
  UserCheck,
  Briefcase,
  Building2,
  FileText,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowLeft,
} from "lucide-react";

import "./SystemOverview.css";

function ProgressBar({ approved, submitted, rejected, total }) {
  const approvedPct = total ? Math.round((approved / total) * 100) : 0;
  const submittedPct = total ? Math.round((submitted / total) * 100) : 0;
  const rejectedPct = total ? Math.round((rejected / total) * 100) : 0;

  return (
    <div className="so-progress-section">
      <div className="so-progress-header">
        <span className="so-progress-title">Log Status Distribution</span>
        <span className="so-progress-fraction">
          {approved} approved of {total} total logs
        </span>
      </div>

      <div className="so-progress-track">
        <div
          className="so-progress-fill approved"
          style={{ width: `${approvedPct}%` }}
        />
        <div
          className="so-progress-fill submitted"
          style={{ width: `${submittedPct}%` }}
        />
        <div
          className="so-progress-fill rejected"
          style={{ width: `${rejectedPct}%` }}
        />
      </div>

      <div className="so-progress-legend">
        <span className="legend-item approved">
          Approved {approved}
        </span>
        <span className="legend-item submitted">
          Submitted {submitted}
        </span>
        <span className="legend-item rejected">
          Rejected {rejected}
        </span>
      </div>
    </div>
  );
}

export default function SystemOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await API.get("logbook/admin-dashboard/");

      setData(res.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load system overview.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="so-loading">
        <div className="so-spinner" />
        <p>Loading system overview...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="so-error-container">
        <p className="so-error">{error}</p>

        <button
          className="so-btn so-btn-primary"
          onClick={fetchData}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="so-error-container">
        <p className="so-error">No data available.</p>
      </div>
    );
  }

  return (
    <div className="system-overview">
 
      <header className="so-topbar">
        <div className="so-topbar-left">
          <span className="so-logo-mark">SO</span>
          <h1>System Overview</h1>
        </div>

        <div className="so-topbar-right">
          <button
            className="so-btn so-btn-ghost"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>
      </header>

      <main className="so-main">
 
        <div className="so-welcome">
          <h2>System Analytics</h2>
          <p className="so-subtitle">
            Real-time overview of users, placements, logs and evaluations.
          </p>
        </div>
 
        <section className="so-section">
          <h3 className="so-section-title">
            Executive Summary
          </h3>

          <div className="so-stats-grid">

            <div className="so-stat-card">
              <span className="so-stat-label">
                Total Users
              </span>
              <span className="so-stat-num">
                {data?.users?.total || 0}
              </span>
            </div>

            <div className="so-stat-card active">
              <span className="so-stat-label">
                Active Placements
              </span>
              <span className="so-stat-num">
                {data?.placements?.active || 0}
              </span>
            </div>

            <div className="so-stat-card">
              <span className="so-stat-label">
                Total Logs
              </span>
              <span className="so-stat-num">
                {data?.logs?.total || 0}
              </span>
            </div>

            <div className="so-stat-card completed">
              <span className="so-stat-label">
                Evaluations
              </span>
              <span className="so-stat-num">
                {data?.evaluations || 0}
              </span>
            </div>

          </div>
        </section>
 
        <section className="so-section">
          <h3 className="so-section-title">
            Users
          </h3>

          <div className="so-stats-grid">

            <div className="so-stat-card">
              <Users size={20} />
              <span className="so-stat-label">
                Total Users
              </span>
              <span className="so-stat-num">
                {data?.users?.total || 0}
              </span>
            </div>

            <div className="so-stat-card">
              <UserCheck size={20} />
              <span className="so-stat-label">
                Students
              </span>
              <span className="so-stat-num">
                {data?.users?.students || 0}
              </span>
            </div>

            <div className="so-stat-card">
              <Activity size={20} />
              <span className="so-stat-label">
                Academic Supervisors
              </span>
              <span className="so-stat-num">
                {data?.users?.academic_supervisors || 0}
              </span>
            </div>

            <div className="so-stat-card">
              <Activity size={20} />
              <span className="so-stat-label">
                Workplace Supervisors
              </span>
              <span className="so-stat-num">
                {data?.users?.workplace_supervisors || 0}
              </span>
            </div>

          </div>
        </section>
 
        <section className="so-section">
          <h3 className="so-section-title">
            Placement Analytics
          </h3>

          <div className="so-stats-grid">

            <div className="so-stat-card">
              <Briefcase size={20} />
              <span className="so-stat-label">
                Total Placements
              </span>
              <span className="so-stat-num">
                {data?.placements?.total || 0}
              </span>
            </div>

            <div className="so-stat-card active">
              <Clock size={20} />
              <span className="so-stat-label">
                Active
              </span>
              <span className="so-stat-num">
                {data?.placements?.active || 0}
              </span>
            </div>

            <div className="so-stat-card pending">
              <AlertTriangle size={20} />
              <span className="so-stat-label">
                Pending
              </span>
              <span className="so-stat-num">
                {data?.placements?.pending || 0}
              </span>
            </div>

            <div className="so-stat-card completed">
              <CheckCircle size={20} />
              <span className="so-stat-label">
                Completed
              </span>
              <span className="so-stat-num">
                {data?.placements?.completed || 0}
              </span>
            </div>

            <div className="so-stat-card cancelled">
              <AlertTriangle size={20} />
              <span className="so-stat-label">
                Cancelled
              </span>
              <span className="so-stat-num">
                {data?.placements?.cancelled || 0}
              </span>
            </div>

            <div className="so-stat-card">
              <UserCheck size={20} />
              <span className="so-stat-label">
                Without Placement
              </span>
              <span className="so-stat-num">
                {data?.placements?.students_without_placement || 0}
              </span>
            </div>

          </div>
        </section>
 
        <section className="so-section">
          <h3 className="so-section-title">
            Weekly Log Analytics
          </h3>

          <ProgressBar
            approved={data?.logs?.approved || 0}
            submitted={data?.logs?.submitted || 0}
            rejected={data?.logs?.rejected || 0}
            total={data?.logs?.total || 0}
          />

          <div className="so-stats-grid">

            <div className="so-stat-card">
              <FileText size={20} />
              <span className="so-stat-label">
                Total Logs
              </span>
              <span className="so-stat-num">
                {data?.logs?.total || 0}
              </span>
            </div>

            <div className="so-stat-card pending">
              <Clock size={20} />
              <span className="so-stat-label">
                Submitted
              </span>
              <span className="so-stat-num">
                {data?.logs?.submitted || 0}
              </span>
            </div>

            <div className="so-stat-card completed">
              <CheckCircle size={20} />
              <span className="so-stat-label">
                Approved
              </span>
              <span className="so-stat-num">
                {data?.logs?.approved || 0}
              </span>
            </div>

            <div className="so-stat-card cancelled">
              <AlertTriangle size={20} />
              <span className="so-stat-label">
                Rejected
              </span>
              <span className="so-stat-num">
                {data?.logs?.rejected || 0}
              </span>
            </div>

            <div className="so-stat-card">
              <Activity size={20} />
              <span className="so-stat-label">
                Approval Rate
              </span>
              <span className="so-stat-num">
                {data?.logs?.approval_rate || 0}%
              </span>
            </div>

          </div>
        </section>
 
        <section className="so-section">
          <h3 className="so-section-title">
            Evaluations
          </h3>

          <div className="so-highlight-card">
            <Building2 size={28} />

            <div>
              <span className="so-highlight-label">
                Total Evaluations Completed
              </span>

              <h2 className="so-highlight-value">
                {data?.evaluations || 0}
              </h2>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
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

export default function SystemOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get("logbook/admin-dashboard/");
        setData(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load system overview");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p className="loading">Loading system overview...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="system-overview-container">
      <div className="overview-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={22} />
          Back
        </button>

        <div className="header-content">
          <h1>System Overview</h1>
          <p>Real-time analytics and system performance</p>
        </div>
      </div>
 
      <section className="overview-section">
        <h2>Users</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <Users size={32} />
            <h3>Total Users</h3>
            <p className="stat-value">{data?.users?.total || 0}</p>
          </div>
          <div className="stat-card">
            <UserCheck size={32} />
            <h3>Students</h3>
            <p className="stat-value">{data?.users?.students || 0}</p>
          </div>
          <div className="stat-card">
            <Activity size={32} />
            <h3>Academic Supervisors</h3>
            <p className="stat-value">{data?.users?.academic_supervisors || 0}</p>
          </div>
          <div className="stat-card">
            <Activity size={32} />
            <h3>Workplace Supervisors</h3>
            <p className="stat-value">{data?.users?.workplace_supervisors || 0}</p>
          </div>
        </div>
      </section>
 
      <section className="overview-section">
        <h2>Placements</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <Briefcase size={32} />
            <h3>Total Placements</h3>
            <p className="stat-value">{data?.placements?.total || 0}</p>
          </div>
          <div className="stat-card active">
            <Clock size={32} />
            <h3>Active</h3>
            <p className="stat-value">{data?.placements?.active || 0}</p>
          </div>
          <div className="stat-card pending">
            <AlertTriangle size={32} />
            <h3>Pending</h3>
            <p className="stat-value">{data?.placements?.pending || 0}</p>
          </div>
          <div className="stat-card completed">
            <CheckCircle size={32} />
            <h3>Completed</h3>
            <p className="stat-value">{data?.placements?.completed || 0}</p>
          </div>
          <div className="stat-card cancelled">
            <AlertTriangle size={32} />
            <h3>Cancelled</h3>
            <p className="stat-value">{data?.placements?.cancelled || 0}</p>
          </div>
          <div className="stat-card">
            <UserCheck size={32} />
            <h3>Students Without Placement</h3>
            <p className="stat-value">{data?.placements?.students_without_placement || 0}</p>
          </div>
        </div>
      </section>
 
      <section className="overview-section">
        <h2>Weekly Logs</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <FileText size={32} />
            <h3>Total Logs</h3>
            <p className="stat-value">{data?.logs?.total || 0}</p>
          </div>
          <div className="stat-card pending">
            <Clock size={32} />
            <h3>Submitted</h3>
            <p className="stat-value">{data?.logs?.submitted || 0}</p>
          </div>
          <div className="stat-card completed">
            <CheckCircle size={32} />
            <h3>Approved</h3>
            <p className="stat-value">{data?.logs?.approved || 0}</p>
          </div>
          <div className="stat-card cancelled">
            <AlertTriangle size={32} />
            <h3>Rejected</h3>
            <p className="stat-value">{data?.logs?.rejected || 0}</p>
          </div>
          <div className="stat-card">
            <Activity size={32} />
            <h3>Approval Rate</h3>
            <p className="stat-value">{data?.logs?.approval_rate || 0}%</p>
          </div>
        </div>
      </section>
 
      <section className="overview-section">
        <h2>Evaluations</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <Building2 size={32} />
            <h3>Total Evaluations</h3>
            <p className="stat-value">{data?.evaluations || 0}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
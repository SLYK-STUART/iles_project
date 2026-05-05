import { useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
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

  if (loading) return <p className="loading">Loading overview...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="overview-container">
 
      <div className="overview-header">
        <div>
          <h1>System Overview</h1>
          <p>Complete system analytics and breakdown</p>
        </div>

        <button className="back-btn" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>
 
      <section className="overview-section">
        <h2>Users</h2>

        <div className="grid">

          <div className="card">
            <Users />
            <h3>Total Users</h3>
            <p>{data.users.total}</p>
          </div>

          <div className="card">
            <UserCheck />
            <h3>Students</h3>
            <p>{data.users.students}</p>
          </div>

          <div className="card">
            <Activity />
            <h3>Academic Sup.</h3>
            <p>{data.users.academic_supervisors}</p>
          </div>

          <div className="card">
            <Activity />
            <h3>Workplace Sup.</h3>
            <p>{data.users.workplace_supervisors}</p>
          </div>

        </div>
      </section>
 
      <section className="overview-section">
        <h2>Placements</h2>

        <div className="grid">

          <div className="card">
            <Briefcase />
            <h3>Total</h3>
            <p>{data.placements.total}</p>
          </div>

          <div className="card blue">
            <Clock />
            <h3>Active</h3>
            <p>{data.placements.active}</p>
          </div>

          <div className="card yellow">
            <AlertTriangle />
            <h3>Pending</h3>
            <p>{data.placements.pending}</p>
          </div>

          <div className="card green">
            <CheckCircle />
            <h3>Completed</h3>
            <p>{data.placements.completed}</p>
          </div>

          <div className="card red">
            <AlertTriangle />
            <h3>Cancelled</h3>
            <p>{data.placements.cancelled}</p>
          </div>

          <div className="card">
            <UserCheck />
            <h3>No Placement</h3>
            <p>{data.placements.students_without_placement}</p>
          </div>

        </div>
      </section>
 
      <section className="overview-section">
        <h2>Logs</h2>

        <div className="grid">

          <div className="card">
            <FileText />
            <h3>Total Logs</h3>
            <p>{data.logs.total}</p>
          </div>

          <div className="card yellow">
            <Clock />
            <h3>Submitted</h3>
            <p>{data.logs.submitted}</p>
          </div>

          <div className="card green">
            <CheckCircle />
            <h3>Approved</h3>
            <p>{data.logs.approved}</p>
          </div>

          <div className="card red">
            <AlertTriangle />
            <h3>Rejected</h3>
            <p>{data.logs.rejected}</p>
          </div>

          <div className="card">
            <Activity />
            <h3>Approval Rate</h3>
            <p>{data.logs.approval_rate}%</p>
          </div>

        </div>
      </section>
 
      <section className="overview-section">
        <h2>Evaluations</h2>

        <div className="grid">

          <div className="card">
            <Building2 />
            <h3>Total Evaluations</h3>
            <p>{data.evaluations}</p>
          </div>

        </div>
      </section>

    </div>
  );
}
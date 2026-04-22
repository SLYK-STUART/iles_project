import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

import "./StudentDashboard.css";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("accounts/student/dashboard/")
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;

  const progress = data?.progress || {};

  const chartData = [
    { name: "Approved", value: progress.approved || 0 },
    { name: "Rejected", value: progress.rejected || 0 },
    { name: "Submitted", value: progress.submitted || 0 },
    { name: "Pending", value: progress.pending || 0},
  ];

  return (
    <div className="dashboard">

      {/* Sidebar */}
      <div className="sidebar">
        <h2>Student</h2>
        <ul>
          <li>Dashboard</li>
          <li onClick={() => navigate("/logbook")}>Logbook</li>
          <li>Reports</li>
          <li>Profile</li>
        </ul>
      </div>

      {/* Main */}
      <div className="main">

        <h1>Welcome, {data.name}</h1>

        {/* ================= CARDS ================= */}
        <div className="cards">
          <div className="card">
            <h3>Total Logs</h3>
            <p>{progress.submitted}</p>
          </div>

          <div className="card">
            <h3>Approved</h3>
            <p>{progress.approved}</p>
          </div>

          <div className="card">
            <h3>Rejected</h3>
            <p>{progress.rejected}</p>
          </div>
        </div>

        {/* ================= PLACEMENT INFO ================= */}
        <div className="profile_section">
          <div className="profile-card">
            <h2>Student Profile</h2>
            <p><strong>Name:</strong> {data.student_profile.name}</p>
            <p><strong>Email:</strong> {data.student_profile.email}</p>
            <p><strong>Phone:</strong> {data.student_profile.phone}</p>
          </div>
          <div className="placement-card">
            <h2>Internship Details</h2> 
            <p><strong>Company:</strong> {data.placement.company}</p>
            <p><strong>Start:</strong> {data.placement.start_date}</p>
            <p><strong>End:</strong> {data.placement.end_date}</p>
            <p><strong>Academic Supervisor:</strong> {data.placement.academic_supervisor}</p>
            <p><strong>Workplace Supervisor:</strong> {data.placement.workplace_supervisor}</p>
          </div>
        </div>

        {/* ================= PROGRESS CHART ================= */}
        <div className="chart-section">
          <h2>Progress Overview</h2>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ================= ACTIVITY ================= */}
        <div className="activity">
          <h2>Recent Activity</h2>
           
           {data.recent_activity.length === 0 ? (
            <p>No recent activity</p>
           ) : (
            <ul>
              {data.recent_activity.map((item, index) => (
                <li key={index}>
                  {item.message}
                  <br />
                  <small>
                    {new Date(item.date).toLocaleString()}
                  </small>
                </li>
              ))}
            </ul>
           )}
        </div>

      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import "./AdminPlacements.css";

export default function AdminPlacements() {
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const fetchPlacements = async () => {
    try {
      const res = await API.get("admin/placements/");
      setPlacements(res.data.placements || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load placements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlacements();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await API.patch(`admin/placements/${id}/`, { status });
      fetchPlacements();
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  const deletePlacement = async (id) => {
    if (!window.confirm("Are you sure you want to delete this placement?")) return;

    try {
      await API.delete(`admin/placements/${id}/`);
      fetchPlacements();
    } catch (err) {
      console.error(err);
      alert("Failed to delete placement");
    }
  };

  if (loading) return <p className="loading">Loading placements...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="admin-placements-container">
      {/* Header */}
      <div className="admin-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="header-title">
          <h1>Internship Placements</h1>
          <p>Manage all student internship assignments</p>
        </div>

        <button 
          className="add-btn"
          onClick={() => navigate("/admin/placement-create")}
        >
          <Plus size={20} />
          New Placement
        </button>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="placements-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Company</th>
              <th>Workplace Supervisor</th>
              <th>Academic Supervisor</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {placements.map((p) => (
              <tr key={p.id}>
                <td className="student-name">{p.student_name}</td>
                <td>{p.company_name}</td>
                <td>{p.workplace_supervisor_name || "—"}</td>
                <td>{p.academic_supervisor_name || "—"}</td>
                <td>{p.start_date}</td>
                <td>{p.end_date}</td>

                <td>
                  <select
                    value={p.status}
                    onChange={(e) => updateStatus(p.id, e.target.value)}
                    className={`status-select ${p.status.toLowerCase()}`}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="ACTIVE">Active</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </td>

                <td>
                  <button 
                    className="delete-btn"
                    onClick={() => deletePlacement(p.id)}
                    title="Delete Placement"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {placements.length === 0 && (
          <div className="empty-state">
            No internship placements found
          </div>
        )}
      </div>
    </div>
  );
}
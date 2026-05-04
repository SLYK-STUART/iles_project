import { useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
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
      await API.patch(`admin/placements/${id}/`, {
        status: status,
      });

      fetchPlacements();
    } catch (err) {
        console.error(err);
      alert("Failed to update status");
    }
  };

  if (loading) return <p className="loading">Loading placements...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="placements-container">

      {/* HEADER */}
      <div className="placements-header">
        <h1>Internship Placements</h1>

        <button
          className="add-btn"
          onClick={() => navigate("/admin/placement-create")}
        >
          <Plus size={18} />
          Add Placement
        </button>
      </div>

      {/* TABLE */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Company</th>
              <th>WP Supervisor</th>
              <th>AC Supervisor</th>
              <th>Start</th>
              <th>End</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {placements.map((p) => (
              <tr key={p.id}>

                <td>{p.student_name}</td>
                <td>{p.company_name}</td>
                <td>{p.workplace_supervisor_name}</td>
                <td>{p.academic_supervisor_name}</td>
                <td>{p.start_date}</td>
                <td>{p.end_date}</td>

                <td>
                  <select
                    value={p.status}
                    onChange={(e) => updateStatus(p.id, e.target.value)}
                    className={`status ${p.status.toLowerCase()}`}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="ACTIVE">Active</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </td>

              </tr>
            ))}
          </tbody>
        </table>

        {placements.length === 0 && (
          <p className="empty">No placements found</p>
        )}
      </div>

    </div>
  );
}
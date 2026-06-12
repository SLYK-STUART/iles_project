import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Search,
  RefreshCw,
  Briefcase,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

import "./AdminPlacements.css";

export default function AdminPlacements() {
  const navigate = useNavigate();

  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchPlacements = async () => {
    try {
      setLoading(true);
      setError(null);

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
    if (
      !window.confirm(
        "Are you sure you want to delete this placement?"
      )
    )
      return;

    try {
      await API.delete(`admin/placements/${id}/`);
      fetchPlacements();
    } catch (err) {
      console.error(err);
      alert("Failed to delete placement");
    }
  };

  const filteredPlacements = useMemo(() => {
    return placements.filter((p) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        p.student_name?.toLowerCase().includes(search) ||
        p.company_name?.toLowerCase().includes(search) ||
        p.workplace_supervisor_name?.toLowerCase().includes(search) ||
        p.academic_supervisor_name?.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "ALL" || p.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [placements, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: placements.length,
      active: placements.filter((p) => p.status === "ACTIVE").length,
      pending: placements.filter((p) => p.status === "PENDING").length,
      completed: placements.filter((p) => p.status === "COMPLETED").length,
      cancelled: placements.filter((p) => p.status === "CANCELLED").length,
    };
  }, [placements]);

  if (loading) {
    return (
      <div className="ap-loading">
        <div className="ap-spinner" />
        <p>Loading placements...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ap-error-container">
        <p className="ap-error">{error}</p>
        <button className="ap-btn" onClick={fetchPlacements}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="admin-placements">
      {/* ================= TOPBAR ================= */}

      <header className="ap-topbar">
        <div className="ap-topbar-left">
          <span className="ap-logo-mark">AP</span>
          <h1>Placement Management</h1>
        </div>

        <div className="ap-topbar-right">
          <button
            className="ap-btn ap-btn-ghost"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <button
            className="ap-btn ap-btn-primary"
            onClick={() => navigate("/admin/placement-create")}
          >
            <Plus size={16} />
            New Placement
          </button>
        </div>
      </header>

      {/* ================= MAIN ================= */}

      <main className="ap-main">

        {/* Welcome */}

        <div className="ap-welcome">
          <h2>Internship Placements</h2>
          <p className="ap-subtitle">
            Manage student placements, supervisors and internship status.
          </p>
        </div>

        {/* Stats */}

        <section className="ap-section">
          <div className="ap-stats-grid">

            <div className="ap-stat-card">
              <span className="ap-stat-label">Total</span>
              <span className="ap-stat-num">{stats.total}</span>
            </div>

            <div className="ap-stat-card active">
              <Clock size={18} />
              <span className="ap-stat-label">Active</span>
              <span className="ap-stat-num">{stats.active}</span>
            </div>

            <div className="ap-stat-card pending">
              <AlertTriangle size={18} />
              <span className="ap-stat-label">Pending</span>
              <span className="ap-stat-num">{stats.pending}</span>
            </div>

            <div className="ap-stat-card completed">
              <CheckCircle size={18} />
              <span className="ap-stat-label">Completed</span>
              <span className="ap-stat-num">{stats.completed}</span>
            </div>

            <div className="ap-stat-card cancelled">
              <AlertTriangle size={18} />
              <span className="ap-stat-label">Cancelled</span>
              <span className="ap-stat-num">{stats.cancelled}</span>
            </div>

          </div>
        </section>

        {/* Filters */}

        <section className="ap-section">
          <h3 className="ap-section-title">
            Search & Filter
          </h3>

          <div className="ap-filter-bar">

            <div className="ap-search-box">
              <Search size={18} />

              <input
                type="text"
                placeholder="Search student, company or supervisor..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
              />
            </div>

            <select
              className="ap-status-filter"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <button
              className="ap-btn"
              onClick={fetchPlacements}
            >
              <RefreshCw size={16} />
            </button>

          </div>
        </section>

        {/* Placements */}

        <section className="ap-section">
          <h3 className="ap-section-title">
            Placement Records
          </h3>

          {filteredPlacements.length > 0 ? (
            <div className="ap-placement-grid">

              {filteredPlacements.map((placement) => (
                <div
                  key={placement.id}
                  className="ap-placement-card"
                >
                  <div className="ap-placement-header">
                    <div>
                      <h4>{placement.student_name}</h4>
                      <p>{placement.company_name}</p>
                    </div>

                    <Briefcase size={20} />
                  </div>

                  <div className="ap-placement-details">

                    <div className="ap-detail-row">
                      <span>Workplace Supervisor</span>
                      <strong>
                        {placement.workplace_supervisor_name || "—"}
                      </strong>
                    </div>

                    <div className="ap-detail-row">
                      <span>Academic Supervisor</span>
                      <strong>
                        {placement.academic_supervisor_name || "—"}
                      </strong>
                    </div>

                    <div className="ap-detail-row">
                      <span>Start Date</span>
                      <strong>{placement.start_date}</strong>
                    </div>

                    <div className="ap-detail-row">
                      <span>End Date</span>
                      <strong>{placement.end_date}</strong>
                    </div>

                  </div>

                  <div className="ap-placement-footer">

                    <select
                      value={placement.status}
                      className={`ap-status-select ${placement.status.toLowerCase()}`}
                      onChange={(e) =>
                        updateStatus(
                          placement.id,
                          e.target.value
                        )
                      }
                    >
                      <option value="PENDING">
                        Pending
                      </option>
                      <option value="ACTIVE">
                        Active
                      </option>
                      <option value="COMPLETED">
                        Completed
                      </option>
                      <option value="CANCELLED">
                        Cancelled
                      </option>
                    </select>

                    <button
                      className="ap-btn ap-btn-danger"
                      onClick={() =>
                        deletePlacement(placement.id)
                      }
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>

                  </div>
                </div>
              ))}

            </div>
          ) : (
            <div className="ap-empty-state">
              <div className="ap-empty-icon">📁</div>

              <p className="ap-empty-title">
                No placements found
              </p>

              <p className="ap-empty-sub">
                Try adjusting your filters or create a new
                internship placement.
              </p>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
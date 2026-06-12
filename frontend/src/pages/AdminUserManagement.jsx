import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import {
  ArrowLeft,
  Plus,
  Search,
  RefreshCw,
  Users,
  GraduationCap,
  Briefcase,
  Shield,
  UserCheck,
} from "lucide-react";

import "./AdminUserManagement.css";

export default function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [showAddMenu, setShowAddMenu] = useState(false);

  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await API.get("accounts/admin/users/");
      setUsers(res.data.users || []);
    } catch (err) {
      console.error(err);
      setError(
        "Failed to load users. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleActive = async (userId, currentStatus) => {
    try {
      await API.patch(`accounts/admin/users/${userId}/`, {
        is_active: !currentStatus,
      });

      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to update user status");
    }
  };

  const deleteUser = async (userId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      await API.delete(`accounts/admin/users/${userId}/`);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to delete user");
    }
  };

  const filteredUsers = users.filter((user) => {
    const fullName =
      `${user.first_name || ""} ${user.last_name || ""}`.toLowerCase();

    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      roleFilter === "ALL" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const stats = useMemo(() => {
    return {
      total: users.length,
      students: users.filter((u) => u.role === "STUDENT").length,
      acSup: users.filter((u) => u.role === "AC_SUP").length,
      wpSup: users.filter((u) => u.role === "WP_SUP").length,
      admins: users.filter((u) => u.role === "ADMIN").length,
    };
  }, [users]);

  const formatRole = (role) => {
    switch (role) {
      case "STUDENT":
        return "Student";
      case "AC_SUP":
        return "Academic Supervisor";
      case "WP_SUP":
        return "Workplace Supervisor";
      case "ADMIN":
        return "Administrator";
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <div className="aum-loading">
        <div className="aum-spinner" />
        <p>Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="aum-error-container">
        <p className="aum-error">{error}</p>
        <button className="aum-btn" onClick={fetchUsers}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="admin-user-management">
      {/* ================= TOPBAR ================= */}

      <header className="aum-topbar">
        <div className="aum-topbar-left">
          <span className="aum-logo-mark">UM</span>
          <h1>User Management</h1>
        </div>

        <div className="aum-topbar-right">
          <button
            className="aum-btn aum-btn-ghost"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <div className="aum-add-wrapper">
            <button
              className="aum-btn aum-btn-primary"
              onClick={() => setShowAddMenu(!showAddMenu)}
            >
              <Plus size={16} />
              Add User
            </button>

            {showAddMenu && (
              <div className="aum-add-menu">
                <button
                  onClick={() => navigate("/admin/create-student")}
                >
                  Create Student
                </button>

                <button
                  onClick={() => navigate("/admin/create-supervisor")}
                >
                  Create Supervisor
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ================= MAIN ================= */}

      <main className="aum-main">
        {/* ================= WELCOME ================= */}

        <section className="aum-welcome">
          <h2>Manage system users</h2>
          <p className="aum-subtitle">
            Create, activate, deactivate and manage users across the platform.
          </p>
        </section>

        {/* ================= STATS ================= */}

        <section className="aum-section">
          <h3 className="aum-section-title">User Overview</h3>

          <div className="aum-stats-grid">
            <div className="aum-stat-card">
              <Users size={20} />
              <span className="aum-stat-label">Total Users</span>
              <span className="aum-stat-num">{stats.total}</span>
            </div>

            <div className="aum-stat-card">
              <GraduationCap size={20} />
              <span className="aum-stat-label">Students</span>
              <span className="aum-stat-num">{stats.students}</span>
            </div>

            <div className="aum-stat-card">
              <UserCheck size={20} />
              <span className="aum-stat-label">Academic Supervisors</span>
              <span className="aum-stat-num">{stats.acSup}</span>
            </div>

            <div className="aum-stat-card">
              <Briefcase size={20} />
              <span className="aum-stat-label">Workplace Supervisors</span>
              <span className="aum-stat-num">{stats.wpSup}</span>
            </div>

            <div className="aum-stat-card">
              <Shield size={20} />
              <span className="aum-stat-label">Administrators</span>
              <span className="aum-stat-num">{stats.admins}</span>
            </div>
          </div>
        </section>

        {/* ================= FILTERS ================= */}

        <section className="aum-section">
          <h3 className="aum-section-title">Search & Filters</h3>

          <div className="aum-filter-bar">
            <div className="aum-search-box">
              <Search size={18} />

              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="aum-role-filter"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="ALL">All Roles</option>
              <option value="STUDENT">Student</option>
              <option value="WP_SUP">Workplace Supervisor</option>
              <option value="AC_SUP">Academic Supervisor</option>
              <option value="ADMIN">Administrator</option>
            </select>

            <button
              className="aum-btn aum-btn-ghost"
              onClick={fetchUsers}
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </section>

        {/* ================= USERS ================= */}

        <section className="aum-section">
          <h3 className="aum-section-title">
            Users ({filteredUsers.length})
          </h3>

          {filteredUsers.length > 0 ? (
            <div className="aum-users-grid">
              {filteredUsers.map((user) => (
                <div key={user.id} className="aum-user-card">
                  <div className="aum-user-header">
                    <div>
                      <h4>
                        {user.first_name} {user.last_name}
                      </h4>

                      <p>{user.email}</p>
                    </div>

                    <span
                      className={`aum-status-badge ${
                        user.is_active
                          ? "active"
                          : "inactive"
                      }`}
                    >
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="aum-user-meta">
                    <div className="aum-meta-row">
                      <span>Role</span>

                      <span
                        className={`aum-role-badge ${user.role.toLowerCase()}`}
                      >
                        {formatRole(user.role)}
                      </span>
                    </div>

                    <div className="aum-meta-row">
                      <span>Joined</span>
                      <span>
                        {new Date(
                          user.date_joined
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="aum-user-actions">
                    <button
                      className="aum-btn aum-btn-ghost"
                      onClick={() =>
                        toggleActive(
                          user.id,
                          user.is_active
                        )
                      }
                    >
                      {user.is_active
                        ? "Deactivate"
                        : "Activate"}
                    </button>

                    <button
                      className="aum-btn aum-btn-danger"
                      onClick={() => deleteUser(user.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="aum-empty-state">
              <div className="aum-empty-icon">👥</div>

              <p className="aum-empty-title">
                No users found
              </p>

              <p className="aum-empty-sub">
                Try adjusting your search or role filter.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
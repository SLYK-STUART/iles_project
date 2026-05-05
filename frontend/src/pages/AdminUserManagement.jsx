import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { ArrowLeft, Plus, Search } from "lucide-react";
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
      const res = await API.get("accounts/admin/users/");
      setUsers(res.data.users || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load users");
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
        is_active: !currentStatus
      });
      fetchUsers();
    } catch (err) {
      alert("Failed to update user status");
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

    try {
      await API.delete(`accounts/admin/users/${userId}/`);
      fetchUsers();
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  const filteredUsers = users.filter(user => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) return <p className="loading">Loading users...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="header-title">
          <h1>User Management</h1>
          <p>Manage all system users and their roles</p>
        </div>
 
        <div className="add-user-wrapper">
          <button 
            className="add-user-btn" 
            onClick={() => setShowAddMenu(!showAddMenu)}
          >
            <Plus size={20} />
            Add User
          </button>

          {showAddMenu && (
            <div className="add-menu">
              <div onClick={() => navigate("/admin/create-student")}>
                Create Student
              </div>
              <div onClick={() => navigate("/admin/create-supervisor")}>
                Create Supervisor
              </div>
            </div>
          )}
        </div>
      </div>
 
      <div className="filters-bar">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select 
          className="role-filter"
          value={roleFilter} 
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="ALL">All Roles</option>
          <option value="STUDENT">Student</option>
          <option value="WP_SUP">Workplace Supervisor</option>
          <option value="AC_SUP">Academic Supervisor</option>
          <option value="ADMIN">Administrator</option>
        </select>
      </div>
 
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td>
                  <div className="user-name">
                    {user.first_name} {user.last_name}
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge ${user.role.toLowerCase()}`}>
                    {user.role.replace('_', ' ')}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>{new Date(user.date_joined).toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="toggle-btn"
                      onClick={() => toggleActive(user.id, user.is_active)}
                    >
                      {user.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => deleteUser(user.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="no-results">
            No users found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}
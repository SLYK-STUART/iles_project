import { useEffect, useState } from "react";
import API from "../api/axios";
import "./AdminUserManagement.css";

export default function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

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

  const updateUser = async (userId, updatedData) => {
    try {
      await API.patch(`accounts/admin/users/${userId}/`, updatedData);
      fetchUsers(); // Refresh the list
      alert("User updated successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to update user");
    }
  };

  const handleRoleChange = (userId, newRole) => {
    updateUser(userId, { role: newRole });
  };

  const handleActiveToggle = (userId, currentStatus) => {
    updateUser(userId, { is_active: !currentStatus });
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.first_name + " " + user.last_name).toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "ALL" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  if (loading) return <p className="loading">Loading users...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="admin-container">
      <h1 className="admin-title">User Management</h1>
      <p className="welcome-text">Manage all system users and their roles</p>

      {/* Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <select 
          value={roleFilter} 
          onChange={(e) => setRoleFilter(e.target.value)}
          className="role-filter"
        >
          <option value="ALL">All Roles</option>
          <option value="STUDENT">Student</option>
          <option value="WP_SUP">Workplace Supervisor</option>
          <option value="AC_SUP">Academic Supervisor</option>
          <option value="ADMIN">Administrator</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Date Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>
                  {user.first_name} {user.last_name}
                </td>
                <td>{user.email}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="role-select"
                  >
                    <option value="STUDENT">Student</option>
                    <option value="WP_SUP">WP Supervisor</option>
                    <option value="AC_SUP">AC Supervisor</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </td>
                <td>
                  <button
                    className={`status-btn ${user.is_active ? 'active' : 'inactive'}`}
                    onClick={() => handleActiveToggle(user.id, user.is_active)}
                  >
                    {user.is_active ? "Active" : "Inactive"}
                  </button>
                </td>
                <td>{user.date_joined}</td>
                <td>
                  <button className="edit-btn">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredUsers.length === 0 && (
        <p className="no-results">No users found matching your criteria.</p>
      )}
    </div>
  );
}
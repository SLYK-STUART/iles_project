import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("access_token");
    const safeRole = role?.trim()?.toUpperCase();

    const safeAllowedRoles = allowedRoles.map(r => r.toUpperCase());

    if (!token) return <Navigate to="/" />;
    if (!safeAllowedRoles.includes(safeRole)) {
        return <Navigate to="/" />
    }

    return children;
}

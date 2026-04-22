import { Routes, Route } from "react-router-dom";

import StudentDashboard from "./pages/StudentDashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import Login from "./pages/Login";
import Logbook from "./pages/Logbook";

import WorkplaceDashboard from "./pages/WorkplaceDashboard";
import AcademicDashboard from "./pages/AcademicDashboard";
import AdminDashboard from "./pages/AdminDashboard";

// Import the new WP Evaluation Form
import WP_EvaluationPage from "./pages/WP_EvaluationPage";   // ← Change this if your file name is different
import EvaluationForm from "./pages/EvaluationForm";         // This is for AC_SUP
import AdminUserManagement from "./pages/AdminUserManagement";

function App() {
  return (
    <Routes>

      {/* LOGIN */}
      <Route path="/" element={<Login />} />

      {/* LOGBOOK */}
      <Route
        path="/logbook"
        element={
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <Logbook />
          </ProtectedRoute>
        }
      />

      {/* STUDENT */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      {/* WORKPLACE SUPERVISOR */}
      <Route
        path="/wp-supervisor"
        element={
          <ProtectedRoute allowedRoles={["WP_SUP"]}>
            <WorkplaceDashboard />
          </ProtectedRoute>
        }
      />

      {/* ACADEMIC SUPERVISOR */}
      <Route
        path="/ac-supervisor"
        element={
          <ProtectedRoute allowedRoles={["AC_SUP"]}>
            <AcademicDashboard />
          </ProtectedRoute>
        }
      />

      {/* ADMIN */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* ===================== */}
      {/* EVALUATION ROUTES */}
      {/* ===================== */}

      {/* AC_SUP Evaluation */}
      <Route
        path="/ac-supervisor/evaluate/:placementId"
        element={
          <ProtectedRoute allowedRoles={["AC_SUP"]}>
            <EvaluationForm />
          </ProtectedRoute>
        }
      />

      {/* WP_SUP Evaluation - NEW */}
      <Route
        path="/wp-supervisor/evaluate/:placementId"
        element={
          <ProtectedRoute allowedRoles={["WP_SUP"]}>
            <WP_EvaluationPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminUserManagement />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Login />} />

    </Routes>
  );
}

export default App;
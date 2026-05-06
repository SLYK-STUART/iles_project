import { Routes, Route, Router } from "react-router-dom";

import StudentDashboard from "./pages/StudentDashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import Login from "./pages/Login";
import Logbook from "./pages/Logbook";

import WorkplaceDashboard from "./pages/WorkplaceDashboard";
import AcademicDashboard from "./pages/AcademicDashboard";
import AdminDashboard from "./pages/AdminDashboard";
 
import WP_EvaluationPage from "./pages/WP_EvaluationPage";    
import EvaluationForm from "./pages/EvaluationForm";         
import AdminUserManagement from "./pages/AdminUserManagement";
import WP_LogReviewPage from "./pages/WP-LogReviewPage";
import StudentReviews from "./pages/StudentReviews";
import AdminCreateStudent from "./pages/AdminCreateStudent";
import ChangePassword from "./pages/ChangePassword";
import AdminCreateSupervisor from "./pages/AdminCreateSupervisor";
import AdminPlacementCreate from "./pages/AdminPlacementCreate";
import SystemOverview from "./pages/SystemOverview";
import AdminPlacements from "./pages/AdminPlacements";

import "react-datepicker/dist/react-datepicker.css"

function App() {
  return (
    <Routes>

      <Route path="/" element={<Login />} />

      <Route
        path="/logbook"
        element={
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <Logbook />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/wp-supervisor"
        element={
          <ProtectedRoute allowedRoles={["WP_SUP"]}>
            <WorkplaceDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/ac-supervisor"
        element={
          <ProtectedRoute allowedRoles={["AC_SUP"]}>
            <AcademicDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/ac-supervisor/evaluate/:placementId"
        element={
          <ProtectedRoute allowedRoles={["AC_SUP"]}>
            <EvaluationForm />
          </ProtectedRoute>
        }
      />

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

      <Route
        path="wp-supervisor/log/:logId"
        element={
          <ProtectedRoute allowedRoles={["WP_SUP"]}>
            <WP_LogReviewPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/reviews"
        element={
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <StudentReviews />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/create-Student"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminCreateStudent />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/create-supervisor"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminCreateSupervisor />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/placement-create"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminPlacementCreate />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/overview"
        element={
          <ProtectedRoute allowedRoles={[]}>
            <SystemOverview />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/placements"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminPlacements />
          </ProtectedRoute>
        }
      />

      <Route
        path="/change-password"
        element={<ChangePassword />}
      />

      <Route path="*" element={<Login />} />

    </Routes>
  );
}

export default App;
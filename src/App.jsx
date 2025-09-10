import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Header from "./common/components/Header";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import Footer from "./common/components/Footer";

// CLIENT PAGES
import ClientDashboard from "./Client/ClientDashboard";
import ClientAppointment from "./Client/ClientAppointments";
import ClientProfile from "./Client/ClientProfile";
import ClientBookAppointment from "./Client/ClientBookAppointment";

// RECEPTIONIST PAGES
import ReceptionistDashboard from "./Receptionist/ReceptionistDashboard";

// INVENTORY CONTROLLER PAGES
import InventoryControllerDashboard from "./InventoryController/InventoryDashboard";

// BRANCH MANAGER PAGES
import BranchManagerDashboard from "./BranchManager/BranchManagerDashboard";

// BRANCH ADMIN PAGES
import BranchAdminDashboard from "./BranchAdmin/BranchAdminDashboard";

// OPERATIONAL MANAGER PAGES
import OperationalManagerDashboard from "./OperationalManager/OperationalDashboard";

// SYSTEM ADMIN PAGES
import SuperAdminDashboard from "./SystemAdmin/SuperAdminDashboard";
// Inventory Controller PAGES
import InventoryDashboard from "./InventoryController/InventoryDashboard";
// Stylist PAGES
import StylistDashboard from "./Stylist/StylistDashboard";

function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg font-medium">Loading...</p>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <main className="flex-1">
              <LoginForm />
            </main>
            <Footer />
          </div>
        }
      />
      <Route
        path="/register"
        element={
          <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <main className="flex-1">
              <RegisterForm />
            </main>
            <Footer />
          </div>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <main className="flex-1">
              <ForgotPassword />
            </main>
            <Footer />
          </div>
        }
      />
      <Route
        path="/reset-password"
        element={
          <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <main className="flex-1">
              <ResetPassword />
            </main>
            <Footer />
          </div>
        }
      />

      {/* Protected Client Routes */}
      <Route
        path="/client-dashboard"
        element={
          <ProtectedRoute requiredRole="client">
            <ClientDashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/client-appointments"
        element={
          <ProtectedRoute requiredRole="client">
            <ClientAppointment />
          </ProtectedRoute>
        }
      />
      {/* Book Appointment as Child Route */}
      <Route
        path="/client-appointments/book"
        element={
          <ProtectedRoute requiredRole="client">
            <ClientBookAppointment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client-profile"
        element={
          <ProtectedRoute requiredRole="client">
            <ClientProfile />
          </ProtectedRoute>
        }
      />
      
      {/* Protected Receptionist Routes */}
      <Route
        path="/receptionist-dashboard"
        element={
          <ProtectedRoute requiredRole="receptionist">
            <ReceptionistDashboard/>
          </ProtectedRoute>
        }
      />

      {/* Protected Inventory Controller Routes */}
      <Route
        path="/inventory-dashboard"
        element={
          <ProtectedRoute requiredRole="inventory controller">
            <InventoryDashboard/>
          </ProtectedRoute>
        }
      />

      {/* Protected Branch Manager Routes */}
      <Route
        path="/branchmanager-dashboard"
        element={
          <ProtectedRoute requiredRole="branch manager">
            <BranchAdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Protected Branch Admin Routes */}
      <Route
        path="/branchadmin-dashboard"
        element={
          <ProtectedRoute requiredRole="branch admin">
            <BranchAdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Protected Operational Manager Routes */}
      <Route
        path="/operational-dashboard"
        element={
          <ProtectedRoute requiredRole="operational manager">
            <OperationalManagerDashboard />
          </ProtectedRoute>
        }
      />

      {/* Protected Stylist Routes */}
      <Route
        path="/stylist-dashboard"
        element={
          <ProtectedRoute requiredRole="stylist">
            <StylistDashboard />
          </ProtectedRoute>
        }
      />

      {/* Protected System Admin Routes */}
      <Route
        path="/systemadmin-dashboard"
        element={
          <ProtectedRoute requiredRole="system admin">
            <SuperAdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Default Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
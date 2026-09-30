import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

import DashboardPage from "./pages/DashboardPage";
import AgentDashboardPage from "./pages/AgentDashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";

import AdminTicketsPage from "./pages/AdminTicketsPage";
import AdminAgentsPage from "./pages/AdminAgentsPage";

import CreateTicketPage from "./pages/CreateTicketPage";
import MyTicketsPage from "./pages/MyTicketsPage";
import TicketDetailsPage from "./pages/TicketDetailsPage";

import ProtectedRoute from "./components/ProtectedRoute";


function DashboardRouter() {
  const storedUser = localStorage.getItem(
    "supportflow_user"
  );

  if (!storedUser) {
    return <Navigate to="/login" replace />;
  }

  let user;

  try {
    user = JSON.parse(storedUser);
  } catch {
    localStorage.removeItem("supportflow_token");
    localStorage.removeItem("supportflow_user");

    return <Navigate to="/login" replace />;
  }

  if (user.role === "Admin") {
    return <AdminDashboardPage />;
  }

  if (user.role === "Agent") {
    return <AgentDashboardPage />;
  }

  return <DashboardPage />;
}


function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC */}

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/register"
          element={<RegisterPage />}
        />


        {/* DASHBOARD */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute
              allowedRoles={[
                "Customer",
                "Agent",
                "Admin",
              ]}
            >
              <DashboardRouter />
            </ProtectedRoute>
          }
        />


        {/* CUSTOMER */}

        <Route
          path="/tickets"
          element={
            <ProtectedRoute
              allowedRoles={["Customer"]}
            >
              <MyTicketsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tickets/create"
          element={
            <ProtectedRoute
              allowedRoles={["Customer"]}
            >
              <CreateTicketPage />
            </ProtectedRoute>
          }
        />


        {/* ADMIN */}

        <Route
          path="/admin/tickets"
          element={
            <ProtectedRoute
              allowedRoles={["Admin"]}
            >
              <AdminTicketsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/agents"
          element={
            <ProtectedRoute
              allowedRoles={["Admin"]}
            >
              <AdminAgentsPage />
            </ProtectedRoute>
          }
        />


        {/* TICKET DETAILS */}

        <Route
          path="/tickets/:id"
          element={
            <ProtectedRoute
              allowedRoles={[
                "Customer",
                "Agent",
                "Admin",
              ]}
            >
              <TicketDetailsPage />
            </ProtectedRoute>
          }
        />


        {/* DEFAULT */}

        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
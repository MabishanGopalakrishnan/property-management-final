// src/App.jsx
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";

/* Landlord pages */
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Properties from "./pages/Properties.jsx";
import Units from "./pages/Units.jsx";
import Payments from "./pages/Payments.jsx";
import Maintenance from "./pages/Maintenance.jsx";
import Leases from "./pages/Leases.jsx";
import Tenants from "./pages/Tenants.jsx";
import NotFound from "./pages/NotFound.jsx";

/* Tenant pages */
import TenantHome from "./pages/tenant/TenantHome.jsx";
import TenantLease from "./pages/tenant/TenantLease.jsx";
import TenantMaintenance from "./pages/tenant/TenantMaintenance.jsx";
import TenantPayments from "./pages/tenant/TenantPayments.jsx";
import TenantProperties from "./pages/tenant/TenantProperties.jsx";

/* Layouts */
import LandlordLayout from "./layouts/LandlordLayout.jsx";
import TenantLayout from "./layouts/TenantLayout.jsx";

/* LANDLORD PROTECTED ROUTE */
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="center-page">
        <div className="loader" />
        <p>Checking session...</p>
      </div>
    );
  }

  if (!user || user.role !== "LANDLORD") {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/* TENANT PROTECTED ROUTE */
function TenantRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="center-page">
        <div className="loader" />
        <p>Loading...</p>
      </div>
    );
  }

  if (!user || user.role !== "TENANT") {
    console.log("TenantRoute: No user or not tenant", { user, path: location.pathname });
    return <Navigate to="/login" replace />;
  }

  return children;
}

/* SPECIAL HANDLER FOR STRIPE PAYMENT CALLBACK */
function TenantPaymentsRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Check if this is a Stripe redirect
  const isStripeRedirect = location.search.includes('success=true') && 
                           location.search.includes('payment_id') && 
                           location.search.includes('session_id');

  if (loading) {
    return (
      <div className="center-page">
        <div className="loader" />
        <p>Loading...</p>
      </div>
    );
  }

  // If Stripe redirect, allow access without tenant check
  if (isStripeRedirect) {
    console.log("Allowing Stripe redirect through");
    return (
      <TenantLayout>
        <TenantPayments />
      </TenantLayout>
    );
  }

  // Otherwise, normal tenant check
  if (!user || user.role !== "TENANT") {
    return <Navigate to="/login" replace />;
  }

  return (
    <TenantLayout>
      <TenantPayments />
    </TenantLayout>
  );
}

export default function App() {
  return (
    <Routes>

      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />


      {/* -----------------------------------
            LANDLORD ROUTES WITH LAYOUT
      ----------------------------------- */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <LandlordLayout>
              <Dashboard />
            </LandlordLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/properties"
        element={
          <PrivateRoute>
            <LandlordLayout>
              <Properties />
            </LandlordLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/units"
        element={
          <PrivateRoute>
            <LandlordLayout>
              <Units />
            </LandlordLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/leases"
        element={
          <PrivateRoute>
            <LandlordLayout>
              <Leases />
            </LandlordLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/tenants"
        element={
          <PrivateRoute>
            <LandlordLayout>
              <Tenants />
            </LandlordLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/payments"
        element={
          <PrivateRoute>
            <LandlordLayout>
              <Payments />
            </LandlordLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/maintenance"
        element={
          <PrivateRoute>
            <LandlordLayout>
              <Maintenance />
            </LandlordLayout>
          </PrivateRoute>
        }
      />


      {/* -----------------------------------
                TENANT ROUTES WITH LAYOUT
      ----------------------------------- */}
      <Route
        path="/tenant"
        element={
          <TenantRoute>
            <TenantLayout>
              <TenantHome />
            </TenantLayout>
          </TenantRoute>
        }
      />

      <Route
        path="/tenant/properties"
        element={
          <TenantRoute>
            <TenantLayout>
              <TenantProperties />
            </TenantLayout>
          </TenantRoute>
        }
      />

      <Route
        path="/tenant/leases"
        element={
          <TenantRoute>
            <TenantLayout>
              <TenantLease />
            </TenantLayout>
          </TenantRoute>
        }
      />

      <Route
        path="/tenant/payments"
        element={<TenantPaymentsRoute />}
      />

      <Route
        path="/tenant/maintenance"
        element={
          <TenantRoute>
            <TenantLayout>
              <TenantMaintenance />
            </TenantLayout>
          </TenantRoute>
        }
      />


      {/* Redirects */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFound />} />

    </Routes>
  );
}

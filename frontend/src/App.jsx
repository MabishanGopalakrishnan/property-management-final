import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

// Protected layout
import DashboardLayout from "./layouts/DashboardLayout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Dashboard */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/properties" element={<div>Properties Page</div>} />
          <Route path="/units" element={<div>Units Page</div>} />
          <Route path="/payments" element={<div>Payments Page</div>} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

// src/pages/Dashboard.jsx
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getMe } from "../api/auth";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const { user, setUser } = useAuth();

  useEffect(() => {
    const refresh = async () => {
      try {
        const me = await getMe();
        setUser(me);
      } catch (e) {
        console.error("Failed to refresh /me:", e);
      }
    };
    refresh();
  }, [setUser]);

  if (!user) {
    return (
      <div className="center-page">
        <div className="loader" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <Navbar />

      <main className="page-inner">
        <section>
          <h1 className="page-title">
            Welcome, <span className="highlight">{user.email}</span>
          </h1>
          <p className="muted">
            Role: <strong>{user.role}</strong>
          </p>
        </section>

        <section className="cards-grid">
          <div className="card">
            <h2>Properties</h2>
            <p>
              Manage your portfolio of rental properties, units, and leases in
              one place.
            </p>
          </div>

          <div className="card">
            <h2>Payments</h2>
            <p>
              Track rent payments over time. Integrated with Stripe in the
              backend.
            </p>
          </div>

          <div className="card">
            <h2>Maintenance</h2>
            <p>
              Tenants can submit tickets; landlords can view and update their
              status.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

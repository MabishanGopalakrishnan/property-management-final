// frontend/src/pages/PaymentsAnalytics.jsx
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import {
  getLandlordPaymentSummary,
  getLandlordPaymentChart,
  getLandlordPayments,
} from "../api/payments";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString();
}

function formatCurrency(value) {
  if (value == null) return "-";
  return `$${Number(value).toFixed(2)}`;
}

export default function PaymentsAnalytics() {
  const { user } = useAuth();
  const isManager = user?.role === "LANDLORD";

  const [summary, setSummary] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [propertyFilter, setPropertyFilter] = useState("ALL");

  useEffect(() => {
    if (!isManager) return;

    const load = async () => {
      try {
        setLoading(true);
        const [s, c, p] = await Promise.all([
          getLandlordPaymentSummary(),
          getLandlordPaymentChart(),
          getLandlordPayments(),
        ]);
        setSummary(s);
        setChartData(c);
        setPayments(p);
      } catch (err) {
        console.error("Failed to load analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isManager]);

  if (!isManager) {
    return (
      <div className="page">
        <Navbar />
        <main className="page-inner">
          <h1 className="page-title">Analytics</h1>
          <p className="muted">
            Only property managers can view payment analytics.
          </p>
        </main>
      </div>
    );
  }

  const uniqueProperties = [
    ...new Map(
      payments
        .map((p) => p.lease?.unit?.property)
        .filter(Boolean)
        .map((prop) => [prop.id, prop])
    ).values(),
  ];

  const filteredPayments =
    propertyFilter === "ALL"
      ? payments
      : payments.filter(
          (p) => p.lease?.unit?.property?.id === Number(propertyFilter)
        );

  return (
    <div className="page">
      <Navbar />
      <main className="page-inner">
        <h1 className="page-title">Payment Analytics</h1>
        <p className="muted">
          High-level overview of rent performance across your portfolio.
        </p>

        {/* KPI cards */}
        <section className="cards-grid analytics-kpis">
          <div className="card kpi-card">
            <p className="kpi-label">Total Revenue Collected</p>
            <p className="kpi-value">
              {summary ? formatCurrency(summary.totalRevenue) : "—"}
            </p>
          </div>

          <div className="card kpi-card">
            <p className="kpi-label">Pending Payments</p>
            <p className="kpi-value">
              {summary ? summary.pendingCount : "—"}
            </p>
          </div>

          <div className="card kpi-card">
            <p className="kpi-label">Late Payments</p>
            <p className="kpi-value">{summary ? summary.lateCount : "—"}</p>
          </div>

          <div className="card kpi-card">
            <p className="kpi-label">Active Leases</p>
            <p className="kpi-value">
              {summary ? summary.activeLeases : "—"}
            </p>
          </div>
        </section>

        {/* Chart */}
        <section className="card">
          <div className="section-header">
            <h2>Monthly Revenue</h2>
            <p className="section-subtitle">
              Collected vs expected rent by month.
            </p>
          </div>

          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    border: "1px solid #1e293b",
                    borderRadius: "0.75rem",
                  }}
                  formatter={(value) => formatCurrency(value)}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="collected"
                  name="Collected"
                  stroke="#22c55e"
                  fillOpacity={1}
                  fill="url(#colorCollected)"
                />
                <Area
                  type="monotone"
                  dataKey="expected"
                  name="Expected"
                  stroke="#38bdf8"
                  fillOpacity={1}
                  fill="url(#colorExpected)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Table */}
        <section className="card">
          <div className="section-header">
            <h2>Payment Details</h2>
            <div className="section-actions">
              <select
                className="input"
                value={propertyFilter}
                onChange={(e) => setPropertyFilter(e.target.value)}
              >
                <option value="ALL">All Properties</option>
                {uniqueProperties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} {p.city ? `— ${p.city}` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <p className="muted">Loading...</p>
          ) : filteredPayments.length === 0 ? (
            <p className="muted">No payments found.</p>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Unit</th>
                    <th>Tenant</th>
                    <th>Due</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Paid At</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((p) => {
                    const lease = p.lease;
                    const property = lease?.unit?.property;
                    const unit = lease?.unit;
                    const tenantUser = lease?.tenant?.user;

                    const status =
                      p.computedStatus ||
                      p.status ||
                      (p.paidAt ? "PAID" : "PENDING");

                    return (
                      <tr key={p.id}>
                        <td>
                          {property
                            ? `${property.title || ""} ${
                                property.city ? `— ${property.city}` : ""
                              }`
                            : "-"}
                        </td>
                        <td>{unit ? unit.unitNumber : "-"}</td>
                        <td>
                          {tenantUser
                            ? `${tenantUser.name} (${tenantUser.email})`
                            : "-"}
                        </td>
                        <td>{formatDate(p.dueDate || p.createdAt)}</td>
                        <td>{formatCurrency(p.amount)}</td>
                        <td>{status}</td>
                        <td>{p.paidAt ? formatDate(p.paidAt) : "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

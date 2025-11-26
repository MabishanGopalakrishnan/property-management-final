// src/pages/tenant/TenantMaintenance.jsx
import { useEffect, useState } from "react";
import {
  getTenantMaintenance,
  getTenantLease,
  createTenantMaintenance
} from "../../api/tenantPortal";

export default function TenantMaintenance() {
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    leaseId: ""
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getTenantMaintenance().then((data) =>
      setRequests(Array.isArray(data) ? data : [])
    );

    getTenantLease().then((leases) => {
      if (Array.isArray(leases) && leases.length > 0) {
        setForm((f) => ({ ...f, leaseId: leases[0].id }));
      }
    });
  }, []);

  const submitForm = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return;

    try {
      setSubmitting(true);
      await createTenantMaintenance(form);
      const refreshed = await getTenantMaintenance();
      setRequests(Array.isArray(refreshed) ? refreshed : []);
      setForm((f) => ({ ...f, title: "", description: "" }));
    } catch (err) {
      console.error("Failed to create maintenance request", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="tenant-page">
      <h1 className="tenant-page-title">Maintenance Requests</h1>

      <div className="tenant-grid-2">
        <form className="tenant-card" onSubmit={submitForm}>
          <h2>Create a request</h2>
          <p className="muted small">
            Tell your landlord what needs attention. Be as specific as
            possible.
          </p>

          <label className="field">
            <span>Title</span>
            <input
              type="text"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              placeholder="Leaky faucet in kitchen"
            />
          </label>

          <label className="field">
            <span>Description</span>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Describe the issue, when it started, and any details."
            />
          </label>

          <label className="field">
            <span>Priority</span>
            <select
              value={form.priority}
              onChange={(e) =>
                setForm((f) => ({ ...f, priority: e.target.value }))
              }
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </label>

          <button className="btn-primary" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit request"}
          </button>
        </form>

        <div className="tenant-card">
          <h2>Your requests</h2>

          {!requests.length ? (
            <p className="muted">You don’t have any maintenance requests yet.</p>
          ) : (
            <div className="tenant-request-list">
              {requests.map((req) => (
                <div key={req.id} className="tenant-request-item">
                  <div className="request-header">
                    <h3>{req.title}</h3>
                    <span
                      className={`status-badge ${req.status.toLowerCase()}`}
                    >
                      {req.status}
                    </span>
                  </div>
                  <p className="muted small">
                    {req.propertyTitle} — Unit {req.unitNumber}
                  </p>
                  <p className="small">{req.description}</p>
                  <p className="muted tiny">
                    Created {new Date(req.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

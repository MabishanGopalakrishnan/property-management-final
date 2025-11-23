// src/pages/Maintenance.jsx
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import {
  getMaintenanceRequests,
  createMaintenanceRequest,
  updateMaintenanceStatus,
} from "../api/maintenance";
import { useAuth } from "../context/AuthContext";

export default function Maintenance() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leaseId, setLeaseId] = useState("");
  const [newRequest, setNewRequest] = useState({
    title: "",
    description: "",
  });

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await getMaintenanceRequests();
      setRequests(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!leaseId) {
      alert("Enter your lease ID.");
      return;
    }
    try {
      await createMaintenanceRequest(Number(leaseId), newRequest);
      setNewRequest({ title: "", description: "" });
      await loadRequests();
    } catch (e) {
      console.error(e);
      alert("Failed to create maintenance request.");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateMaintenanceStatus(id, status);
      await loadRequests();
    } catch (e) {
      console.error(e);
      alert("Failed to update status.");
    }
  };

  const canUpdate = user?.role === "LANDLORD";

  return (
    <div className="page">
      <Navbar />
      <main className="page-inner">
        <h1 className="page-title">Maintenance</h1>
        <p className="muted">
          Tenants can submit issues; landlords can track and close them.
        </p>

        {user?.role === "TENANT" && (
          <section className="card">
            <h2>Submit request</h2>
            <form className="form-grid" onSubmit={handleCreate}>
              <input
                className="input"
                placeholder="Your lease ID"
                value={leaseId}
                onChange={(e) => setLeaseId(e.target.value)}
              />
              <input
                className="input"
                placeholder="Title"
                value={newRequest.title}
                onChange={(e) =>
                  setNewRequest((r) => ({ ...r, title: e.target.value }))
                }
                required
              />
              <textarea
                className="input"
                rows={3}
                placeholder="Describe the problem"
                value={newRequest.description}
                onChange={(e) =>
                  setNewRequest((r) => ({ ...r, description: e.target.value }))
                }
              />
              <button className="btn-primary">Submit</button>
            </form>
          </section>
        )}

        <section className="card">
          <h2>Requests</h2>
          {loading ? (
            <p>Loading...</p>
          ) : requests.length === 0 ? (
            <p className="muted">No maintenance requests yet.</p>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Lease</th>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Created</th>
                    {canUpdate && <th />}
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => (
                    <tr key={r.id}>
                      <td>{r.id}</td>
                      <td>{r.leaseId}</td>
                      <td>{r.title}</td>
                      <td>{r.status}</td>
                      <td>{new Date(r.createdAt).toLocaleString()}</td>
                      {canUpdate && (
                        <td>
                          <select
                            className="input"
                            value={r.status}
                            onChange={(e) =>
                              handleStatusChange(r.id, e.target.value)
                            }
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="IN_PROGRESS">IN_PROGRESS</option>
                            <option value="COMPLETED">COMPLETED</option>
                            <option value="CANCELED">CANCELED</option>
                          </select>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

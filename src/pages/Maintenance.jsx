// src/pages/Maintenance.jsx
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import {
  getMaintenanceRequests,
  updateMaintenanceRequest,
  uploadMaintenancePhoto,
  getMaintenanceRequest,
} from "../api/maintenance";

export default function Maintenance() {
  const { user } = useAuth();
  const isManager = user?.role === "LANDLORD";
  const [requests, setRequests] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [propertyFilter, setPropertyFilter] = useState("ALL");

  const [selected, setSelected] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [uploading, setUploading] = useState(false);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await getMaintenanceRequests();
      setRequests(data);
      setFiltered(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const applyFilters = () => {
    let res = [...requests];

    if (search.trim() !== "") {
      res = res.filter((r) =>
        r.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (priorityFilter !== "ALL") {
      res = res.filter((r) => r.priority === priorityFilter);
    }

    if (statusFilter !== "ALL") {
      res = res.filter((r) => r.status === statusFilter);
    }

    if (propertyFilter !== "ALL") {
      res = res.filter((r) => r.lease.unit.property.id === Number(propertyFilter));
    }

    setFiltered(res);
  };

  useEffect(() => {
    applyFilters();
  }, [search, priorityFilter, statusFilter, propertyFilter]);

  const handleUpdate = async (id, fields) => {
    try {
      const updated = await updateMaintenanceRequest(id, fields);
      await loadRequests();
      setDetailData(updated);
    } catch (err) {
      console.error("Failed update:", err);
    }
  };

  const handleSelect = async (req) => {
    setSelected(req);
    const full = await getMaintenanceRequest(req.id);
    setDetailData(full);
  };

  const handleUpload = async (e) => {
    if (!selected) return;
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      await uploadMaintenancePhoto(selected.id, file);
      const full = await getMaintenanceRequest(selected.id);
      setDetailData(full);
      await loadRequests();
    } catch (err) {
      console.error("Upload failed:", err);
    }
    setUploading(false);
  };

  if (!isManager) {
    return (
      <div className="page">
        <Navbar />
        <main className="page-inner">
          <h1>Maintenance</h1>
          <p>You do not have access to this dashboard.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="page">
      <Navbar />

      <main className="page-inner">
        <h1 className="page-title">Maintenance Dashboard</h1>
        <p className="muted">Manage all maintenance requests across properties.</p>

        {/* Filters */}
        <section className="card filters-grid">
          <input
            className="input"
            placeholder="Search requests…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="input"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="ALL">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>

          <select
            className="input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELED">Canceled</option>
          </select>

          <select
            className="input"
            value={propertyFilter}
            onChange={(e) => setPropertyFilter(e.target.value)}
          >
            <option value="ALL">All Properties</option>
            {[...new Map(
              requests.map((r) => [
                r.lease.unit.property.id,
                r.lease.unit.property,
              ])
            ).values()].map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} — {p.city}
              </option>
            ))}
          </select>
        </section>

        {/* Maintenance Cards */}
        <section className="cards-grid">
          {loading ? (
            <p>Loading...</p>
          ) : filtered.length === 0 ? (
            <p>No requests found.</p>
          ) : (
            filtered.map((r) => (
              <div
                key={r.id}
                className="card maintenance-card"
                onClick={() => handleSelect(r)}
              >
                <div className={`badge badge-${r.priority}`}>{r.priority}</div>
                <div className={`badge status-${r.status}`}>{r.status}</div>

                <h3>{r.title}</h3>
                <p className="muted">
                  Unit {r.lease.unit.unitNumber} · {r.lease.unit.property.title}
                </p>

                <p>
                  Tenant:{" "}
                  <strong>
                    {r.lease.tenant.user.name} ({r.lease.tenant.user.email})
                  </strong>
                </p>

                <p className="small-muted">
                  Created {new Date(r.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </section>

        {/* Detail Drawer */}
        {selected && detailData && (
          <div className="drawer">
            <div className="drawer-inner">
              <button
                className="close-btn"
                onClick={() => setSelected(null)}
              >
                ✕
              </button>

              <h2>{detailData.title}</h2>
              <p className="muted">
                Unit {detailData.lease.unit.unitNumber} —{" "}
                {detailData.lease.unit.property.title}
              </p>

              <p className="description">{detailData.description}</p>

              <h3>Update Status</h3>
              <select
                className="input"
                value={detailData.status}
                onChange={(e) =>
                  handleUpdate(detailData.id, { status: e.target.value })
                }
              >
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELED">Canceled</option>
              </select>

              <h3>Priority</h3>
              <select
                className="input"
                value={detailData.priority}
                onChange={(e) =>
                  handleUpdate(detailData.id, { priority: e.target.value })
                }
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>

              <h3>Assign Contractor</h3>
              <input
                className="input"
                placeholder="Contractor name"
                value={detailData.contractor || ""}
                onChange={(e) =>
                  handleUpdate(detailData.id, { contractor: e.target.value })
                }
              />

              <h3>Photos</h3>
              <div className="photo-grid">
                {detailData.photos?.map((url, i) => (
                  <img key={i} src={url} alt="" className="photo-thumb" />
                ))}
              </div>

              <label className="upload-btn">
                {uploading ? "Uploading..." : "Upload Photo"}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleUpload}
                />
              </label>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

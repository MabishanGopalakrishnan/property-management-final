// src/pages/tenant/TenantMaintenance.jsx
import { useEffect, useState } from "react";
import {
  tenantMaintenance,
  createTenantMaintenance,
  tenantLeases
} from "../../api/tenants";

export default function TenantMaintenance() {
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    leaseId: ""
  });

  useEffect(() => {
    tenantMaintenance().then(res => setRequests(res.data));

    tenantLeases().then(res => {
      if (res.data.length)
        setForm(f => ({ ...f, leaseId: res.data[0].id }));
    });
  }, []);

  const submitForm = () => {
    createTenantMaintenance(form).then(() => window.location.reload());
  };

  return (
    <div className="text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Maintenance Requests</h1>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">Create a Request</h2>

        <input
          type="text"
          placeholder="Title"
          className="w-full p-2 mb-3 bg-gray-700 rounded"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
        />

        <textarea
          placeholder="Description"
          className="w-full p-2 mb-3 bg-gray-700 rounded"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
        />

        <select
          className="w-full p-2 mb-3 bg-gray-700 rounded"
          value={form.priority}
          onChange={e => setForm({ ...form, priority: e.target.value })}
        >
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>

        <button className="bg-blue-600 px-4 py-2 rounded" onClick={submitForm}>
          Submit Request
        </button>
      </div>

      {requests.map(req => (
        <div key={req.id} className="bg-gray-800 p-6 rounded-lg shadow-lg mb-4">
          <p><strong>Title:</strong> {req.title}</p>
          <p><strong>Status:</strong> {req.status}</p>
          <p><strong>Priority:</strong> {req.priority}</p>
        </div>
      ))}
    </div>
  );
}

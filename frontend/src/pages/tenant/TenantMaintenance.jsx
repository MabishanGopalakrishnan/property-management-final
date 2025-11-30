// src/pages/tenant/TenantMaintenance.jsx
import { useEffect, useState } from "react";
import {
  getTenantMaintenance,
  getTenantLease,
  createTenantMaintenance,
  uploadTenantMaintenancePhoto
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
  const [photoFiles, setPhotoFiles] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

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

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files || []);
    setPhotoFiles(files);

    // Generate previews
    const previews = files.map(file => URL.createObjectURL(file));
    setPhotoPreviews(previews);
  };

  const removePhoto = (index) => {
    const newFiles = [...photoFiles];
    const newPreviews = [...photoPreviews];
    
    URL.revokeObjectURL(newPreviews[index]);
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setPhotoFiles(newFiles);
    setPhotoPreviews(newPreviews);
  };

  const submitForm = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return;

    try {
      setSubmitting(true);
      const newRequest = await createTenantMaintenance(form);
      
      // Upload photos if any
      if (photoFiles.length > 0) {
        setUploadingPhotos(true);
        for (const file of photoFiles) {
          await uploadTenantMaintenancePhoto(newRequest.id, file);
        }
        setUploadingPhotos(false);
      }
      
      const refreshed = await getTenantMaintenance();
      setRequests(Array.isArray(refreshed) ? refreshed : []);
      setForm((f) => ({ ...f, title: "", description: "" }));
      
      // Clear photos
      photoPreviews.forEach(url => URL.revokeObjectURL(url));
      setPhotoFiles([]);
      setPhotoPreviews([]);
    } catch (err) {
      console.error("Failed to create maintenance request", err);
      alert("Failed to submit maintenance request. Please try again.");
    } finally {
      setSubmitting(false);
      setUploadingPhotos(false);
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

          <label className="field">
            <span>Photos (optional)</span>
            <p className="muted small" style={{ marginTop: '-0.5rem', marginBottom: '0.75rem' }}>
              Add photos to help describe the issue
            </p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoChange}
              style={{
                padding: '0.75rem',
                border: '2px dashed rgba(255,255,255,0.2)',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.03)',
                cursor: 'pointer',
                width: '100%'
              }}
            />
          </label>

          {photoPreviews.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                Preview ({photoPreviews.length} {photoPreviews.length === 1 ? 'photo' : 'photos'})
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.75rem' }}>
                {photoPreviews.map((preview, index) => (
                  <div key={index} style={{ position: 'relative' }}>
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '120px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        background: 'rgba(239, 68, 68, 0.9)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold'
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button className="btn-primary" disabled={submitting || uploadingPhotos}>
            {uploadingPhotos ? "Uploading photos..." : submitting ? "Submitting..." : "Submit request"}
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

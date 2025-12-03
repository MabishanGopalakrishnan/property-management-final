// frontend/src/api/maintenance.js
import API from "./axiosConfig";

export const getMaintenanceRequests = async () => {
  const res = await API.get("/maintenance");
  return res.data;
};

// Get details of a single request
export const getMaintenanceRequest = async (id) => {
  const res = await API.get(`/maintenance/${id}`);
  return res.data;
};

// Update fields: status, priority, contractor, description
export const updateMaintenanceRequest = async (id, data) => {
  const res = await API.put(`/maintenance/${id}`, data);
  return res.data;
};

// Upload photos
export const uploadMaintenancePhoto = async (id, file) => {
  const form = new FormData();
  form.append("photo", file);

  const res = await API.post(`/maintenance/${id}/photo`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};

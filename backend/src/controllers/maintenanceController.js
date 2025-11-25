// backend/src/controllers/maintenanceController.js
import {
  getAllMaintenanceRequestsService,
  getMaintenanceRequestByIdService,
  updateMaintenanceRequestService,
  addPhotoToMaintenanceRequestService,
} from "../services/maintenanceService.js";

export const getAllMaintenanceRequests = async (req, res) => {
  try {
    const requests = await getAllMaintenanceRequestsService();
    res.json(requests);
  } catch (err) {
    console.error("Get all maintenance requests error:", err);
    res.status(500).json({ error: "Failed to fetch maintenance requests" });
  }
};

export const getMaintenanceRequestById = async (req, res) => {
  try {
    const request = await getMaintenanceRequestByIdService(req.params.id);
    if (!request) return res.status(404).json({ error: "Not found" });
    res.json(request);
  } catch (err) {
    console.error("Get request by ID error:", err);
    res.status(500).json({ error: "Failed to fetch request" });
  }
};

export const updateMaintenanceRequest = async (req, res) => {
  try {
    const updated = await updateMaintenanceRequestService(
      req.params.id,
      req.body
    );
    res.json(updated);
  } catch (err) {
    console.error("Update request error:", err);
    res.status(500).json({ error: "Failed to update request" });
  }
};

export const uploadMaintenancePhoto = async (req, res) => {
  try {
    const filePath = `/uploads/maintenance/${req.file.filename}`;
    await addPhotoToMaintenanceRequestService(req.params.id, filePath);
    res.json({ success: true, url: filePath });
  } catch (err) {
    console.error("Upload photo error:", err.message);
    res.status(500).json({ error: "Failed to upload photo" });
  }
};

import {
  createMaintenanceRequestService,
  getMaintenanceRequestsService,
  updateMaintenanceStatusService
} from "../services/maintenanceService.js";

export const createMaintenanceRequest = async (req, res) => {
  try {
    const leaseId = parseInt(req.params.leaseId);
    const request = await createMaintenanceRequestService(leaseId, req.body);
    res.json(request);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getMaintenanceRequests = async (req, res) => {
  try {
    const requests = await getMaintenanceRequestsService();
    res.json(requests);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateMaintenanceStatus = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updated = await updateMaintenanceStatusService(id, req.body.status);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// backend/src/controllers/leaseController.js
import {
  createLeaseService,
  getLeasesByPropertyService,
  getLeasesByUnitService,
  getLeaseByIdService,
  updateLeaseService,
  deleteLeaseService,
} from "../services/leaseService.js";

// Landlord creates a lease
export const createLease = async (req, res) => {
  try {
    const landlordId = req.user.id;
    console.log("CREATE LEASE BODY:", req.body);
    const lease = await createLeaseService(landlordId, req.body);
    res.json(lease);
  } catch (err) {
    console.error("Create lease error:", err);
    res.status(400).json({ error: err.message });
  }
};

export const getLeasesByProperty = async (req, res) => {
  try {
    const landlordId = req.user.id;
    const propertyId = parseInt(req.params.propertyId, 10);
    const leases = await getLeasesByPropertyService(landlordId, propertyId);
    res.json(leases);
  } catch (err) {
    console.error("Get leases by property error:", err);
    res.status(400).json({ error: err.message });
  }
};

export const getLeasesByUnit = async (req, res) => {
  try {
    const landlordId = req.user.id;
    const unitId = parseInt(req.params.unitId, 10);
    const leases = await getLeasesByUnitService(landlordId, unitId);
    res.json(leases);
  } catch (err) {
    console.error("Get leases by unit error:", err);
    res.status(400).json({ error: err.message });
  }
};

export const getLeaseById = async (req, res) => {
  try {
    const landlordId = req.user.id;
    const id = parseInt(req.params.id, 10);
    const lease = await getLeaseByIdService(landlordId, id);
    if (!lease) return res.status(404).json({ error: "Lease not found" });
    res.json(lease);
  } catch (err) {
    console.error("Get lease by id error:", err);
    res.status(400).json({ error: err.message });
  }
};

export const updateLease = async (req, res) => {
  try {
    const landlordId = req.user.id;
    const id = parseInt(req.params.id, 10);
    const lease = await updateLeaseService(landlordId, id, req.body);
    res.json(lease);
  } catch (err) {
    console.error("Update lease error:", err);
    res.status(400).json({ error: err.message });
  }
};

export const deleteLease = async (req, res) => {
  try {
    const landlordId = req.user.id;
    const id = parseInt(req.params.id, 10);
    const lease = await deleteLeaseService(landlordId, id);
    res.json(lease);
  } catch (err) {
    console.error("Delete lease error:", err);
    res.status(400).json({ error: err.message });
  }
};

import {
  createLeaseService,
  getLeasesByPropertyService,
  getLeasesByUnitService,
  getLeaseByIdService,
  updateLeaseService,
  deleteLeaseService
}
from "../services/leaseService.js";

export const createLease = async (req, res) => {
  try {
    const lease = await createLeaseService(req.body);
    res.json(lease);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getLeasesByProperty = async (req, res) => {
  try {
    const leases = await getLeasesByPropertyService(parseInt(req.params.propertyId));
    res.json(leases);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getLeasesByUnit = async (req, res) => {
  try {
    const leases = await getLeasesByUnitService(parseInt(req.params.unitId));
    res.json(leases);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getLeaseById = async (req, res) => {
  try {
    const lease = await getLeaseByIdService(parseInt(req.params.id));
    res.json(lease);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateLease = async (req, res) => {
  try {
    const lease = await updateLeaseService(parseInt(req.params.id), req.body);
    res.json(lease);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteLease = async (req, res) => {
  try {
    const lease = await deleteLeaseService(parseInt(req.params.id));
    res.json(lease);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

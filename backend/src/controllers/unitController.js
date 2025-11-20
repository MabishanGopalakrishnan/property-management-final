import {
  createUnitService,
  getUnitsByPropertyService,
  updateUnitService,
  deleteUnitService
} from "../services/unitService.js";

export const createUnit = async (req, res) => {
  try {
    const propertyId = parseInt(req.params.propertyId);
    const unit = await createUnitService(propertyId, req.body);
    res.json(unit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUnitsByProperty = async (req, res) => {
  try {
    const propertyId = parseInt(req.params.propertyId);
    const units = await getUnitsByPropertyService(propertyId);
    res.json(units);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateUnit = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updated = await updateUnitService(id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteUnit = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await deleteUnitService(id);
    res.json(deleted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

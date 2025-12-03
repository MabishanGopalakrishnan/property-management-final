// backend/src/controllers/unitController.js
import {
  createUnitService,
  listUnitsService,
  updateUnitService,
  deleteUnitService,
} from "../services/unitService.js";

export const listUnits = async (req, res) => {
  try {
    const landlordId = req.user.id;
    const propertyId = req.params.propertyId;
    const units = await listUnitsService(landlordId, propertyId);
    res.json(units);
  } catch (err) {
    console.error("List units error:", err);
    res.status(400).json({ error: err.message });
  }
};

export const createUnit = async (req, res) => {
  try {

    const landlordId = req.user.id;
    const propertyId = req.params.propertyId;
    const unit = await createUnitService(landlordId, propertyId, req.body);

    res.json(unit);
  } catch (err) {
    console.error("Unit creation error:", err);
    res.status(400).json({ error: err.message });
  }
};

export const updateUnit = async (req, res) => {
  try {
    const landlordId = req.user.id;
    const unitId = req.params.unitId;
    const updated = await updateUnitService(landlordId, unitId, req.body);
    res.json(updated);
  } catch (err) {
    console.error("Update unit error:", err);
    res.status(400).json({ error: err.message });
  }
};

export const deleteUnit = async (req, res) => {
  try {
    const landlordId = req.user.id;
    const unitId = req.params.unitId;
    const deleted = await deleteUnitService(landlordId, unitId);
    res.json(deleted);
  } catch (err) {
    console.error("Delete unit error:", err);
    res.status(400).json({ error: err.message });
  }
};

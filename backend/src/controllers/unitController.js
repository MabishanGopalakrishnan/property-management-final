// import {
//   createUnitService,
//   getUnitsByPropertyService,
//   updateUnitService,
//   deleteUnitService
// } from "../services/unitService.js";

// export const createUnit = async (req, res) => {
//   try {
//     const propertyId = parseInt(req.params.propertyId);
//     const unit = await createUnitService(propertyId, req.body);
//     res.json(unit);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// export const getUnitsByProperty = async (req, res) => {
//   try {
//     const propertyId = parseInt(req.params.propertyId);
//     const units = await getUnitsByPropertyService(propertyId);
//     res.json(units);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// export const updateUnit = async (req, res) => {
//   try {
//     const id = parseInt(req.params.id);
//     const updated = await updateUnitService(id, req.body);
//     res.json(updated);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// export const deleteUnit = async (req, res) => {
//   try {
//     const id = parseInt(req.params.id);
//     const deleted = await deleteUnitService(id);
//     res.json(deleted);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


import {
  createUnitService,
  listUnitsService,
  updateUnitService,
  deleteUnitService
} from "../services/unitService.js";

export const createUnit = async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const unit = await createUnitService(ownerId, req.params.propertyId, req.body);
    res.status(201).json(unit);
  } catch (err) { next(err); }
};

export const listUnits = async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const units = await listUnitsService(ownerId, req.params.propertyId);
    res.json(units);
  } catch (err) { next(err); }
};

export const updateUnit = async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const updated = await updateUnitService(ownerId, req.params.unitId, req.body);
    res.json(updated);
  } catch (err) { next(err); }
};

export const deleteUnit = async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const deleted = await deleteUnitService(ownerId, req.params.unitId);
    res.json(deleted);
  } catch (err) { next(err); }
};

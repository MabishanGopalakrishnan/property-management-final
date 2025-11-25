const service = require('./unit.service');

async function create(req, res) {
  const ownerId = req.user.id;
  const unit = await service.createUnit(ownerId, req.params.propertyId, req.body);
  res.status(201).json(unit);
}

async function list(req, res) {
  const ownerId = req.user.id;
  const units = await service.listUnits(ownerId, req.params.propertyId);
  res.json(units);
}

async function update(req, res) {
  const ownerId = req.user.id;
  const updated = await service.updateUnit(ownerId, req.params.unitId, req.body);
  res.json(updated);
}

async function remove(req, res) {
  const ownerId = req.user.id;
  const deleted = await service.deleteUnit(ownerId, req.params.unitId);
  res.json(deleted);
}

module.exports = { create, list, update, remove };

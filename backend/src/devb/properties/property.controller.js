const service = require('./property.service');

async function create(req, res) {
  const ownerId = req.user.id;
  const property = await service.createProperty(ownerId, req.body);
  res.status(201).json(property);
}

async function list(req, res) {
  const ownerId = req.user.id;
  const properties = await service.getProperties(ownerId);
  res.json(properties);
}

async function getOne(req, res) {
  const ownerId = req.user.id;
  const property = await service.getPropertyById(ownerId, req.params.id);
  if (!property) return res.status(404).json({ message: "Not found" });
  res.json(property);
}

async function update(req, res) {
  const ownerId = req.user.id;
  const updated = await service.updateProperty(ownerId, req.params.id, req.body);
  res.json(updated);
}

async function remove(req, res) {
  const ownerId = req.user.id;
  const deleted = await service.deleteProperty(ownerId, req.params.id);
  res.json(deleted);
}

module.exports = { create, list, getOne, update, remove };

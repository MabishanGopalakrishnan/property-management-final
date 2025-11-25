const service = require('./maintenance.service');

async function tenantCreate(req, res) {
  const created = await service.tenantCreateRequest(req.user.id, req.params.leaseId, req.body);
  res.status(201).json(created);
}

async function landlordList(req, res) {
  const requests = await service.landlordListRequests(req.user.id);
  res.json(requests);
}

async function landlordUpdate(req, res) {
  const updated = await service.landlordUpdateRequest(req.user.id, req.params.requestId, req.body);
  res.json(updated);
}

module.exports = { tenantCreate, landlordList, landlordUpdate };

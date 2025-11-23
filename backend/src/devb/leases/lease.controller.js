const service = require('./lease.service');

async function create(req, res) {
  const lease = await service.createLease(req.user.id, req.body);
  res.status(201).json(lease);
}

async function list(req, res) {
  if (req.user.role === 'LANDLORD') {
    const leases = await service.listLeasesForLandlord(req.user.id);
    return res.json(leases);
  } else {
    const leases = await service.listLeasesForTenant(req.user.id);
    return res.json(leases);
  }
}

module.exports = { create, list };

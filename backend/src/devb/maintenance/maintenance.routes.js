const router = require('express').Router();
const controller = require('./maintenance.controller');
const { authRequired } = require('../../middleware/authMiddleware');

router.use(authRequired);

// tenant create for own lease
router.post('/lease/:leaseId', (req, res, next) => {
  if (req.user.role !== 'TENANT') return res.status(403).json({ message: "Tenant only" });
  next();
}, controller.tenantCreate);

// landlord list + update
router.get('/', (req, res, next) => {
  if (req.user.role !== 'LANDLORD') return res.status(403).json({ message: "Landlord only" });
  next();
}, controller.landlordList);

router.put('/:requestId', (req, res, next) => {
  if (req.user.role !== 'LANDLORD') return res.status(403).json({ message: "Landlord only" });
  next();
}, controller.landlordUpdate);

module.exports = router;

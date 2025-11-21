const router = require('express').Router();
const controller = require('./lease.controller');
const { authRequired } = require('../../middleware/authMiddleware');

router.use(authRequired);

router.get('/', controller.list);

// landlord only create
router.post('/', (req, res, next) => {
  if (req.user.role !== 'LANDLORD') return res.status(403).json({ message: "Landlord only" });
  next();
}, controller.create);

module.exports = router;

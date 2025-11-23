const router = require('express').Router();
const controller = require('./unit.controller');
const { authRequired } = require('../../middleware/authMiddleware');
const { requireRole } = require('../../middleware/roleMiddleware');

router.use(authRequired, requireRole('LANDLORD'));

router.get('/property/:propertyId', controller.list);
router.post('/property/:propertyId', controller.create);
router.put('/:unitId', controller.update);
router.delete('/:unitId', controller.remove);

module.exports = router;

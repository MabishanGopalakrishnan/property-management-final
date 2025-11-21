const router = require('express').Router();
const controller = require('./property.controller');
const { authRequired } = require('../../middleware/authMiddleware');
const { requireRole } = require('../../middleware/roleMiddleware');

router.use(authRequired, requireRole('LANDLORD'));

router.post('/', controller.create);
router.get('/', controller.list);
router.get('/:id', controller.getOne);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;

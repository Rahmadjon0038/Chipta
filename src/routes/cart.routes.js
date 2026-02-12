const { Router } = require('express');
const cartController = require('../controllers/cart.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

const router = Router();

router.use(authMiddleware);
router.get('/', cartController.getMyCart);
router.post('/', cartController.addToCart);
router.patch('/:id', cartController.updateCartItem);
router.delete('/:id', cartController.removeCartItem);

module.exports = router;

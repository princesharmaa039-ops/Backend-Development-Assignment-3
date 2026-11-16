const express = require('express');
const c = require('../controllers/productController');
const { validateObjectId, validateStockChange, requireBody } = require('../middleware/validators');

const router = express.Router();

// Static routes MUST come before "/:id" so "low-stock" / "summary" aren't treated as IDs
router.get('/low-stock', c.getLowStock);
router.get('/summary', c.getSummary);

router.route('/').get(c.getProducts).post(requireBody, c.createProduct);

router
  .route('/:id')
  .all(validateObjectId)
  .get(c.getProductById)
  .put(requireBody, c.updateProduct)
  .delete(c.deleteProduct);

router.patch('/:id/stock', validateObjectId, validateStockChange, c.adjustStock);

module.exports = router;

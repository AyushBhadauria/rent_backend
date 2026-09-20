const express = require('express');
const multer = require('multer');
const { requireAdmin } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteImage,
  deleteProduct,
} = require('../controllers/products.controller');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
});
const router = express.Router();

router.get('/', asyncHandler(listProducts));
router.get('/:id', asyncHandler(getProduct));

router.post('/', requireAdmin, upload.array('images', 8), asyncHandler(createProduct));
router.put('/:id', requireAdmin, upload.array('images', 8), asyncHandler(updateProduct));
// publicId is passed as a query param (?publicId=...) since Cloudinary public
// IDs contain slashes (folder paths) and would break as a route segment.
router.delete('/:id/images', requireAdmin, asyncHandler(deleteImage));
router.delete('/:id', requireAdmin, asyncHandler(deleteProduct));

module.exports = router;

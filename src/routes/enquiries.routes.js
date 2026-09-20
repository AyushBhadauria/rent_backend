const express = require('express');
const { requireAdmin } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { createEnquiry, listEnquiries, updateEnquiryStatus } = require('../controllers/enquiries.controller');

const router = express.Router();

router.post('/', asyncHandler(createEnquiry));
router.get('/', requireAdmin, asyncHandler(listEnquiries));
router.patch('/:id/status', requireAdmin, asyncHandler(updateEnquiryStatus));

module.exports = router;

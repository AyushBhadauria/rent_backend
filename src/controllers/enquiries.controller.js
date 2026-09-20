const Enquiry = require('../models/Enquiry');
const Product = require('../models/Product');

async function createEnquiry(req, res) {
  const { productId, customerName, email, phone, message } = req.body;

  if (!productId || !customerName || !email || !phone) {
    return res.status(400).json({ message: 'productId, customerName, email and phone are required' });
  }

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  const enquiry = await Enquiry.create({
    product: productId,
    customerName,
    email,
    phone,
    message,
  });

  const businessNumber = process.env.WHATSAPP_BUSINESS_NUMBER;
  const text = `Hi, I'd like to rent "${product.name}" (₹${product.rentalPrice}).\nName: ${customerName}\nEmail: ${email}\nPhone: ${phone}${message ? `\nMessage: ${message}` : ''}`;
  const whatsappUrl = `https://wa.me/${businessNumber}?text=${encodeURIComponent(text)}`;

  res.status(201).json({ enquiry, whatsappUrl });
}

async function listEnquiries(req, res) {
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const enquiries = await Enquiry.find(filter).populate('product', 'name rentalPrice images').sort({ createdAt: -1 });
  res.json(enquiries);
}

async function updateEnquiryStatus(req, res) {
  const { status } = req.body;
  const allowed = ['new', 'contacted', 'booked', 'closed'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: `status must be one of ${allowed.join(', ')}` });
  }

  const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!enquiry) return res.status(404).json({ message: 'Enquiry not found' });
  res.json(enquiry);
}

module.exports = { createEnquiry, listEnquiries, updateEnquiryStatus };

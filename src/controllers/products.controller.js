const Product = require('../models/Product');
const { cloudinary, uploadBuffer } = require('../config/cloudinary');

async function uploadFiles(files) {
  const results = await Promise.all((files || []).map((file) => uploadBuffer(file.buffer)));
  return results.map((result) => ({ url: result.secure_url, publicId: result.public_id }));
}

async function listProducts(req, res) {
  const { category, available } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (available === 'true') filter.isAvailable = true;

  const products = await Product.find(filter).sort({ createdAt: -1 });
  res.json(products);
}

async function getProduct(req, res) {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
}

async function createProduct(req, res) {
  const { name, description, category, size, color, rentalPrice, securityDeposit } = req.body;

  if (!name || rentalPrice === undefined) {
    return res.status(400).json({ message: 'name and rentalPrice are required' });
  }

  const images = await uploadFiles(req.files);

  const product = await Product.create({
    name,
    description,
    category,
    size,
    color,
    rentalPrice,
    securityDeposit,
    images,
  });

  res.status(201).json(product);
}

async function updateProduct(req, res) {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  const fields = ['name', 'description', 'category', 'size', 'color', 'rentalPrice', 'securityDeposit', 'isAvailable'];
  for (const field of fields) {
    if (req.body[field] !== undefined) product[field] = req.body[field];
  }

  const newImages = await uploadFiles(req.files);
  if (newImages.length) {
    product.images.push(...newImages);
  }

  await product.save();
  res.json(product);
}

async function deleteImage(req, res) {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  const { publicId } = req.query;
  if (!publicId) return res.status(400).json({ message: 'publicId query param is required' });

  const image = product.images.find((img) => img.publicId === publicId);
  if (!image) return res.status(404).json({ message: 'Image not found' });

  await cloudinary.uploader.destroy(publicId);
  product.images = product.images.filter((img) => img.publicId !== publicId);
  await product.save();
  res.json(product);
}

async function deleteProduct(req, res) {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  await Promise.all(product.images.map((img) => cloudinary.uploader.destroy(img.publicId)));
  await product.deleteOne();
  res.json({ message: 'Product deleted' });
}

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteImage,
  deleteProduct,
};

const fs = require('fs').promises;
const path = require('path');
const cuid = require('cuid');
const db = require('./db');

const productsFile = path.join(__dirname, 'data/full-products.json');

// Define the Product Model
const Product = db.model('Product', {
  _id: { type: String, default: cuid },
  description: { type: String },
  alt_description: { type: String },
  likes: { type: Number, required: true },
  urls: {
    regular: { type: String, required: true },
    small: { type: String, required: true },
    thumb: { type: String, required: true },
  },
  links: {
    self: { type: String, required: true },
    html: { type: String, required: true },
  },
  user: {
    id: { type: String, required: true },
    first_name: { type: String, required: true },
    last_name: { type: String },
    portfolio_url: { type: String },
    username: { type: String, required: true },
  },
  tags: [
    {
      title: { type: String, required: true },
    },
  ],
});

/**
 * List products with optional filtering, sorting, and pagination.
 * @param {Object} options - Query options.
 * @param {number} [options.offset=0] - Number of documents to skip.
 * @param {number} [options.limit=25] - Number of documents to return.
 * @param {string} [options.tag] - Filter by tag title.
 * @returns {Promise<Array>} - List of products.
 */
async function list(options = {}) {
  const { offset = 0, limit = 25, tag } = options;

  const query = tag
    ? {
        tags: {
          $elemMatch: {
            title: tag,
          },
        },
      }
    : {};

  const products = await Product.find(query)
    .sort({ _id: 1 })
    .skip(Number(offset))
    .limit(Number(limit));

  return products;
}

/**
 * Get a single product by ID.
 * @param {string} _id - Product ID.
 * @returns {Promise<Object|null>} - The product, or null if not found.
 */
async function get(_id) {
  try {
    const product = await Product.findById(_id);
    if (!product) throw new Error('Product not found');
    return product;
  } catch (err) {
    throw new Error(`Error retrieving product: ${err.message}`);
  }
}

/**
 * Create a new product.
 * @param {Object} fields - Product fields.
 * @returns {Promise<Object>} - The created product.
 */
async function create(fields) {
  try {
    const product = new Product(fields);
    await product.save();
    return product;
  } catch (err) {
    throw new Error(`Error creating product: ${err.message}`);
  }
}

/**
 * Edit an existing product.
 * @param {string} _id - Product ID.
 * @param {Object} changes - Fields to update.
 * @returns {Promise<Object>} - The updated product.
 */
async function edit(_id, changes) {
  try {
    const product = await get(_id);
    if (!product) throw new Error('Product not found');

    Object.keys(changes).forEach((key) => {
      product[key] = changes[key];
    });

    await product.save();
    return product;
  } catch (err) {
    throw new Error(`Error editing product: ${err.message}`);
  }
}

/**
 * Delete a product by ID.
 * @param {string} _id - Product ID.
 * @returns {Promise<Object>} - The result of the deletion operation.
 */
async function destroy(_id) {
  try {
    const result = await Product.deleteOne({ _id });
    if (result.deletedCount === 0) throw new Error('Product not found');
    return { message: 'Product deleted successfully', success: true };
  } catch (err) {
    throw new Error(`Error deleting product: ${err.message}`);
  }
}

module.exports = {
  list,
  get,
  create,
  edit,
  destroy,
};

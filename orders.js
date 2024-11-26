const cuid = require('cuid');
const db = require('./db');

const Order = db.model('Order', {
  _id: { type: String, default: cuid },
  buyerEmail: { type: String, required: true },
  products: [
    {
      type: String,
      ref: 'Product', // Automatically fetch associated products
      index: true,
      required: true,
    },
  ],
  status: {
    type: String,
    index: true,
    default: 'CREATED',
    enum: ['CREATED', 'PENDING', 'COMPLETED'],
  },
});

/**
 * List orders with optional filtering, sorting, and pagination.
 * @param {Object} options - Query options.
 * @param {number} options.offset - Number of documents to skip.
 * @param {number} options.limit - Number of documents to return.
 * @param {string} [options.productId] - Filter by product ID.
 * @param {string} [options.status] - Filter by order status.
 * @returns {Promise<Array>} List of orders.
 */
async function list(options = {}) {
  const { offset = 0, limit = 25, productId, status } = options;

  const query = {};
  if (productId) query.products = productId;
  if (status) query.status = status;

  try {
    const orders = await Order.find(query)
      .sort({ _id: 1 })
      .skip(offset)
      .limit(limit)
      .exec();

    return orders;
  } catch (err) {
    throw new Error(`Error listing orders: ${err.message}`);
  }
}

/**
 * Get a single order by ID.
 * @param {string} _id - Order ID.
 * @returns {Promise<Object|null>} The order, or null if not found.
 */
async function get(_id) {
  try {
    const order = await Order.findById(_id).populate('products').exec();
    if (!order) throw new Error('Order not found');
    return order;
  } catch (err) {
    throw new Error(`Error retrieving order: ${err.message}`);
  }
}

/**
 * Create a new order.
 * @param {Object} fields - Order fields.
 * @returns {Promise<Object>} The created order.
 */
async function create(fields) {
  try {
    const order = new Order(fields);
    await order.save();
    await order.populate('products');
    return order;
  } catch (err) {
    throw new Error(`Error creating order: ${err.message}`);
  }
}

/**
 * Edit an existing order by ID.
 * @param {string} _id - The ID of the order to edit.
 * @param {object} changes - The changes to apply to the order.
 * @returns {Promise<object>} - The updated order.
 */
async function edit(_id, changes) {
  const order = await Order.findById(_id);

  if (!order) {
    throw new Error('Order not found');
  }

  Object.keys(changes).forEach((key) => {
    order[key] = changes[key];
  });

  await order.save();
  return order;
}

/**
 * Delete an order by ID.
 * @param {string} _id - The ID of the order to delete.
 * @returns {Promise<void>}
 */
async function destroy(_id) {
  const result = await Order.deleteOne({ _id });
  if (result.deletedCount === 0) {
    throw new Error('Order not found');
  }
}

module.exports = {
  create,
  get,
  list,
  edit,
  destroy,
};


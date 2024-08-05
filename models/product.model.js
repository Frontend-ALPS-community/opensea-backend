const mongoose = require('mongoose');

const ProductSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter product name'],
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    Timestamp: true,
  }
);

ProductSchema.pre('create', async () => {});

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Product category is required'],
        enum: ['Hair Care', 'Skin Care', 'Styling', 'Beard Care', 'Nail Care', 'Equipment', 'Other'],
        default: 'Hair Care'
    },
    brand: {
        type: String,
        trim: true,
        default: 'Generic'
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: 0
    },
    stockQuantity: {
        type: Number,
        required: [true, 'Stock quantity is required'],
        min: 0,
        default: 0
    },
    lowStockThreshold: {
        type: Number,
        default: 5,
        min: 0
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);

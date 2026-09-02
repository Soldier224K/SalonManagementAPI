const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// @route   GET /api/products
// @desc    Get all salon products / inventory (supports filters: category, lowStock, search)
router.get('/', async (req, res) => {
    try {
        const { category, lowStock, search } = req.query;
        let query = {};

        if (category) {
            query.category = category;
        }

        if (lowStock === 'true') {
            query.$expr = { $lte: ['$stockQuantity', '$lowStockThreshold'] };
        }

        if (search) {
            const escaped = escapeRegex(search.trim());
            query.$or = [
                { name: { $regex: escaped, $options: 'i' } },
                { brand: { $regex: escaped, $options: 'i' } }
            ];
        }

        const products = await Product.find(query).sort({ stockQuantity: 1, name: 1 });
        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/products/:id
// @desc    Get single product by ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// @route   POST /api/products
// @desc    Add a new product
router.post('/', async (req, res) => {
    try {
        const productData = { ...req.body };
        if (productData.isAvailable === undefined && productData.stockQuantity !== undefined) {
            productData.isAvailable = Number(productData.stockQuantity) > 0;
        }
        const product = new Product(productData);
        await product.save();
        res.status(201).json({ success: true, message: 'Product added successfully', data: product });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// @route   PUT /api/products/:id
// @desc    Update product details
router.put('/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.status(200).json({ success: true, message: 'Product updated successfully', data: product });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// @route   PATCH /api/products/:id/stock
// @desc    Adjust product stock quantity
router.patch('/:id/stock', async (req, res) => {
    try {
        const { changeAmount } = req.body;
        if (changeAmount === undefined || isNaN(changeAmount)) {
            return res.status(400).json({ success: false, message: 'changeAmount (number) is required' });
        }

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        product.stockQuantity = Math.max(0, product.stockQuantity + Number(changeAmount));
        product.isAvailable = product.stockQuantity > 0;
        await product.save();

        res.status(200).json({
            success: true,
            message: `Stock updated. Current quantity: ${product.stockQuantity}`,
            data: product
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product
router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.status(200).json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        res.status(error.name === 'CastError' ? 400 : 500).json({ success: false, message: error.message });
    }
});

module.exports = router;

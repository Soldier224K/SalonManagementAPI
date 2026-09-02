const express = require('express');
const router = express.Router();
const Service = require('../models/Service');

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// @route   GET /api/services
// @desc    Get all services (supports filtering by category, targetGender, isActive, maxPrice, search)
router.get('/', async (req, res) => {
    try {
        const { category, targetGender, isActive, maxPrice, minPrice, search } = req.query;
        let query = {};

        if (category) {
            query.category = category;
        }

        if (targetGender) {
            query.targetGender = targetGender;
        }

        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        if (search) {
            const escaped = escapeRegex(search.trim());
            query.$or = [
                { name: { $regex: escaped, $options: 'i' } },
                { description: { $regex: escaped, $options: 'i' } }
            ];
        }

        const services = await Service.find(query).sort({ category: 1, name: 1 });
        res.status(200).json({
            success: true,
            count: services.length,
            data: services
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/services/categories
// @desc    Get all service categories
router.get('/categories', async (req, res) => {
    try {
        const categories = await Service.distinct('category');
        res.status(200).json({ success: true, count: categories.length, data: categories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/services/:id
// @desc    Get single service by ID
router.get('/:id', async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }
        res.status(200).json({ success: true, data: service });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// @route   POST /api/services
// @desc    Create a new service
router.post('/', async (req, res) => {
    try {
        const service = new Service(req.body);
        await service.save();
        res.status(201).json({ success: true, message: 'Service created successfully', data: service });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// @route   PUT /api/services/:id
// @desc    Update service details
router.put('/:id', async (req, res) => {
    try {
        const service = await Service.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }
        res.status(200).json({ success: true, message: 'Service updated successfully', data: service });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// @route   PATCH /api/services/:id/toggle-status
// @desc    Toggle service active status
router.patch('/:id/toggle-status', async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }
        service.isActive = !service.isActive;
        await service.save();
        res.status(200).json({
            success: true,
            message: `Service status updated to ${service.isActive ? 'Active' : 'Inactive'}`,
            data: service
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// @route   DELETE /api/services/:id
// @desc    Delete a service
router.delete('/:id', async (req, res) => {
    try {
        const service = await Service.findByIdAndDelete(req.params.id);
        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }
        res.status(200).json({ success: true, message: 'Service deleted successfully' });
    } catch (error) {
        res.status(error.name === 'CastError' ? 400 : 500).json({ success: false, message: error.message });
    }
});

module.exports = router;

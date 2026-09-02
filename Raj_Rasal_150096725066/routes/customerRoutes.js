const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const Appointment = require('../models/Appointment');
const Bill = require('../models/Bill');

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// @route   GET /api/customers
// @desc    Get all customers (supports search by name, email, phone)
router.get('/', async (req, res) => {
    try {
        const { search, gender } = req.query;
        let query = {};

        if (gender) {
            query.gender = gender;
        }

        if (search) {
            const escaped = escapeRegex(search.trim());
            query.$or = [
                { name: { $regex: escaped, $options: 'i' } },
                { email: { $regex: escaped, $options: 'i' } },
                { phone: { $regex: escaped, $options: 'i' } }
            ];
        }

        const customers = await Customer.find(query).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: customers.length,
            data: customers
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/customers/:id
// @desc    Get single customer by ID
router.get('/:id', async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }
        res.status(200).json({ success: true, data: customer });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// @route   GET /api/customers/:id/appointments
// @desc    Get customer booking / appointment history
router.get('/:id/appointments', async (req, res) => {
    try {
        const appointments = await Appointment.find({ customer: req.params.id })
            .populate('stylist', 'name phone email specialties')
            .populate('services', 'name price durationMinutes category')
            .sort({ appointmentDate: -1 });

        res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/customers/:id/bills
// @desc    Get customer billing / invoice history
router.get('/:id/bills', async (req, res) => {
    try {
        const bills = await Bill.find({ customer: req.params.id })
            .populate('appointment')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: bills.length,
            data: bills
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   POST /api/customers
// @desc    Register a new customer
router.post('/', async (req, res) => {
    try {
        const customer = new Customer(req.body);
        await customer.save();
        res.status(201).json({ success: true, message: 'Customer registered successfully', data: customer });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// @route   PUT /api/customers/:id
// @desc    Update customer details
router.put('/:id', async (req, res) => {
    try {
        const customer = await Customer.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }
        res.status(200).json({ success: true, message: 'Customer updated successfully', data: customer });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// @route   PATCH /api/customers/:id/loyalty
// @desc    Add / adjust loyalty points
router.patch('/:id/loyalty', async (req, res) => {
    try {
        const { points } = req.body;
        if (points === undefined || isNaN(points)) {
            return res.status(400).json({ success: false, message: 'Valid points value required' });
        }

        const customer = await Customer.findById(req.params.id);
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        customer.loyaltyPoints = Math.max(0, customer.loyaltyPoints + Number(points));
        await customer.save();

        res.status(200).json({
            success: true,
            message: `Loyalty points updated to ${customer.loyaltyPoints}`,
            data: customer
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// @route   DELETE /api/customers/:id
// @desc    Delete customer record
router.delete('/:id', async (req, res) => {
    try {
        const customer = await Customer.findByIdAndDelete(req.params.id);
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }
        res.status(200).json({ success: true, message: 'Customer removed successfully' });
    } catch (error) {
        res.status(error.name === 'CastError' ? 400 : 500).json({ success: false, message: error.message });
    }
});

module.exports = router;

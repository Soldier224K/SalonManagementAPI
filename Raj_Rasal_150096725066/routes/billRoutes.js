const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');
const Appointment = require('../models/Appointment');
const Customer = require('../models/Customer');

// @route   GET /api/bills
// @desc    Get all bills (supports filters: paymentStatus, customer, paymentMethod)
router.get('/', async (req, res) => {
    try {
        const { paymentStatus, customer, paymentMethod } = req.query;
        let query = {};

        if (paymentStatus) {
            query.paymentStatus = paymentStatus;
        }

        if (customer) {
            query.customer = customer;
        }

        if (paymentMethod) {
            query.paymentMethod = paymentMethod;
        }

        const bills = await Bill.find(query)
            .populate('customer', 'name email phone loyaltyPoints')
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

// @route   GET /api/bills/:id
// @desc    Get single bill by ID
router.get('/:id', async (req, res) => {
    try {
        const bill = await Bill.findById(req.params.id)
            .populate('customer', 'name email phone loyaltyPoints')
            .populate({
                path: 'appointment',
                populate: [
                    { path: 'stylist', select: 'name phone' },
                    { path: 'services', select: 'name price durationMinutes' }
                ]
            });

        if (!bill) {
            return res.status(404).json({ success: false, message: 'Bill not found' });
        }

        res.status(200).json({ success: true, data: bill });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// @route   POST /api/bills
// @desc    Generate a new bill
router.post('/', async (req, res) => {
    try {
        const { customer, appointment, items, discount = 0, tax = 0, paymentMethod = 'Pending', paymentStatus = 'Pending' } = req.body;

        const customerDoc = await Customer.findById(customer);
        if (!customerDoc) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: 'At least one item is required in the bill' });
        }

        const subtotal = items.reduce((acc, item) => acc + (Number(item.price) * (Number(item.quantity) || 1)), 0);
        const totalAmount = Math.max(0, subtotal - Number(discount) + Number(tax));

        // Generate unique bill number
        const billNumber = `SLN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

        const billData = {
            billNumber,
            customer,
            items,
            subtotal,
            discount,
            tax,
            totalAmount,
            paymentMethod,
            paymentStatus,
            paidAt: paymentStatus === 'Paid' ? new Date() : null
        };

        if (appointment && typeof appointment === 'string' && appointment.trim() !== '') {
            billData.appointment = appointment.trim();
        }

        const bill = new Bill(billData);

        await bill.save();

        // Award loyalty points (1 point per 100 spent if paid)
        if (paymentStatus === 'Paid') {
            const pointsEarned = Math.floor(totalAmount / 100);
            if (pointsEarned > 0) {
                customerDoc.loyaltyPoints = (customerDoc.loyaltyPoints || 0) + pointsEarned;
                await customerDoc.save();
            }
        }

        res.status(201).json({
            success: true,
            message: 'Bill generated successfully',
            data: bill
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// @route   PATCH /api/bills/:id/pay
// @desc    Record payment for a bill
router.patch('/:id/pay', async (req, res) => {
    try {
        const { paymentMethod } = req.body;

        const bill = await Bill.findById(req.params.id);
        if (!bill) {
            return res.status(404).json({ success: false, message: 'Bill not found' });
        }

        if (bill.paymentStatus === 'Paid') {
            return res.status(400).json({ success: false, message: 'This bill is already paid' });
        }

        bill.paymentStatus = 'Paid';
        bill.paymentMethod = paymentMethod || (bill.paymentMethod !== 'Pending' ? bill.paymentMethod : 'Cash');
        bill.paidAt = new Date();

        await bill.save();

        // Award loyalty points to customer
        const customer = await Customer.findById(bill.customer);
        if (customer) {
            const pointsEarned = Math.floor(bill.totalAmount / 100);
            if (pointsEarned > 0) {
                customer.loyaltyPoints = (customer.loyaltyPoints || 0) + pointsEarned;
                await customer.save();
            }
        }

        res.status(200).json({
            success: true,
            message: 'Payment recorded successfully',
            data: bill
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// @route   DELETE /api/bills/:id
// @desc    Delete a bill
router.delete('/:id', async (req, res) => {
    try {
        const bill = await Bill.findByIdAndDelete(req.params.id);
        if (!bill) {
            return res.status(404).json({ success: false, message: 'Bill not found' });
        }
        res.status(200).json({ success: true, message: 'Bill deleted successfully' });
    } catch (error) {
        res.status(error.name === 'CastError' ? 400 : 500).json({ success: false, message: error.message });
    }
});

module.exports = router;

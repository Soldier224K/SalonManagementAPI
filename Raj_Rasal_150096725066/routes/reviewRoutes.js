const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Stylist = require('../models/Stylist');

// @route   GET /api/reviews
// @desc    Get all reviews (supports filtering by stylist or service)
router.get('/', async (req, res) => {
    try {
        const { stylist, service } = req.query;
        let query = {};

        if (stylist) query.stylist = stylist;
        if (service) query.service = service;

        const reviews = await Review.find(query)
            .populate('customer', 'name')
            .populate('stylist', 'name specialties')
            .populate('service', 'name category')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   POST /api/reviews
// @desc    Add a review & update stylist average rating
router.post('/', async (req, res) => {
    try {
        const reviewData = { ...req.body };
        if (!reviewData.stylist || (typeof reviewData.stylist === 'string' && reviewData.stylist.trim() === '')) {
            delete reviewData.stylist;
        }
        if (!reviewData.service || (typeof reviewData.service === 'string' && reviewData.service.trim() === '')) {
            delete reviewData.service;
        }

        const review = new Review(reviewData);
        await review.save();

        // Update stylist rating if review is for stylist
        if (review.stylist) {
            const reviewsForStylist = await Review.find({ stylist: review.stylist });
            const avgRating = (reviewsForStylist.reduce((acc, r) => acc + r.rating, 0) / reviewsForStylist.length).toFixed(1);
            await Stylist.findByIdAndUpdate(review.stylist, { rating: Number(avgRating) });
        }

        res.status(201).json({
            success: true,
            message: 'Review submitted successfully',
            data: review
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete a review
router.delete('/:id', async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);
        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        // Recalculate stylist rating if review was associated with stylist
        if (review.stylist) {
            const remaining = await Review.find({ stylist: review.stylist });
            const avgRating = remaining.length > 0
                ? Number((remaining.reduce((acc, r) => acc + r.rating, 0) / remaining.length).toFixed(1))
                : 5.0;
            await Stylist.findByIdAndUpdate(review.stylist, { rating: avgRating });
        }

        res.status(200).json({ success: true, message: 'Review deleted successfully' });
    } catch (error) {
        res.status(error.name === 'CastError' ? 400 : 500).json({ success: false, message: error.message });
    }
});

module.exports = router;

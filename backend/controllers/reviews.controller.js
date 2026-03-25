const Review = require('../models/Review');
const User = require('../models/User');

// GET /api/reviews
exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    const total = reviews.length;
    const avg = total > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / total).toFixed(1) : 0;
    const distribution = [5, 4, 3, 2, 1].map(star => ({
      star,
      count: reviews.filter(r => r.rating === star).length,
      pct: total > 0 ? Math.round((reviews.filter(r => r.rating === star).length / total) * 100) : 0
    }));
    res.json({ reviews, avg: parseFloat(avg), total, distribution });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// POST /api/reviews
exports.createReview = async (req, res) => {
  try {
    const { rating, title, comment } = req.body;
    if (!rating || !comment) return res.status(400).json({ error: 'Rating and comment are required' });
    const user = await User.findById(req.user.id).select('username profilePhoto');
    if (!user) return res.status(404).json({ error: 'User not found' });

    // one review per user
    const existing = await Review.findOne({ author: req.user.id });
    if (existing) {
      existing.rating = rating;
      existing.title = title || '';
      existing.comment = comment;
      await existing.save();
      return res.json(existing);
    }

    const review = await Review.create({
      author: req.user.id,
      authorName: user.username,
      authorPhoto: user.profilePhoto || '',
      rating: parseInt(rating),
      title: title || '',
      comment,
    });
    res.status(201).json(review);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// POST /api/reviews/:id/helpful
exports.markHelpful = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    const uid = req.user.id;
    const idx = review.helpful.findIndex(h => h.toString() === uid);
    if (idx > -1) review.helpful.splice(idx, 1);
    else review.helpful.push(uid);
    await review.save();
    res.json({ helpful: review.helpful.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// DELETE /api/reviews/:id (admin or author)
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    if (review.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    await review.deleteOne();
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

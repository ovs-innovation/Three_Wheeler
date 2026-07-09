const News = require('../models/news.model');

/**
 * @desc Get all news
 * @route GET /api/news
 * @access Public
 */
const getNews = async (req, res, next) => {
  try {
    const news = await News.find().sort({ date: -1, createdAt: -1 });
    res.status(200).json({
      success: true,
      message: 'News articles retrieved successfully',
      data: news,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get news by ID
 * @route GET /api/news/:id
 * @access Public
 */
const getNewsById = async (req, res, next) => {
  try {
    const news = await News.findOne({ id: req.params.id });
    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News article not found',
        data: null,
        errors: ['News article not found']
      });
    }
    res.status(200).json({
      success: true,
      message: 'News article retrieved successfully',
      data: news,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Create news article
 * @route POST /api/news
 * @access Private (Admin)
 */
const createNews = async (req, res, next) => {
  try {
    const newsData = req.body;

    if (!newsData.id) {
      const count = await News.countDocuments();
      newsData.id = `news-${count + 1}-${Date.now()}`;
    }

    if (!newsData.date) {
      newsData.date = new Date().toISOString().split('T')[0];
    }

    const news = await News.create(newsData);

    res.status(201).json({
      success: true,
      message: 'News article created successfully',
      data: news,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update news article
 * @route PUT /api/news/:id
 * @access Private (Admin)
 */
const updateNews = async (req, res, next) => {
  try {
    const news = await News.findOneAndUpdate({ id: req.params.id }, req.body, {
      new: true,
      runValidators: true
    });

    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News article not found',
        data: null,
        errors: ['News article not found']
      });
    }

    res.status(200).json({
      success: true,
      message: 'News article updated successfully',
      data: news,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Delete news article
 * @route DELETE /api/news/:id
 * @access Private (Admin)
 */
const deleteNews = async (req, res, next) => {
  try {
    const news = await News.findOneAndDelete({ id: req.params.id });

    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News article not found',
        data: null,
        errors: ['News article not found']
      });
    }

    res.status(200).json({
      success: true,
      message: 'News article deleted successfully',
      data: {},
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews
};

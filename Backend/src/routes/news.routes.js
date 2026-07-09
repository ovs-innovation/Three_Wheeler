const express = require('express');
const router = express.Router();
const {
  getNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews
} = require('../controllers/news.controller');
const { protectAdmin } = require('../middleware/auth.middleware');

router.get('/', getNews);
router.get('/:id', getNewsById);

router.post('/', protectAdmin, createNews);
router.put('/:id', protectAdmin, updateNews);
router.delete('/:id', protectAdmin, deleteNews);

module.exports = router;

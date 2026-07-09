const express = require('express');
const router = express.Router();
const {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog
} = require('../controllers/blog.controller');
const { protectAdmin } = require('../middleware/auth.middleware');

router.get('/', getBlogs);
router.get('/:id', getBlogById);

router.post('/', protectAdmin, createBlog);
router.put('/:id', protectAdmin, updateBlog);
router.delete('/:id', protectAdmin, deleteBlog);

module.exports = router;

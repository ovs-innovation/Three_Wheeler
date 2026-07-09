const Blog = require('../models/blog.model');

/**
 * @desc Get all blogs
 * @route GET /api/blogs
 * @access Public
 */
const getBlogs = async (req, res, next) => {
  try {
    const blogs = await Blog.find().sort({ date: -1, createdAt: -1 });
    res.status(200).json({
      success: true,
      message: 'Blog posts retrieved successfully',
      data: blogs,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get blog by ID
 * @route GET /api/blogs/:id
 * @access Public
 */
const getBlogById = async (req, res, next) => {
  try {
    const blog = await Blog.findOne({ id: req.params.id });
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found',
        data: null,
        errors: ['Blog post not found']
      });
    }
    res.status(200).json({
      success: true,
      message: 'Blog post retrieved successfully',
      data: blog,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Create blog post
 * @route POST /api/blogs
 * @access Private (Admin)
 */
const createBlog = async (req, res, next) => {
  try {
    const blogData = req.body;

    if (!blogData.id) {
      const count = await Blog.countDocuments();
      blogData.id = `blog-${count + 1}-${Date.now()}`;
    }

    if (!blogData.date) {
      blogData.date = new Date().toISOString().split('T')[0];
    }

    const blog = await Blog.create(blogData);

    res.status(201).json({
      success: true,
      message: 'Blog post created successfully',
      data: blog,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update blog post
 * @route PUT /api/blogs/:id
 * @access Private (Admin)
 */
const updateBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findOneAndUpdate({ id: req.params.id }, req.body, {
      new: true,
      runValidators: true
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found',
        data: null,
        errors: ['Blog post not found']
      });
    }

    res.status(200).json({
      success: true,
      message: 'Blog post updated successfully',
      data: blog,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Delete blog post
 * @route DELETE /api/blogs/:id
 * @access Private (Admin)
 */
const deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findOneAndDelete({ id: req.params.id });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found',
        data: null,
        errors: ['Blog post not found']
      });
    }

    res.status(200).json({
      success: true,
      message: 'Blog post deleted successfully',
      data: {},
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog
};

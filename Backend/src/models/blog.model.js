const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    image: {
      type: String,
      default: ''
    },
    date: {
      type: String,
      required: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    readTime: {
      type: String,
      default: '5 min read'
    },
    summary: {
      type: String,
      default: ''
    },
    content: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;

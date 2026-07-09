const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema(
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
      default: '3 min read'
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

const News = mongoose.model('News', newsSchema);

module.exports = News;

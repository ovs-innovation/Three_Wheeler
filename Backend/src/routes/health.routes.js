const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend server is healthy and responding',
    data: {
      uptime: process.uptime(),
      timestamp: Date.now(),
      status: 'UP'
    },
    errors: null
  });
});

module.exports = router;

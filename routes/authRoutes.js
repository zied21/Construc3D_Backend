const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');
const { uploadFile } = require('../controllers/uploadController');
router.post('/login', login);
router.post('/upload', uploadFile); 

module.exports = router;
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
   
      const uploadPath = path.join(process.cwd(), 'uploads', 'raw');
      

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { 
          recursive: true,
     
        });
        console.log(`Created directory: ${uploadPath}`);
      }
      
      cb(null, uploadPath);
    } catch (err) {
      console.error('Directory creation error:', err);
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (!token) throw new Error('No token provided');
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      const ext = path.extname(file.originalname);
      cb(null, `${decoded.id}-${uniqueSuffix}${ext}`);
    } catch (err) {
      console.error('Filename generation error:', err);
      cb(err);
    }
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});


exports.uploadFile = (req, res) => {
  upload.single('photo')(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ 
        error: err.message,
        details: err.stack
      });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

  
    fs.access(req.file.path, fs.constants.F_OK, (err) => {
      if (err) {
        console.error('File verification failed:', err);
        return res.status(500).json({ error: 'File save verification failed' });
      }
      
      res.json({ 
        success: true,
        filename: req.file.filename,
        path: req.file.path 
      });
    });
  });
};
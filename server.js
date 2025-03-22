const express = require('express');
const app = express();
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { config, rootDir } = require('./config');

// Ensure required directories exist
if (!fs.existsSync(rootDir)) {
    fs.mkdirSync(rootDir, { recursive: true });
}

if (!fs.existsSync(config.upload.directory)) {
    fs.mkdirSync(config.upload.directory, { recursive: true });
}
const helmet = require('helmet');
const compression = require('compression');

// Configure server timeouts
app.set('keepAliveTimeout', 65000); // 65 seconds
app.set('headersTimeout', 66000); // 66 seconds - slightly higher than keepAliveTimeout
app.set('timeout', 60000); // 60 seconds request timeout

console.log(`Starting server in ${config.server.env} mode...`);

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = config.upload.directory;
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF, DOC, DOCX, JPEG, and PNG files are allowed.'));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: parseInt(config.upload.maxFileSize) || 5 * 1024 * 1024 // 5MB default
    }
});

// Security middleware
app.use(helmet());

// Compression middleware
app.use(compression());

// Basic middleware
app.use(express.json({ limit: config.upload.maxSize }));
app.use(express.urlencoded({ extended: true, limit: config.upload.maxSize }));
app.use(express.static(rootDir, { maxAge: '1d' }));
app.use('/uploads', express.static(path.join(rootDir, config.upload.directory), { maxAge: '1d' }));

// Security headers
app.use((req, res, next) => {
    Object.entries(config.securityHeaders).forEach(([key, value]) => {
        res.setHeader(key, value);
    });
    next();
});

// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', config.cors.origin);
    res.header('Access-Control-Allow-Headers', config.cors.allowedHeaders.join(', '));
    res.header('Access-Control-Allow-Methods', config.cors.methods.join(', '));
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

// Routes - Update these routes
app.get('/', (req, res) => {
    res.sendFile(path.join(rootDir, 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(rootDir, 'admin.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(rootDir, 'hr-dashboard.html'));
});

// API endpoints - Add error handling
app.post('/api/applications', upload.single('resume'), async (req, res) => {
    try {
        // Validate required fields
        const requiredFields = ['fullName', 'email', 'phone', 'position'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({ 
                error: `Missing required fields: ${missingFields.join(', ')}` 
            });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'Resume file is required' });
        }

        // Handle application submission
        res.json({ 
            message: 'Application submitted successfully',
            fileName: req.file.filename
        });
    } catch (error) {
        console.error('Error:', error);
        if (error instanceof multer.MulterError) {
            return res.status(400).json({ error: 'File upload error: ' + error.message });
        }
        res.status(500).json({ error: error.message || 'Failed to submit application' });
    }
});

app.get('/api/applications', (req, res) => {
    // Mock data for demonstration
    const applications = [
        {
            id: 1,
            fullName: 'John Doe',
            position: 'IT Related',
            dateApplied: new Date(),
            status: 'New'
        }
    ];
    res.json(applications);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || config.server.port;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
    console.log(`Server running in ${process.env.NODE_ENV || config.server.env} mode on ${HOST}:${PORT}`);
});
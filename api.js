const express = require('express');
const router = express.Router();
const db = require('./database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        // Create unique filename with original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({ storage: storage });

// Get all applications
// Get all applications with optional filtering
router.get('/applications', async (req, res) => {
    try {
        const { status, position, fromDate, toDate } = req.query;
        
        let sql = 'SELECT * FROM applications';
        const params = [];
        const conditions = [];
        
        if (status) {
            conditions.push('status = ?');
            params.push(status);
        }
        
        if (position) {
            conditions.push('position = ?');
            params.push(position);
        }
        
        if (fromDate) {
            conditions.push('applicationDate >= ?');
            params.push(fromDate);
        }
        
        if (toDate) {
            conditions.push('applicationDate <= ?');
            params.push(toDate);
        }
        
        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }
        
        sql += ' ORDER BY applicationDate DESC';
        
        const [rows] = await db.query(sql, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all status types
router.get('/status-types', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM status_types');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add new status type
router.post('/status-types', async (req, res) => {
    try {
        const { name, description } = req.body;
        
        const [result] = await db.query(
            'INSERT INTO status_types (name, description) VALUES (?, ?)',
            [name, description]
        );
        
        res.json({ 
            message: 'Status type added successfully',
            id: result.insertId 
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get application by email
router.get('/applications/:email', async (req, res) => {
    try {
        const { email } = req.params;
        
        const [rows] = await db.query('SELECT * FROM applications WHERE email = ?', [email]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add new application
router.post('/applications', upload.single('resume'), async (req, res) => {
    try {
        const { name, email, gender, dob, age, address, phone, education, position } = req.body;
        const resumeFilename = req.file ? req.file.filename : null;
        const applicationDate = new Date().toISOString();
        
        const sql = `INSERT INTO applications 
                    (name, email, gender, dob, age, address, phone, education, position, applicationDate, resumeFilename) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        const [result] = await db.query(sql, [name, email, gender, dob, age, address, phone, education, position, applicationDate, resumeFilename]);
        
        res.json({ 
            message: 'Application submitted successfully',
            id: result.insertId 
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update application status
router.put('/applications/:email', async (req, res) => {
    try {
        const { status } = req.body;
        const { email } = req.params;
        
        const [result] = await db.query('UPDATE applications SET status = ? WHERE email = ?', [status, email]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }
        res.json({ message: 'Application updated successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete application
router.delete('/applications/:email', async (req, res) => {
    try {
        const { email } = req.params;
        
        const [result] = await db.query('DELETE FROM applications WHERE email = ?', [email]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }
        res.json({ message: 'Application deleted successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get resume file
router.get('/resume/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(__dirname, 'uploads', filename);
    
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).json({ error: 'Resume file not found' });
    }
});

module.exports = router;
-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS hr_app;
USE hr_app;

-- Create status_types table
CREATE TABLE IF NOT EXISTS status_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
);

-- Insert default status types
INSERT INTO status_types (name, description) VALUES
('New', 'Newly submitted application'),
('Reviewing', 'Application under review'),
('Shortlisted', 'Candidate shortlisted for interview'),
('Rejected', 'Application not selected'),
('Hired', 'Candidate has been hired')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    gender VARCHAR(20),
    dob DATE,
    age INT,
    address TEXT,
    phone VARCHAR(20),
    education TEXT,
    position VARCHAR(100) NOT NULL,
    applicationDate DATETIME NOT NULL,
    status VARCHAR(50) DEFAULT 'New',
    resumeFilename VARCHAR(255),
    FOREIGN KEY (status) REFERENCES status_types(name)
);
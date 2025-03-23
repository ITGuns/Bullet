const mongoose = require('mongoose');
const { config } = require('../config');

// Application Schema with validation
const applicationSchema = new mongoose.Schema({
  fullName: { 
    type: String, 
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long']
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  phone: { 
    type: String, 
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[\d\s-+()]+$/, 'Please enter a valid phone number']
  },
  position: { 
    type: String, 
    required: [true, 'Position is required'],
    trim: true
  },
  resume: { 
    type: String, 
    required: [true, 'Resume file is required']
  },
  coverLetter: { 
    type: String,
    trim: true
  },
  status: { 
    type: String, 
    enum: {
      values: ['pending', 'reviewed', 'interviewed', 'accepted', 'rejected'],
      message: '{VALUE} is not a valid status'
    },
    default: 'pending'
  },
  submittedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add indexes
applicationSchema.index({ email: 1 }, { unique: true });
applicationSchema.index({ status: 1 });

// Middleware to update the updatedAt timestamp
applicationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create the model
const Application = mongoose.model('Application', applicationSchema);

// MongoDB connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.database.uri, config.database.options);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    // Handle application shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
      } catch (err) {
        console.error('Error during MongoDB shutdown:', err);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Initialize database connection
connectDB();

module.exports = { Application, connectDB };
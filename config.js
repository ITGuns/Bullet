require('dotenv').config();
const path = require('path');

const rootDir = process.env.ROOT_DIR || path.resolve(__dirname, 'src');

const config = {
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development'
  },
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development'
  },
  database: {
    client: process.env.DB_CLIENT || 'sqlite3',
    connection: process.env.DATABASE_URL || {
      filename: './data/hr_applications.db'
    }
  },
  cors: {
    origin: process.env.CORS_ORIGIN || ['52.41.36.82', '54.191.253.12', '44.226.122.3'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
  },
  upload: {
    directory: process.env.UPLOAD_DIR || 'uploads',
    maxFileSize: process.env.MAX_FILE_SIZE || '5mb'
  },
  security: {
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'blob:']
        }
      }
    }
  }
};

module.exports = { config, rootDir };
console.log('Root directory:', rootDir);
console.log('Environment:', config.server.env);
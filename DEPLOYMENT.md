# Deployment Guide

## Prerequisites

1. A web server with Node.js installed (v14 or higher)
2. Domain name and SSL certificate
3. PM2 or similar process manager for Node.js

## Deployment Steps

### 1. Server Setup

```bash
# Install Node.js dependencies
npm install --production

# Install PM2 globally
npm install -g pm2
```

### 2. Environment Configuration

1. Copy `.env.example` to `.env`
2. Update the following variables in `.env`:
   - `PORT`: Your desired port (e.g., 80 or 443 for HTTPS)
   - `NODE_ENV`: Set to 'production'
   - `CORS_ORIGIN`: Your domain name
   - `DATABASE_URL`: Your database connection string

### 3. Database Setup

1. Create the `data` directory:
```bash
mkdir data
```

2. Ensure proper permissions for the database directory:
```bash
chmod 755 data
```

### 4. File Upload Directory

1. Create the uploads directory:
```bash
mkdir uploads
```

2. Set proper permissions:
```bash
chmod 755 uploads
```

### 5. Starting the Application

```bash
# Start the application with PM2
pm2 start server.js --name "hr-system"

# Ensure app starts on system reboot
pm2 startup
pm2 save
```

### 6. Nginx Configuration (Recommended)

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 7. SSL Setup

1. Install Certbot
2. Run:
```bash
certbot --nginx -d yourdomain.com
```

### 8. Monitoring

```bash
# Monitor application status
pm2 status

# View logs
pm2 logs hr-system
```

## Maintenance

### Updates

1. Pull latest changes:
```bash
git pull origin main
```

2. Install dependencies:
```bash
npm install --production
```

3. Restart the application:
```bash
pm2 restart hr-system
```

### Backup

Regularly backup the following:
- Database file: `data/hr_applications.db`
- Uploads directory: `uploads/`
- Environment configuration: `.env`

## Security Considerations

1. Ensure all sensitive data is in `.env`
2. Regular security updates:
```bash
npm audit fix
```
3. Monitor application logs for suspicious activity
4. Implement rate limiting if needed
5. Regular backup of database and uploaded files
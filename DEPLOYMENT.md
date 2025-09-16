# 🚀 Deployment Guide

This guide covers how to deploy the TravelAI application in production.

## 📋 Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ (for local development)
- MongoDB (if not using Docker)
- SSL certificates (for HTTPS)

## 🐳 Docker Deployment (Recommended)

### 1. Clone and Setup

```bash
git clone <repository-url>
cd Personalized-Travel-Destination-Recommender
```

### 2. Environment Configuration

```bash
# Copy environment template
cp env.example .env

# Edit configuration
nano .env
```

**Required Environment Variables:**
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `NEXT_PUBLIC_API_URL`: Frontend API URL

### 3. Deploy with Docker

```bash
# Make deployment script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

Or manually:

```bash
# Build and start services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 4. Verify Deployment

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## 🖥️ Manual Deployment

### 1. Backend Setup

```bash
cd server
npm install
npm run build
npm start
```

### 2. Frontend Setup

```bash
cd client
npm install
npm run build
npm start
```

### 3. Database Setup

```bash
# Start MongoDB
mongod

# Seed database
cd server
node seeders/seedDestinations.js
```

## 🔧 Production Configuration

### Nginx Configuration

The included `nginx.conf` provides:
- SSL termination
- Rate limiting
- Static file caching
- Security headers
- Load balancing

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/travelai` |
| `JWT_SECRET` | JWT signing secret | Required |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `production` |
| `REDIS_URL` | Redis connection string | Optional |

### SSL Certificates

Place your SSL certificates in the `ssl/` directory:
- `ssl/cert.pem` - SSL certificate
- `ssl/key.pem` - Private key

## 📊 Monitoring

### Health Checks

- **Backend**: `GET /health`
- **Frontend**: `GET /api/health`

### Logs

```bash
# View all logs
docker-compose -f docker-compose.prod.yml logs -f

# View specific service logs
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
```

### Database Backup

```bash
# Backup MongoDB
docker-compose -f docker-compose.prod.yml exec mongodb mongodump --out /backup

# Restore MongoDB
docker-compose -f docker-compose.prod.yml exec mongodb mongorestore /backup
```

## 🔄 Updates

### Rolling Update

```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

### Zero-Downtime Update

```bash
# Update backend only
docker-compose -f docker-compose.prod.yml up -d --no-deps backend

# Update frontend only
docker-compose -f docker-compose.prod.yml up -d --no-deps frontend
```

## 🛠️ Troubleshooting

### Common Issues

1. **Port conflicts**: Change ports in `docker-compose.prod.yml`
2. **Database connection**: Check MongoDB URI and credentials
3. **SSL errors**: Verify certificate paths and permissions
4. **Memory issues**: Increase Docker memory limits

### Debug Commands

```bash
# Check container status
docker-compose -f docker-compose.prod.yml ps

# Check resource usage
docker stats

# Access container shell
docker-compose -f docker-compose.prod.yml exec backend sh
docker-compose -f docker-compose.prod.yml exec frontend sh

# Check logs
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs frontend
```

## 🔒 Security

### Production Security Checklist

- [ ] Change default passwords
- [ ] Use strong JWT secrets
- [ ] Enable HTTPS
- [ ] Configure firewall rules
- [ ] Regular security updates
- [ ] Monitor logs for suspicious activity
- [ ] Backup data regularly

### Firewall Configuration

```bash
# Allow only necessary ports
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp
ufw enable
```

## 📈 Scaling

### Horizontal Scaling

```yaml
# docker-compose.prod.yml
services:
  backend:
    deploy:
      replicas: 3
  frontend:
    deploy:
      replicas: 2
```

### Load Balancer

Use a load balancer (nginx, HAProxy) to distribute traffic across multiple instances.

## 🆘 Support

For deployment issues:
1. Check logs: `docker-compose -f docker-compose.prod.yml logs`
2. Verify environment variables
3. Check network connectivity
4. Review security settings

## 📝 Notes

- The application uses MongoDB for data storage
- Redis is optional but recommended for caching
- All services run in Docker containers
- Nginx handles reverse proxy and SSL termination
- Health checks ensure service availability

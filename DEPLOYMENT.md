# Deployment Guide

## Prerequisites

- Python 3.8+ with pip
- Node.js and npm (for frontend testing)
- Git
- Docker (optional, for containerized deployment)

## Local Development

### Backend Setup

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the server:**
   ```bash
   python src/app.py
   # or with uvicorn directly:
   uvicorn src.app:app --reload
   ```

3. **Access the application:**
   - Web interface: http://localhost:8000
   - API docs: http://localhost:8000/docs
   - Alternative docs: http://localhost:8000/redoc

### Backend Testing

```bash
# Run all tests
pytest tests/ -v

# Run specific test class
pytest tests/test_app.py::TestSignupForActivity -v

# Run with coverage
pytest tests/ --cov=src --cov-report=html
```

### Frontend Testing

1. **Install Node dependencies:**
   ```bash
   npm install
   ```

2. **Run frontend tests:**
   ```bash
   npm test              # Run once
   npm run test:watch   # Watch mode
   npm run test:coverage # With coverage report
   ```

## Production Deployment

### Option 1: Using Gunicorn (Recommended for Production)

```bash
# Install gunicorn
pip install gunicorn

# Run with gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 src.app:app
```

### Option 2: Using Docker

1. **Create Dockerfile:**
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "src.app:app", "--host", "0.0.0.0", "--port", "8000"]
```

2. **Build and run:**
```bash
docker build -t mergington-api .
docker run -p 8000:8000 mergington-api
```

### Option 3: Using Docker Compose (Multiple Services)

```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - PYTHONUNBUFFERED=1
```

## Environment Variables

Create a `.env` file for configuration:

```env
# Server
HOST=0.0.0.0
PORT=8000
DEBUG=False

# Database (for future use)
DATABASE_URL=postgresql://user:password@localhost:5432/mergington
```

## Performance Optimization

### For Production:

1. **Enable CORS if needed:**
   ```python
   from fastapi.middleware.cors import CORSMiddleware
   
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["*"],
       allow_methods=["*"],
       allow_headers=["*"]
   )
   ```

2. **Add rate limiting:**
   ```bash
   pip install slowapi
   ```

3. **Enable response caching:**
   - Use `Cache-Control` headers
   - Implement Redis caching for frequently accessed data

## Monitoring & Logging

### Structured Logging

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
```

### Health Check Endpoint

```python
@app.get("/health")
def health_check():
    return {"status": "healthy"}
```

## Database Migration (Future)

When moving from in-memory to persistent storage:

```bash
# Install Alembic for migrations
pip install alembic sqlalchemy

# Create migration
alembic revision --autogenerate -m "Initial schema"

# Apply migrations
alembic upgrade head
```

## Scaling Considerations

1. **Horizontal Scaling:**
   - Use load balancer (Nginx, HAProxy)
   - Run multiple API instances
   - Use persistent database instead of in-memory

2. **Vertical Scaling:**
   - Increase worker processes
   - Optimize database queries
   - Add caching layer (Redis)

3. **CI/CD Pipeline:**
   - Automated testing on push
   - Code coverage tracking
   - Automated deployment on merge to main

## Security Checklist

- [ ] Set `DEBUG=False` in production
- [ ] Use HTTPS/SSL certificates
- [ ] Implement authentication/authorization
- [ ] Add rate limiting to prevent abuse
- [ ] Validate all user inputs
- [ ] Use environment variables for secrets
- [ ] Regular security audits
- [ ] Keep dependencies updated

## Backup & Recovery

```bash
# Backup data (when using persistent storage)
pg_dump mergington_db > backup.sql

# Restore from backup
psql mergington_db < backup.sql
```

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 8000
lsof -i :8000

# Kill process
kill -9 <PID>
```

### Import Errors
```bash
# Ensure PYTHONPATH includes src
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
```

### Database Connection Issues
- Verify database is running
- Check connection string in environment variables
- Ensure database user has proper permissions

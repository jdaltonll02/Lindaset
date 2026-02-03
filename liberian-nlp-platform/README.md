# Liberian NLP Platform

A comprehensive web platform for preserving and digitizing Liberian languages through collaborative data collection, translation, and audio recording.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Development Setup](#development-setup)
- [Production Setup](#production-setup)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Useful Commands](#useful-commands)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## 🎯 Project Overview

The Liberian NLP Platform is designed to preserve and digitize the 16+ tribal languages of Liberia through:

- **Collaborative Translation**: Users contribute text translations between Liberian languages and English
- **Audio Recording**: Native speakers record pronunciations and speech samples
- **Quality Control**: Multi-tier review system ensures data accuracy
- **Dataset Generation**: Curated datasets for NLP research and language preservation
- **User Management**: Role-based access control with contributor, reviewer, language lead, admin, and superuser roles

## 🏗️ Architecture

```
Frontend (React + TypeScript)
├── Authentication & Authorization
├── Role-based Dashboard
├── Translation Workspace
├── Audio Recording Studio
└── Admin Management Panel

Backend (Django + DRF)
├── REST API Endpoints
├── User Management
├── Language Models
├── File Storage
└── Email Services

Database Layer
├── PostgreSQL (User data, metadata)
└── MongoDB Atlas (Language content, translations)
```

## ✨ Features

### 🔐 Authentication & Security
- User registration with email verification
- Login with username or email
- Password reset via email
- Two-factor authentication (2FA)
- Role-based access control
- Secure token-based authentication

### 👥 User Roles & Permissions
- **Contributor**: Submit translations and recordings
- **Reviewer**: Review and validate content
- **Language Lead**: Manage specific language content
- **Admin**: Platform administration, content management
- **Superuser**: Full system access, user management

### 🌍 Language Management
- Support for 16+ Liberian languages
- Language family classification
- Endangerment level tracking
- Regional dialect support
- Admin-controlled language addition

### 📝 Content Creation
- Text translation interface
- Audio recording studio
- Quality validation system
- Content moderation tools

### 📊 Admin Dashboard
- User management (create, edit, delete, role changes)
- Language management
- Content moderation
- System analytics
- Security monitoring

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Client-side routing
- **React Query** - Server state management
- **Zustand** - Client state management
- **Tailwind CSS** - Styling
- **Axios** - HTTP client

### Backend
- **Django 4.2** - Web framework
- **Django REST Framework** - API framework
- **PostgreSQL** - Primary database
- **MongoDB Atlas** - Language content storage
- **Django Channels** - WebSocket support
- **Celery** - Background tasks
- **Redis** - Caching and message broker

### Infrastructure
- **Docker** - Containerization
- **Nginx** - Reverse proxy
- **AWS S3** - File storage
- **SMTP** - Email services

## 🚀 Development Setup

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL 14+
- MongoDB Atlas account
- Git

### 1. Clone Repository
```bash
git clone <repository-url>
cd liberian-nlp-platform
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Environment configuration
cp .env.example .env
# Edit .env with your configuration

# Database setup
python manage.py migrate
python manage.py createsuperuser

# Create sample data
python manage.py loaddata fixtures/sample_languages.json

# Start development server
python manage.py runserver
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Environment Variables

#### Backend (.env)
```env
# Django Settings
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/liberian_nlp

# MongoDB Atlas
MONGO_DB_NAME=liberian_nlp
MONGO_HOST=mongodb+srv://user:password@cluster.mongodb.net/
MONGO_USER=your-mongo-user
MONGO_PASSWORD=your-mongo-password

# Email Configuration
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.hostinger.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@domain.com
EMAIL_HOST_PASSWORD=your-email-password
DEFAULT_FROM_EMAIL=noreply@liberian-nlp.com

# File Storage
USE_S3=False
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_STORAGE_BUCKET_NAME=your-bucket
```

#### Frontend (.env)
```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
VITE_APP_NAME=Liberian NLP Platform
```

## 🌐 Production Setup

### 1. Docker Deployment
```bash
# Build and start services
docker-compose up -d

# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Collect static files
docker-compose exec backend python manage.py collectstatic --noinput
```

### 2. Environment Configuration
- Set `DEBUG=False` in backend .env
- Configure production database URLs
- Set up proper CORS settings
- Configure file storage (AWS S3)
- Set up SSL certificates

### 3. Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📚 API Documentation

### Authentication Endpoints
```
POST /api/v1/accounts/login/          - User login
POST /api/v1/accounts/register/       - User registration
POST /api/v1/accounts/logout/         - User logout
POST /api/v1/accounts/forgot-password/ - Password reset request
POST /api/v1/accounts/reset-password/  - Password reset confirmation
```

### Admin Endpoints
```
GET  /api/v1/accounts/api/admin/users/     - List users
POST /api/v1/accounts/api/admin/users/     - Create user
PUT  /api/v1/accounts/api/admin/users/{id}/ - Update user
DELETE /api/v1/accounts/api/admin/users/{id}/ - Delete user

GET  /api/v1/accounts/api/admin/languages/     - List languages
POST /api/v1/accounts/api/admin/languages/     - Create language
PUT  /api/v1/accounts/api/admin/languages/{id}/ - Update language
DELETE /api/v1/accounts/api/admin/languages/{id}/ - Delete language
```

### Language Endpoints
```
GET /api/v1/languages/           - List active languages
GET /api/v1/languages/{id}/      - Get language details
GET /api/v1/languages/stats/     - Language statistics
```

## 🗄️ Database Schema

### User Model
```python
class User(AbstractUser):
    role = CharField(choices=UserRole.choices)
    reputation_score = FloatField(default=0.0)
    preferred_languages = ManyToManyField(Language)
    is_verified = BooleanField(default=False)
    created_at = DateTimeField(auto_now_add=True)
```

### Language Model
```python
class Language(models.Model):
    name = CharField(max_length=100, unique=True)
    iso_code = CharField(max_length=10, unique=True)
    family = CharField(choices=LanguageFamily.choices)
    regions = TextField()
    estimated_speakers = PositiveIntegerField()
    endangerment_level = CharField(choices=ENDANGERMENT_CHOICES)
```

## 🔧 Useful Commands

### Backend Commands
```bash
# Database operations
python manage.py makemigrations
python manage.py migrate
python manage.py flush

# User management
python manage.py createsuperuser
python manage.py create_superuser --username admin --email admin@example.com

# Data management
python manage.py loaddata fixtures/languages.json
python manage.py dumpdata languages > backup.json

# Development
python manage.py runserver
python manage.py shell
python manage.py test

# Production
python manage.py collectstatic
python manage.py check --deploy
```

### Frontend Commands
```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking

# Testing
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

### Docker Commands
```bash
# Development
docker-compose up -d
docker-compose logs -f backend
docker-compose exec backend python manage.py migrate

# Production
docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.prod.yml logs -f
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Backend Server Won't Start
**Problem**: `ModuleNotFoundError` or import errors
**Solution**:
```bash
# Ensure virtual environment is activated
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt

# Check Python version
python --version  # Should be 3.11+
```

#### 2. Database Connection Errors
**Problem**: `django.db.utils.OperationalError`
**Solution**:
```bash
# Check database is running
pg_isready -h localhost -p 5432

# Verify connection settings in .env
# Run migrations
python manage.py migrate
```

#### 3. MongoDB Connection Issues
**Problem**: `MongoEngine connection error`
**Solution**:
- Verify MongoDB Atlas credentials in .env
- Check network access in MongoDB Atlas
- Ensure IP address is whitelisted

#### 4. Email Not Sending
**Problem**: Password reset emails not received
**Solution**:
```bash
# Check email configuration in .env
# For Gmail, use App Password instead of regular password
# Verify SMTP settings with your email provider
```

#### 5. Frontend Build Errors
**Problem**: TypeScript or build errors
**Solution**:
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node.js version
node --version  # Should be 18+

# Run type checking
npm run type-check
```

#### 6. CORS Issues
**Problem**: API requests blocked by CORS
**Solution**:
- Add frontend URL to `CORS_ALLOWED_ORIGINS` in Django settings
- Ensure backend is running on correct port
- Check browser developer tools for specific CORS errors

### Debug Mode

#### Backend Debugging
```python
# In Django settings.py
DEBUG = True
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
    },
}
```

#### Frontend Debugging
```typescript
// Enable React Query DevTools
import { ReactQueryDevtools } from 'react-query/devtools'

// Add to App component
<ReactQueryDevtools initialIsOpen={false} />
```

### Performance Monitoring

#### Backend Performance
```bash
# Install django-debug-toolbar
pip install django-debug-toolbar

# Add to INSTALLED_APPS and middleware
# Monitor database queries and performance
```

#### Frontend Performance
```bash
# Bundle analysis
npm run build
npm run analyze

# Lighthouse audit
npx lighthouse http://localhost:3000
```

## 🤝 Contributing

### Development Workflow
1. Create feature branch from `main`
2. Make changes following code style guidelines
3. Write/update tests
4. Update documentation
5. Submit pull request

### Code Style
- **Backend**: Follow PEP 8, use Black formatter
- **Frontend**: Use ESLint + Prettier configuration
- **Commits**: Use conventional commit messages

### Testing
```bash
# Backend tests
python manage.py test

# Frontend tests
npm run test

# E2E tests
npm run test:e2e
```

---

## 📝 Changelog

### Version 1.0.0 (Current)
- ✅ User authentication and authorization
- ✅ Role-based access control
- ✅ Language management system
- ✅ Admin dashboard with user/language management
- ✅ Email-based password reset
- ✅ Two-factor authentication
- ✅ Modular frontend architecture
- ✅ MongoDB Atlas integration
- ✅ Comprehensive error handling

### Planned Features
- 🔄 Translation workspace
- 🔄 Audio recording studio
- 🔄 Content review system
- 🔄 Dataset export functionality
- 🔄 Advanced analytics dashboard
- 🔄 Mobile responsive design
- 🔄 API rate limiting
- 🔄 Automated testing suite

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Maintainer**: Development Team
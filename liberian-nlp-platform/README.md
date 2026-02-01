# Liberian NLP Platform

A production-grade, modular web platform for building low-resource NLP and Speech datasets for all 16 Liberian tribal languages. This system supports Machine Translation (MT), Automatic Speech Recognition (ASR), Speech Translation, and LLM dataset construction with rigorous quality control and community governance.

## 🎯 Mission

Preserve and digitize Liberian languages through collaborative technology, enabling:
- Academic research on under-resourced languages
- NGO and national language preservation efforts  
- Open dataset release under Creative Commons licensing
- Future model training at scale

## 🏗️ System Architecture

### Backend (Django)
- **Python 3.11** with Django + Django REST Framework
- **PostgreSQL** database with optimized indexing
- **Celery + Redis** for async audio processing
- **S3-compatible storage** (MinIO) for media files
- **JWT authentication** with role-based access control
- **Modular Django apps** for clean separation of concerns

### Frontend (React)
- **React 18** with TypeScript and Vite
- **Tailwind CSS** with Carnegie Mellon inspired design
- **Framer Motion** for smooth animations
- **PWA support** for offline-first functionality
- **Accessible, mobile-first** responsive design

### Key Features
- ✅ **Multi-language support** for all 16 Liberian languages
- ✅ **Three-layer quality control** (automatic, human, governance)
- ✅ **Real-time audio recording** with quality analysis
- ✅ **Collaborative translation** workflows
- ✅ **Reputation-based reviewer system**
- ✅ **Dataset export** in multiple formats (JSON, TSV, Common Voice)
- ✅ **Offline functionality** for low-connectivity environments

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- Redis 6+

### Backend Setup

1. **Clone and setup environment**
```bash
git clone <repository-url>
cd liberian-nlp-platform/backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements/dev.txt
```

2. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your database and Redis settings
```

3. **Database setup**
```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py loaddata fixtures/liberian_languages.json
```

4. **Start services**
```bash
# Terminal 1: Django server
python manage.py runserver

# Terminal 2: Celery worker
celery -A config worker -l info

# Terminal 3: Redis (if not running as service)
redis-server
```

### Frontend Setup

1. **Install dependencies**
```bash
cd ../frontend
npm install
```

2. **Configure environment**
```bash
cp .env.example .env.local
# Edit API URL if needed
```

3. **Start development server**
```bash
npm run dev
```

Visit `http://localhost:3000` to access the platform.

## 📊 Data Models

### Core Entities

**Languages & Orthography**
- 16 Liberian languages with linguistic metadata
- Multiple writing systems and orthographic conventions
- Regional variants and dialectal information

**Text Data**
- Sentences with quality metrics and metadata
- Translation pairs with confidence scoring
- Corpus organization by domain and difficulty

**Audio Data**
- High-quality recordings (16kHz, mono, WAV)
- Automatic quality analysis (SNR, clipping, silence)
- Speaker profiles (anonymized demographics)

**Quality Control**
- Multi-reviewer validation system
- Consensus tracking and dispute resolution
- Automated quality checks and heuristics

## 🔒 Security & Privacy

- **GDPR-compliant** data minimization
- **Pseudonymous contributors** with reputation tracking
- **Explicit consent** for all data usage types
- **CC-BY-4.0 licensing** for open dataset release
- **Role-based permissions** with audit trails

## 🌍 Supported Languages

The platform supports all 16 Liberian tribal languages:

| Language | Family | ISO Code | Speakers | Status |
|----------|--------|----------|----------|---------|
| Bassa | Niger-Congo | bsq | 600K | Active |
| Kpelle | Mande | xpe | 800K | Active |
| Gio | Niger-Congo | aou | 350K | Active |
| Mano | Mande | mev | 400K | Active |
| Krahn | Niger-Congo | krh | 300K | Vulnerable |
| Grebo | Niger-Congo | grb | 400K | Active |
| Vai | Mande | vai | 150K | Active |
| Gola | Niger-Congo | gol | 200K | Vulnerable |
| Kissi | Niger-Congo | kss | 300K | Active |
| Gbandi | Mande | gba | 100K | Endangered |
| Loma | Mande | lom | 180K | Vulnerable |
| Mandingo | Mande | man | 250K | Active |
| Mende | Mande | men | 200K | Active |
| Kru | Kru | kru | 150K | Vulnerable |
| Sapo | Niger-Congo | krn | 50K | Endangered |
| Belleh | Niger-Congo | bom | 30K | Critically Endangered |

## 📈 Quality Metrics

### Automatic Validation
- Language identification confidence
- Text length ratio checks (0.3-3.0x)
- Audio quality analysis (SNR > 10dB)
- Orthographic consistency validation

### Human Review
- Accuracy rating (1-5 scale)
- Fluency assessment
- Cultural appropriateness
- Reviewer confidence scoring

### Consensus System
- Minimum 3 reviews per item
- Weighted voting by reviewer reputation
- Automatic escalation for disputes
- Language lead final approval

## 🔧 API Documentation

### Authentication
```bash
# Register new user
POST /api/v1/accounts/register/
{
  "username": "contributor",
  "email": "user@example.com", 
  "password": "secure_password",
  "preferred_languages": [1, 2, 3]
}

# Login
POST /api/v1/accounts/login/
{
  "username": "contributor",
  "password": "secure_password"
}
```

### Text Data
```bash
# Create translation pair
POST /api/v1/text-data/translation-pairs/
{
  "source_text": "Hello, how are you?",
  "target_text": "Sannu, ina kwana?",
  "source_language_id": 1,
  "target_language_id": 2,
  "corpus_id": 1
}

# Get random sentence for translation
GET /api/v1/text-data/random-sentence/?language=2
```

### Audio Data
```bash
# Upload audio recording
POST /api/v1/audio-data/upload/
Content-Type: multipart/form-data
{
  "audio_file": <file>,
  "language_id": 2,
  "sentence_id": "uuid",
  "transcript": "Spoken text"
}
```

## 🚀 Deployment

### Docker Deployment
```bash
# Build and start all services
docker-compose up -d

# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser
```

### Production Considerations
- Use **PostgreSQL** with connection pooling
- Configure **Redis Cluster** for high availability  
- Set up **S3/MinIO** for scalable file storage
- Enable **SSL/TLS** with proper certificates
- Configure **monitoring** (Prometheus/Grafana)
- Set up **backup strategies** for database and media

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch** (`git checkout -b feature/amazing-feature`)
3. **Follow code standards** (Black, ESLint, TypeScript)
4. **Write tests** for new functionality
5. **Submit pull request** with detailed description

### Code Standards
- **Backend**: Black formatting, type hints, Django best practices
- **Frontend**: ESLint + Prettier, TypeScript strict mode
- **Testing**: 80%+ coverage requirement
- **Documentation**: Docstrings and inline comments

## 📄 License

This project is licensed under **MIT License** for code and **CC-BY-4.0** for datasets.

## 🙏 Acknowledgments

- **Carnegie Mellon University** for design inspiration
- **Liberian language communities** for cultural guidance
- **Mozilla Common Voice** for dataset format standards
- **HuggingFace** for model integration patterns

## 📞 Support

- **Documentation**: [docs.liberian-nlp.org](https://docs.liberian-nlp.org)
- **Issues**: GitHub Issues
- **Community**: Discord Server
- **Email**: support@liberian-nlp.org

---

**Built with ❤️ for Liberian language preservation**
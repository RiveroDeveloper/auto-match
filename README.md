# 🚗 Car Store - AutoMatch

## 🌐 Live Application

**🔗 [View Live Application](http://52.90.19.84)**

- **Frontend**: http://52.90.19.84
- **Backend API**: http://52.90.19.84:8000/car-store/api/v1/
- **API Documentation**: http://52.90.19.84:8000/car-store/api/docs/

## 📦 Description

Car store project (AutoMatch) with React frontend and Django REST API backend. A modern vehicle marketplace application with features including vehicle search, comparison, currency conversion, and internationalization support.

## 🛠️ Technologies

### Frontend
- React 19.x
- Vite (build tool)
- React Router DOM (routing)
- Axios (HTTP client)
- React i18next (internationalization)
- Bootstrap & Tailwind CSS (styling)
- Nginx (production server)

### Backend
- Django 4.2.7
- Django REST Framework 3.14.0
- drf-spectacular (API documentation)
- Django Rosetta (translation management)
- SQLite (development database)
- Gunicorn (production server)
- Docker & Docker Compose (containerization)

### Deployment
- AWS EC2 (cloud hosting)
- Docker (containerization)
- Nginx (reverse proxy & static file serving)

## 🚀 Installation

### Prerequisites
- Node.js 18+ 
- Python 3.8+
- npm or yarn

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
python manage.py makemigrations core
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

## 📝 Development

### Adding new dependencies

#### Frontend
```bash
# Navigate to frontend directory
cd frontend

# Install new dependency
npm install <package>
```

#### Backend
```bash
# Navigate to backend directory
cd backend

# Activate virtual environment
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # macOS/Linux

# Install new dependency
pip install <package>

# Update requirements.txt
pip freeze > requirements.txt
```

### Database Migrations

```bash
# Create new migration after model changes
python manage.py makemigrations

# Apply migrations
python manage.py migrate
```

### Code Formatting

```bash
# Install new Node.js dependency
npm install <package>
```

## 📚 API Documentation

### 🎯 Accessing the API Documentation
Once the backend server is running, you can access the interactive API documentation at:

#### **Swagger UI (Recommended)**
```
http://localhost:8000/api/docs/
```
- **Modern interactive interface**
- **Test endpoints directly in the browser**
- **Automatic code examples**
- **Real-time validation**

#### **ReDoc (Alternative)**
```
http://localhost:8000/api/redoc/
```
- **Clean and professional documentation**
- **Ideal for sharing with developers**
- **Section-based navigation**

#### **OpenAPI Schema (JSON/YAML)**
```
http://localhost:8000/api/schema/
```
- **Complete API schema**
- **Compatible with OpenAPI tools**
- **For automated integrations**

### 🔗 API Endpoints

#### Base URL
```
http://localhost:8000/car-store/api/v1/
```

#### Available Endpoints

**Makes (Car Brands)**
```
GET    /makes/          → List all makes
POST   /makes/          → Create a new make
GET    /makes/{id}/     → Get specific make
PUT    /makes/{id}/     → Update a make
DELETE /makes/{id}/     → Delete a make
```

**Categories**
```
GET    /categories/     → List all categories
POST   /categories/     → Create a new category
GET    /categories/{id}/ → Get specific category
PUT    /categories/{id}/ → Update a category
DELETE /categories/{id}/ → Delete a category
```

**Vehicles**
```
GET    /vehicles/       → List all vehicles
POST   /vehicles/       → Create a new vehicle
GET    /vehicles/{id}/  → Get specific vehicle
PUT    /vehicles/{id}/  → Update a vehicle
DELETE /vehicles/{id}/  → Delete a vehicle

# Custom filters
GET    /vehicles/by_make/?make_id=1     → Vehicles by make
GET    /vehicles/by_category/?category_id=2  → Vehicles by category
GET    /vehicles/search/?text=toyota&category=sedan  → Advanced search
```

**Reviews**
```
GET    /reviews/        → List all reviews
POST   /reviews/        → Create a new review
GET    /reviews/{id}/   → Get specific review
PUT    /reviews/{id}/   → Update a review
DELETE /reviews/{id}/   → Delete a review

# Custom filters
GET    /reviews/by_vehicle/?vehicle_id=1  → Reviews by vehicle
GET    /reviews/by_expert/?expert_id=1    → Reviews by expert
```

### 🔍 Advanced Search

#### Vehicle Search Parameters
```
GET /vehicles/search/?text=toyota&category=sedan&year_min=2020&price_max=30000
```

**Available filters:**
- **`text`**: Search in make and model names
- **`category`**: Filter by exact category name
- **`year_min`**: Minimum year
- **`year_max`**: Maximum year
- **`price_min`**: Minimum price
- **`price_max`**: Maximum price

**Search examples:**
```bash
# Search Toyota Sedans from 2020 onwards
GET /vehicles/search/?text=toyota&category=sedan&year_min=2020

# Search vehicles between $20,000 and $50,000
GET /vehicles/search/?price_min=20000&price_max=50000

# Search vehicles by text only
GET /vehicles/search/?text=civic
```

### 🧪 Testing the API

#### With Swagger UI (Recommended)
1. Go to: `http://localhost:8000/api/docs/`
2. Select the endpoint you want to test
3. Click "Try it out"
4. Fill in parameters if needed
5. Click "Execute"
6. View the response automatically

#### With Postman
1. **Import collection** from OpenAPI schema
2. **Configure environment variables**:
   - `base_url`: `http://localhost:8000`
   - `api_path`: `car-store/api/v1`
3. **Use URLs**: `{{base_url}}/{{api_path}}/makes/`

#### With cURL
```bash
# Get all makes
curl http://localhost:8000/car-store/api/v1/makes/

# Create a new make
curl -X POST http://localhost:8000/car-store/api/v1/makes/ \
  -H "Content-Type: application/json" \
  -d '{"name": "BMW"}'

# Advanced search
curl "http://localhost:8000/car-store/api/v1/vehicles/search/?text=toyota&year_min=2020"
```

#### With Browser
```
http://localhost:8000/car-store/api/v1/makes/
http://localhost:8000/car-store/api/v1/vehicles/
```

## 🚨 Troubleshooting

### Error: "ModuleNotFoundError: No module named 'drf_spectacular'"
**Cause**: Dependencies not installed  
**Solution**: 
```bash
pip install -r requirements.txt
```

### Error: "Dependency on app with no migrations"
**Cause**: Migrations not created  
**Solution**:
```bash
python manage.py makemigrations core
python manage.py migrate
```

### Error: "Page not found" at `/api/docs/`
**Cause**: URLs not configured correctly  
**Solution**: Verify that `drf_spectacular` is in `INSTALLED_APPS`

### Error: "Internal Server Error" in documentation
**Cause**: Incorrect configuration in settings.py  
**Solution**: Verify `SPECTACULAR_SETTINGS` in settings.py

## 🔗 Useful Links

### Production (Live)
- **🌐 Live Application**: http://52.90.19.84
- **📚 API Documentation**: http://52.90.19.84:8000/car-store/api/docs/
- **🔧 Backend API**: http://52.90.19.84:8000/car-store/api/v1/

### Local Development
- **Swagger UI**: `http://localhost:8000/api/docs/`
- **ReDoc**: `http://localhost:8000/api/redoc/`
- **OpenAPI Schema**: `http://localhost:8000/api/schema/`
- **Django Admin**: `http://localhost:8000/admin/`

## 🚀 Deployment

The application is deployed on AWS EC2 using Docker and Docker Compose. For deployment instructions, see the deployment documentation.

### Quick Start with Docker

```bash
# Build and start containers
docker-compose up -d

# Run migrations
docker-compose exec backend python manage.py migrate

# Collect static files
docker-compose exec backend python manage.py collectstatic --noinput

# View logs
docker-compose logs -f
```

## 📋 Features

- ✅ Vehicle search and filtering
- ✅ Vehicle comparison
- ✅ Shopping cart functionality
- ✅ Multi-currency support (USD, COP, EUR)
- ✅ Internationalization (English/Spanish)
- ✅ Responsive design
- ✅ JWT authentication
- ✅ API documentation (Swagger/ReDoc)
- ✅ Report generation (PDF/Excel)
# ITB Tracer Dashboard - Data Request Management System

A comprehensive full-stack web application for managing alumni tracer study data requests at ITB (Institut Teknologi Bandung).

## 🚀 Features

### ✅ Completed Features

#### Backend (Go/Gin)
- **Authentication System**: JWT-based admin authentication
- **Data Request CRUD**: Complete CRUD operations for data requests
- **SQL Query Execution**: Secure SQL query execution with admin privileges  
- **Email Integration**: Email notifications for request status updates
- **Admin Logging**: Comprehensive audit trail for admin actions
- **File Upload/Download**: Support for CSV, JSON, Excel exports

#### Frontend (React/Vite)
- **Admin Dashboard**: Real-time analytics and overview statistics
- **Request Management**: Advanced filtering, search, and pagination
- **Data Preview Component**: Interactive SQL editor with result preview
- **Status Management**: Comprehensive request status workflow
- **Email Manager**: Template-based email notifications
- **Advanced Analytics**: Detailed insights and performance metrics
- **Responsive Design**: Mobile-friendly interface

### 🎯 Key Components

1. **DataPreview Component** (`UC6, UC7, UC13`)
   - Interactive SQL query editor with syntax highlighting
   - Real-time query execution and result preview
   - Multiple view modes (Table, JSON, Chart)
   - Row selection and batch operations
   - CSV/JSON export functionality

2. **StatusManager Component** (`UC10`)
   - Visual status workflow management
   - Admin notes and change tracking
   - Email notification triggers
   - Status history timeline

3. **EmailManager Component** (`UC8, UC9`)
   - Template-based email composition
   - Query result attachments
   - Email history tracking
   - Multiple export formats

4. **AnalyticsDashboard Component** (`UC11`)
   - Real-time request statistics
   - Trend analysis and visualizations
   - Performance metrics
   - Popular data insights

## 🛠️ Technology Stack

### Backend
- **Go 1.23** with Gin web framework
- **PostgreSQL** database with GORM ORM
- **JWT** authentication
- **CORS** enabled for cross-origin requests
- **Godotenv** for environment configuration

### Frontend
- **React 19.1** with modern hooks
- **Vite** for fast development and building
- **React Router** for navigation
- **CodeMirror** for SQL syntax highlighting
- **Responsive CSS** with modern styling

## 📦 Installation & Setup

### Prerequisites
- Go 1.23 or higher
- Node.js 18 or higher
- PostgreSQL 12 or higher

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install Go dependencies**
   ```bash
   go mod download
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432
   POSTGRES_USER=your_postgres_user
   POSTGRES_PASSWORD=your_postgres_password
   POSTGRES_DB=tracer_dashboard
   POSTGRES_SSL_MODE=disable
   
   JWT_SECRET=your_super_secret_jwt_key
   BASE_URL=http://localhost:8080
   PORT=8080
   
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_FROM=your-email@gmail.com
   EMAIL_USERNAME=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   ```

4. **Setup PostgreSQL Database**
   ```sql
   CREATE DATABASE tracer_dashboard;
   CREATE USER your_postgres_user WITH ENCRYPTED PASSWORD 'your_postgres_password';
   GRANT ALL PRIVILEGES ON DATABASE tracer_dashboard TO your_postgres_user;
   ```

5. **Run the backend server**
   ```bash
   go run main.go
   ```
   
   Server will start on `http://localhost:8080`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env`:
   ```env
   VITE_API_URL=http://localhost:8080
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   
   Frontend will start on `http://localhost:5173`

## 🗃️ Database Schema

The application uses the following main tables:

### data_requests
```sql
CREATE TABLE data_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    nim VARCHAR(50) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    format VARCHAR(50) NOT NULL,
    purpose TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    year_from INTEGER,
    year_to INTEGER,
    table_name VARCHAR(255),
    columns TEXT,
    filter_criteria TEXT,
    sql_query TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### admin_logs
```sql
CREATE TABLE admin_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL,
    action VARCHAR(255) NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔗 API Endpoints

### Authentication
- `POST /login` - Admin login

### Data Requests
- `GET /data-requests` - Get all requests
- `GET /data-requests/filter` - Get filtered requests
- `GET /data-requests/:id` - Get request by ID
- `POST /data-requests` - Create new request
- `PUT /data-requests/:id` - Update request
- `DELETE /data-requests/:id` - Delete request

### SQL Operations
- `POST /sql` - Execute SQL query (Admin only)
- `GET /sql/:name` - Get saved query
- `GET /table-info` - Get database table information

### Admin Operations
- `POST /admin-logs` - Create admin log
- `GET /admin-logs` - Get admin logs
- `POST /email` - Send email notification

## 🎨 Component Architecture

### Page Components
- **Dashboard**: Main admin overview with analytics toggle
- **RequestManagement**: Advanced request filtering and management
- **RequestDetail**: Comprehensive request details with tabs
- **Request**: SQL query interface with DataPreview integration
- **Login**: Authentication page

### Shared Components
- **DataPreview**: Interactive SQL editor and result viewer
- **StatusManager**: Request status workflow management
- **EmailManager**: Email composition and sending
- **AnalyticsDashboard**: Advanced analytics and insights

## 🔧 Configuration

### CORS Configuration
The backend is configured to allow cross-origin requests from the frontend:
```go
config.AllowAllOrigins = true
config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE"}
config.AllowHeaders = []string{"Content-Type", "Authorization", "Cookie", "Set-Cookie"}
config.AllowCredentials = true
```

### Security Features
- JWT token authentication
- SQL injection prevention
- Admin-only query execution
- CORS protection
- Environment-based configuration

## 📱 Usage Guide

### For Admins

1. **Login**: Access the admin dashboard at `/login`
2. **Dashboard**: View overview statistics and analytics
3. **Request Management**: 
   - Browse and filter data requests
   - Update request statuses
   - Review request details
4. **Data Preview**: 
   - Execute SQL queries safely
   - Preview and export results
   - Email results to requesters
5. **Analytics**: View detailed insights and trends

### Request Workflow

1. **Pending** → Initial submission
2. **Approved** → Admin approval
3. **In Progress** → Data processing
4. **Completed** → Ready for delivery
5. **Rejected** → Requires revision

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify PostgreSQL is running
   - Check database credentials in `.env`
   - Ensure database exists

2. **CORS Error**
   - Verify backend is running on correct port
   - Check `VITE_API_URL` in frontend `.env`

3. **JWT Token Issues**
   - Check `JWT_SECRET` is set
   - Verify token is being sent in requests

4. **Email Not Sending**
   - Verify SMTP credentials
   - Check email provider settings
   - Ensure app passwords are used for Gmail

## 🚀 Deployment

### Backend Deployment
```bash
# Build the application
go build -o tracer-backend main.go

# Set production environment variables
export GO_ENV=production

# Run the binary
./tracer-backend
```

### Frontend Deployment
```bash
# Build for production
npm run build

# Serve with a static file server
npm run preview
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly
5. Commit changes: `git commit -am 'Add feature'`
6. Push to branch: `git push origin feature-name`
7. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

- **Backend Development**: Go/Gin framework with PostgreSQL
- **Frontend Development**: React with modern component architecture
- **Database Design**: Comprehensive schema for tracer study data
- **UI/UX Design**: Responsive and accessible interface

## 🔮 Future Enhancements

- Real-time notifications with WebSockets
- Advanced data visualization with Chart.js
- File upload for bulk data import
- API rate limiting and caching
- Multi-language support
- Advanced search with Elasticsearch
- Mobile app development
- Data export scheduling

---

For technical support or questions, please create an issue in the repository or contact the development team.
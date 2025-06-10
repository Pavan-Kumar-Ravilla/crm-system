# CRM Backend API

A comprehensive Node.js/Express.js backend API for a Customer Relationship Management (CRM) system with MongoDB database.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Lead Management**: Complete lead lifecycle management with conversion tracking
- **Contact Management**: Contact organization with account relationships
- **Account Management**: Company/organization management with hierarchy support
- **Opportunity Management**: Sales pipeline and forecast management
- **Activity Management**: Task, call, email, and meeting tracking
- **Data Security**: Input validation, rate limiting, and security headers
- **Comprehensive API**: RESTful API with filtering, pagination, and search

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Morgan
- **Password Hashing**: bcryptjs

## 📦 Installation

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit the .env file with your configuration
   nano .env
   ```

4. **Configure Environment Variables**
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/crm-system
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=30d
   CLIENT_URL=http://localhost:3000
   REQUIRE_EMAIL_VERIFICATION=false
   ```

5. **Start MongoDB**
   ```bash
   # Using MongoDB service
   sudo systemctl start mongod
   
   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

6. **Start the server**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

## 🔧 Available Scripts

```bash
# Start in production mode
npm start

# Start in development mode with nodemon
npm run dev

# Run with custom startup script
node scripts/start.js
```

## 🌐 API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `POST /logout` - User logout
- `POST /refresh-token` - Refresh access token
- `GET /me` - Get current user profile
- `PUT /me` - Update user profile
- `PUT /change-password` - Change password
- `POST /forgot-password` - Request password reset
- `PUT /reset-password/:token` - Reset password

### Lead Routes (`/api/leads`)
- `GET /` - Get all leads (with filtering, pagination, search)
- `POST /` - Create new lead
- `GET /:id` - Get lead by ID
- `PUT /:id` - Update lead
- `DELETE /:id` - Delete lead (soft delete)
- `POST /:id/convert` - Convert lead to contact/account/opportunity
- `GET /stats` - Get lead statistics
- `GET /recent` - Get recent leads
- `PUT /bulk-update` - Bulk update leads
- `DELETE /bulk-delete` - Bulk delete leads

### Contact Routes (`/api/contacts`)
- `GET /` - Get all contacts
- `POST /` - Create new contact
- `GET /:id` - Get contact by ID
- `PUT /:id` - Update contact
- `DELETE /:id` - Delete contact
- `GET /stats` - Get contact statistics
- `GET /recent` - Get recent contacts
- `GET /by-account/:accountId` - Get contacts by account

### Account Routes (`/api/accounts`)
- `GET /` - Get all accounts
- `POST /` - Create new account
- `GET /:id` - Get account by ID
- `PUT /:id` - Update account
- `DELETE /:id` - Delete account
- `GET /:id/summary` - Get account summary with related data
- `GET /:id/hierarchy` - Get account hierarchy
- `GET /stats` - Get account statistics

### Opportunity Routes (`/api/opportunities`)
- `GET /` - Get all opportunities
- `POST /` - Create new opportunity
- `GET /:id` - Get opportunity by ID
- `PUT /:id` - Update opportunity
- `DELETE /:id` - Delete opportunity
- `GET /stats` - Get opportunity statistics
- `GET /pipeline` - Get sales pipeline data
- `GET /forecast` - Get forecast data

### Activity Routes (`/api/activities`)
- `GET /` - Get all activities
- `POST /` - Create new activity
- `GET /:id` - Get activity by ID
- `PUT /:id` - Update activity
- `DELETE /:id` - Delete activity
- `PUT /:id/complete` - Mark activity as completed
- `GET /upcoming` - Get upcoming activities
- `GET /overdue` - Get overdue activities
- `GET /stats` - Get activity statistics

## 🔐 Authentication & Authorization

### JWT Token Structure
```javascript
{
  "id": "user_id",
  "email": "user@example.com",
  "role": "admin|manager|sales_rep|user",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### User Roles
- **admin**: Full system access
- **manager**: Team management capabilities
- **sales_rep**: Lead/contact/opportunity management
- **user**: Basic read access

### Protected Routes
All API routes except authentication endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## 📊 Database Schema

### Collections
- **users**: User accounts and authentication
- **leads**: Potential customers
- **contacts**: Individual contacts within accounts
- **accounts**: Companies/organizations
- **opportunities**: Sales opportunities
- **activities**: Tasks, calls, emails, meetings

### Relationships
- Users own Leads, Contacts, Accounts, Opportunities, Activities
- Contacts belong to Accounts
- Opportunities belong to Accounts and have primary Contacts
- Activities can be related to Leads, Contacts, Accounts, or Opportunities

## 🛡️ Security Features

- **Input Validation**: All inputs validated using express-validator
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Security Headers**: Helmet.js for security headers
- **CORS Protection**: Configurable CORS policies
- **Password Hashing**: bcryptjs with salt rounds
- **JWT Security**: Secure token generation and validation
- **Soft Deletes**: Data preservation with isActive flags

## 🧪 Testing

### Health Check
```bash
curl http://localhost:5000/health
```

### API Testing
You can test the API using:
- **Postman**: Import the provided collection
- **cURL**: Command line testing
- **Thunder Client**: VS Code extension

## 🚨 Error Handling

The API uses consistent error response format:
```json
{
  "status": "error",
  "message": "Error description",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 📈 Monitoring & Logging

- **Morgan**: HTTP request logging
- **Console Logging**: Application events and errors
- **Health Endpoint**: Server and database status monitoring

## 🔧 Configuration Options

### Environment Variables
- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: JWT signing secret
- `JWT_EXPIRE`: Token expiration time
- `CLIENT_URL`: Frontend URL for CORS
- `RATE_LIMIT_WINDOW_MS`: Rate limit window
- `RATE_LIMIT_MAX_REQUESTS`: Max requests per window

## 🤝 Contributing

1. Follow the existing code structure
2. Add proper validation for new endpoints
3. Include error handling
4. Update documentation
5. Test thoroughly before committing

## 📝 License

This project is licensed under the ISC License.

## 🆘 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check MONGODB_URI in .env file
   - Verify network connectivity

2. **JWT Token Errors**
   - Check JWT_SECRET is set
   - Verify token format in Authorization header
   - Ensure token hasn't expired

3. **CORS Errors**
   - Add your frontend URL to CLIENT_URL
   - Check CORS configuration in server.js

4. **Validation Errors**
   - Check request payload format
   - Verify required fields are provided
   - Review validation rules in middleware/validation.js

### Getting Help

- Check the logs for detailed error messages
- Use the health endpoint to verify server status
- Review the API documentation for correct usage
- Check MongoDB connection and collections

## 🎯 Performance Tips

- Use pagination for large datasets
- Implement proper indexing in MongoDB
- Use lean() queries for read-only operations
- Optimize database queries with proper filtering
- Monitor memory usage and response times
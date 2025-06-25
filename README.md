# Property Website Backend

A RESTful API for a property website built with Node.js, Express, and MongoDB.

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create environment file:**
   Create a `.env` file in the root directory with the following content:
   ```env
   # MongoDB connection string
   MONGO_URI=mongodb://localhost:27017/propertydb
   
   # Server port
   PORT=5000
   
   # JWT secret key (use a strong secret in production)
   JWT_SECRET=your-super-secret-jwt-key-here
   
   # JWT expiration time
   JWT_EXPIRES_IN=7d
   
   # Environment
   NODE_ENV=development
   ```

3. **Start MongoDB:**
   Make sure MongoDB is running on your system.

4. **Run the application:**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

5. **Access the API:**
   - API Base URL: http://localhost:5000
   - Swagger Documentation: http://localhost:5000/api-docs

## API Endpoints

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/me` - Get current user profile (requires authentication)
- `POST /api/users` - Create new user
- `POST /api/users/login` - Login user (sets JWT token in cookie)
- `POST /api/users/logout` - Logout user (clears JWT token cookie)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user by ID
- `DELETE /api/users` - Delete all users

### Properties
- `GET /api/properties` - Get all properties
- `GET /api/properties/:id` - Get property by ID
- `GET /api/properties/user/:userId` - Get properties by user ID
- `POST /api/properties` - Create property
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property by ID
- `DELETE /api/properties` - Delete all properties

## Authentication & JWT

This API uses JWT (JSON Web Tokens) for authentication:

- When you login successfully, a JWT token is generated containing all user details
- The token is automatically saved in an HTTP-only cookie named `token`
- The token expires in 7 days by default
- Protected routes automatically verify the token from cookies
- Use `/api/users/logout` to clear the token cookie

## Testing with Swagger

1. Open http://localhost:5000/api-docs in your browser
2. Try the endpoints with sample data provided in the schemas
3. For login, use a phone number and password of an existing user
4. After login, the JWT token will be set in cookies automatically
5. Try accessing `/api/users/me` to get current user profile (requires login)

## Sample Data

### Create User:
```json
{
  "name": "John Doe",
  "address": "456 Oak Street, Central City",
  "phoneNumber": "+919876543210",
  "status": "active",
  "profilePic": "https://example.com/profile.jpg",
  "password": "mypassword123"
}
```

### Login:
```json
{
  "phoneNumber": "+919876543210",
  "password": "mypassword123"
}
```

### Create Property:
```json
{
  "title": "Beautiful 3BHK Apartment",
  "description": "Spacious apartment with modern amenities",
  "price": 50000,
  "address": "123 Main Street, Downtown",
  "city": "Mumbai",
  "state": "Maharashtra",
  "country": "India",
  "propertyType": "apartment",
  "bedrooms": 3,
  "bathrooms": 2,
  "area": 1200,
  "images": ["https://example.com/image1.jpg"],
  "user": "USER_ID_HERE"
}
``` # eprop

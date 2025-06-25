const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const userRoutes = require('./routes/user.routes');
const propertyRoutes = require('./routes/property.routes');
const itemRoutes = require('./routes/item.routes');
const adminRoutes = require('./routes/admin.routes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// CORS middleware - must be before other middleware
app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from frontend
  credentials: true, // Allow cookies to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// API routes
app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/admin', adminRoutes);

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/', (req, res) => {
  res.send('API is running');
});

module.exports = app; 
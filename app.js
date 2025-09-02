const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Parse JSON and URL-encoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure CORS
const localFrontend = 'http://localhost:5173';
const deployedFrontend = process.env.FRONTEND_URL; // e.g. https://your-site.netlify.app
const allowedOrigins = [localFrontend].concat(deployedFrontend ? [deployedFrontend] : []);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));

// Import routes
const authRoutes = require('./routes/auth');
const attendanceRoutes = require('./routes/attendance');
const taskRoutes = require('./routes/task');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/task', taskRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('API is running');
});

// Initialize Mongo once per cold start
let isDbConnected = false;
async function ensureDbConnection() {
  if (isDbConnected) return;
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  isDbConnected = true;
}

module.exports = { app, ensureDbConnection };



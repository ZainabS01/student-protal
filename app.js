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
// Directly allow your Netlify frontend URL
const hardcodedFrontend = 'https://jocular-yeot-207524.netlify.app';
const deployedFrontend = process.env.FRONTEND_URL; // optional override via env
const allowedOrigins = [localFrontend, hardcodedFrontend]
  .concat(deployedFrontend ? [deployedFrontend] : []);

app.use(cors({
  origin: function (origin, callback) {
    // Allow same-origin, tools, and direct calls (origin may be undefined)
    if (!origin) return callback(null, true);
    // Allow explicit list
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Allow Netlify preview/branch deploys like https://<site>--<branch>.netlify.app
    if (/\.netlify\.app$/i.test(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
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



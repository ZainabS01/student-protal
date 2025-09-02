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

// CORS - allow all origins when deployed behind same-origin proxy (/api)
app.use(cors());

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

// Error handling middleware
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({ message: 'Something went wrong!' });
});

// Connect to MongoDB once on cold start
if (!mongoose.connection.readyState) {
	mongoose.connect(process.env.MONGO_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => console.log('MongoDB connected'))
	.catch(err => console.error('MongoDB connection error:', err));
}

module.exports = app;



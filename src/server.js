const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Enable CORS (Open for everyone until deployed domain is ready)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
  res.send('Exanor Blog API is running...');
});

// Import Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin/users', require('./routes/users'));
app.use('/api/admin/posts', require('./routes/adminPosts'));
app.use('/api/public/posts', require('./routes/publicPosts'));
app.use('/api/admin/upload', require('./routes/upload'));
app.use('/api', require('./routes/settings'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

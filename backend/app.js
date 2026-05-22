require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const path = require('path');

require('./config/passport');

const authRoutes = require('./routes/auth');
const diseaseRoutes = require('./routes/disease');
const weatherRoutes = require('./routes/weather');
const communityRoutes = require('./routes/community');
const marketplaceRoutes = require('./routes/marketplace');
const chatRoutes = require('./routes/chat');
const cropRoutes = require('./routes/crops');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Trust proxy
app.set('trust proxy', 1);

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Body parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Session (required for Passport)
app.use(session({
  secret: process.env.SESSION_SECRET || 'krishi-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 24 * 60 * 60 * 1000 },
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/disease', diseaseRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/market', marketplaceRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/crops', cropRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', service: 'Krishi Bazar API', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

module.exports = app;

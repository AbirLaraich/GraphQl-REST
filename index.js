const express = require('express');
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const connectDB = require('./db/db');
const annoncesRoutes = require('./routes/AnnonceRoute');
const usersRoutes = require('./routes/UserRoute');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

require('dotenv').config();
connectDB();

const app = express();

const swaggerDocument = YAML.load('api/openapi.yaml');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, function(accessToken, refreshToken, profile, done) {
  const token = jwt.sign({ id: profile.id, email: profile.emails[0].value }, process.env.JWT_SECRET, { expiresIn: '6h' });
  return done(null, { profile, token });
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'default-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.json({ message: 'Authentification réussie', token: req.user.token });
  }
);

app.use('/', annoncesRoutes); 
app.use('/', usersRoutes); 

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message });
});

const serverPort = process.env.PORT || 8080;
app.listen(serverPort, () => {
  console.log('Serveur démarré sur http://localhost:' + serverPort);
});

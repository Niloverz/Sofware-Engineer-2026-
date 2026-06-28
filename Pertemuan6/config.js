const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

const app = express();

// Konfigurasi session
app.use(session({
  secret: 'your-session-secret',
  resave: false,
  saveUninitialized: true
}));

// Inisialisasi passport
app.use(passport.initialize());
app.use(passport.session());

// ==================== STRATEGY GOOGLE ====================
passport.use(new GoogleStrategy({
    clientID: 'GOOGLE_CLIENT_ID',
    clientSecret: 'GOOGLE_CLIENT_SECRET',
    callbackURL: 'http://localhost:3000/auth/callback'
  },
  (accessToken, refreshToken, profile, done) => {
    console.log('Google Profile:', profile.displayName);
    return done(null, profile);
  }
));

// ==================== STRATEGY GITHUB ====================
passport.use(new GitHubStrategy({
    clientID: 'GITHUB_CLIENT_ID',
    clientSecret: 'GITHUB_CLIENT_SECRET',
    callbackURL: 'http://localhost:3000/auth/github/callback'
  },
  (accessToken, refreshToken, profile, done) => {
    console.log('GitHub Profile:', profile.username);
    return done(null, profile);
  }
));

// ==================== STRATEGY FACEBOOK ====================
passport.use(new FacebookStrategy({
    clientID: 'FACEBOOK_APP_ID',
    clientSecret: 'FACEBOOK_APP_SECRET',
    callbackURL: 'http://localhost:3000/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'name', 'email', 'photos']
  },
  (accessToken, refreshToken, profile, done) => {
    console.log('Facebook Profile:', profile.displayName);
    return done(null, profile);
  }
));

// Serialize user ke session
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user dari session
passport.deserializeUser((user, done) => {
  done(null, user);
});

// ==================== ROUTE GOOGLE ====================
// Route untuk memulai login
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

// Route callback (sesuai dengan yang di Google Console)
app.get('/auth/callback',  // ← HAPUS /google
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/profile');
  });

// ==================== ROUTE GITHUB ====================
app.get('/auth/github',
  passport.authenticate('github', { scope: ['user:email'] }));

app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/profile');
  });

// ==================== ROUTE FACEBOOK ====================
app.get('/auth/facebook',
  passport.authenticate('facebook', { scope: ['public_profile'] }));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/profile');
  });

// ==================== ROUTE HOME ====================
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>OAuth Demo</title>
        <style>
            body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }
            button { padding: 10px 20px; margin: 10px; font-size: 16px; cursor: pointer; }
            .google { background-color: #DB4437; color: white; border: none; border-radius: 5px; }
            .github { background-color: #333; color: white; border: none; border-radius: 5px; }
            .facebook { background-color: #4267B2; color: white; border: none; border-radius: 5px; }
            a { text-decoration: none; }
        </style>
    </head>
    <body>
        <h1>OAuth Demo - Lengkap</h1>
        <p>Pilih login dengan provider favorit Anda:</p>
        <br>
        <a href="/auth/google"><button class="google">Login dengan Google</button></a>
        <a href="/auth/github"><button class="github">Login dengan GitHub</button></a>
        <a href="/auth/facebook"><button class="facebook">  Login dengan Facebook</button></a>
    </body>
    </html>
  `);
});

// ==================== ROUTE PROFIL ====================
app.get('/profile', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  
  // Ambil nama dari berbagai kemungkinan provider
  let name = req.user.displayName || 
             req.user.username || 
             (req.user.name && req.user.name.givenName) || 
             req.user.id;
  
  let provider = req.user.provider || 'Unknown';
  let email = req.user.emails ? req.user.emails[0].value : 'Tidak tersedia';
  let avatar = req.user.photos ? req.user.photos[0].value : '';
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Profil</title>
        <style>
            body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }
            .container { max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; }
            img { border-radius: 50%; width: 100px; height: 100px; object-fit: cover; }
            a { color: #4267B2; text-decoration: none; margin: 0 10px; }
        </style>
    </head>
    <body>
        <div class="container">
            ${avatar ? `<img src="${avatar}" alt="Avatar">` : ''}
            <h1>Hello, ${name}!</h1>
            <p>Login berhasil melalui: <strong>${provider}</strong></p>
            <p>Email: ${email}</p>
            <br>
            <a href="/">Kembali ke Home</a> | 
            <a href="/logout">Logout</a>
        </div>
    </body>
    </html>
  `);
});

// ==================== ROUTE LOGOUT ====================
app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error(err);
      return res.redirect('/');
    }
    res.redirect('/');
  });
});

// ==================== JALANKAN SERVER ====================
app.listen(3000, () => {
  console.log('Server berjalan di http://localhost:3000');
  console.log('');
  console.log('Coba akses:');
  console.log('Google:  http://localhost:3000/auth/google');
  console.log('GitHub:  http://localhost:3000/auth/github');
  console.log('Facebook: http://localhost:3000/auth/facebook');
  console.log('');
  console.log('Semua provider sudah terkonfigurasi!');
});
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const app = express();

const PORT = process.env.PORT || 3000;

// Konfigurasi Session
app.use(session({
  secret: "secret-key",
  resave: false,
  saveUninitialized: true
}));

// Inisialisasi Passport
app.use(passport.initialize());
app.use(passport.session());

// Serialize dan Deserialize
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Konfigurasi Google Strategy
passport.use(new GoogleStrategy({
  clientID: "94021442291-fmjr3516khic9headnktk8601cd373hr.apps.googleusercontent.com",
  clientSecret: "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",
  callbackURL: "http://localhost:3000/auth/google/callback"
},
(accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));

// Set view engine
app.set("view engine", "ejs");

// Middleware untuk mengecek login
function isLoggedIn(req, res, next) {
  req.user ? next() : res.redirect("/");
}

// Route Home
app.get("/", (req, res) => {
  res.render("home");
});

// Route ke Google Login
app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Callback dari Google
app.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/profile");
  }
);

// Halaman profil
app.get("/profile", isLoggedIn, (req, res) => {
  res.render("profile", { user: req.user });
});

// Logout
app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

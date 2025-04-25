// Mengimpor library yang diperlukan
const express = require("express"); // Framework untuk membuat server web
const session = require("express-session"); // Middleware untuk mengelola sesi pengguna
const passport = require("passport"); // Library untuk autentikasi
const GoogleStrategy = require("passport-google-oauth20").Strategy; // Strategi Google OAuth 2.0 untuk Passport.js
const app = express(); // Membuat instance aplikasi Express

// Menentukan port server
const PORT = process.env.PORT || 3000; // server 

// Konfigurasi Session
app.use(session({
  secret: "secret-key", // Kunci rahasia untuk mengenkripsi data sesi
  resave: false, // Tidak menyimpan ulang sesi jika tidak ada perubahan
  saveUninitialized: true // Menyimpan sesi yang belum diinisialisasi
}));

// Inisialisasi Passport
app.use(passport.initialize()); // Menginisialisasi Passport.js untuk digunakan dalam aplikasi
app.use(passport.session()); // Menghubungkan Passport.js dengan sesi Express

// Serialize dan Deserialize
passport.serializeUser((user, done) => {
  done(null, user); // Menyimpan data pengguna ke dalam sesi setelah login berhasil
});
passport.deserializeUser((obj, done) => {
  done(null, obj); // Mengambil data pengguna dari sesi untuk digunakan di aplikasi
});

// Konfigurasi Google Strategy
passport.use(new GoogleStrategy({
  clientID: "94021442291-fmjr3516khic9headnktk8601cd373hr.apps.googleusercontent.com", // Client ID dari Google Developer Console
  clientSecret: "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", // Client Secret dari Google Developer Console
  callbackURL: "http://localhost:3000/auth/google/callback" // URL callback setelah login berhasil
},
(accessToken, refreshToken, profile, done) => {
  return done(null, profile); // Mengembalikan data profil pengguna setelah autentikasi berhasil
}));

// Mengatur view engine
app.set("view engine", "ejs"); // Mengatur EJS sebagai view engine untuk merender halaman HTML

// Middleware untuk mengecek apakah pengguna sudah login
function isLoggedIn(req, res, next) {
  req.user ? next() : res.redirect("/"); // Jika pengguna sudah login, lanjutkan ke route berikutnya; jika tidak, arahkan ke halaman beranda
}

// Route Home
app.get("/", (req, res) => {
  res.render("home"); // Merender halaman home.ejs sebagai halaman beranda
});

// Route untuk memulai login dengan Google
app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] }) // Memulai alur OAuth 2.0 dengan meminta akses ke profil dan email pengguna
);

// Route callback dari Google setelah login
app.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }), // Menangani callback dari Google setelah login, arahkan ke halaman beranda jika gagal
  (req, res) => {
    res.redirect("/profile"); // Jika login berhasil, arahkan ke halaman profil
  }
);

// Route untuk halaman profil
app.get("/profile", isLoggedIn, (req, res) => {
  res.render("profile", { user: req.user }); // Merender halaman profile.ejs dengan data pengguna yang login
});

// Route untuk logout
app.get("/logout", (req, res, next) => {
  req.logout((err) => { // Mengakhiri sesi pengguna
    if (err) return next(err); // Jika ada error, teruskan ke middleware berikutnya
    res.redirect("/"); // Arahkan kembali ke halaman beranda setelah logout
  });
});

// Menjalankan server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`); // Menjalankan server di port yang ditentukan
});

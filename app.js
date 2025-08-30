const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const session = require("express-session");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const app = express();
const PORT = 3006;

// ================= Middleware =================
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()); // untuk menerima JSON dari fetch
app.use(express.static(path.join(__dirname, "views"))); // serve file HTML, CSS, JS
app.use(session({
  secret: "secret123",
  resave: false,
  saveUninitialized: true
}));

// ================= Helper =================
function isLoggedIn(req, res, next) {
  if (req.session.userId) next();
  else res.status(401).json({ error: "Harus login" });
}

// ================= Halaman HTML =================
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "views/index.html")));
app.get("/about", (req, res) => res.sendFile(path.join(__dirname, "views/about.html")));
app.get("/news", (req, res) => res.sendFile(path.join(__dirname, "views/news.html")));
app.get("/contact", (req, res) => res.sendFile(path.join(__dirname, "views/contact.html")));
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, "views/login.html")));
app.get("/register", (req, res) => res.sendFile(path.join(__dirname, "views/register.html")));
app.get("/add-news", isLoggedIn, (req, res) => res.sendFile(path.join(__dirname, "views/add-news.html")));

// ================= Register =================
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) return res.status(400).send("Username sudah digunakan");

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({ data: { username, password: hashedPassword, role: "user" } });

    res.redirect("/login");
  } catch (err) {
    console.error(err);
    res.status(500).send("Terjadi kesalahan saat registrasi");
  }
});

// ================= Login =================
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(400).send("Username tidak ditemukan");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send("Password salah");

    req.session.userId = user.id;
    req.session.username = user.username;

    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Terjadi kesalahan saat login");
  }
});

// ================= Logout =================
app.get("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).send("Gagal logout");
    res.redirect("/login");
  });
});

// ================= CRUD Berita =================
app.get("/api/news", async (req, res) => {
  try {
    const news = await prisma.berita.findMany({ orderBy: { tanggal: 'desc' } });
    res.json(news);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/news", isLoggedIn, async (req, res) => {
  const { judul, konten } = req.body;
  try {
    await prisma.berita.create({ data: { judul, konten } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/news/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const { judul, konten } = req.body;
  try {
    await prisma.berita.update({ where: { id: parseInt(id) }, data: { judul, konten } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ================= Kontak =================
app.post("/contact", async (req, res) => {
  const { nama, email, pesan } = req.body;

  if (!nama || !email || !pesan) {
    return res.status(400).json({ error: "Semua field harus diisi" });
  }

  try {
    await prisma.kontak.create({ data: { nama, email, pesan } });
    res.json({ success: true, message: "Pesan berhasil dikirim" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengirim pesan" });
  }
});

// ================= Jalankan Server =================
app.listen(PORT, () => console.log(`Server berjalan di http://localhost:${PORT}`));

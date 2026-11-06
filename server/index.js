require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { MONGODB_URI, JWT_SECRET, PORT = 4000 } = process.env;

if (!JWT_SECRET) {
  console.error('JWT_SECRET is required. Copy .env.example to .env and set it.');
  process.exit(1);
}

const MONGO = MONGODB_URI || 'mongodb://127.0.0.1:27017/nutritrack';
mongoose.connect(MONGO)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => { console.error('MongoDB connection error:', err.message); process.exit(1); });

// ── Models ──────────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, lowercase: true, trim: true },
  passwordHash: String,
  displayName: String,
  profile: { type: Object, default: {} },
}, { timestamps: true });
const User = mongoose.model('User', userSchema);

const snapshotSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  goals: { type: Object, default: {} },
  days: { type: Array, default: [] },
}, { timestamps: true });
const Snapshot = mongoose.model('Snapshot', snapshotSchema);

// ── Helpers ──────────────────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const signToken = (user) => jwt.sign({ sub: String(user._id) }, JWT_SECRET, { expiresIn: '30d' });
const publicUser = (user) => ({ id: String(user._id), email: user.email, displayName: user.displayName });

async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Missing token' });
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ error: 'Invalid token' });
    req.user = user;
    next();
  } catch (_e) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// ── App ──────────────────────────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/auth/signup', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const displayName = String(req.body.displayName || '').trim();
    if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Invalid email' });
    if (password.length < 6 || password.length > 16) return res.status(400).json({ error: 'Password must be 6-16 characters' });
    if (displayName.length < 2) return res.status(400).json({ error: 'Display name must have at least 2 characters' });
    if (await User.findOne({ email })) return res.status(409).json({ error: 'Email already registered' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash, displayName });
    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (_e) {
    res.status(500).json({ error: 'Sign up failed' });
  }
});

app.post('/auth/signin', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (_e) {
    res.status(500).json({ error: 'Sign in failed' });
  }
});

app.get('/me', auth, (req, res) => res.json({ profile: req.user.profile || {} }));
app.put('/me', auth, async (req, res) => {
  req.user.profile = req.body.profile || {};
  await req.user.save();
  res.json({ profile: req.user.profile });
});

app.get('/snapshot', auth, async (req, res) => {
  const snap = await Snapshot.findOne({ userId: req.user._id });
  res.json(snap ? { goals: snap.goals, days: snap.days } : { goals: {}, days: [] });
});
app.put('/snapshot', auth, async (req, res) => {
  await Snapshot.findOneAndUpdate(
    { userId: req.user._id },
    { goals: req.body.goals || {}, days: Array.isArray(req.body.days) ? req.body.days : [] },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  res.json({ ok: true });
});

app.listen(PORT, () => console.log(`NutriTrack API listening on :${PORT}`));

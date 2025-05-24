const express = require('express');
const fs = require('fs');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = './messages.json';
const ACCOUNT_FILE = './account.json';

// Helper baca tulis messages
const readMessages = () => {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return [];
  }
};
const writeMessages = (data) => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

// Helper baca tulis accounts
const readAccounts = () => {
  try {
    return JSON.parse(fs.readFileSync(ACCOUNT_FILE, 'utf8'));
  } catch {
    return [];
  }
};
const writeAccounts = (data) => fs.writeFileSync(ACCOUNT_FILE, JSON.stringify(data, null, 2));

// Validasi username diawali '@'
function isValidUsername(username) {
  return /^@/.test(username);
}

// Validasi password minimal 8 karakter, huruf besar, kecil, simbol
function isValidPassword(password) {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(password)
  );
}

// CRUD messages

// GET all messages
app.get('/messages', (req, res) => {
  const messages = readMessages();
  res.json(messages);
});

// POST new message
app.post('/messages', (req, res) => {
  const messages = readMessages();
  const newMessage = {
    id: uuidv4(),
    username: req.body.username,
    text: req.body.text,
    timestamp: req.body.timestamp,
  };
  messages.push(newMessage);
  writeMessages(messages);
  res.status(201).json(newMessage);
});

// PUT update message by id
app.put('/messages/:id', (req, res) => {
  const messages = readMessages();
  const idx = messages.findIndex(msg => msg.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Message not found' });

  messages[idx].text = req.body.text;
  writeMessages(messages);
  res.json(messages[idx]);
});

// DELETE message by id
app.delete('/messages/:id', (req, res) => {
  let messages = readMessages();
  messages = messages.filter(msg => msg.id !== req.params.id);
  writeMessages(messages);
  res.status(204).send();
});

// REGISTER user baru dengan bcrypt dan validasi
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ error: '⚠️ Username dan password harus diisi.' });

  if (!isValidUsername(username))
    return res.status(400).json({ error: '⚠️ Username harus diawali dengan @.' });

  if (!isValidPassword(password))
    return res.status(400).json({
      error: '⚠️ Password minimal 8 karakter, harus mengandung huruf besar, huruf kecil, dan simbol.',
    });

  const accounts = readAccounts();

  if (accounts.find(acc => acc.username === username))
    return res.status(409).json({ error: '⚠️ Username sudah terdaftar.' });

  const hashedPassword = await bcrypt.hash(password, 10);

  const lastId = accounts.length > 0 ? accounts[accounts.length - 1].id : 0;
  const newUser = {
    id: lastId + 1,
    username,
    password: hashedPassword,
  };

  accounts.push(newUser);
  writeAccounts(accounts);

  res.status(201).json({
    message: '✔️ Akun berhasil dibuat. Mengalihkan ke halaman login dalam 3 detik...',
  });
});

// LOGIN dengan bcrypt verify
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const accounts = readAccounts();

  const user = accounts.find(acc => acc.username === username);
  if (!user) return res.status(401).json({ success: false, message: 'Username atau password salah' });

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid)
    return res.status(401).json({ success: false, message: 'Username atau password salah' });

  const { password: pw, ...userSafe } = user;
  res.json({ success: true, user: userSafe });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

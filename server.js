const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const USERS_PATH = path.join(__dirname, 'users.json');
const TAYIN_PATH = path.join(__dirname, 'tayinTalep.json');

// users.json → GET
app.get('/api/users', (req, res) => {
  console.log('GET /api/users çağrıldı');
  fs.readFile(USERS_PATH, 'utf8', (err, data) => {
    if (err) return res.status(500).send(err);
    res.json(JSON.parse(data));
  });
});

// users.json → POST
app.post('/api/users', (req, res) => {
  console.log('POST /api/users çağrıldı');
  fs.writeFile(USERS_PATH, JSON.stringify(req.body, null, 2), err => {
    if (err) return res.status(500).send(err);
    res.json({ status: 'ok' });
  });
});

// tayinTalep.json → GET tüm talepler
app.get('/api/tayinTalep', (req, res) => {
  console.log('GET /api/tayinTalep çağrıldı');
  fs.readFile(TAYIN_PATH, 'utf8', (err, data) => {
    if (err) return res.status(500).send(err);
    res.json(JSON.parse(data));
  });
});

// tayinTalep.json → POST tüm talepler
app.post('/api/tayinTalep', (req, res) => {
  console.log('POST /api/tayinTalep çağrıldı');
  fs.writeFile(TAYIN_PATH, JSON.stringify(req.body, null, 2), err => {
    if (err) return res.status(500).send(err);
    res.json({ status: 'ok' });
  });
});

// (İsteğe bağlı) belirli sicil için GET ve POST da ekleyebilirsiniz:
// app.get('/api/tayinTalep/:sicil', handler)
// app.post('/api/tayinTalep/:sicil', handler)

// Statik dosyaları sun
app.use(express.static(__dirname));

// Sunucuyu başlat
const PORT = 3000;
app.listen(PORT, () => console.log(`Sunucu http://localhost:${PORT} üzerinde`));

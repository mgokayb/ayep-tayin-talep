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

// tayinTalep.json → POST (merge mantığı ile)
app.post('/api/tayinTalep', (req, res) => {
  console.log('POST /api/tayinTalep çağrıldı, gelen veri:', req.body);

  // Mevcut dosyayı oku
  fs.readFile(TAYIN_PATH, 'utf8', (readErr, content) => {
    if (readErr) return res.status(500).send(readErr);

    let allRequests;
    try {
      allRequests = JSON.parse(content);
    } catch (parseErr) {
      return res.status(500).send(parseErr);
    }

    // Gelen her sicil için talebi ekle/güncelle ya da sil
    Object.entries(req.body).forEach(([sicil, talep]) => {
      if (talep === null) {
        delete allRequests[sicil];
      } else {
        allRequests[sicil] = talep;
      }
    });

    // Birleştirilmiş veriyi tekrar yaz
    fs.writeFile(TAYIN_PATH, JSON.stringify(allRequests, null, 2), writeErr => {
      if (writeErr) return res.status(500).send(writeErr);
      res.json({ status: 'ok' });
    });
  });
});

// Statik dosyaları sun
app.use(express.static(__dirname));

// Sunucuyu başlat
const PORT = 3000;
app.listen(PORT, () => console.log(`Sunucu http://localhost:${PORT} üzerinde`));

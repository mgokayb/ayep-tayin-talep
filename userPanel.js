// userPanel.js

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const sicil = params.get('sicil');
  const ad    = params.get('ad');
  const gorev = params.get('gorev');
  document.getElementById('user-name').textContent = ad;

  const content       = document.getElementById('panel-content');
  const btnProfile    = document.getElementById('btn-profile');
  const btnNewRequest = document.getElementById('btn-new-request');
  const btnMyRequests = document.getElementById('btn-my-requests');
  const btnLogout     = document.getElementById('btn-logout');

  let provinces  = [];
  let myRequests = [];
  let hasRequest = false;

  // Butonlar
  btnProfile.onclick    = showProfile;
  btnNewRequest.onclick = showNewRequestForm;
  btnMyRequests.onclick = showMyRequests;
  btnLogout.onclick     = () => window.location.href = 'index.html';

  // Şehirler
  fetch('provinces.json')
    .then(r => r.json())
    .then(d => provinces = d)
    .catch(console.error);

  // Talepler
  fetch('/api/tayinTalep')
    .then(r => r.json())
    .then(obj => {
      if (obj[sicil]) {
        myRequests = [{ sicil, ...obj[sicil] }];
        hasRequest = true;
      }
    })
    .catch(console.error);

  // PROFİL
  function showProfile() {
    content.innerHTML = `
      <div class="card" style="max-width:400px;">
        <h2>Profil Bilgileri</h2>
        <p><strong>Sicil No:</strong> ${sicil}</p>
        <p><strong>Ad Soyad:</strong> ${ad}</p>
        <p><strong>Görev Yeri:</strong> ${gorev}</p>
        <button id="toggle-pwd" class="btn" style="margin-top:1rem;">Şifre Değiştir</button>
        <form id="pwd-form" style="display:none; margin-top:1rem;">
          <div class="form-group">
            <label for="old-pw">Eski Şifre</label>
            <input type="password" id="old-pw" required>
          </div>
          <div class="form-group">
            <label for="new-pw">Yeni Şifre</label>
            <input type="password" id="new-pw" required>
          </div>
          <button type="submit" class="btn submit-btn">Kaydet</button>
        </form>
      </div>`;
    const toggle = document.getElementById('toggle-pwd');
    const form   = document.getElementById('pwd-form');
    toggle.onclick = () => {
      form.style.display = form.style.display === 'block' ? 'none' : 'block';
    };
    form.onsubmit = e => {
      e.preventDefault();
      alert('Şifre değişikliği backend entegrasyonu gerekli.');
    };
  }

  // YENİ TALEP
  function showNewRequestForm() {
    content.innerHTML = `
      <div class="card" style="max-width:400px;">
        <h2>Yeni Tayin Talebi</h2>
        <form id="new-request-form">
          <div class="form-group">
            <label for="new-sehir">Şehir</label>
            <select id="new-sehir" required></select>
          </div>
          <div class="form-group">
            <label for="talep-tarih">Başvuru Tarihi</label>
            <input type="text" id="talep-tarih" readonly>
          </div>
          <div class="form-group">
            <label for="talep-aciklama">Açıklama</label>
            <textarea id="talep-aciklama" rows="4" required></textarea>
          </div>
          <button type="submit" class="btn submit-btn">Gönder</button>
        </form>
      </div>`;

    // Eğer zaten talep varsa uyar
    if (hasRequest) {
      content.querySelector('form').remove();
      content.querySelector('h2').insertAdjacentHTML('afterend', `
        <p style="color:#c00;">Zaten bir talebiniz var.<br>Lütfen Önceki Taleplerimden düzenleyin.</p>
      `);
      return;
    }

    // Dropdown ve tarih
    const sel = document.getElementById('new-sehir');
    provinces.forEach(p => sel.add(new Option(`${p.plaka} - ${p.il}`, p.il)));
    document.getElementById('talep-tarih').value = new Date().toLocaleString();

    document.getElementById('new-request-form').onsubmit = e => {
      e.preventDefault();
      const sehir    = sel.value;
      const tarihISO = new Date().toISOString();
      const aciklama = document.getElementById('talep-aciklama').value;

      myRequests = [{ sicil, tarih: tarihISO, sehir, aciklama }];
      hasRequest  = true;

      fetch('/api/tayinTalep', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ [sicil]: { tarih: tarihISO, sehir, aciklama } })
      })
      .then(() => showMyRequests())
      .catch(console.error);
    };
  }

  // ÖNCEKİ TALEPLER
  function showMyRequests() {
    content.innerHTML = `
      <div class="card prev-requests-card">
        <h2>Önceki Tayin Taleplerim</h2>
        <div class="request-table-wrapper prev-requests-wrapper">
          <table id="prev-requests-table" class="request-table">
            <thead>
              <tr>
                <th>#</th><th>Tarih</th><th>Şehir</th><th>Açıklama</th><th>İşlem</th>
              </tr>
            </thead>
            <tbody id="req-body"></tbody>
          </table>
        </div>
      </div>`;

    const tbody = document.getElementById('req-body');
    myRequests.forEach((t, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${i+1}</td>
        <td>${new Date(t.tarih).toLocaleDateString()}</td>
        <td>${t.sehir}</td>
        <td>${t.aciklama}</td>
        <td>
          <button class="delete-btn">Sil</button>
          <button class="edit-btn">Düzenle</button>
        </td>`;
      tr.querySelector('.delete-btn').onclick = () => {
        if (!confirm('Talep silinsin mi?')) return;
        hasRequest = false;
        myRequests = [];
        fetch('/api/tayinTalep', {
          method: 'POST',
          headers: { 'Content-Type':'application/json' },
          body: JSON.stringify({ [sicil]: null })
        })
        .then(() => showMyRequests())
        .catch(console.error);
      };
      tr.querySelector('.edit-btn').onclick = () => {
        // Düzenleme için talep formunu aç
        hasRequest = false;
        showNewRequestForm();
        document.getElementById('new-sehir').value      = t.sehir;
        document.getElementById('talep-aciklama').value = t.aciklama;
      };
      tbody.appendChild(tr);
    });
  }

  // Başlangıç
  showProfile();
});

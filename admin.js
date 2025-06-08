// admin.js
console.log('✅ admin.js yüklendi ve çalışıyor.');

const ADMIN_CREDENTIALS = { id: 'admin', pw: '1234' };
let users = [];
let provinces = [];
let tayinObj = {};   // sicil → talep objesi
let dirty = false;

window.addEventListener('DOMContentLoaded', () => {
  // 1) users.json
  fetch('/api/users')
    .then(r => r.json())
    .then(data => { users = data; renderUserTable(); });

  // 2) provinces.json
  fetch('provinces.json')
    .then(r => r.json())
    .then(d => provinces = d)
    .then(renderProvinceOptions);

  // 3) tayinTalep.json
  fetch('/api/tayinTalep')
    .then(r => r.json())
    .then(d => { tayinObj = d; renderUserTable(); });

  // 4) Admin login
  const loginOv = document.getElementById('login-overlay');
  const panelOv = document.getElementById('panel');
  document.getElementById('admin-login-form').onsubmit = e => {
    e.preventDefault();
    if (document.getElementById('admin-id').value === ADMIN_CREDENTIALS.id &&
        document.getElementById('admin-pw').value === ADMIN_CREDENTIALS.pw) {
      loginOv.classList.add('hidden');
      panelOv.classList.remove('hidden');
      renderUserTable();
    } else window.location.href = 'index.html';
  };
  document.getElementById('admin-cancel').onclick = () =>
    window.location.href = 'index.html';

  // 5) Kullanıcı formu
  document.getElementById('user-form').onsubmit = saveUser;
  document.getElementById('user-form-cancel').onclick = () =>
    document.getElementById('user-form').reset();

  // 6) Çıkış: önce users.json sonra tayinTalep.json
  document.getElementById('admin-logout').onclick = () => {
    if (!dirty) return window.location.href = 'index.html';
    if (confirm('Yapılan değişiklikler kaydedilsin mi?')) {
      saveUsersToServer(() => {
        fetch('/api/tayinTalep', {
          method: 'POST',
          headers: { 'Content-Type':'application/json' },
          body: JSON.stringify(tayinObj)
        })
        .then(() => window.location.href = 'index.html');
      });
    } else {
      window.location.href = 'index.html';
    }
  };
});

function renderProvinceOptions() {
  const sel = document.getElementById('new-gorev');
  provinces.forEach(p => {
    const opt = new Option(`${p.plaka} - ${p.il}`, p.il);
    sel.add(opt);
  });
}

function renderUserTable() {
  const tbody = document.getElementById('user-table-body');
  tbody.innerHTML = '';
  users.forEach((u, i) => {
    const hasTalep = !!tayinObj[u.sicil];
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i+1}</td>
      <td>${u.sicil}</td>
      <td>${u.ad}</td>
      <td>${u.gorev}</td>
      <td>
        <button class="view-btn" ${hasTalep?'':'disabled'}>Talep Görüntüle</button>
      </td>
      <td><button class="delete-btn" onclick="deleteUser(${i})">Sil</button></td>
      <td><button class="edit-btn" onclick="startEdit(${i})">Değiştir</button></td>
    `;
    tr.querySelector('.view-btn').onclick = () => openRequestOverlay(u.sicil);
    tbody.appendChild(tr);
  });
}

function deleteUser(idx) {
  const s = users[idx].sicil;
  users.splice(idx,1);
  delete tayinObj[s];
  dirty = true;
  renderUserTable();
}

let editingIndex = null;
function startEdit(idx) {
  editingIndex = idx;
  const u = users[idx];
  document.getElementById('new-sicil').value = u.sicil;
  document.getElementById('new-ad').value    = u.ad;
  document.getElementById('new-gorev').value = u.gorev;
  document.getElementById('new-sifre').value = u.sifre;
  dirty = true;
}

function saveUser(e) {
  e.preventDefault();
  const sicil = document.getElementById('new-sicil').value;
  const ad    = document.getElementById('new-ad').value;
  const gorev = document.getElementById('new-gorev').value;
  const sifre = document.getElementById('new-sifre').value;
  const newU  = { sicil, ad, gorev, sifre };

  if (editingIndex !== null) {
    const old = users[editingIndex].sicil;
    users[editingIndex] = newU;
    if (old !== sicil) {
      tayinObj[sicil] = tayinObj[old] || null;
      delete tayinObj[old];
    }
    editingIndex = null;
  } else {
    users.unshift(newU);
    tayinObj[sicil] = null;
  }

  dirty = true;
  document.getElementById('user-form').reset();
  renderUserTable();
}

function openRequestOverlay(sicil) {
  const t = tayinObj[sicil];
  const overlay = document.getElementById('request-overlay');
  const content  = document.getElementById('request-content');

  content.innerHTML = `
    <p><strong>Başvuru Tarihi:</strong> ${new Date(t.tarih).toLocaleString()}</p>
    <p><strong>Şehir:</strong> ${t.sehir}</p>
    <p><strong>Açıklama:</strong><br>${t.aciklama}</p>
    <div class="form-buttons centered">
      <button class="btn delete-btn" id="del-talep">Sil</button>
      <button class="btn submit-btn" id="edit-talep">Düzenle</button>
    </div>
  `;

  // Sil
  document.getElementById('del-talep').onclick = () => {
    delete tayinObj[sicil];
    dirty = true;
    saveUsersToServer(() => {
      overlay.classList.add('hidden');
      renderUserTable();
    });
  };

  // Düzenle → Form aç
  document.getElementById('edit-talep').onclick = () => {
    const t0 = tayinObj[sicil];
    content.innerHTML = `
      <h2>Talep Düzenle</h2>
      <form id="edit-request-form">
        <div class="form-group">
          <label>Başvuru Tarihi</label>
          <input type="text" value="${new Date(t0.tarih).toLocaleDateString()}" disabled>
        </div>
        <div class="form-group">
          <label for="edit-sehir">Şehir</label>
          <select id="edit-sehir"></select>
        </div>
        <div class="form-group">
          <label for="edit-aciklama">Açıklama</label>
          <textarea id="edit-aciklama" rows="4">${t0.aciklama}</textarea>
        </div>
        <div class="form-buttons centered">
          <button type="button" class="btn cancel-btn" id="cancel-edit">İptal</button>
          <button type="submit" class="btn submit-btn">Kaydet</button>
        </div>
      </form>
    `;

    // Şehirler
    const selEdit = document.getElementById('edit-sehir');
    provinces.forEach(p => selEdit.add(new Option(`${p.plaka} - ${p.il}`, p.il)));
    selEdit.value = t0.sehir;

    // İptal
    document.getElementById('cancel-edit').onclick = () =>
      openRequestOverlay(sicil);

    // Kaydet
    document.getElementById('edit-request-form').onsubmit = e => {
      e.preventDefault();
      const yeniSehir     = selEdit.value;
      const yeniAciklama  = document.getElementById('edit-aciklama').value;
      tayinObj[sicil] = { tarih: t0.tarih, sehir: yeniSehir, aciklama: yeniAciklama };
      dirty = true;
      saveUsersToServer(() => {
        overlay.classList.add('hidden');
        renderUserTable();
      });
    };
  };

  // Kapat
  document.getElementById('close-request').onclick = () =>
    overlay.classList.add('hidden');

  overlay.classList.remove('hidden');
}

function saveUsersToServer(callback) {
  fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify(users)
  })
  .then(() => {
    console.log('✅ users.json güncellendi');
    if (callback) callback();
  })
  .catch(err => console.error('Kullanıcı kaydetme hatası:', err));
}

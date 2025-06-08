// script.js
console.log('✅ script.js yüklendi ve çalışıyor.');

document.addEventListener('DOMContentLoaded', () => {
  // 1) Responsive navbar toggle (index ve login sayfalarında)
  const menuToggle = document.querySelector('.menu-toggle');
  const navItems   = document.querySelector('.nav-items');
  if (menuToggle && navItems) {
    menuToggle.addEventListener('click', () => {
      navItems.classList.toggle('open');
    });
  }

  // 2) Eğer index.html'deyse (table-talepler var)
  if (document.getElementById('table-talepler')) {
    loadTalepler();
    loadUsers();
    // Giriş Yap butonu index sayfasında login.html'e götürsün
    document.querySelector('.login-btn').addEventListener('click', () => {
      window.location.href = 'login.html';
    });
    return;
  }

  // 3) Eğer login.html'deyse (.login-form var)
  const loginForm = document.querySelector('.login-form');
  if (loginForm) {
    let users = [];
    fetch('users.json')
      .then(res => res.json())
      .then(data => users = data)
      .catch(err => console.error('Kullanıcı yüklenemedi:', err));

    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      const sicil = document.getElementById('tc-no').value.trim();
      const sifre = document.getElementById('uyap-sifre').value;
      const user  = users.find(u => u.sicil === sicil);

      if (!user) {
        alert('Sicil numarası bulunamadı.');
        return;
      }
      if (user.sifre !== sifre) {
        alert('Şifre hatalı.');
        return;
      }

      // Başarılıysa userPanel.html'e yönlendir
      const params = new URLSearchParams({
        sicil: user.sicil,
        ad:    user.ad,
        gorev: user.gorev
      });
      window.location.href = `userPanel.html?${params.toString()}`;
    });

    // İptal butonu index'e dönsün
    loginForm.querySelector('.cancel-btn').addEventListener('click', () => {
      window.location.href = 'index.html';
    });
    return;
  }

  // 4) Diğer sayfalarda (ör. userPanel.html, adminPanel.html) script burada çalışmaz
});

// Tablo doldurma fonksiyonları
function loadTalepler() {
  fetch('/api/tayinTalep')
    .then(res => res.json())
    .then(obj => {
      const tbody = document.querySelector('#table-talepler tbody');
      tbody.innerHTML = '';
      let i = 1;
      for (const [sicil, t] of Object.entries(obj)) {
        if (!t) continue;
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${i++}</td>
          <td>${sicil}</td>
          <td>${t.sehir}</td>
          <td>${t.aciklama}</td>
          <td>${new Date(t.tarih).toLocaleDateString()}</td>
        `;
        tbody.appendChild(tr);
      }
    })
    .catch(err => console.error('Talepler yüklenirken hata:', err));
}

function loadUsers() {
  fetch('/api/users')
    .then(res => res.json())
    .then(arr => {
      const tbody = document.querySelector('#table-users tbody');
      tbody.innerHTML = '';
      arr.forEach((u, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${idx + 1}</td>
          <td>${u.sicil}</td>
          <td>${u.gorev}</td>
        `;
        tbody.appendChild(tr);
      });
    })
    .catch(err => console.error('Kullanıcılar yüklenirken hata:', err));
}

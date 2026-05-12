const API_BASE = 'http://localhost:3000/api';

// Jika sudah login, langsung ke app
if (localStorage.getItem('token')) {
  window.location.href = 'app.html';
}

// ── Tab Switcher ─────────────────────────────────────────
const ACTIVE_TAB   = ['flex-1','py-2.5','text-sm','font-semibold','rounded-xl','transition-all','duration-300','text-white','bg-gradient-to-r','from-violet-600','to-purple-600','shadow-lg','shadow-violet-500/20'];
const INACTIVE_TAB = ['flex-1','py-2.5','text-sm','font-semibold','rounded-xl','transition-all','duration-300','text-white/50','hover:text-white/80'];

function setTabActive(btn) {
  btn.className = ACTIVE_TAB.join(' ');
}
function setTabInactive(btn) {
  btn.className = INACTIVE_TAB.join(' ');
}

function switchTab(tab) {
  const loginForm    = document.getElementById('form-login');
  const registerForm = document.getElementById('form-register');
  const tabLogin     = document.getElementById('tab-login');
  const tabRegister  = document.getElementById('tab-register');

  clearAlert();

  if (tab === 'login') {
    loginForm.style.display    = 'block';
    registerForm.style.display = 'none';
    setTabActive(tabLogin);
    setTabInactive(tabRegister);
  } else {
    loginForm.style.display    = 'none';
    registerForm.style.display = 'block';
    setTabActive(tabRegister);
    setTabInactive(tabLogin);
  }
}

// ── Alert Helpers ────────────────────────────────────────
function showAlert(message, type = 'error') {
  const el = document.getElementById('auth-alert');
  el.textContent = message;
  el.className = type === 'error'
    ? 'block mb-6 px-4 py-3 rounded-xl text-sm font-bold bg-red-50 border border-red-100 text-red-600'
    : 'block mb-6 px-4 py-3 rounded-xl text-sm font-bold bg-emerald-50 border border-emerald-100 text-emerald-600';
}

function clearAlert() {
  const el = document.getElementById('auth-alert');
  el.className = 'hidden mb-6 px-4 py-3 rounded-xl text-sm font-medium';
}

// ── Login ────────────────────────────────────────────────
async function handleLogin(e) {
  e.preventDefault();
  clearAlert();

  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  const btn = document.getElementById('btn-login');

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Memproses...';

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      showAlert(data.message || 'Login gagal.');
      return;
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('username', data.user.username);
    window.location.href = 'app.html';
  } catch {
    showAlert('Tidak dapat terhubung ke server. Pastikan server berjalan.');
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Masuk';
  }
}

// ── Register ─────────────────────────────────────────────
async function handleRegister(e) {
  e.preventDefault();
  clearAlert();

  const username = document.getElementById('reg-username').value.trim();
  const password = document.getElementById('reg-password').value;
  const confirm = document.getElementById('reg-confirm').value;
  const btn = document.getElementById('btn-register');

  if (password !== confirm) {
    showAlert('Password dan konfirmasi password tidak cocok.');
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Mendaftarkan...';

  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      showAlert(data.message || 'Registrasi gagal.');
      return;
    }

    showAlert('Registrasi berhasil! Silakan masuk dengan akun baru Anda.', 'success');
    
    // Kosongkan form
    document.getElementById('reg-username').value = '';
    document.getElementById('reg-password').value = '';
    document.getElementById('reg-confirm').value = '';

    // Pindah ke tab login setelah 2 detik
    setTimeout(() => {
      toggleAuth('login');
    }, 2000);
  } catch {
    showAlert('Tidak dapat terhubung ke server. Pastikan server berjalan.');
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Daftar Sekarang';
  }
}

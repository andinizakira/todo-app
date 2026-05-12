const API_BASE = 'http://localhost:3000/api';

// ── Auth Check ───────────────────────────────────────────
const token = localStorage.getItem('token');
const username = localStorage.getItem('username');

if (!token) {
  window.location.href = 'index.html';
}

document.getElementById('header-username').textContent = username || 'User';
document.getElementById('sidebar-username').textContent = username || 'User';
document.getElementById('greeting-text').textContent = `Hai, ${username}! 👋`;
document.getElementById('user-avatar-side').textContent = (username || 'U')[0].toUpperCase();

// ── State ────────────────────────────────────────────────
let allTasks = [];
let currentFilter = 'all';

// ── API Helper ───────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  if (res.status === 401) {
    logout();
    return null;
  }

  return res;
}

// ── Logout ───────────────────────────────────────────────
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  window.location.href = 'index.html';
}

// ── Toast ────────────────────────────────────────────────
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');

  const styles = {
    success: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
    error:   'bg-red-500/20 border-red-500/40 text-red-300',
    info:    'bg-violet-500/20 border-violet-500/40 text-violet-300',
  };
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };

  toast.className = `pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-xl text-sm font-medium shadow-2xl ${styles[type] || styles.info}`;
  toast.style.animation = 'slideInRight 0.3s ease forwards';
  toast.innerHTML = `<span class="text-base">${icons[type] || '💬'}</span><span>${message}</span>`;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.3s ease forwards';
    setTimeout(() => toast.remove(), 280);
  }, 2800);
}

// ── Filter ───────────────────────────────────────────────
function setFilter(filter) {
  currentFilter = filter;

  const activeClass = ['bg-violet-600', 'text-white', 'shadow-lg', 'shadow-violet-500/20'];
  const inactiveClass = ['text-white/40', 'hover:text-white'];
  
  const sideActiveClass = ['sidebar-active'];
  const sideInactiveClass = ['text-white/50', 'hover:text-white', 'hover:bg-white/5'];

  const titles = { all: 'Semua Tugas', active: 'Dalam Proses', done: 'Tugas Selesai' };
  document.getElementById('list-title').textContent = titles[filter];

  ['all', 'active', 'done'].forEach(f => {
    // Top bar buttons
    const btn = document.getElementById(`filter-${f}`);
    if (btn) {
      if (f === filter) {
        btn.className = `px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeClass.join(' ')}`;
      } else {
        btn.className = `px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${inactiveClass.join(' ')}`;
      }
    }

    // Sidebar buttons
    const sideBtn = document.getElementById(`filter-${f}-side`);
    if (sideBtn) {
      if (f === filter) {
        sideBtn.className = `w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:bg-white/5 ${sideActiveClass.join(' ')}`;
      } else {
        sideBtn.className = `w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${sideInactiveClass.join(' ')}`;
      }
    }
  });

  renderTasks();
}

// ── Stats ────────────────────────────────────────────────
function updateStats() {
  const total = allTasks.length;
  const done  = allTasks.filter(t => t.is_completed === 2).length;
  const active = allTasks.filter(t => t.is_completed === 1).length;

  animateNumber('stat-total', total);
  animateNumber('stat-active', active);
  animateNumber('stat-done', done);
  
  // Update banner text
  document.getElementById('stat-active-banner').textContent = `${active} tugas sedang dikerjakan`;
}

function animateNumber(id, target) {
  const el = document.getElementById(id);
  const current = parseInt(el.textContent) || 0;
  if (current === target) return;
  const step = target > current ? 1 : -1;
  let val = current;
  const interval = setInterval(() => {
    val += step;
    el.textContent = val;
    if (val === target) clearInterval(interval);
  }, 40);
}

// ── Format Date ──────────────────────────────────────────
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ── Escape HTML ──────────────────────────────────────────
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Render Tasks ─────────────────────────────────────────
function renderTasks() {
  const list = document.getElementById('task-list');
  const searchQuery = document.getElementById('search-tasks').value.toLowerCase();

  let tasks = allTasks;
  
  // Apply Search
  if (searchQuery) {
    tasks = tasks.filter(t => 
      t.title.toLowerCase().includes(searchQuery) || 
      (t.description && t.description.toLowerCase().includes(searchQuery))
    );
  }

  // Apply Filter
  if (currentFilter === 'active') tasks = tasks.filter(t => t.is_completed === 1);
  if (currentFilter === 'done')   tasks = tasks.filter(t => t.is_completed === 2);

  if (tasks.length === 0) {
    const msgs = {
      all:    { icon: '📋', text: searchQuery ? 'Tidak ada tugas yang cocok.' : 'Belum ada tugas. Tambahkan tugas pertama Anda!' },
      active: { icon: '🎉', text: searchQuery ? 'Tidak ada tugas aktif yang cocok.' : 'Semua tugas sudah selesai! Keren banget!' },
      done:   { icon: '📌', text: searchQuery ? 'Tidak ada tugas selesai yang cocok.' : 'Belum ada tugas yang selesai.' },
    };
    const m = msgs[currentFilter];
    list.innerHTML = `
      <div class="flex flex-col items-center justify-center py-20 text-center">
        <div class="text-6xl mb-4">${m.icon}</div>
        <p class="text-white/30 text-sm font-medium">${m.text}</p>
      </div>`;
    return;
  }

  list.innerHTML = tasks.map(task => {
    const isDone = task.is_completed === 2;
    const isProgress = task.is_completed === 1;
    
    let statusLabel = 'Todo';
    let statusClass = 'bg-white/5 text-white/40 border-white/10';
    let icon = '⭕';
    
    if (isProgress) {
      statusLabel = 'In Progress';
      statusClass = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      icon = '⚡';
    } else if (isDone) {
      statusLabel = 'Completed';
      statusClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      icon = '✅';
    }

    return `
    <div class="task-enter group relative bg-white/5 border ${isDone ? 'border-emerald-500/20 opacity-70' : isProgress ? 'border-amber-500/30' : 'border-white/10 hover:border-violet-500/30'} rounded-2xl p-4 transition-all duration-200" id="task-${task.id}">
      <div class="flex items-start gap-4">

        <!-- Status Cycle Button -->
        <div class="pt-0.5 flex-shrink-0">
          <button onclick="toggleTask(${task.id})" 
            class="w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all duration-300 ${isDone ? 'bg-emerald-500 border-transparent shadow-lg shadow-emerald-500/20' : isProgress ? 'bg-amber-500 border-transparent shadow-lg shadow-amber-500/20' : 'border-white/10 hover:border-violet-500 bg-white/5'}">
            <span class="text-lg">${icon}</span>
          </button>
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <div class="task-view">
            <div class="flex items-center gap-2 mb-1">
              <span class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${statusClass}">${statusLabel}</span>
              <p class="text-sm font-semibold text-white ${isDone ? 'line-through text-white/40' : ''} truncate">${escapeHtml(task.title)}</p>
            </div>
            ${task.description ? `<p class="text-xs text-white/40 mb-2 line-clamp-2">${escapeHtml(task.description)}</p>` : ''}
            <p class="text-xs text-white/25 flex items-center gap-1"><span>📅</span> ${formatDate(task.created_at)}</p>
          </div>

          <!-- Edit Form (hidden) -->
          <div class="task-edit-form" id="edit-form-${task.id}">
            <input class="w-full bg-white/5 border border-white/10 focus:border-violet-500 text-white placeholder-white/20 rounded-xl px-3 py-2 text-sm outline-none transition-all duration-200 mb-2 focus:ring-2 focus:ring-violet-500/20"
              type="text" id="edit-title-${task.id}" value="${escapeHtml(task.title)}" placeholder="Judul tugas" />
            <textarea class="w-full bg-white/5 border border-white/10 focus:border-violet-500 text-white placeholder-white/20 rounded-xl px-3 py-2 text-sm outline-none transition-all duration-200 mb-3 resize-none focus:ring-2 focus:ring-violet-500/20"
              id="edit-desc-${task.id}" rows="2" placeholder="Deskripsi (opsional)">${escapeHtml(task.description || '')}</textarea>
            <div class="flex gap-2">
              <button onclick="saveEdit(${task.id})"
                class="px-4 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500 transition-all duration-200">
                Simpan
              </button>
              <button onclick="cancelEdit(${task.id})"
                class="px-4 py-1.5 rounded-lg text-xs font-semibold bg-white/5 border border-white/10 text-white/50 hover:text-white transition-all duration-200">
                Batal
              </button>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="task-actions flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 flex-shrink-0">
          <button onclick="startEdit(${task.id})" title="Edit tugas"
            class="w-8 h-8 rounded-lg bg-white/5 border border-white/10 hover:bg-violet-500/20 hover:border-violet-500/40 flex items-center justify-center text-sm transition-all duration-200">
            ✏️
          </button>
          <button onclick="deleteTask(${task.id})" title="Hapus tugas"
            class="w-8 h-8 rounded-lg bg-white/5 border border-white/10 hover:bg-red-500/20 hover:border-red-500/40 flex items-center justify-center text-sm transition-all duration-200">
            🗑️
          </button>
        </div>

      </div>
    </div>
    `;
  }).join('');
}

// ── Load Tasks ───────────────────────────────────────────
async function loadTasks() {
  try {
    const res = await apiFetch('/tasks');
    if (!res) return;
    const data = await res.json();
    allTasks = Array.isArray(data) ? data : [];
    updateStats();
    renderTasks();
  } catch {
    showToast('Gagal memuat tugas dari server.', 'error');
  }
}

// ── Add Task ─────────────────────────────────────────────
async function addTask() {
  const titleInput = document.getElementById('input-title');
  const descInput  = document.getElementById('input-desc');
  const title = titleInput.value.trim();
  const description = descInput.value.trim();

  if (!title) {
    showToast('Judul tugas tidak boleh kosong!', 'error');
    titleInput.focus();
    return;
  }

  try {
    const res = await apiFetch('/tasks', {
      method: 'POST',
      body: JSON.stringify({ title, description }),
    });
    if (!res) return;
    const newTask = await res.json();
    if (!res.ok) { showToast(newTask.message || 'Gagal menambahkan tugas.', 'error'); return; }

    allTasks.unshift(newTask);
    titleInput.value = '';
    descInput.value = '';
    updateStats();
    renderTasks();
    showToast('Tugas berhasil ditambahkan! 🎯', 'success');
  } catch {
    showToast('Gagal menghubungi server.', 'error');
  }
}

// ── Toggle Status (Cycle through states) ─────────────────
async function toggleTask(id) {
  try {
    const res = await apiFetch(`/tasks/${id}/next`, { method: 'PATCH' });
    if (!res) return;
    const updated = await res.json();
    if (!res.ok) { showToast(updated.message || 'Gagal mengubah status.', 'error'); return; }

    const idx = allTasks.findIndex(t => t.id === id);
    if (idx !== -1) allTasks[idx] = updated;

    updateStats();
    renderTasks();
    
    const labels = ['Tugas dikembalikan ke Todo.', 'Tugas sekarang In Progress! ⚡', 'Tugas Selesai! 🎉'];
    const types = ['info', 'info', 'success'];
    showToast(labels[updated.is_completed], types[updated.is_completed]);
  } catch {
    showToast('Gagal mengubah status tugas.', 'error');
  }
}

// ── Edit Task ────────────────────────────────────────────
function startEdit(id) {
  const card     = document.getElementById(`task-${id}`);
  const view     = card.querySelector('.task-view');
  const editForm = document.getElementById(`edit-form-${id}`);
  const actions  = card.querySelector('.task-actions');

  view.style.display = 'none';
  editForm.classList.add('show');
  actions.style.opacity = '0';
  actions.style.pointerEvents = 'none';
  document.getElementById(`edit-title-${id}`).focus();
}

function cancelEdit(id) {
  const card     = document.getElementById(`task-${id}`);
  const view     = card.querySelector('.task-view');
  const editForm = document.getElementById(`edit-form-${id}`);
  const actions  = card.querySelector('.task-actions');

  view.style.display = '';
  editForm.classList.remove('show');
  actions.style.opacity = '';
  actions.style.pointerEvents = '';
}

async function saveEdit(id) {
  const title       = document.getElementById(`edit-title-${id}`).value.trim();
  const description = document.getElementById(`edit-desc-${id}`).value.trim();

  if (!title) { showToast('Judul tugas tidak boleh kosong!', 'error'); return; }

  try {
    const res = await apiFetch(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ title, description }),
    });
    if (!res) return;
    const updated = await res.json();
    if (!res.ok) { showToast(updated.message || 'Gagal memperbarui tugas.', 'error'); return; }

    const idx = allTasks.findIndex(t => t.id === id);
    if (idx !== -1) allTasks[idx] = updated;

    renderTasks();
    showToast('Tugas berhasil diperbarui! ✨', 'success');
  } catch {
    showToast('Gagal menghubungi server.', 'error');
  }
}

// ── Delete Task ──────────────────────────────────────────
async function deleteTask(id) {
  if (!confirm('Apakah Anda yakin ingin menghapus tugas ini?')) return;

  try {
    const res = await apiFetch(`/tasks/${id}`, { method: 'DELETE' });
    if (!res) return;
    const data = await res.json();
    if (!res.ok) { showToast(data.message || 'Gagal menghapus tugas.', 'error'); return; }

    allTasks = allTasks.filter(t => t.id !== id);
    updateStats();
    renderTasks();
    showToast('Tugas dihapus.', 'info');
  } catch {
    showToast('Gagal menghubungi server.', 'error');
  }
}

// ── Enter key untuk tambah task ──────────────────────────
document.getElementById('input-title').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addTask();
});

// ── Search functionality ──────────────────────────────────
document.getElementById('search-tasks').addEventListener('input', renderTasks);

// ── Init ─────────────────────────────────────────────────
loadTasks();

const express = require('express');
const { pool } = require('../database');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Semua route di bawah ini membutuhkan JWT yang valid
router.use(authenticateToken);

// GET /api/tasks — Ambil semua task milik user yang sedang login
router.get('/', async (req, res) => {
  try {
    const [tasks] = await pool.query(
      'SELECT * FROM tasks WHERE user_id = ? ORDER BY is_completed ASC, created_at DESC',
      [req.user.id]
    );
    res.json(tasks);
  } catch (err) {
    console.error('Get tasks error:', err);
    res.status(500).json({ message: 'Gagal mengambil data tugas.' });
  }
});

// POST /api/tasks — Tambah task baru
router.post('/', async (req, res) => {
  const { title, description } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({ message: 'Judul tugas wajib diisi.' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO tasks (user_id, title, description, is_completed) VALUES (?, ?, ?, 0)',
      [req.user.id, title.trim(), description ? description.trim() : null]
    );

    const [newTask] = await pool.query(
      'SELECT * FROM tasks WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newTask[0]);
  } catch (err) {
    console.error('Add task error:', err);
    res.status(500).json({ message: 'Gagal menambahkan tugas.' });
  }
});

// PUT /api/tasks/:id — Edit task (title dan/atau description)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({ message: 'Judul tugas wajib diisi.' });
  }

  try {
    // Pastikan task ini milik user yang sedang login
    const [rows] = await pool.query(
      'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Tugas tidak ditemukan.' });
    }

    await pool.query(
      'UPDATE tasks SET title = ?, description = ? WHERE id = ? AND user_id = ?',
      [title.trim(), description ? description.trim() : null, id, req.user.id]
    );

    const [updated] = await pool.query(
      'SELECT * FROM tasks WHERE id = ?',
      [id]
    );

    res.json(updated[0]);
  } catch (err) {
    console.error('Update task error:', err);
    res.status(500).json({ message: 'Gagal memperbarui tugas.' });
  }
});

// PATCH /api/tasks/:id/next — Majukan status (Todo -> In Progress -> Done -> Todo)
router.patch('/:id/next', async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Tugas tidak ditemukan.' });
    }

    // Siklus: 0 (Todo) -> 1 (In Progress) -> 2 (Done) -> 0 (Todo)
    const currentStatus = rows[0].is_completed || 0;
    const nextStatus = (currentStatus + 1) % 3;

    await pool.query(
      'UPDATE tasks SET is_completed = ? WHERE id = ? AND user_id = ?',
      [nextStatus, id, req.user.id]
    );

    const [updated] = await pool.query(
      'SELECT * FROM tasks WHERE id = ?',
      [id]
    );

    res.json(updated[0]);
  } catch (err) {
    console.error('Next status error:', err);
    res.status(500).json({ message: 'Gagal memperbarui status tugas.' });
  }
});

// DELETE /api/tasks/:id — Hapus task
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Tugas tidak ditemukan.' });
    }

    await pool.query(
      'DELETE FROM tasks WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    res.json({ message: 'Tugas berhasil dihapus.' });
  } catch (err) {
    console.error('Delete task error:', err);
    res.status(500).json({ message: 'Gagal menghapus tugas.' });
  }
});

module.exports = router;

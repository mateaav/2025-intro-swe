const express = require('express');
const router = express.Router();
const authenticateToken = require('./authMiddleware'); 

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('autoskola.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS instruktori(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      instruktor_name TEXT NOT NULL,
      instruktor_email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      oib TEXT UNIQUE NOT NULL
    )
  `, (err) => {
    if (err) {
      console.error('Greška pri kreiranju tablice instruktori:', err.message);
    } else {
      console.log('Tablica instruktori je kreirana.');
    }
  });
});

router.get('/', authenticateToken, (req, res) => {
  db.all('SELECT * FROM instruktori', [], (err, rows) => {
    if (err) {
      console.error('Greška pri dohvaćanju instruktora:', err.message);
      res.status(500).send('Greška pri dohvaćanju instruktora: ' + err.message);
    } else {
      res.status(200).json(rows); 
    }
  });
});


router.get('/me', authenticateToken, (req, res) => {
  const { email } = req.user; // mail iz tokena

  db.get('SELECT * FROM instruktori WHERE instruktor_email = ?', [email], (err, row) => {
    if (err) {
      console.error('Greška pri dohvaćanju instruktora:', err.message);
      res.status(500).send('Greška pri dohvaćanju instruktora: ' + err.message);
    } else if (!row) {
      res.status(404).send('Instruktor nije pronađen.');
    } else {
      res.status(200).json(row); 
    }
  });
});

router.get('/moje_voznje', authenticateToken, (req, res) => {
  const { email } = req.user; 

  db.all(`
    SELECT * FROM voznje
    WHERE instruktor_email = ?
  `, [email], (err, rows) => {
    if (err) {
      console.error('Greška pri dohvaćanju vožnji:', err.message);
      res.status(500).send('Greška pri dohvaćanju vožnji: ' + err.message);
    } else {
      res.status(200).json(rows); 
    }
  });
});



router.get('/polaznici', authenticateToken, (req, res) => {
  const { email } = req.user; 
  db.all(`
    SELECT * 
    FROM polaznici 
    WHERE instruktor_email = ?
  `, [email], (err, rows) => {
    if (err) {
      console.error('Greška pri dohvaćanju polaznika:', err.message);
      return res.status(500).send('Greška pri dohvaćanju polaznika: ' + err.message);
    }
    if (rows.length === 0) {
      return res.status(404).send('Nema polaznika povezanih s ovim instruktorom.');
    }
    res.status(200).json(rows);  
  });
});

router.post('/', authenticateToken, (req, res) => {
  const { instruktor_name, instruktor_email, password, oib } = req.body;

  if (!instruktor_name || !instruktor_email || !password || !oib) {
    return res.status(400).send('Sva polja su obavezna.');
  }

  db.run(`
    INSERT INTO instruktori (instruktor_name, instruktor_email, password, oib)
    VALUES (?, ?, ?, ?)
  `, [instruktor_name, instruktor_email, password, oib], function (err) {
    if (err) {
      console.error('Greška pri spremanju instruktora:', err.message);
    } else {
      res.status(201).json({ id: this.lastID, instruktor_name, instruktor_email, oib });
    }
  });
});

router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { instruktor_name, instruktor_email, password, oib } = req.body;

  const fields = [];
  const values = [];

  if (instruktor_name) {
    fields.push('instruktor_name = ?');
    values.push(instruktor_name);
  }
  if (instruktor_email) {
    fields.push('instruktor_email = ?');
    values.push(instruktor_email);
  }
  if (password) {
    fields.push('password = ?');
    values.push(password);
  }
  if (oib) {
    fields.push('oib = ?');
    values.push(oib);
  }

  if (fields.length === 0) {
    return res.status(400).send('Nijedno polje nije poslano za ažuriranje.');
  }

  values.push(id);
  const sql = `UPDATE instruktori SET ${fields.join(', ')} WHERE id = ?`;

  db.run(sql, values, function (err) {
    if (err) {
      console.error('Greška pri ažuriranju instruktora:', err.message);
      res.status(500).send('Greška pri ažuriranju instruktora: ' + err.message);
    } else if (this.changes === 0) {
      res.status(404).send('Instruktor nije pronađen.');
    } else {
      res.status(200).send('Instruktor je uspješno ažuriran.');
    }
  });
});


router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM instruktori WHERE id = ?', [id], function (err) {
    if (err) {
      console.error('Greška pri brisanju instruktora:', err.message);
      res.status(500).send('Greška pri brisanju instruktora: ' + err.message);
    } else if (this.changes === 0) {
      res.status(404).send('Instruktor nije pronađen.');
    } else {
      res.status(200).send('Instruktor je obrisan.');
    }
  });
});

module.exports = router;

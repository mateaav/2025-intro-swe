const express = require('express');
const router = express.Router();
const authenticateToken = require('./authMiddleware'); 

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('autoskola.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS voznje(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      instruktor_email TEXT NOT NULL,
      polaznik_email TEXT NOT NULL,
      termin DATETIME NOT NULL,  
      trajanje TIME NOT NULL,   
      lokacija TEXT NOT NULL,
      status BOOLEAN DEFAULT 0,
      FOREIGN KEY (instruktor_email) REFERENCES instruktori(instruktori_email),
      FOREIGN KEY (polaznik_email) REFERENCES polaznici(polaznik_email)
    )
  `, (err) => {
    if (err) {
      console.error('Greška pri kreiranju tablice voznje:', err.message);
    } else {
      console.log('Tablica voznje je kreirana.');
    }
  });
});





router.get('/', authenticateToken, (req, res) => {
  db.all('SELECT * FROM voznje', [], (err, rows) => {
    if (err) {
      console.error('Greška pri dohvaćanju vožnji:', err.message);
      res.status(500).send('Greška pri dohvaćanju vožnji: ' + err.message);
    } else {
      res.status(200).json(rows);
    }
  });
});

router.get('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM voznje WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Greška pri dohvaćanju vožnje:', err.message);
      res.status(500).send('Greška pri dohvaćanju vožnje: ' + err.message);
    } else if (!row) {
      res.status(404).send('Vožnja nije pronađena.');
    } else {
      res.status(200).json(row);
    }
  });
});


router.post('/', authenticateToken, (req, res) => {
  const { instruktor_email, polaznik_email, termin, trajanje, lokacija, status } = req.body;

  
  if (!instruktor_email || !polaznik_email || !termin || !trajanje || !lokacija) {
    return res.status(400).send('Sva polja su obavezna.');
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(instruktor_email)) {
    return res.status(400).send('Neispravan instruktor email.');
  }
  db.run(`
    INSERT INTO voznje (instruktor_email, polaznik_email, termin, trajanje, lokacija, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [instruktor_email, polaznik_email, termin, trajanje, lokacija, status || 0], function (err) {
    if (err) {
      console.error('Greška pri unosu vožnje:', err.message);
      return res.status(500).send('Greška pri unosu vožnje: ' + err.message);
    }
    res.status(201).json({
      id: this.lastID, 
      instruktor_email, 
      polaznik_email, 
      termin, 
      trajanje, 
      lokacija,
      status
    });
  });
});




router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { instruktor_email, polaznik_email, termin, trajanje, lokacija, status } = req.body;

  const fields = [];
  const values = [];

  if (instruktor_email) {
    fields.push('instruktor_email = ?');
    values.push(instruktor_email);
  }
  if (polaznik_email) {
    fields.push('polaznik_email = ?');
    values.push(polaznik_email);
  }
  if (termin) {
    fields.push('termin = ?');
    values.push(termin);
  }
  if (trajanje) {
    fields.push('trajanje = ?');
    values.push(trajanje);
  }
  if (lokacija) {
    fields.push('lokacija = ?');
    values.push(lokacija);
  }
  if (status !== undefined) {
    fields.push('status = ?');
    values.push(status);
  }

  if (fields.length === 0) {
    return res.status(400).send('Nijedno polje nije poslano za ažuriranje.');
  }

  values.push(id);
  const sql = `UPDATE voznje SET ${fields.join(', ')} WHERE id = ?`;

  db.run(sql, values, function (err) {
    if (err) {
      console.error('Greška pri ažuriranju vožnje:', err.message);
      return res.status(500).send('Greška pri ažuriranju vožnje: ' + err.message);
    } else if (this.changes === 0) {
      return res.status(404).send('Vožnja nije pronađena.');
    }

    
    if (status === true) {
      const { polaznik_email } = req.body;  
      const updatePolaznikSql = `UPDATE polaznici SET odvozeni_sati = odvozeni_sati + 1 WHERE polaznik_email = ?`;

      db.run(updatePolaznikSql, [polaznik_email], function (err) {
        if (err) {
          console.error('Greška pri ažuriranju odvoženih sati:', err.message);
          return res.status(500).send('Greška pri ažuriranju odvoženih sati: ' + err.message);
        }
        res.status(200).send('Sati su povećani.');
      });
    } else {
      res.status(200).send('Vožnja je uspješno ažurirana.');
    }
  });
});



router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM voznje WHERE id = ?', [id], function (err) {
    if (err) {
      console.error('Greška pri brisanju voznje:', err.message);
      res.status(500).send('Greška pri brisanju voznje: ' + err.message);
    } else if (this.changes === 0) {
      res.status(404).send('Lekcija nije pronađena.');
    } else {
      res.status(200).send('Lekcija je obrisana.');
    }
  });
});

module.exports = router;

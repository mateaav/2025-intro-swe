const express = require('express');
const router = express.Router();
const authenticateToken = require('./authMiddleware'); 

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('autoskola.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS polaznici (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      polaznik_name TEXT NOT NULL,
      polaznik_email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      prva_pomoc BOOLEAN NOT NULL,
      instruktor_email TEXT,
      odvozeni_sati INTEGER DEFAULT 0,
      FOREIGN KEY (instruktor_email) REFERENCES instruktori(instruktor_email)
      )
  `, (err) => {
    if (err) {
      console.error('Greška pri kreiranju tablice polaznici:', err.message);
    } else {
      console.log('Tablica polaznici je kreirana.');
    }
  });
});


router.get('/', authenticateToken, (req, res) => {
  db.all('SELECT * FROM polaznici', [], (err, rows) => {
    if (err) {
      console.error('Greška pri dohvaćanju polaznika:', err.message);
      res.status(500).send('Greška pri dohvaćanju polaznika: ' + err.message);
    } else {
      res.status(200).json(rows); 
    }
  });
});
router.get('/me', authenticateToken, (req, res) => {

  const { email } = req.user; 
  db.get('SELECT * FROM polaznici WHERE polaznik_email = ?', [email], (err, row) => {
    if (err) {
      console.error('Greška pri dohvaćanju polaznika:', err.message);
      res.status(500).send('Greška pri dohvaćanju polaznika: ' + err.message);
    } else if (!row) {
      res.status(404).send('Polaznik nije pronađen.');
    } else {
      res.status(200).json(row); 
    }
  });
});


router.get('/voznje', authenticateToken, (req, res) => {
  const { email } = req.user;

  db.all(`
    SELECT * FROM voznje
    WHERE polaznik_email = ?
  `, [email], (err, rows) => {
    if (err) {
      console.error('Greška pri dohvaćanju vožnji:', err.message);
      res.status(500).send('Greška pri dohvaćanju vožnji: ' + err.message);
    } else {
      res.status(200).json(rows);
    }
  });
});

router.get('/instruktor', authenticateToken, (req, res) => {
  const { email } = req.user; 
  db.get('SELECT * FROM polaznici WHERE polaznik_email = ?', [email], (err, polaznikRow) => {
    if (err) {
      console.error('Greška pri dohvaćanju polaznika:', err.message);
      return res.status(500).send('Greška pri dohvaćanju polaznika: ' + err.message);
    }

    if (!polaznikRow) {
      return res.status(404).send('Polaznik nije pronađen.');
    }

    
    const { instruktor_email } = polaznikRow; 
    db.get('SELECT * FROM instruktori WHERE instruktor_email = ?', [instruktor_email], (err, instruktorRow) => {
      if (err) {
        console.error('Greška pri dohvaćanju instruktora:', err.message);
        return res.status(500).send('Greška pri dohvaćanju instruktora: ' + err.message);
      }

      if (!instruktorRow) {
        return res.status(404).send('Instruktor nije pronađen.');
      }

      res.status(200).json({
        instruktor_name: instruktorRow.instruktor_name,
        instruktor_email: instruktorRow.instruktor_email,
        instruktor_phone: instruktorRow.instruktor_phone,  
        instruktor_license: instruktorRow.instruktor_license 
      });
    });
  });
});



router.get('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM voznje WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Greška pri dohvaćanju voznje:', err.message);
      res.status(500).send('Greška pri dohvaćanju voznje: ' + err.message);
    } else if (!row) {
      res.status(404).send('Lekcija nije pronađena.');
    } else {
      res.status(200).json(row);
    }
  });
});

router.post('/', authenticateToken, (req, res) => {
  const { polaznik_name, polaznik_email, password, prva_pomoc, instruktor_email } = req.body;
  const odvozeni_sati = 0; 

  if (!polaznik_name || !polaznik_email || !password || prva_pomoc === undefined || !instruktor_email) {
    return res.status(400).send('Sva polja su obavezna.');
  }

  db.run(`
    INSERT INTO polaznici (polaznik_name, polaznik_email, password, prva_pomoc, instruktor_email, odvozeni_sati)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [polaznik_name, polaznik_email, password, prva_pomoc, instruktor_email, odvozeni_sati], function (err) {
    if (err) {
      console.error('Greška pri spremanju polaznika:', err.message);
      res.status(500).send('Greška pri spremanju polaznika: ' + err.message);
    } else {
      res.status(201).json({
        id: this.lastID, 
        polaznik_name, 
        polaznik_email, 
        prva_pomoc, 
        instruktor_email, 
        odvozeni_sati
      });
    }
  });
});



router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { polaznik_name, polaznik_email, password, prva_pomoc, instruktor_email, odvozeni_sati } = req.body;

  const fields = [];
  const values = [];

  if (polaznik_name) {
    fields.push('polaznik_name = ?');
    values.push(polaznik_name);
  }
  if (polaznik_email) {
    fields.push('polaznik_email = ?');
    values.push(polaznik_email);
  }
  if (password) {
    fields.push('password = ?');
    values.push(password);
  }
  if (prva_pomoc !== undefined) {
    fields.push('prva_pomoc = ?');
    values.push(prva_pomoc);
  }
  if (instruktor_email) {
    fields.push('instruktor_email = ?');
    values.push(instruktor_email);
  }
  if (odvozeni_sati !== undefined) {
    fields.push('odvozeni_sati = ?');
    values.push(odvozeni_sati);
  }

  if (fields.length === 0) {
    return res.status(400).send('Nijedno polje nije poslano za ažuriranje.');
  }

  values.push(id);
  const sql = `UPDATE polaznici SET ${fields.join(', ')} WHERE id = ?`;

  db.run(sql, values, function (err) {
    if (err) {
      console.error('Greška pri ažuriranju polaznika:', err.message);
      res.status(500).send('Greška pri ažuriranju polaznika: ' + err.message);
    } else if (this.changes === 0) {
      res.status(404).send('Polaznik nije pronađen.');
    } else {
      res.status(200).send('Polaznik je uspješno ažuriran.');
    }
  });
});


router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { email } = req.user;  

  db.run('DELETE FROM polaznici WHERE id = ? AND instruktor_email = ?', [id, email], function (err) {
    if (err) {
      console.error('Greška pri brisanju polaznika:', err.message);
      res.status(500).send('Greška pri brisanju polaznika: ' + err.message);
    } else if (this.changes === 0) {
      res.status(404).send('Polaznik nije pronađen ili ne pripada ovom instruktoru.');
    } else {
      res.status(200).send('Polaznik je obrisan.');
    }
  });
});


module.exports = router;

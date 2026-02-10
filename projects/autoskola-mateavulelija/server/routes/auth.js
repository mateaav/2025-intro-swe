const express = require('express');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('autoskola.db');

const router = express.Router();
const SECRET_KEY = 'tajni_kljuc'; 
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('Email i lozinka su obavezni.');
  }

  db.get('SELECT * FROM instruktori WHERE instruktor_email = ?', [email], (err, row) => {
    if (err) {
      console.error('Greška pri dohvaćanju korisnika:', err.message);
      return res.status(500).send('Greška pri provjeri korisnika.');
    }

    
    if (!row) {
      db.get('SELECT * FROM polaznici WHERE polaznik_email = ?', [email], (err, row) => {
        if (err) {
          console.error('Greška pri dohvaćanju polaznika:', err.message);
          return res.status(500).send('Greška pri provjeri polaznika.');
        }

        if (!row) {
          return res.status(401).send('Korisnik nije pronađen.');
        }

      
        if (row.password !== password) {
          return res.status(401).send('Neispravna lozinka.');
        }

       
        const token = jwt.sign(
          { id: row.id, email: row.polaznik_email }, 
          SECRET_KEY, 
          { expiresIn: '30d' } //  30 dana 
        );

        return res.status(200).json({ token });
      });
    } else {
      if (row.password !== password) {
        return res.status(401).send('Neispravna lozinka.');
      }

      const token = jwt.sign(
        { id: row.id, email: row.instruktor_email }, 
        SECRET_KEY, 
        { expiresIn: '30d' }  
      );

      return res.status(200).json({ token });
    }
  });
});

router.post('/logout', (req, res) => {
  res.status(200).send('Uspješno ste se odjavili.');
});
module.exports = router;

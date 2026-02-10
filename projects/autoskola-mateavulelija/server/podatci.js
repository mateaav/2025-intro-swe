const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./autoskola.db', (err) => {
  if (err) {
    console.error('Greška pri povezivanju s bazom:', err.message);
  } else {
    console.log('Povezan s SQLite bazom podataka.');
  }
});

const dodajpodatke = () => {
  db.run(`
    INSERT INTO instruktori (instruktor_name, instruktor_email, password, oib)
    VALUES 
      ('Ivan Horvat', 'ivan.horvat@example.com', 'tajna123', '1234567890'),
      ('Ana Kovačić', 'ana.kovacic@example.com', 'tajna456', '2345678901'),
      ('Marko Marković', 'marko.markovic@example.com', 'tajna789', '3456789012')
  `, (err) => {
    if (err) {
      console.error('Greška pri unosu instruktora:', err.message);
    } else {
      console.log('Instruktori su uspješno uneseni.');
    }
  });

  db.run(`
    INSERT INTO polaznici (polaznik_name, polaznik_email, password, prva_pomoc, instruktor_email, odvozeni_sati)
    VALUES
      ('Tomislav Perić', 'tomislav.peric@example.com', 'tajna123', 1, 'ivan.horvat@example.com', 0),
      ('Jelena Novak', 'jelena.novak@example.com', 'tajna456', 1, 'ivan.horvat@example.com', 0),
      ('Petar Petrović', 'petar.petrovic@example.com', 'tajna789', 0, 'ivan.horvat@example.com', 0),

      ('Maja Lukić', 'maja.lukic@example.com', 'tajna321', 1, 'ana.kovacic@example.com', 0),
      ('Luka Jurić', 'luka.juric@example.com', 'tajna654', 0, 'ana.kovacic@example.com', 0),
      ('Sara Ivanić', 'sara.ivanic@example.com', 'tajna987', 1, 'ana.kovacic@example.com', 0),

      ('Igor Marić', 'igor.maric@example.com', 'tajna147', 1, 'marko.markovic@example.com', 0),
      ('Klara Kovačić', 'klara.kovacic@example.com', 'tajna258', 0, 'marko.markovic@example.com', 0),
      ('Marko Šarić', 'marko.saric@example.com', 'tajna369', 1, 'marko.markovic@example.com', 0)
  `, (err) => {
    if (err) {
      console.error('Greška pri unosu polaznika:', err.message);
    } else {
      console.log('Polaznici su uspješno uneseni.');
    }
  });
};
module.exports = { dodajpodatke };

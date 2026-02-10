const fs = require('fs');
const path = require('path');


const dbPath = path.join('../autoskola.db');

// Očisti bazu podataka prije svakog testa
beforeAll(() => {
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);  // Briše bazu podataka ako postoji
  }
});


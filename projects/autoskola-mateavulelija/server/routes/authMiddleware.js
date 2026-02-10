const jwt = require('jsonwebtoken');
const SECRET_KEY = 'tajni_kljuc';  

function authenticateToken(req, res, next) {
  const token = req.header('Authorization') && req.header('Authorization').split(' ')[1]; //Bearer <TOKEN>

  if (!token) {
    return res.status(403).send('Pristup odbijen. Nema tokena.');
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).send('Pristup odbijen. Nevažeći token.');
    }

    req.user = user;
    next();
  });
}

module.exports = authenticateToken;

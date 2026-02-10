const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const instruktorRoute = require('./routes/instruktori');
const polaznikRoute = require('./routes/polaznici');
const lekcijeRoute = require('./routes/voznje');
const authRouter = require('./routes/auth');
const { dodajpodatke } = require('./podatci');

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.use('/instruktori', instruktorRoute);
app.use('/polaznici', polaznikRoute);
app.use('/voznje', lekcijeRoute);
app.use('/auth', authRouter);

dodajpodatke();
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
	console.log(`Server radi na portu ${PORT}`);
});

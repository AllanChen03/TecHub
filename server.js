const express = require('express');
const cors = require('cors');
require('dotenv').config();

const usuario = require('./routes/usuario');
const admin = require('./routes/admin');

const app = express();

app.use(cors());
app.use(express.json())

app.use(express.static('public'));

app.use('/', usuario);
app.use('/admin', admin);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
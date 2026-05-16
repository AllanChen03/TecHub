const express = require('express');
const cors = require('cors');
require('dotenv').config();

const usuario = require('./backend/routes/usuario');
const admin = require('./backend/routes/admin');
const comentarios = require('./backend/routes/comentarios');


const app = express();

app.use(cors({
  origin: '*'
}));
app.use(express.json())

app.use(express.static('public'));

app.use('/usuarios', usuario);
app.use('/admin', admin);
app.use('/api/comentarios', comentarios);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
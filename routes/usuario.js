const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarios/usuarioController');

router.get('/', usuarioController.inicio);
router.get('/prueba-db', usuarioController.pruebaBD);

module.exports = router;
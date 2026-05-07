const express = require('express');
const router = express.Router();
const registroController = require('../controllers/usuarios/registroController');
const usuarioController = require('../controllers/usuarios/usuarioController');

router.post('/crearUsuario', registroController.crearUsuario);
router.post('/login', usuarioController.login);
router.post('/verificar', registroController.verificarCuenta);

module.exports = router;
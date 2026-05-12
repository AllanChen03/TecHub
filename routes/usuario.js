const express = require('express');
const router = express.Router();
const registroController = require('../controllers/usuarios/registroController');
const usuarioController = require('../controllers/usuarios/usuarioController');
const productoController = require('../controllers/productoController');
const categoriaController = require('../controllers/categoriaController');

router.post('/crearUsuario', registroController.crearUsuario);
router.post('/login', usuarioController.login);
router.post('/verificar', registroController.verificarCuenta);

router.get('/categorias', categoriaController.obtenerCategorias);

router.get('/productos', productoController.obtenerProductos);


module.exports = router;
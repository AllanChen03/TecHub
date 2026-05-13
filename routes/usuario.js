const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/auth');
const registroController = require('../controllers/usuarios/registroController');
const usuarioController = require('../controllers/usuarios/usuarioController');
const productoController = require('../controllers/productoController');
const categoriaController = require('../controllers/categoriaController');

router.post('/registro', registroController.crearUsuario);
router.post('/login', usuarioController.login);
router.post('/verificar', registroController.verificarCuenta);

router.get('/categorias', verificarToken, categoriaController.obtenerCategorias);

router.get('/productos', productoController.obtenerProductos);

router.post('/recuperarContrasena', usuarioController.solicitarRecuperacion);
router.post('/restablecerContrasena', usuarioController.restablecerContrasena);

router.post('/reenviarCodigo', registroController.reenviarCodigoRegistro);


module.exports = router;
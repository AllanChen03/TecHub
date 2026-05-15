const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/auth');
const registroController = require('../controllers/usuarios/registroController');
const usuarioController = require('../controllers/usuarios/usuarioController');
const productoController = require('../controllers/productoController');
const categoriaController = require('../controllers/categoriaController');
const ordenController = require('../controllers/ordenController');

const upload = require('../middleware/upload');


// Autenticación y Registro
router.post('/registro', registroController.crearUsuario);
router.put('/:id', verificarToken, registroController.editarUsuario);
router.post('/login', usuarioController.login);
router.post('/verificar', registroController.verificarCuenta);
router.put('/:id/password', verificarToken, usuarioController.editarContrasena);
router.delete('/:id', verificarToken, registroController.eliminarUsuario);

// Recuperar contraseña
router.post('/recuperarContrasena', usuarioController.solicitarRecuperacion);
router.post('/restablecerContrasena', usuarioController.restablecerContrasena);
router.post('/reenviarCodigo', registroController.reenviarCodigoRegistro);

// Categorías
router.get('/categorias', verificarToken, categoriaController.obtenerCategorias);

// Productos
router.get('/productos', productoController.obtenerProductos);
router.post('/productos', verificarToken, upload.single('imagen'), productoController.crearProducto);  
router.get('/mis-productos', verificarToken, productoController.obtenerMisProductos);
router.put('/productos/:id', verificarToken, upload.single('imagen'), productoController.actualizarProducto); 
router.delete('/productos/:id', verificarToken, productoController.eliminarProducto);
router.get('/productos/:id', productoController.obtenerProductoPorId);

// Ordenes
router.get('/ordenes', verificarToken, ordenController.obtenerOrdenes);
router.post('/ordenes', verificarToken, ordenController.crearOrden);
router.get('/ordenes/compras/:compradorID', verificarToken, ordenController.obtenerMisCompras);
router.get('/ordenes/ventas/:vendedorID', verificarToken, ordenController.obtenerMisVentas);
router.put('/ordenes/:id', verificarToken, ordenController.actualizarEstadoOrden);
router.delete('/ordenes/:id', verificarToken, ordenController.eliminarOrden);


module.exports = router;
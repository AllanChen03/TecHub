const express = require('express');
const router = express.Router();
const adminController = require('../controllers/usuarios/adminController');
const categoriaController = require('../controllers/categoriaController');

const { verificarToken, esAdmin } = require('../middleware/auth'); 

const upload = require('../middleware/upload');

//Ruta Login
router.post('/login', adminController.loginAdmin);

//Rutas Categorias
router.get('/categorias', verificarToken, esAdmin, categoriaController.obtenerCategorias);
router.post('/categorias', verificarToken, esAdmin, upload.single('imagen'), categoriaController.crearCategoria);

//Rutas Usuarios
router.get('/usuarios', verificarToken, esAdmin, adminController.obtenerUsuarios);
router.post('/usuarios', verificarToken, esAdmin, adminController.crearUsuario);

module.exports = router;
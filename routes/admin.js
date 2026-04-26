const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/usuarios', adminController.obtenerUsuarios);
router.post('/usuarios', adminController.crearUsuario);

module.exports = router;
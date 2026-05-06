const db = require('../config/db');

const obtenerCategorias = (req, res) => {
  const sql = 'SELECT * FROM categorias';
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error al obtener categorías:', err);
      return res.status(500).json({ error: 'Error al consultar las categorías' });
    }
    res.json(results);
  });
};

const crearCategoria = (req, res) => {
  const { nombreCategoria } = req.body;
  
  const imagenPath = req.file ? `/uploads/categorias/${req.file.filename}` : null;

  if (!nombreCategoria) {
    return res.status(400).json({ error: 'El nombre de la categoría es obligatorio' });
  }

  const sql = 'INSERT INTO categorias (NombreCategoria, ImagenPath) VALUES (?, ?)';
  
  db.query(sql, [nombreCategoria, imagenPath], (err, result) => {
    if (err) {
      console.error('Error al crear categoría:', err);
      return res.status(500).json({ error: 'Error interno al crear la categoría' });
    }

    res.status(201).json({
      mensaje: 'Categoría creada exitosamente',
      categoriaID: result.insertId,
      nombreCategoria: nombreCategoria,
      imagenPath: imagenPath
    });
  });
};

module.exports = {
  obtenerCategorias,
  crearCategoria
};
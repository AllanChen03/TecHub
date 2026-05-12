const db = require('../config/db');

const obtenerProductos = (req, res) => {
  const sql = 'SELECT * FROM productos';
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error al obtener productos:', err);
      return res.status(500).json({ error: 'Error al consultar las productos' });
    }
    res.json(results);
  });
};


module.exports = {
  obtenerProductos
};
const db = require('../config/db');

const obtenerOrdenes = (req, res) => {
  const sql = 'SELECT * FROM ordenes'; 
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error al obtener las órdenes:', err);
      return res.status(500).json({ error: 'Error interno al consultar las órdenes' });
    }
    if (results.length === 0) {
      return res.json({ mensaje: 'No hay órdenes registradas aún', ordenes: [] });
    }

    res.json(results);
  });
};

module.exports = {
  obtenerOrdenes
};
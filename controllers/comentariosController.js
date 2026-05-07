const db = require('../config/db');

const obtenerComentarios = (req, res) => {
  const sql = 'SELECT * FROM Comentarios'; 
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error al obtener los comentarios:', err);
      return res.status(500).json({ error: 'Error interno al consultar los comentarios' });
    }

    if (results.length === 0) {
      return res.json({ mensaje: 'No hay comentarios registrados aún', comentarios: [] });
    }

    res.json(results);
  });
};

const eliminarComentario = (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM comentarios WHERE ComentarioID = ?';
  
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error al eliminar comentario:', err);
      return res.status(500).json({ error: 'Error al eliminar el comentario.' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Comentario no encontrado' });
    }

    res.json({ mensaje: 'Comentario eliminado correctamente' });
  });
};

module.exports = {
  obtenerComentarios,
  eliminarComentario
};
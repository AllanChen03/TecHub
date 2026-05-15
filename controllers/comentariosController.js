const db = require('../config/db');

const obtenerComentariosPorProducto = (req, res) => {
  const { productoID } = req.params;

  const sql = `
    SELECT c.*, u.Nombre, u.Apellidos 
    FROM comentarios c
    JOIN usuarios u ON c.CompradorID = u.UsuarioID
    WHERE c.ProductoID = ?
    ORDER BY c.Fecha DESC
  `;
  
  db.query(sql, [productoID], (err, results) => {
    if (err) {
      console.error('Error al obtener comentarios:', err);
      return res.status(500).json({ error: 'Error al consultar los comentarios' });
    }

    res.json(results);
  });
};

const crearComentario = (req, res) => {
  const { ProductoID, CompradorID, VendedorID, Texto, Valoracion } = req.body;

  if (!ProductoID || !CompradorID || !VendedorID || !Valoracion) {
    return res.status(400).json({ error: 'Faltan datos obligatorios para la reseña' });
  }

  if (Valoracion < 1 || Valoracion > 5) {
    return res.status(400).json({ error: 'La valoración debe ser entre 1 y 5' });
  }

  const sql = `
    INSERT INTO comentarios 
    (ProductoID, CompradorID, VendedorID, Texto, Valoracion, Fecha) 
    VALUES (?, ?, ?, ?, ?, NOW())
  `;
  
  db.query(sql, [ProductoID, CompradorID, VendedorID, Texto, Valoracion], (err, result) => {
    if (err) {
      console.error('Error al crear comentario:', err);
      return res.status(500).json({ error: 'Error interno al guardar el comentario' });
    }

    res.status(201).json({
      mensaje: '¡Gracias por tu reseña!',
      comentarioID: result.insertId
    });
  });
};

const actualizarComentario = (req, res) => {
  const { id } = req.params; 
  const { Texto, Valoracion, CompradorID } = req.body; 

  if (Valoracion && (Valoracion < 1 || Valoracion > 5)) {
    return res.status(400).json({ error: 'La valoración debe ser entre 1 y 5' });
  }

  const sql = `
    UPDATE comentarios 
    SET Texto = ?, Valoracion = ? 
    WHERE ComentarioID = ? AND CompradorID = ?
  `;
  
  db.query(sql, [Texto, Valoracion, id, CompradorID], (err, result) => {
    if (err) {
      console.error('Error al actualizar comentario:', err);
      return res.status(500).json({ error: 'Error interno al actualizar el comentario' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(403).json({ error: 'Comentario no encontrado o no tienes permiso para editarlo' });
    }

    res.json({ mensaje: 'Comentario actualizado exitosamente' });
  });
};

const eliminarComentario = (req, res) => {
  const { id } = req.params; 
  const compradorID = req.query.compradorID;

  const sql = `
    DELETE FROM comentarios 
    WHERE ComentarioID = ? AND CompradorID = ?
  `;
  
  db.query(sql, [id, compradorID], (err, result) => {
    if (err) {
      console.error('Error al eliminar comentario:', err);
      return res.status(500).json({ error: 'Error al eliminar el comentario' });
    }

    if (result.affectedRows === 0) {
      return res.status(403).json({ error: 'No se encontró el comentario o no estás autorizado para borrarlo' });
    }

    res.json({ mensaje: 'Comentario eliminado correctamente' });
  });
};

module.exports = {
  obtenerComentariosPorProducto,
  crearComentario,
  actualizarComentario,
  eliminarComentario
};
const db = require('../config/db');

// ==========================================
// 1. OBTENER TODAS LAS ÓRDENES (ADMIN)
// ==========================================
const obtenerOrdenes = (req, res) => {

  const sql = `
    SELECT
      o.OrdenID,
      o.Fecha,
      o.PrecioTotal,

      p.NombreProducto,
      p.ImagenPath,

      eo.NombreEstado,

      c.Nombre AS NombreComprador,
      c.Apellidos AS ApellidoComprador,

      v.Nombre AS NombreVendedor,
      v.Apellidos AS ApellidoVendedor

    FROM ordenes o

    INNER JOIN Productos p
      ON o.ProductoID = p.ProductoID

    INNER JOIN Usuarios c
      ON o.CompradorID = c.UsuarioID

    INNER JOIN Usuarios v
      ON o.VendedorID = v.UsuarioID

    INNER JOIN EstadoOrden eo
      ON o.EstadoID = eo.EstadoID

    ORDER BY o.Fecha DESC
  `;

  db.query(sql, (err, results) => {

    if (err) {
      console.error('Error al obtener órdenes:', err);

      return res.status(500).json({
        error: 'Error al consultar las órdenes'
      });
    }

    res.json(results);
  });
};

// ==========================================
// 2. CREAR UNA ORDEN
// ==========================================
const crearOrden = (req, res) => {

  const {
    PrecioTotal,
    VendedorID,
    CompradorID,
    ProductoID,
    EstadoID
  } = req.body;

  // Validación básica
  if (
    !PrecioTotal ||
    !VendedorID ||
    !CompradorID ||
    !ProductoID ||
    !EstadoID
  ) {
    return res.status(400).json({
      error: 'Faltan datos obligatorios para crear la orden'
    });
  }

  // Evitar que alguien se compre a sí mismo
  if (VendedorID === CompradorID) {
    return res.status(400).json({
      error: 'No puedes comprar tu propio producto'
    });
  }

  const sql = `
    INSERT INTO ordenes
    (
      Fecha,
      PrecioTotal,
      VendedorID,
      CompradorID,
      ProductoID,
      EstadoID
    )
    VALUES
    (
      NOW(),
      ?,
      ?,
      ?,
      ?,
      ?
    )
  `;

  db.query(
    sql,
    [
      PrecioTotal,
      VendedorID,
      CompradorID,
      ProductoID,
      EstadoID
    ],
    (err, result) => {

      if (err) {
        console.error('Error al crear orden:', err);

        return res.status(500).json({
          error: 'Error interno al crear la orden'
        });
      }

      // ==========================================
      // CAMBIAR PRODUCTO A VENDIDO
      // DisponibilidadID = 2 -> Vendido
      // ==========================================

      const updateProducto = `
        UPDATE Productos
        SET DisponibilidadID = 2
        WHERE ProductoID = ?
      `;

      db.query(updateProducto, [ProductoID], (errUpdate) => {

        if (errUpdate) {
          console.error(
            'Error al actualizar disponibilidad del producto:',
            errUpdate
          );
        }
      });

      res.status(201).json({
        mensaje: 'Orden creada exitosamente',
        ordenID: result.insertId
      });
    }
  );
};

// ==========================================
// 3. ACTUALIZAR ESTADO DE LA ORDEN
// ==========================================
const actualizarEstadoOrden = (req, res) => {

  const { id } = req.params;

  const { EstadoID } = req.body;

  if (!EstadoID) {
    return res.status(400).json({
      error: 'El EstadoID es obligatorio'
    });
  }

  const sql = `
    UPDATE ordenes
    SET EstadoID = ?
    WHERE OrdenID = ?
  `;

  db.query(sql, [EstadoID, id], (err, result) => {

    if (err) {
      console.error('Error al actualizar la orden:', err);

      return res.status(500).json({
        error: 'Error interno al actualizar la orden'
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: 'Orden no encontrada'
      });
    }

    // ==========================================
    // SI LA ORDEN SE CANCELA
    // VOLVER PRODUCTO A DISPONIBLE
    // EstadoID = 3 -> Cancelado
    // ==========================================

    if (EstadoID == 3) {

      const sqlProducto = `
        UPDATE Productos
        SET DisponibilidadID = 1
        WHERE ProductoID = (
          SELECT ProductoID
          FROM ordenes
          WHERE OrdenID = ?
        )
      `;

      db.query(sqlProducto, [id], (errProducto) => {

        if (errProducto) {
          console.error(
            'Error al actualizar disponibilidad:',
            errProducto
          );
        }
      });
    }

    res.json({
      mensaje: 'Estado de la orden actualizado exitosamente'
    });
  });
};

// ==========================================
// 4. ELIMINAR ORDEN
// ==========================================
const eliminarOrden = (req, res) => {

  const { id } = req.params;

  const sql = `
    DELETE FROM ordenes
    WHERE OrdenID = ?
  `;

  db.query(sql, [id], (err, result) => {

    if (err) {
      console.error('Error al eliminar la orden:', err);

      return res.status(500).json({
        error: 'Error interno al eliminar la orden'
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: 'Orden no encontrada'
      });
    }

    res.json({
      mensaje: 'Orden eliminada exitosamente'
    });
  });
};

// ==========================================
// 5. OBTENER MIS COMPRAS
// ==========================================
const obtenerMisCompras = (req, res) => {

  const { compradorID } = req.params;

  const sql = `
    SELECT
      o.OrdenID,
      o.Fecha,
      o.PrecioTotal,

      p.NombreProducto,
      p.ImagenPath,

      eo.NombreEstado,

      u.Nombre AS NombreVendedor,
      u.Apellidos AS ApellidoVendedor

    FROM ordenes o

    INNER JOIN Productos p
      ON o.ProductoID = p.ProductoID

    INNER JOIN Usuarios u
      ON o.VendedorID = u.UsuarioID

    INNER JOIN EstadoOrden eo
      ON o.EstadoID = eo.EstadoID

    WHERE o.CompradorID = ?

    ORDER BY o.Fecha DESC
  `;

  db.query(sql, [compradorID], (err, results) => {

    if (err) {
      console.error('Error al obtener compras:', err);

      return res.status(500).json({
        error: 'Error al obtener tus compras'
      });
    }

    res.json(results);
  });
};

// ==========================================
// 6. OBTENER MIS VENTAS
// ==========================================
const obtenerMisVentas = (req, res) => {

  const { vendedorID } = req.params;

  const sql = `
    SELECT
      o.OrdenID,
      o.Fecha,
      o.PrecioTotal,

      p.NombreProducto,
      p.ImagenPath,

      eo.NombreEstado,

      u.Nombre AS NombreComprador,
      u.Apellidos AS ApellidoComprador

    FROM ordenes o

    INNER JOIN Productos p
      ON o.ProductoID = p.ProductoID

    INNER JOIN Usuarios u
      ON o.CompradorID = u.UsuarioID

    INNER JOIN EstadoOrden eo
      ON o.EstadoID = eo.EstadoID

    WHERE o.VendedorID = ?

    ORDER BY o.Fecha DESC
  `;

  db.query(sql, [vendedorID], (err, results) => {

    if (err) {
      console.error('Error al obtener ventas:', err);

      return res.status(500).json({
        error: 'Error al obtener tus ventas'
      });
    }

    res.json(results);
  });
};

// ==========================================
// EXPORTAR FUNCIONES
// ==========================================
module.exports = {
  obtenerOrdenes,
  crearOrden,
  actualizarEstadoOrden,
  eliminarOrden,
  obtenerMisCompras,
  obtenerMisVentas
};
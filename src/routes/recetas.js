const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// Obtener todas las recetas
router.get('/', (req, res) => {
  db.query('SELECT * FROM Receta', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Crear una nueva receta
router.post('/', (req, res) => {
  const { nombre, pasos, productos } = req.body;

  // Validar si hay suficiente cantidad de cada producto
  let validacionFallida = false;
  const validacionPromesas = productos.map(producto => {
      return new Promise((resolve, reject) => {
          const query = 'SELECT cantidad FROM Producto WHERE producto_id = ?';
          db.query(query, [producto.producto_id], (err, result) => {
              if (err) reject(err);
              const cantidadDisponible = result[0].cantidad;

              if (cantidadDisponible < producto.cantidad_usada) {
                  validacionFallida = true;
              }
              resolve();
          });
      });
  });

  // Esperar a que se realicen todas las validaciones
  Promise.all(validacionPromesas)
      .then(() => {
          if (validacionFallida) {
              return res.status(400).json({ message: 'No hay suficiente cantidad de productos para la receta' });
          }

          // Insertar la receta
          const recetaQuery = 'INSERT INTO Receta (nombre, pasos) VALUES (?, ?)';
          db.query(recetaQuery, [nombre, pasos], (err, result) => {
              if (err) throw err;

              const recetaId = result.insertId;

              // Insertar los productos en ProductoReceta
              productos.forEach(producto => {
                  const productoRecetaQuery = 'INSERT INTO ProductoReceta (receta_id, producto_id, cantidad_usada) VALUES (?, ?, ?)';
                  db.query(productoRecetaQuery, [recetaId, producto.producto_id, producto.cantidad_usada], (err, result) => {
                      if (err) throw err;
                  });

                  // Restar la cantidad usada del inventario
                  const updateProductoQuery = 'UPDATE Producto SET cantidad = cantidad - ? WHERE producto_id = ?';
                  db.query(updateProductoQuery, [producto.cantidad_usada, producto.producto_id], (err, result) => {
                      if (err) throw err;
                  });
              });

              res.status(201).json({ message: 'Receta creada con éxito' });
          });
      })
      .catch(err => {
          res.status(500).json({ message: 'Error al validar los productos', error: err });
      });
});



// Actualizar una receta
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, pasos } = req.body;
  const query = 'UPDATE Receta SET nombre = ?, pasos = ? WHERE receta_id = ?';
  
  db.query(query, [nombre, pasos, id], (err, result) => {
    if (err) throw err;
    res.json({ message: 'Receta actualizada con éxito.' });
  });
});

// Eliminar una receta
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM Receta WHERE receta_id = ?';
  
  db.query(query, [id], (err, result) => {
    if (err) throw err;
    res.json({ message: 'Receta eliminada con éxito.' });
  });
});

module.exports = router;

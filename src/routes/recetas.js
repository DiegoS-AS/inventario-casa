const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// Obtener todas las recetas
router.get('/', (req, res) => {
  const sql = 'SELECT receta_id, nombre, pasos FROM Receta';
  
  db.query(sql, (err, results) => {
      if (err) {
          console.error('Error al obtener las recetas:', err);
          return res.status(500).json({ error: 'Error al obtener las recetas' });
      }
      res.json(results);  // Devolver todas las recetas
  });
});

// Obtener los productos de una receta específica
router.get('/:recetaId/productos', (req, res) => {
  const recetaId = req.params.recetaId;

  const sql = `
      SELECT p.producto_id, p.nombre
      FROM ProductoReceta pr
      JOIN Producto p ON pr.producto_id = p.producto_id
      WHERE pr.receta_id = ?`;

  db.query(sql, [recetaId], (err, results) => {
      if (err) {
          console.error('Error en la consulta SQL:', err);
          return res.status(500).json({ error: 'Error al obtener los productos de la receta' });
      }
      if (results.length === 0) {
          console.log('No se encontraron productos para la receta con ID:', recetaId);
          return res.status(404).json({ error: 'No se encontraron productos para esta receta' });
      }
      res.json(results);
  });
});


module.exports = router;

// Crear una nueva receta
router.post('/', (req, res) => {
    const { nombre, pasos, productos } = req.body;

    const recetaQuery = 'INSERT INTO Receta (nombre, pasos) VALUES (?, ?)';
    db.query(recetaQuery, [nombre, pasos], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error al crear la receta', error: err });
        }

        const recetaId = result.insertId;

        // Aquí agregas la lógica para insertar los productos asociados a la receta
        // Luego envías la respuesta de éxito
        res.status(201).json({ message: 'Receta creada con éxito', recetaId });
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
router.delete('/:recetaId', (req, res) => {
    const recetaId = req.params.recetaId;

    const sql = 'DELETE FROM Receta WHERE receta_id = ?';
    db.query(sql, [recetaId], (err, result) => {
        if (err) {
            console.error('Error al eliminar la receta:', err);
            return res.status(500).json({ error: 'Error al eliminar la receta' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Receta no encontrada' });
        }
        res.json({ message: 'Receta eliminada correctamente' });
    });
});


// Validar inventario
router.post('/:recetaId/validar', (req, res) => {
    const { productos } = req.body;

    const inventario = {
        1: 3,  // 3 Papas
        2: 0   // 0 Mantecas
    };

    let productosFaltantes = [];

    productos.forEach(producto => {
        const cantidadDisponible = inventario[producto.producto_id] || 0;
        if (producto.cantidad_usada > cantidadDisponible) {
            productosFaltantes.push(producto.producto_id);
        }
    });

    if (productosFaltantes.length > 0) {
        res.json({ valido: false, productosFaltantes });
    } else {
        res.json({ valido: true });
    }
});

module.exports = router;

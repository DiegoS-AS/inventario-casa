const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// Obtener todos los productos
router.get('/', (req, res) => {
  db.query('SELECT * FROM Producto', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Crear un nuevo producto
router.post('/', (req, res) => {
  const { nombre, cantidad, fecha_compra, fecha_expiracion, tipo, costo } = req.body;
  const query = 'INSERT INTO Producto (nombre, cantidad, fecha_compra, fecha_expiracion, tipo, costo) VALUES (?, ?, ?, ?, ?, ?)';
  
  db.query(query, [nombre, cantidad, fecha_compra, fecha_expiracion, tipo, costo], (err, result) => {
    if (err) throw err;
    res.status(201).json({ id: result.insertId, ...req.body });
  });
});

// Actualizar un producto existente
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, cantidad, fecha_compra, fecha_expiracion, tipo, costo } = req.body;
  const query = 'UPDATE Producto SET nombre = ?, cantidad = ?, fecha_compra = ?, fecha_expiracion = ?, tipo = ?, costo = ? WHERE producto_id = ?';
  
  db.query(query, [nombre, cantidad, fecha_compra, fecha_expiracion, tipo, costo, id], (err, result) => {
    if (err) throw err;
    res.json({ message: 'Producto actualizado con éxito.' });
  });
});

// Eliminar un producto
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM Producto WHERE producto_id = ?';
  
  db.query(query, [id], (err, result) => {
    if (err) throw err;
    res.json({ message: 'Producto eliminado con éxito.' });
  });
});

module.exports = router;

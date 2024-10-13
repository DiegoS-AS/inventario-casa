const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

// Importar rutas
const productoRoutes = require('./routes/productos');
const recetaRoutes = require('./routes/recetas');

// Usar rutas
app.use('/api/productos', productoRoutes);
app.use('/api/recetas', recetaRoutes);

// Escuchar en el puerto
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

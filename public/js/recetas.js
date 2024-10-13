const apiUrlProductos = 'http://localhost:3000/api/productos';  // Asegúrate de que esta URL sea correcta
const apiUrlRecetas = 'http://localhost:3000/api/recetas';

// Función para cargar productos disponibles y agregarlos al formulario
const loadProductosDisponibles = async () => {
    try {
        const response = await fetch(apiUrlProductos); // Consulta al API de productos
        const productos = await response.json();
        const productosDiv = document.getElementById('productos-recipe');
        productosDiv.innerHTML = '';

        productos.forEach(producto => {
            const productHTML = `
                <div>
                    <label>${producto.nombre} (Cantidad disponible: ${producto.cantidad})</label>
                    <input type="number" id="producto-${producto.producto_id}" placeholder="Cantidad necesaria" min="0" max="${producto.cantidad}">
                </div>
            `;
            productosDiv.insertAdjacentHTML('beforeend', productHTML);
        });
    } catch (error) {
        console.error("Error al cargar los productos: ", error);
    }
};

// Cargar los productos y recetas cuando la página se cargue
window.onload = () => {
    loadProductosDisponibles();
    loadRecetas();  // Si también quieres mostrar las recetas
};

// Función para cargar todas las recetas
const loadRecetas = async () => {
    const response = await fetch(apiUrl);
    const recetas = await response.json();
    const recetasList = document.getElementById('recetas-list');
    recetasList.innerHTML = '';
    
    recetas.forEach(receta => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${receta.nombre}</td>
            <td>${receta.pasos}</td>
            <td>
                <button onclick="editarReceta(${receta.receta_id})">Editar</button>
                <button onclick="eliminarReceta(${receta.receta_id})">Eliminar</button>
            </td>
        `;
        recetasList.appendChild(row);
    });
};

// Función para agregar una receta
const agregarReceta = async (e) => {
    e.preventDefault();

    // Crear el objeto de la receta
    const nuevaReceta = {
        nombre: document.getElementById('nombre-receta').value,
        pasos: document.getElementById('pasos-receta').value,
        productos: []  // Aquí vamos a agregar los productos seleccionados
    };

    // Recoger los productos seleccionados y sus cantidades
    const productosDiv = document.getElementById('productos-recipe');
    const inputs = productosDiv.querySelectorAll('input[type="number"]');
    
    inputs.forEach(input => {
        const productoId = input.id.split('-')[1];  // Obtener el ID del producto del ID del input
        const cantidadNecesaria = input.value;

        if (cantidadNecesaria > 0) {
            nuevaReceta.productos.push({
                producto_id: productoId,
                cantidad_usada: cantidadNecesaria
            });
        }
    });

    try {
        // Enviar la receta y los productos al backend
        const response = await fetch(apiUrlRecetas, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nuevaReceta)
        });

        if (response.ok) {
            alert('Receta creada con éxito');
            document.getElementById('receta-form').reset();
            loadRecetas();
        } else {
            const errorMessage = await response.json();
            alert(`Error: ${errorMessage.message}`);
        }
    } catch (error) {
        console.error("Error al guardar la receta: ", error);
    }
};

// Conectar la función al formulario
document.getElementById('receta-form').addEventListener('submit', agregarReceta);



// Función para eliminar una receta
const eliminarReceta = async (id) => {
    await fetch(`${apiUrl}/${id}`, {
        method: 'DELETE'
    });
    loadRecetas();
};

// Función para editar una receta (similar a productos)
const editarReceta = async (id) => {
    const nuevoNombre = prompt("Nuevo nombre de la receta:");
    const nuevosPasos = prompt("Nuevos pasos de la receta:");

    if (nuevoNombre && nuevosPasos) {
        await fetch(`${apiUrl}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nombre: nuevoNombre, pasos: nuevosPasos })
        });
        loadRecetas();
    }
};

// Cargar las recetas al cargar la página
document.getElementById('receta-form').addEventListener('submit', agregarReceta);
window.onload = loadRecetas;

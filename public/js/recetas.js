const apiUrlProductos = 'http://localhost:3000/api/productos';  // Asegúrate de que esta URL sea correcta
const apiUrlRecetas = 'http://localhost:3000/api/recetas';

// Función para cargar los productos disponibles en el formulario
const loadProductosDisponibles = async () => {
    try {
        const response = await fetch(apiUrlProductos);  // Solicitud al backend para obtener productos
        if (!response.ok) {
            throw new Error('Error al obtener los productos');
        }

        const productos = await response.json();  // Convertir la respuesta a JSON
        const productosDiv = document.getElementById('productos-recipe');
        productosDiv.innerHTML = '';  // Limpiar el contenido anterior antes de agregar los productos

        // Verificar si hay productos para mostrar
        if (productos.length === 0) {
            productosDiv.innerHTML = '<p>No hay productos disponibles</p>';
        }

        // Crear el HTML para cada producto
        productos.forEach(producto => {
            const productHTML = `
                <div>
                    <label>${producto.nombre} (Cantidad disponible: ${producto.cantidad})</label>
                    <input type="number" id="producto-${producto.producto_id}" placeholder="Cantidad necesaria" min="0" max="${producto.cantidad}">
                </div>
            `;
            productosDiv.insertAdjacentHTML('beforeend', productHTML);  // Insertar cada producto en el DOM
        });
    } catch (error) {
        console.error("Error al cargar los productos: ", error);
    }
};

// Llama a la función `loadProductosDisponibles` cuando la página se cargue
document.addEventListener('DOMContentLoaded', () => {
    loadProductosDisponibles();  // Cargar productos cuando el DOM esté listo
    //loadRecetas();               // Cargar recetas también
});


// Función para cargar todas las recetas existentes
const loadRecetas = async () => {
    try {
        const response = await fetch(apiUrlRecetas);
        const recetas = await response.json();  // Obtén las recetas del backend
        const recetasList = document.getElementById('recetas-list');
        recetasList.innerHTML = '';  // Limpiar la tabla antes de cargar las recetas

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
    } catch (error) {
        console.error("Error al cargar las recetas: ", error);
    }
};

// Cargar las recetas cuando la página se cargue
window.onload = () => {
    loadRecetas();
    loadProductosDisponibles();  // Si también quieres mostrar los productos en la misma página
};


// Función para agregar una receta
const agregarReceta = async (e) => {
    e.preventDefault();

    const nuevaReceta = {
        nombre: document.getElementById('nombre-receta').value,
        pasos: document.getElementById('pasos-receta').value,
        productos: []  // Aquí almacenaremos los productos seleccionados
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
        const response = await fetch(apiUrlRecetas, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nuevaReceta)  // Enviar receta con los productos seleccionados
        });

        if (response.ok) {
            alert('Receta creada con éxito');
            document.getElementById('receta-form').reset();
            loadRecetas();  // Llamar a esta función para recargar la lista de recetas
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

const apiUrlProductos = 'http://localhost:3000/api/productos';  // Asegúrate de que esta URL sea correcta
const apiUrlRecetas = 'http://localhost:3000/api/recetas';

// Función para cargar los productos disponibles en el formulario
const loadProductosDisponibles = async () => {
    try {
        const response = await fetch(apiUrlProductos);
        const productos = await response.json();
        const productosDiv = document.getElementById('productos-recipe');
        productosDiv.innerHTML = '';

        if (productos.length === 0) {
            productosDiv.innerHTML = '<p>No hay productos disponibles</p>';
        }

        productos.forEach(producto => {
            const productHTML = `
                <div>
                    <input type="checkbox" id="producto-${producto.producto_id}" name="productos" value="${producto.producto_id}">
                    <label for="producto-${producto.producto_id}">${producto.nombre} (Cantidad disponible: ${producto.cantidad})</label>
                </div>
            `;
            productosDiv.insertAdjacentHTML('beforeend', productHTML);
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


// Función para cargar las recetas desde el backend
const loadRecetas = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/recetas');  // Ajusta el puerto del servidor backend
        const recetas = await response.json();

        const recetasList = document.getElementById('recetas-list');
        recetasList.innerHTML = '';  // Limpiar el contenedor antes de agregar recetas

        recetas.forEach(receta => {
            const recetaHTML = `
                <div class="receta">
                    <h3>${receta.nombre}</h3>
                    <button onclick="mostrarModal(${receta.receta_id})">Hacer</button>
                    <button onclick="editarReceta(${receta.receta_id})">Editar</button>
                    <button onclick="eliminarReceta(${receta.receta_id})">Eliminar</button>
                </div>

                <!-- Modal para esta receta -->
                <div id="modal-${receta.receta_id}" class="modal">
                    <div class="modal-content">
                        <span class="close" onclick="cerrarModal(${receta.receta_id})">&times;</span>
                        <h2>Ingrese las cantidades para la receta</h2>
                        <form id="cantidad-productos-form">
                            <div id="productos-cantidad-${receta.receta_id}"></div>
                            <button type="button" onclick="validarCantidades(${receta.receta_id})">Confirmar</button>
                        </form>
                    </div>
                </div>
            `;

            recetasList.insertAdjacentHTML('beforeend', recetaHTML);
        });
    } catch (error) {
        console.error("Error al cargar las recetas: ", error);
    }
};


// Cargar las recetas cuando la página se cargue
window.onload = () => {
    loadRecetas();
};

// Función para agregar una receta
const agregarReceta = async (e) => {
    e.preventDefault();

    // Crear el objeto de la receta
    const nuevaReceta = {
        nombre: document.getElementById('nombre-receta').value,
        pasos: document.getElementById('pasos-receta').value,
        productos: []  // Aquí almacenaremos los IDs de los productos seleccionados
    };

    // Recoger productos seleccionados
    const productosCheckboxes = document.querySelectorAll('input[name="productos"]:checked');

    productosCheckboxes.forEach(checkbox => {
        const productoId = checkbox.value;
        nuevaReceta.productos.push({
            producto_id: productoId
        });
    });

    try {
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
const eliminarReceta = async (recetaId) => {
    console.log('ID de la receta a eliminar:', recetaId);  // Agrega esto para verificar

    const confirmacion = confirm("¿Estás seguro de que deseas eliminar esta receta?");
    if (confirmacion) {
        try {
            const response = await fetch(`http://localhost:3000/api/recetas/${recetaId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                alert('Receta eliminada con éxito');
                loadRecetas();  // Recargar las recetas después de eliminar
            } else {
                alert('Error al eliminar la receta');
            }
        } catch (error) {
            console.error("Error al eliminar la receta: ", error);
        }
    }
};


// Cargar las recetas al cargar la página
document.getElementById('receta-form').addEventListener('submit', agregarReceta);
window.onload = loadRecetas;

// Mostrar el modal para la receta
const mostrarModal = (recetaId) => {
    const modal = document.getElementById(`modal-${recetaId}`);
    modal.style.display = "block";

    // Cargar los productos necesarios para la receta
    cargarProductosParaReceta(recetaId);
};

// Cerrar el modal
const cerrarModal = (recetaId) => {
    const modal = document.getElementById(`modal-${recetaId}`);
    modal.style.display = "none";
};

// Función para cargar los productos en el modal
const cargarProductosParaReceta = (recetaId) => {
    const productosDiv = document.getElementById(`productos-cantidad-${recetaId}`);
    productosDiv.innerHTML = '';

    // Asegúrate de usar el puerto correcto donde corre el servidor backend (Node.js)
    fetch(`http://localhost:3000/api/recetas/${recetaId}/productos`)
        .then(response => response.json())
        .then(productos => {
            productos.forEach(producto => {
                productosDiv.innerHTML += `
                    <label>${producto.nombre} (Cantidad disponible: ${producto.cantidad})</label>
                    <input type="number" id="cantidad-${producto.producto_id}" min="0" max="${producto.cantidad}">
                `;
            });
        })
        .catch(error => console.error('Error al cargar productos de la receta:', error));
};


// Validar las cantidades ingresadas con el inventario en el backend
const validarCantidades = async (recetaId) => {
    const productosDiv = document.getElementById(`productos-cantidad-${recetaId}`);
    const inputs = productosDiv.querySelectorAll('input[type="number"]');
    let productosSolicitados = [];

    inputs.forEach(input => {
        const productoId = input.id.split('-')[1];
        const cantidadIngresada = parseFloat(input.value);

        productosSolicitados.push({
            producto_id: productoId,
            cantidad_usada: cantidadIngresada
        });
    });

    // Enviar los productos solicitados al backend para validación
    const response = await fetch(`/api/recetas/${recetaId}/validar`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productos: productosSolicitados })
    });

    const resultado = await response.json();

    if (resultado.valido) {
        alert('Todo está listo, comenzamos con la receta!');
        mostrarPasosDeReceta(recetaId);  // Mostrar los pasos si todo está bien
        cerrarModal(recetaId);  // Cerrar el modal
    } else {
        alert(`No tiene suficiente de: ${resultado.productosFaltantes.join(", ")}`);
    }
};

// Función que muestra los pasos de la receta
const mostrarPasosDeReceta = (recetaId) => {
    alert(`Mostrando los pasos de la receta ${recetaId}`);  // Aquí pondrías la lógica para mostrar los pasos
};

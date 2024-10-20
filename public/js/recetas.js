const apiUrlProductos = 'http://localhost:3000/api/productos';  // Asegúrate de que esta URL sea correcta
const apiUrlRecetas = 'http://localhost:3000/api/recetas';

// Mostrar el modal para la receta
const mostrarModal = async (recetaId) => {
    const modal = document.getElementById(`modal-${recetaId}`);
    modal.style.display = "block";

    // Obtener los productos asociados a la receta
    const response = await fetch(`http://localhost:3000/api/recetas/${recetaId}/productos`);
    const productos = await response.json();
    console.log('Productos recibidos:', productos);

    const productosDiv = document.getElementById(`productos-cantidad-${recetaId}`);
    productosDiv.innerHTML = '';  // Limpiar antes de agregar

    productos.forEach(producto => {
        const productoHTML = `
            <div class="producto-item">
                <label>${producto.nombre} (Cantidad disponible: ${producto.cantidad})</label>
                <input type="number" class="producto-cantidad" min="0" max="${producto.cantidad}" placeholder="Cantidad a usar">
            </div>
        `;
        productosDiv.insertAdjacentHTML('beforeend', productoHTML);
    });
};

// Cerrar el modal
const cerrarModal = (recetaId) => {
    const modal = document.getElementById('modal-nueva-receta');
    if (modal) {
        modal.style.display = 'none';  // Oculta el modal
    }
};

// Función para cargar las recetas desde el backend
const loadRecetas = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/recetas');  // Ajusta el puerto del servidor backend
        const recetas = await response.json();

        const recetasList = document.getElementById('recetas-list');
        recetasList.innerHTML = '';  // Limpiar el contenedor antes de agregar recetas

        recetas.forEach(receta => {
            const recetaCardHTML = `
                <div class="receta-card">
                    <div class="receta-box"></div>  <!-- White square box instead of image -->
                    <h3>${receta.nombre}</h3>
                    <div class="receta-buttons">
                        <button class="hacer-btn" onclick="hacerReceta(${receta.receta_id})">HACER</button>
                        <button class="eliminiar-btn" onclick="eliminarReceta(${receta.receta_id})">ELIMINAR</button>
                    </div>
                </div>

                <!-- Modal para esta receta -->
                <div id="modal-hacer-receta-${receta.receta_id}" class="modal">
                    <div class="modal-content">
                        <span class="close" onclick="cerrarModal(${receta.receta_id})">&times;</span>
                        <h2>Ingrese las cantidades para la receta</h2>
                        <div id="productos-cantidad-${receta.receta_id}">
                            <!-- Aquí se generarán dinámicamente los inputs de cantidad -->
                        </div>
                        <button type="button" onclick="validarCantidades(${receta.receta_id})">Confirmar</button>
                    </div>
                </div>
            `;

            recetasList.insertAdjacentHTML('beforeend', recetaCardHTML);
        });
    } catch (error) {
        console.error("Error al cargar las recetas: ", error);
    }
};

// Función para cargar los productos disponibles en el formulario
const cargarProductosDisponibles = async () => {
    try {
        console.log('Cargando productos disponibles...');
        const response = await fetch('http://localhost:3000/api/productos');
        const productos = await response.json();

        console.log('Productos recibidos:', productos);

        const productosDiv = document.getElementById('productos-recipe'); // Asegúrate de tener el ID correcto en el HTML
        productosDiv.innerHTML = '';  // Limpiar antes de agregar productos

        if (productos.length === 0) {
            productosDiv.innerHTML = '<p>No hay productos disponibles</p>';
        } else {
            productos.forEach(producto => {
                const productoHTML = `
                    <div class="producto-item">
                        <input type="checkbox" id="producto-${producto.producto_id}" name="productos" value="${producto.producto_id}">
                        <label for="producto-${producto.producto_id}">${producto.nombre}</label>
                    </div>
                `;
                productosDiv.insertAdjacentHTML('beforeend', productoHTML);
            });
        }

    } catch (error) {
        console.error('Error al cargar los productos:', error);
    }
};

// Llama a esta función cuando se abra el modal de nueva receta
document.getElementById('agregar-receta-btn').addEventListener('click', () => {
    cargarProductosDisponibles();  // Cargar los productos en el modal
    document.getElementById('modal-nueva-receta').style.display = 'block';  // Mostrar el modal
});

// Conectar la función al formulario
document.addEventListener('DOMContentLoaded', () => {
    const recetaForm = document.getElementById('receta-form');
    if (recetaForm) {
        recetaForm.addEventListener('submit', agregarReceta);
    }
    // Ensure we can access the grid container
    const recetasGrid = document.querySelector('.recetas-grid');
    loadRecetas();
});

// Función para agregar una receta
const agregarReceta = async (e) => {
    e.preventDefault();

    const nuevaReceta = {
        nombre: document.getElementById('nombre-receta').value,
        pasos: document.getElementById('pasos-receta').value,
        productos: []  // Aquí almacenaremos los productos seleccionados
    };

    // Recoger productos seleccionados y cantidades
    document.querySelectorAll('.producto-checkbox').forEach(checkbox => {
        if (checkbox.checked) {
            const productoId = checkbox.value;
            const cantidad = checkbox.parentElement.nextElementSibling.value;
            if (cantidad > 0) {
                nuevaReceta.productos.push({
                    producto_id: productoId,
                    cantidad_usada: cantidad
                });
            }
        }
    });

    try {
        const response = await fetch('http://localhost:3000/api/recetas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nuevaReceta)
        });

        if (response.ok) {
            alert('Receta creada con éxito');
            document.getElementById('nueva-receta-form').reset();
            cerrarModal();  // Cerrar el modal después de crear la receta
            loadRecetas();  // Recargar la lista de recetas
        } else {
            const errorMessage = await response.json();
            alert(`Error: ${errorMessage.message}`);
        }
    } catch (error) {
        console.error("Error al guardar la receta: ", error);
    }
};

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
document.getElementById('nueva-receta-form').addEventListener('submit', agregarReceta);
window.onload = loadRecetas;

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
                    <label>${producto.nombre} (Cant disponible: ${producto.cantidad})</label>
                    <input type="number" id="cantidad-${producto.producto_id}" min="0" max="${producto.cantidad}">
                `;
            });
        })
        .catch(error => console.error('Error al cargar productos de la receta:', error));
};

// Validar las cantidades ingresadas con el inventario en el backend
const validarCantidades = (recetaId) => {
    const productosDiv = document.getElementById(`productos-cantidad-${recetaId}`);
    const inputs = productosDiv.querySelectorAll('.producto-cantidad');
    
    let cantidadesValidas = true;
    let productosFaltantes = [];

    inputs.forEach(input => {
        const cantidadDisponible = parseInt(input.max);
        const cantidadIngresada = parseInt(input.value);
        
        if (cantidadIngresada > cantidadDisponible) {
            cantidadesValidas = false;
            productosFaltantes.push(input.parentElement.querySelector('label').innerText);  // Nombre del producto faltante
        }
    });

    if (cantidadesValidas) {
        alert('Puede proceder con la receta');
        cerrarModal(recetaId);  // Cerrar el modal si todo está bien
    } else {
        alert(`No tiene suficiente de los siguientes productos: ${productosFaltantes.join(', ')}`);
    }
};

// Función que muestra los pasos de la receta
const mostrarPasosDeReceta = (recetaId) => {
    alert(`Mostrando los pasos de la receta ${recetaId}`);  // Aquí pondrías la lógica para mostrar los pasos
};

const hacerReceta = async (recetaId) => {
    try {
        // Obtener los productos de la receta
        const response = await fetch(`http://localhost:3000/api/recetas/${recetaId}/productos`);
        const productos = await response.json();

        // Abrir el modal para ingresar las cantidades
        const modal = document.getElementById(`modal-hacer-receta-${recetaId}`);
        modal.style.display = "block";  // Mostrar el modal

        // Limpiar el contenido del modal antes de añadir los productos
        const productosDiv = document.getElementById(`productos-cantidad-${recetaId}`);
        productosDiv.innerHTML = '';

        // Generar los inputs para ingresar las cantidades
        productos.forEach(producto => {
            const productoHTML = `
                <div class="producto-item">
                    <label>${producto.nombre} (Disponible: ${producto.cantidad})</label>
                    <input type="number" class="producto-cantidad" id="cantidad-${producto.producto_id}" min="0" max="${producto.cantidad}" placeholder="Cantidad a usar">
                </div>
            `;
            productosDiv.insertAdjacentHTML('beforeend', productoHTML);
        });

    } catch (error) {
        console.error("Error al obtener los productos de la receta:", error);
    }
};

const apiUrl = 'http://localhost:3000/api/productos';

// Función para cargar todos los productos
const loadProductos = async () => {
    const response = await fetch(apiUrl);
    const productos = await response.json();
    const productosList = document.getElementById('productos-list');
    productosList.innerHTML = '';
    
    productos.forEach(producto => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${producto.nombre}</td>
            <td>${producto.cantidad}</td>
            <td>${producto.fecha_compra}</td>
            <td>${producto.fecha_expiracion}</td>
            <td>${producto.tipo}</td>
            <td>${producto.costo}</td>
            <td>
                <button onclick="editarProducto(${producto.producto_id})">Editar</button>
                <button onclick="eliminarProducto(${producto.producto_id})">Eliminar</button>
            </td>
        `;
        productosList.appendChild(row);
    });
};

// Función para agregar un producto
const agregarProducto = async (e) => {
    e.preventDefault();

    const nuevoProducto = {
        nombre: document.getElementById('nombre').value,
        cantidad: document.getElementById('cantidad').value,
        fecha_compra: document.getElementById('fecha_compra').value,
        fecha_expiracion: document.getElementById('fecha_expiracion').value,
        tipo: document.getElementById('tipo').value,
        costo: document.getElementById('costo').value
    };

    await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(nuevoProducto)
    });

    document.getElementById('producto-form').reset();
    loadProductos();
};

// Función para eliminar un producto
const eliminarProducto = async (id) => {
    await fetch(`${apiUrl}/${id}`, {
        method: 'DELETE'
    });
    loadProductos();
};

// Función para editar un producto (esto puede abrir un modal o un formulario en el futuro)
const editarProducto = async (id) => {
    // Aquí se puede implementar la funcionalidad de editar el producto
    // Por simplicidad, se puede usar un prompt para editar rápidamente
    const nuevoNombre = prompt("Nuevo nombre del producto:");
    if (nuevoNombre) {
        await fetch(`${apiUrl}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nombre: nuevoNombre })
        });
        loadProductos();
    }
};

// Cargar los productos al cargar la página
document.getElementById('producto-form').addEventListener('submit', agregarProducto);
window.onload = loadProductos;

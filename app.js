let ventas = JSON.parse(localStorage.getItem("ventas")) || [];
let productoSeleccionado = null;

let productos = JSON.parse(localStorage.getItem("productos")) || [];

function guardarProducto(){

    const producto = {
        id: Date.now(),
        nombre: document.getElementById("nombre").value,
        marca: document.getElementById("marca").value,
        precioBolsa: Number(document.getElementById("precioBolsa").value),
        precioKilo: Number(document.getElementById("precioKilo").value),
        pesoBolsa: Number(document.getElementById("pesoBolsa").value),
        stock: Number(document.getElementById("stock").value)
    };

    productos.push(producto);

    localStorage.setItem("productos", JSON.stringify(productos));

    limpiarInputs();
    mostrarProductos();
}

function mostrarProductos(){

    const lista = document.getElementById("listaProductos");
    lista.innerHTML = "";

    productos.forEach(p => {
        lista.innerHTML += `
            <div class="producto">
                <b>${p.nombre}</b> - ${p.marca}<br>
                Stock: ${p.stock} kg<br>
                Bolsa: $${p.precioBolsa} | Kg: $${p.precioKilo}
            </div>
        `;
    });
}

mostrarVentas();

function registrarVenta(){

    if(!productoSeleccionado){
    alert("Seleccione un producto");
    return;
}

const producto = productoSeleccionado;
    const tipo = document.getElementById("tipoVenta").value;
    const cantidad = Number(document.getElementById("cantidadVenta").value);

    if(!producto){
        alert("Producto no encontrado");
        return;
    }

    let kilosVendidos = 0;
    let total = 0;

    if(tipo === "bolsa"){
        kilosVendidos = cantidad * producto.pesoBolsa;
        total = cantidad * producto.precioBolsa;
    } else {
        kilosVendidos = cantidad;
        total = cantidad * producto.precioKilo;
    }

    if(producto.stock < kilosVendidos){
        alert("No hay stock suficiente");
        return;
    }

    producto.stock -= kilosVendidos;

    const venta = {
    id: Date.now(),
    fecha: new Date().toLocaleString(),
    productoId: producto.id,
    producto: producto.nombre,
    tipo: tipo,
    cantidad: cantidad,
    kilosVendidos: kilosVendidos,
    total: total
};

    ventas.push(venta);

    localStorage.setItem("ventas", JSON.stringify(ventas));
    localStorage.setItem("productos", JSON.stringify(productos));

    mostrarProductos();
    mostrarVentas();
    
    productoSeleccionado = null;
    document.getElementById("buscarProducto").value = "";
    document.getElementById("cantidadVenta").value = "";
}

function mostrarVentas(){
    const lista = document.getElementById("listaVentas");
    lista.innerHTML = "";

    ventas.forEach(v => {
    lista.innerHTML += `
        <div class="producto">
            ${v.fecha}<br>
            ${v.producto} - ${v.tipo} - ${v.cantidad}<br>
            Total: $${v.total}<br>
            <button onclick="eliminarVenta(${v.id})">Eliminar</button>
        </div>
    `;
});
}
    
function eliminarVenta(idVenta){

    const venta = ventas.find(v => v.id === idVenta);

    if(!venta){
        return;
    }

    // Buscar el producto original
    const producto = productos.find(p => p.id === venta.productoId);

    if(producto){
        producto.stock += venta.kilosVendidos;
    }

    // Eliminar la venta del array
    ventas = ventas.filter(v => v.id !== idVenta);

    localStorage.setItem("ventas", JSON.stringify(ventas));
    localStorage.setItem("productos", JSON.stringify(productos));

    mostrarProductos();
    mostrarVentas();
}
    
function limpiarInputs(){
    document.querySelectorAll("input").forEach(i => i.value="");
}


mostrarProductos();

document.getElementById("buscarProducto").addEventListener("input", function(){

    const texto = this.value.toLowerCase();
    const sugerencias = document.getElementById("sugerencias");

    sugerencias.innerHTML = "";

    if(texto === ""){
        return;
    }

    const filtrados = productos.filter(p => 
    (p.nombre && p.nombre.toLowerCase().includes(texto)) ||
    (p.marca && p.marca.toLowerCase().includes(texto))
);

    filtrados.forEach(p => {
        const div = document.createElement("div");
        div.textContent = `${p.nombre} (${p.stock} kg)`;

        div.onclick = function(){
            document.getElementById("buscarProducto").value = p.nombre;
            productoSeleccionado = p;
            sugerencias.innerHTML = "";
        };

        sugerencias.appendChild(div);
    });

});
}





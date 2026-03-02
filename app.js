let ventas = JSON.parse(localStorage.getItem("ventas")) || [];
let productoSeleccionado = null;
let productoEditandoId = null;

let productos = JSON.parse(localStorage.getItem("productos")) || [];

function guardarProducto(){

    const nombre = document.getElementById("nombre").value;
    const marca = document.getElementById("marca").value;
    const precioBolsa = Number(document.getElementById("precioBolsa").value);
    const precioKilo = Number(document.getElementById("precioKilo").value);
    const pesoBolsa = Number(document.getElementById("pesoBolsa").value);
    const stock = Number(document.getElementById("stock").value);

    if(productoEditandoId){

        const producto = productos.find(p => p.id === productoEditandoId);

        producto.nombre = nombre;
        producto.marca = marca;
        producto.precioBolsa = precioBolsa;
        producto.precioKilo = precioKilo;
        producto.pesoBolsa = pesoBolsa;
        producto.stock = stock;

        productoEditandoId = null;

    } else {

        const nuevoProducto = {
            id: Date.now(),
            nombre,
            marca,
            precioBolsa,
            precioKilo,
            pesoBolsa,
            stock
        };

        productos.push(nuevoProducto);
    }

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
            Bolsa: $${p.precioBolsa} | Kg: $${p.precioKilo}<br>
            <button onclick="editarProducto(${p.id})">Editar</button>
        </div>
    `;
});
}

mostrarVentas();

function editarProducto(id){

    const producto = productos.find(p => p.id === id);

    if(!producto) return;

    document.getElementById("nombre").value = producto.nombre;
    document.getElementById("marca").value = producto.marca;
    document.getElementById("precioBolsa").value = producto.precioBolsa;
    document.getElementById("precioKilo").value = producto.precioKilo;
    document.getElementById("pesoBolsa").value = producto.pesoBolsa;
    document.getElementById("stock").value = producto.stock;

    productoEditandoId = id;
}

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

    const producto = productos.find(p => p.id === venta.productoId);

    if(producto && venta.kilosVendidos){
        producto.stock += venta.kilosVendidos;
    }

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

function exportarVentas(){

    if(ventas.length === 0){
        alert("No hay ventas para exportar");
        return;
    }

    let contenido = "Fecha,Producto,Tipo,Cantidad,Total\n";

    ventas.forEach(v => {
        contenido += `${v.fecha},${v.nombre},${v.tipo},${v.cantidad},${v.total}\n`;
    });

    const blob = new Blob([contenido], { type: "text/csv;charset=utf-8;" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "ventas_petshop.csv";

    link.click();
}

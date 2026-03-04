let ventas = JSON.parse(localStorage.getItem("ventas")) || [];
let productoSeleccionado = null;
let productoEditandoId = null;

let productos = JSON.parse(localStorage.getItem("productos")) || [];

function guardarProducto(){

    const nombre = document.getElementById("nombre").value;
    const marca = document.getElementById("marca").value;
    const precio = Number(document.getElementById("precio").value);
    const unidad = document.getElementById("unidad").value;
    const stock = Number(document.getElementById("stock").value);

    if(productoEditandoId){

        const producto = productos.find(p => p.id === productoEditandoId);

        producto.nombre = nombre;
        producto.marca = marca;
        producto.precio = precio;
        producto.unidad = unidad;
        producto.stock = stock;

        productoEditandoId = null;

    } else {

        const nuevoProducto = {
            id: Date.now(),
            nombre,
            marca,
            precio,
            unidad,
            stock
        };

        productos.push(nuevoProducto);
    }

    localStorage.setItem("productos", JSON.stringify(productos));

    limpiarInputs();
    mostrarProductos();
}

function mostrarPantalla(pantalla){

    const prod = document.getElementById("pantallaProductos");
    const vent = document.getElementById("pantallaVentas");
    const rep = document.getElementById("pantallaReportes");

    if(!prod || !vent || !rep){
        console.log("Alguna pantalla no existe en el HTML");
        return;
    }

    prod.style.display = "none";
    vent.style.display = "none";
    rep.style.display = "none";

    if(pantalla === "productos") prod.style.display = "block";
    if(pantalla === "ventas") vent.style.display = "block";
    if(pantalla === "reportes") rep.style.display = "block";
}

mostrarVentas();

function mostrarProductos(){

    const lista = document.getElementById("listaProductos");
    lista.innerHTML = "";

    productos.forEach(p => {
        lista.innerHTML += `
            <div class="producto">
                <b>${p.nombre}</b> - ${p.marca}<br>
                Precio: $${p.precio} por ${p.unidad}<br>
                Stock: ${p.stock} ${p.unidad}<br>
                <button onclick="editarProducto(${p.id})">Editar</button>
            </div>
        `;
    });
}

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

    const cantidad = Number(document.getElementById("cantidadVenta").value);
    const producto = productoSeleccionado;

    if(producto.stock < cantidad){
        alert("No hay stock suficiente");
        return;
    }

    const total = cantidad * producto.precio;

    producto.stock -= cantidad;

    const venta = {
        id: Date.now(),
        fecha: new Date().toLocaleString(),
        productoId: producto.id,
        producto: producto.nombre,
        cantidad: cantidad,
        unidad: producto.unidad,
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

    let contenido = "Fecha;Producto;Tipo;Cantidad;Total\n";

    ventas.forEach(v => {
        contenido += `${v.fecha};${v.nombre};${v.tipo};${v.cantidad};${v.total}\n`;
    });

    const blob = new Blob([contenido], { type: "text/csv;charset=utf-8;" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "ventas_petshop.csv";

    link.click();
}

function mostrarPantalla(pantalla){

    document.getElementById("pantallaProductos").style.display = "none";
    document.getElementById("pantallaVentas").style.display = "none";
    document.getElementById("pantallaReportes").style.display = "none";

    if(pantalla === "productos"){
        document.getElementById("pantallaProductos").style.display = "block";
    }

    if(pantalla === "ventas"){
        document.getElementById("pantallaVentas").style.display = "block";
    }

    if(pantalla === "reportes"){
        document.getElementById("pantallaReportes").style.display = "block";
    }
}

window.onload = function(){
    mostrarPantalla("productos");
};

localStorage.clear();

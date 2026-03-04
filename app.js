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

function mostrarPantalla(nombre){

    // Oculta solo pantallas dentro del sistema
    document.querySelectorAll("#sistema .pantalla").forEach(p => {
        p.style.display = "none";
    });

    const pantalla = document.getElementById(
        "pantalla" + nombre.charAt(0).toUpperCase() + nombre.slice(1)
    );

    if(pantalla){
        pantalla.style.display = "block";
    }

    if(nombre === "dashboard"){
        actualizarDashboard();
    }
}

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

let configuracion = JSON.parse(localStorage.getItem("configuracion")) || {};

function guardarConfiguracion(){

    configuracion = {
        nombre: document.getElementById("nombreNegocio").value,
        dueno: document.getElementById("duenoNegocio").value,
        telefono: document.getElementById("telefonoNegocio").value,
        direccion: document.getElementById("direccionNegocio").value,
        rubro: document.getElementById("rubroNegocio").value
    };

    localStorage.setItem("configuracion", JSON.stringify(configuracion));

    aplicarConfiguracion();

    alert("Configuración guardada");
}

function aplicarConfiguracion(){

    if(configuracion.nombre){
        document.getElementById("tituloSistema").innerText =
    "🏪 " + configuracion.nombre + " - Sistema Comercial v2.0";
    }
}

aplicarConfiguracion();

function actualizarDashboard(){

    if(!ventas) return;

    const hoy = new Date().toLocaleDateString();
    const mesActual = new Date().getMonth();
    const anioActual = new Date().getFullYear();

    let totalHoy = 0;
    let totalMes = 0;
    let contadorVentas = ventas.length;
    let productosVendidos = {};

    ventas.forEach(v => {

        const fechaVenta = new Date(v.fecha);
        const fechaTexto = fechaVenta.toLocaleDateString();

        if(fechaTexto === hoy){
            totalHoy += v.total;
        }

        if(fechaVenta.getMonth() === mesActual && fechaVenta.getFullYear() === anioActual){
            totalMes += v.total;
        }

        if(!productosVendidos[v.producto]){
            productosVendidos[v.producto] = 0;
        }

        productosVendidos[v.producto] += v.cantidad;
    });

    let productoTop = "-";
    let maxCantidad = 0;

    for(let producto in productosVendidos){
        if(productosVendidos[producto] > maxCantidad){
            maxCantidad = productosVendidos[producto];
            productoTop = producto;
        }
    }

    document.getElementById("ventasHoy").innerText = "$" + totalHoy;
    document.getElementById("ventasMes").innerText = "$" + totalMes;
    document.getElementById("cantidadVentas").innerText = contadorVentas;
    document.getElementById("productoTop").innerText = productoTop;
}

// Usuario por defecto (solo la primera vez)
if(!localStorage.getItem("usuarioSistema")){
    localStorage.setItem("usuarioSistema", JSON.stringify({
        usuario: "admin",
        password: "1234"
    }));
}

let usuarioGuardado = JSON.parse(localStorage.getItem("usuarioSistema"));
let sesionActiva = localStorage.getItem("sesionActiva");

function iniciarSesion(){

    const usuario = document.getElementById("usuarioLogin").value;
    const password = document.getElementById("passwordLogin").value;

    if(usuario === usuarioGuardado.usuario &&
       password === usuarioGuardado.password){

        localStorage.setItem("sesionActiva", "true");

        document.getElementById("pantallaLogin").style.display = "none";
        document.getElementById("sistema").style.display = "block";

        mostrarPantalla("dashboard");

    } else {
        alert("Usuario o contraseña incorrectos");
    }
}

function verificarSesion(){

    if(sesionActiva === "true"){
        document.getElementById("pantallaLogin").style.display = "none";
        document.getElementById("sistema").style.display = "block";
        mostrarPantalla("dashboard");
    } else {
        document.getElementById("pantallaLogin").style.display = "block";
    }
}

function cerrarSesion(){

    localStorage.removeItem("sesionActiva");
    location.reload();
}

verificarSesion();


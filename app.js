// ======================
// VARIABLES
// ======================
let ventas = JSON.parse(localStorage.getItem("ventas")) || [];
let productos = JSON.parse(localStorage.getItem("productos")) || [];
let productoSeleccionado = null;
let productoEditandoId = null;
let carrito = [];

// ======================
// PRODUCTOS
// ======================
function guardarProducto() {
    const nombre = document.getElementById("nombre").value;
    const marca = document.getElementById("marca").value;
    const precio = Number(document.getElementById("precio").value);
    const unidad = document.getElementById("unidad").value;
    const stock = Number(document.getElementById("stock").value);

    if (productoEditandoId) {
        const producto = productos.find(p => p.id === productoEditandoId);
        producto.nombre = nombre;
        producto.marca = marca;
        producto.precio = precio;
        producto.unidad = unidad;
        producto.stock = stock;
        productoEditandoId = null;
    } else {
        const nuevoProducto = { id: Date.now(), nombre, marca, precio, unidad, stock };
        productos.push(nuevoProducto);
    }

    localStorage.setItem("productos", JSON.stringify(productos));
    limpiarInputs();
    mostrarProductos();
}

function mostrarProductos() {
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

function editarProducto(id) {
    const producto = productos.find(p => p.id === id);
    if (!producto) return;

    document.getElementById("nombre").value = producto.nombre;
    document.getElementById("marca").value = producto.marca;
    document.getElementById("precio").value = producto.precio;
    document.getElementById("unidad").value = producto.unidad;
    document.getElementById("stock").value = producto.stock;

    productoEditandoId = id;
}

// ======================
// VENTAS
// ======================
function registrarVenta() {
    if (!productoSeleccionado) {
        alert("Seleccione un producto");
        return;
    }

    const cantidad = Number(document.getElementById("cantidadVenta").value);
    const producto = productoSeleccionado;

    if (producto.stock < cantidad) {
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

        let productosHTML = "";

        v.items.forEach(item => {
            productosHTML += `
                <div class="ventaItem">
                    ${item.producto} 
                    <span class="cantidad">${item.cantidad}</span> x $${item.precio}
                    <span class="subtotal">= $${item.subtotal}</span>
                </div>
            `;
        });

        lista.innerHTML += `
            <div class="ventaCard">
                <b>${new Date(v.fecha).toLocaleString()}</b>
                <hr>
                ${productosHTML}
                <hr>
                <div class="ventaTotal">
                    TOTAL: $${v.total}
                </div>
                <button onclick="eliminarVenta(${v.id})">
                    <i class="fa-solid fa-trash"></i> Eliminar
                </button>
            </div>
        `;
    });
}

function eliminarVenta(idVenta) {
    const venta = ventas.find(v => v.id === idVenta);
    if (!venta) return;

    const producto = productos.find(p => p.id === venta.productoId);
    if (producto) producto.stock += venta.cantidad;

    ventas = ventas.filter(v => v.id !== idVenta);

    localStorage.setItem("ventas", JSON.stringify(ventas));
    localStorage.setItem("productos", JSON.stringify(productos));

    mostrarProductos();
    mostrarVentas();
}

// ======================
// LIMPIAR INPUTS
// ======================
function limpiarInputs() {
    document.querySelectorAll("input").forEach(i => i.value = "");
}

// ======================
// BUSCADOR PRODUCTOS
// ======================
document.getElementById("buscarProducto").addEventListener("input", function () {
    const texto = this.value.toLowerCase();
    const sugerencias = document.getElementById("sugerencias");
    sugerencias.innerHTML = "";

    if (texto === "") return;

    const filtrados = productos.filter(p =>
        (p.nombre && p.nombre.toLowerCase().includes(texto)) ||
        (p.marca && p.marca.toLowerCase().includes(texto))
    );

    filtrados.forEach(p => {
        const div = document.createElement("div");
        div.textContent = `${p.nombre} (${p.stock} ${p.unidad})`;

        div.onclick = function () {
            document.getElementById("buscarProducto").value = p.nombre;
            productoSeleccionado = p;
            sugerencias.innerHTML = "";
        };

        sugerencias.appendChild(div);
    });
});

// ======================
// EXPORTAR VENTAS
// ======================
function exportarVentas(){

    if(ventas.length === 0){
        alert("No hay ventas para exportar");
        return;
    }

    let contenido = "Fecha;Producto;Cantidad;Precio Unitario;Subtotal;Total Venta\n";

    ventas.forEach(v => {

        v.items.forEach(item => {

            contenido += 
                `${new Date(v.fecha).toLocaleString()};` +
                `${item.producto};` +
                `${item.cantidad};` +
                `${item.precio};` +
                `${item.subtotal};` +
                `${v.total}\n`;
        });

    });

    const blob = new Blob([contenido], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "ventas_programando.csv";
    link.click();
}

// ======================
// PANTALLAS Y SIDEBAR
// ======================
function mostrarPantalla(nombre) {
    document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('mostrar'));

    const pantallaElem = document.getElementById("pantalla" + nombre.charAt(0).toUpperCase() + nombre.slice(1));
    if (pantallaElem) pantallaElem.classList.add('mostrar');

    // Botón activo
    document.querySelectorAll('.sidebar button').forEach(btn => btn.classList.remove('active'));
    const boton = Array.from(document.querySelectorAll('.sidebar button'))
        .find(b => b.textContent.trim().toLowerCase() === nombre.toLowerCase());
    if (boton) boton.classList.add('active');

    if (nombre === "dashboard") actualizarDashboard();
}

// ======================
// DASHBOARD
// ======================

function actualizarDashboard(){

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

        if (fechaTexto === hoy)
            totalHoy += v.total;

        if (fechaVenta.getMonth() === mesActual && fechaVenta.getFullYear() === anioActual)
            totalMes += v.total;

        if(v.items){
            v.items.forEach(item => {

                if(!productosVendidos[item.productoId])
                    productosVendidos[item.productoId] = 0;

                productosVendidos[item.productoId] += item.cantidad;

            });
        }

    });

    // producto más vendido
    let productoTop = "-";
    let maxCantidad = 0;

    for (let id in productosVendidos) {

        if (productosVendidos[id] > maxCantidad) {

            maxCantidad = productosVendidos[id];
            const prod = productos.find(p => p.id == id);
            productoTop = prod ? prod.nombre : "-";

        }

    }

    document.getElementById("ventasHoy").textContent = "$" + totalHoy;
    document.getElementById("ventasMes").textContent = "$" + totalMes;
    document.getElementById("cantidadVentas").textContent = contadorVentas;
    document.getElementById("productoTop").textContent = productoTop;

    // ======================
    // GRAFICO VENTAS DEL MES
    // ======================

    const diasDelMes = Array.from({length: 31}, (_, i) => (i+1).toString());
    let ventasPorDia = Array(31).fill(0);

    ventas.forEach(v => {

        const fecha = new Date(v.fecha);

        if(fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual){
            ventasPorDia[fecha.getDate()-1] += v.total;
        }

    });

    const ctxVentas = document.getElementById("graficoVentasMes");

    if(ctxVentas){

        if(window.chartVentas) window.chartVentas.destroy();

        window.chartVentas = new Chart(ctxVentas, {

            type: "bar",

            data:{
                labels: diasDelMes,
                datasets:[{
                    label:"Ventas del mes",
                    data: ventasPorDia,
                    backgroundColor:"#3b82f6"
                }]
            },

            options:{
                responsive:true,
                plugins:{
                    legend:{
                        labels:{
                            color:"#111",
                            font:{ size:14, weight:"bold" }
                        }
                    }
                },
                scales:{
                    x:{
                        ticks:{
                            color:"#111",
                            font:{ size:12, weight:"bold" }
                        }
                    },
                    y:{
                        beginAtZero:true,
                        ticks:{
                            color:"#111",
                            font:{ size:12, weight:"bold" }
                        }
                    }
                }
            }

        });

    }

    // ======================
    // GRAFICO PRODUCTOS TOP
    // ======================

    let listaProductos = Object.keys(productosVendidos).map(id => {

        const prod = productos.find(p => p.id == id);

        return {
            nombre: prod ? prod.nombre : "Producto",
            cantidad: productosVendidos[id]
        };

    });

    listaProductos.sort((a,b)=> b.cantidad - a.cantidad);
    listaProductos = listaProductos.slice(0,5);

    const nombres = listaProductos.map(p=>p.nombre);
    const cantidades = listaProductos.map(p=>p.cantidad);

    const ctxProductos = document.getElementById("graficoProductosTop");

    if(ctxProductos){

        if(window.chartProductos) window.chartProductos.destroy();

        window.chartProductos = new Chart(ctxProductos,{

            type:"bar",

            data:{
                labels:nombres,
                datasets:[{
                    label:"Productos más vendidos",
                    data:cantidades,
                    backgroundColor:"#10b981"
                }]
            },

            options:{
                responsive:true,
                plugins:{
                    legend:{
                        labels:{
                            color:"#111",
                            font:{ size:14, weight:"bold" }
                        }
                    }
                },
                scales:{
                    x:{
                        ticks:{
                            color:"#111",
                            font:{ size:12, weight:"bold" }
                        }
                    },
                    y:{
                        beginAtZero:true,
                        ticks:{
                            color:"#111",
                            font:{ size:12, weight:"bold" }
                        }
                    }
                }
            }

        });

    }

}

// ======================
// CONFIGURACION DEL NEGOCIO
// ======================
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

function aplicarConfiguracion() {
    if (configuracion.nombre)
        document.getElementById("tituloSistema").innerText = "🏪 " + configuracion.nombre + " - Sistema Comercial v2.0";
}

// ======================
// LOGIN Y SESION
// ======================
if (!localStorage.getItem("usuarioSistema")) {
    localStorage.setItem("usuarioSistema", JSON.stringify({ usuario: "admin", password: "1234" }));
}

let usuarioGuardado = JSON.parse(localStorage.getItem("usuarioSistema"));
let sesionActiva = localStorage.getItem("sesionActiva");

function iniciarSesion() {
    const usuario = document.getElementById("usuarioLogin").value;
    const password = document.getElementById("passwordLogin").value;

    if (usuario === usuarioGuardado.usuario && password === usuarioGuardado.password) {
        localStorage.setItem("sesionActiva", "true");
        document.getElementById("pantallaLogin").style.display = "none";
        document.getElementById("sistema").style.display = "flex";
        mostrarPantalla("dashboard");
    } else {
        alert("Usuario o contraseña incorrectos");
    }
}

function verificarSesion() {
    if (sesionActiva === "true") {
        document.getElementById("pantallaLogin").style.display = "none";
        document.getElementById("sistema").style.display = "flex";
        mostrarPantalla("dashboard");
    } else {
        document.getElementById("pantallaLogin").style.display = "block";
    }
}

function cerrarSesion() {
    localStorage.removeItem("sesionActiva");
    location.reload();
}

// ======================
// INICIALIZACIÓN
// ======================
mostrarProductos();
aplicarConfiguracion();
verificarSesion();

function agregarAlCarrito(){

    const nombreProducto = document.getElementById("buscarProducto").value;
    const cantidad = parseFloat(document.getElementById("cantidadVenta").value);

    if(!nombreProducto || !cantidad){
        alert("Completar producto y cantidad");
        return;
    }

    const producto = productos.find(p => p.nombre === nombreProducto);
    if(!producto){
        alert("Producto no encontrado");
        return;
    }

    const item = {
        productoId: producto.id,
        producto: producto.nombre,
        precio: producto.precio,
        cantidad: cantidad,
        subtotal: producto.precio * cantidad
    };

    carrito.push(item);

    document.getElementById("buscarProducto").value = "";
    document.getElementById("cantidadVenta").value = "";

    actualizarCarrito();
}

function actualizarCarrito(){

    const lista = document.getElementById("carritoLista");
    lista.innerHTML = "";

    let total = 0;

    carrito.forEach((item, index) => {
        total += item.subtotal;

        lista.innerHTML += `
            <div class="carritoItem">
                ${item.producto} - ${item.cantidad} x $${item.precio}
                <b> = $${item.subtotal}</b>
                <button onclick="eliminarDelCarrito(${index})">❌</button>
            </div>
        `;
    });

    document.getElementById("totalCarrito").innerText = total;
}

function eliminarDelCarrito(index){
    carrito.splice(index,1);
    actualizarCarrito();
}

function finalizarVenta(){

    if(carrito.length === 0){
        alert("No hay productos en la venta");
        return;
    }

    let totalFinal = carrito.reduce((acc,item)=> acc + item.subtotal, 0);

    const nuevaVenta = {
        id: Date.now(),
        fecha: new Date().toISOString(),
        items: carrito,
        total: totalFinal
    };

    ventas.push(nuevaVenta);
    localStorage.setItem("ventas", JSON.stringify(ventas));

    generarTicket(nuevaVenta)

    carrito = [];
    actualizarCarrito();
    actualizarDashboard();
    mostrarVentas();

    alert("Venta registrada correctamente");
}

function generarTicket(venta){

    let ticketHTML = `
    <html>
    <head>
        <title>Ticket de Venta</title>
        <style>

            body{
                font-family: Arial;
                text-align:center;
            }

            .ticket{
                width:300px;
                margin:auto;
            }

            table{
                width:100%;
                border-collapse: collapse;
            }

            th, td{
                border-bottom:1px dashed #000;
                padding:5px;
                font-size:14px;
            }

        </style>
    </head>

    <body>

        <div class="ticket">

            <h2>Mi Negocio</h2>
            <p>${new Date().toLocaleString()}</p>

            <table>
                <tr>
                    <th>Producto</th>
                    <th>Cant</th>
                    <th>Total</th>
                </tr>

                ${venta.items.map(p => `
                <tr>
                    <td>${p.nombre}</td>
                    <td>${p.cantidad}</td>
                    <td>$${p.precio * p.cantidad}</td>
                </tr>
                `).join("")}

            </table>

            <h3>Total: $${venta.total}</h3>

            <p>Gracias por su compra</p>

        </div>

    </body>
    </html>
    `

    let ventana = window.open("", "TICKET", "width=400,height=600")
    ventana.document.write(ticketHTML)
    ventana.document.close()
}

let ventas = JSON.parse(localStorage.getItem("ventas")) || [];

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

cargarProductosEnSelect();
mostrarVentas();

function cargarProductosEnSelect(){
    const select = document.getElementById("productoVenta");
    select.innerHTML = "";

    productos.forEach(p => {
        select.innerHTML += `
            <option value="${p.id}">
                ${p.nombre} (${p.stock} kg)
            </option>
        `;
    });
}

function registrarVenta(){

    const idProducto = Number(document.getElementById("productoVenta").value);
    const tipo = document.getElementById("tipoVenta").value;
    const cantidad = Number(document.getElementById("cantidadVenta").value);

    const producto = productos.find(p => p.id === idProducto);

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
        fecha: new Date().toLocaleString(),
        producto: producto.nombre,
        tipo: tipo,
        cantidad: cantidad,
        total: total
    };

    ventas.push(venta);

    localStorage.setItem("ventas", JSON.stringify(ventas));
    localStorage.setItem("productos", JSON.stringify(productos));

    mostrarProductos();
    cargarProductosEnSelect();
    mostrarVentas();

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
                Total: $${v.total}
            </div>
        `;
    });
}

function limpiarInputs(){
    document.querySelectorAll("input").forEach(i => i.value="");
}


mostrarProductos();

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

function limpiarInputs(){
    document.querySelectorAll("input").forEach(i => i.value="");
}

mostrarProductos();
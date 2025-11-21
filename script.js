// ================================
// CARGA DE PRODUCTOS DESDE productos.json
// ================================

let carrito = [];

// --- Cargar productos desde JSON local ---
fetch("productos.json")
  .then(res => res.json())
  .then(productos => {
    productos.forEach(p => {
      renderProducto(p);
    });
  })
  .catch(err => {
    console.error("Error cargando productos.json:", err);
  });

// ================================
// RENDERIZAR PRODUCTO EN CATÁLOGO
// ================================
function renderProducto(p) {

  let categoria = p.categoria.trim().toLowerCase();
  let contenedor;

  switch (categoria) {
    case "niño":
      contenedor = document.getElementById("catalogo-nino");
      break;

    case "niña":
      contenedor = document.getElementById("catalogo-nina");
      break;

    case "bebe":
    case "bebé":
      contenedor = document.getElementById("catalogo-bebe");
      break;

    case "beba":
      contenedor = document.getElementById("catalogo-beba");
      break;

    default:
      console.warn("Categoría desconocida:", p.categoria);
      return;
  }

  const div = document.createElement("div");
  div.className = "producto";

  div.innerHTML = `
    <img src="${p.imagen}" onclick='verProducto(${JSON.stringify(p)})'>
    <h4>${p.nombre}</h4>
    <p>$${p.precio}</p>
    <button onclick='verProducto(${JSON.stringify(p)})'>Agregar</button>
  `;

  contenedor.appendChild(div);
}

// ================================
// MODAL DE PRODUCTO
// ================================
function verProducto(p) {

    // ========== CARGAR DATOS ==========
    document.getElementById("modal-imagen").src = p.imagen;
    document.getElementById("modal-nombre").innerText = p.nombre;
    document.getElementById("modal-precio").innerText = "$" + p.precio;
    document.getElementById("modal-stock").innerText = p.stock;
    document.getElementById("modal-color").innerText = p.color;

    // ========== GENERAR BOTONES DE TALLE ==========
    const contenedorTalles = document.getElementById("talle-opciones");
    contenedorTalles.innerHTML = "";

    let talleSeleccionado = null;

    if (p.talles) {
        p.talles.split(",").forEach(t => {
            const btn = document.createElement("div");
            btn.classList.add("talle-opcion");
            btn.innerText = t.trim();

            btn.onclick = () => {
                document.querySelectorAll(".talle-opcion").forEach(b => b.classList.remove("selected"));
                btn.classList.add("selected");
                talleSeleccionado = t.trim();
            };

            contenedorTalles.appendChild(btn);
        });
    }

    // ========== CANTIDAD + / - ==========
    let cantidadActual = 1;
    document.getElementById("cantidad-valor").innerText = cantidadActual;

    document.getElementById("btn-sumar").onclick = () => {
        cantidadActual++;
        document.getElementById("cantidad-valor").innerText = cantidadActual;
    };

    document.getElementById("btn-restar").onclick = () => {
        if (cantidadActual > 1) {
            cantidadActual--;
            document.getElementById("cantidad-valor").innerText = cantidadActual;
        }
    };

    // ========== AGREGAR AL CARRITO ==========
    document.getElementById("modal-agregar").onclick = () => {

        if (!talleSeleccionado) {
            alert("Seleccioná un talle");
            return;
        }

        agregarAlCarrito(p, talleSeleccionado, cantidadActual);
        cerrarModal();
    };

    // Mostrar modal
    document.getElementById("modal-producto").classList.remove("oculto");
}

function cerrarModal() {
  document.getElementById("modal-producto").classList.add("oculto");
}

// ================================
// SECCIONES (Niño / Niña / Bebé / Beba)
// ================================
function mostrarSeccion(id) {
  document.querySelectorAll(".seccion").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// ================================
// CARRITO
// ================================
function toggleCarrito() {
  document.getElementById("carrito").classList.toggle("show");
}

function agregarAlCarrito(p, talle, cantidad) {
  carrito.push({
    ...p,
    talle: talle,
    cantidad: cantidad
  });

  actualizarCarrito();
}

function actualizarCarrito() {
  const cont = document.getElementById("items-carrito");
  cont.innerHTML = "";

  let total = 0;

  carrito.forEach((p, i) => {
    const subtotal = p.precio * p.cantidad;
    total += subtotal;

    cont.innerHTML += `
      <div class="carrito-item">
        <div class="info">
          <strong>${p.nombre}</strong><br>
          <small>Talle: ${p.talle}</small><br>
          <small>Cant: ${p.cantidad}</small><br>
          <span>$${subtotal}</span>
        </div>
        <button onclick="eliminar(${i})">X</button>
      </div>
    `;
  });

  if (document.getElementById("entrega").value === "envio") {
    total += 2000;
  }

  document.getElementById("contador-flotante").innerText = carrito.length;
  document.getElementById("total").innerText = "Total: $" + total;
}

function eliminar(i) {
  carrito.splice(i, 1);
  actualizarCarrito();
}

// ================================
// ENTREGA
// ================================
function mostrarDireccion() {
  const entrega = document.getElementById("entrega").value;
  const dir = document.getElementById("direccion");

  if (entrega === "envio") {
    dir.classList.remove("oculto");
  } else {
    dir.classList.add("oculto");
    dir.value = "";
  }

  actualizarCarrito();
}

// ================================
// DATOS DE PAGO
// ================================
function mostrarDatosPago() {
  const pago = document.getElementById("pago").value;
  const cel = document.getElementById("celular");
  const datos = document.getElementById("datos-pago");

  if (pago === "transferencia") {
    datos.classList.remove("oculto");
    datos.innerHTML = `
      <strong>CBU:</strong> 0930311710100845283600 <br>
      <strong>Titular:</strong> Pequeños Gigantes
    `;
  }
  else if (pago === "mp") {
    datos.classList.remove("oculto");
    datos.innerHTML = `
      <strong>Alias:</strong> peques.gigantes06 <br>
      <strong>CVU:</strong> 0000003100146278369987
    `;
  }
  else {
    datos.classList.add("oculto");
    datos.innerHTML = "";
  }
}

// ================================
// WHATSAPP
// ================================
function enviarPedido() {
  let msg = "*Nuevo pedido:*%0A%0A";

  carrito.forEach(p => {
    msg += `- ${p.nombre} | Talle: ${p.talle} | Cant: ${p.cantidad} | $${p.precio} c/u | Subtotal: $${p.precio * p.cantidad}%0A`;
  });

  const total = document.getElementById("total").innerText;
  const pago = document.getElementById("pago").value;
  const entrega = document.getElementById("entrega").value;

  msg += `%0A${total}`;
  msg += `%0A%0A*Pago:* ${pago}`;
  msg += `%0A*Entrega:* ${entrega}`;

  if (entrega === "envio") {
    msg += `%0A*Dirección:* ${document.getElementById("direccion").value}`;
    msg += `%0A*Costo envío:* $2000`;
  }

  if (pago === "transferencia") {
    msg += `%0A%0A*CBU:* 0930311710100845283600`;
    msg += `%0A*Titular:* Pequeños Gigantes`;
  }

  if (pago === "mp") {
    msg += `%0A%0A*Alias:* peques.gigantes06`;
    msg += `%0A*CVU:* 0000003100146278369987`;
  }

  window.open("https://wa.me/5492996239628?text=" + msg);

  setTimeout(() => {
    carrito = [];
    window.location.reload();
  }, 1200);
}

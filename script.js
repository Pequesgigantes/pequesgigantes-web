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
// RENDERIZAR PRODUCTO
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
    <button onclick='agregarAlCarrito(${JSON.stringify(p)})'>Agregar</button>
  `;

  contenedor.appendChild(div);
}

// ================================
// MODAL DE PRODUCTO
// ================================
function verProducto(p) {
  document.getElementById("modal-imagen").src = p.imagen;
  document.getElementById("modal-nombre").innerText = p.nombre;
  document.getElementById("modal-precio").innerText = "$" + p.precio;
  document.getElementById("modal-stock").innerText = p.stock;
  document.getElementById("modal-color").innerText = p.color;
  document.getElementById("modal-talles").innerText = p.talles ?? "Consultar";

  document.getElementById("modal-agregar").onclick = () => {
    agregarAlCarrito(p);
    cerrarModal();
  };

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

function agregarAlCarrito(p) {
  carrito.push(p);
  actualizarCarrito();
}

function actualizarCarrito() {
  const cont = document.getElementById("items-carrito");
  cont.innerHTML = "";

  let total = 0;

  carrito.forEach((p, i) => {
    total += p.precio;

    cont.innerHTML += `
      <div class="carrito-item">
        <div class="info">
          <strong>${p.nombre}</strong>
          <span>$${p.precio}</span>
        </div>
        <button onclick="eliminar(${i})">X</button>
      </div>
    `;
  });

  if (document.getElementById("entrega").value === "envio") {
    total += 1500;
  }

  document.getElementById("contador-flotante").innerText = carrito.length;
  document.getElementById("total").innerText = "Total: $" + total;
}

function eliminar(i) {
  carrito.splice(i, 1);
  actualizarCarrito();
}

// ================================
// DIRECCIÓN (ENVÍO / LOCAL)
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
    cel.classList.remove("oculto");
    datos.classList.remove("oculto");

    datos.innerHTML = `
      <strong>CBU:</strong> 0000003100029384747298 <br>
      <strong>Titular:</strong> Matías Avalo
    `;
  }
  else if (pago === "mp") {
    cel.classList.remove("oculto");
    datos.classList.remove("oculto");

    datos.innerHTML = `
      <strong>Alias:</strong> peque.gigantes.mp <br>
      <strong>CVU:</strong> 000000790002839384845
    `;
  }
  else {
    cel.classList.add("oculto");
    datos.classList.add("oculto");
    cel.value = "";
    datos.innerHTML = "";
  }
}

// ================================
// ENVIAR PEDIDO POR WHATSAPP
// ================================
function enviarPedido() {
  let msg = "*Nuevo pedido:*%0A%0A";

  carrito.forEach(p => {
    msg += `- ${p.nombre} $${p.precio}%0A`;
  });

  const total = document.getElementById("total").innerText;
  const pago = document.getElementById("pago").value;
  const entrega = document.getElementById("entrega").value;

  msg += `%0A${total}`;
  msg += `%0A%0A*Pago:* ${pago}`;
  msg += `%0A*Entrega:* ${entrega}`;

  if (entrega === "envio") {
    msg += `%0A*Dirección:* ${document.getElementById("direccion").value}`;
    msg += `%0A*Costo envío:* $1500`;
  }

  if (pago === "transferencia") {
    msg += `%0A%0A*CBU:* 0000003100029384747298`;
    msg += `%0A*Titular:* Matías Avalo`;
  }

  if (pago === "mp") {
    msg += `%0A%0A*Alias:* peque.gigantes.mp`;
    msg += `%0A*CVU:* 000000790002839384845`;
  }

  if (pago !== "tarjeta") {
    msg += `%0A*Celular:* ${document.getElementById("celular").value}`;
  }

  window.open("https://wa.me/5492995952200?text=" + msg);

  setTimeout(() => {
    carrito = [];
    window.location.reload();
  }, 1500);
}


// ================================
// BUSCADOR MINI (ADMIN)
// ================================
const tbodyProductos = document.getElementById("tbody-productos");

function filtrarPorID() {
  const idBuscado = document.getElementById("buscarID").value.trim();

  const filas = tbodyProductos?.querySelectorAll("tr") ?? [];

  filas.forEach(fila => {
    const id = fila.querySelector("td").textContent.trim();

    if (idBuscado === "" || id === idBuscado) {
      fila.style.display = "";
    } else {
      fila.style.display = "none";
    }
  });
}

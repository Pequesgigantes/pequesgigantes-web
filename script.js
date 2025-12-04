// ================================
// CARGA DE PRODUCTOS DESDE productos.json
// ================================

let carrito = [];

// --- Cargar productos desde JSON local ---
fetch("productos.json")
  .then(res => res.json())
  .then(productos => {
    productos.forEach(p => {
      if (p) renderProducto(p);
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

  document.getElementById("modal-imagen").src = p.imagen;
  document.getElementById("modal-nombre").innerText = p.nombre;
  document.getElementById("modal-precio").innerText = "$" + p.precio;
  document.getElementById("modal-stock").innerText = p.stock;
  document.getElementById("modal-color").innerText = p.color;

  const contenedorTalles = document.getElementById("talle-opciones");
  contenedorTalles.innerHTML = "";

  let talleSeleccionado = null;

  // === VALIDACIÓN DE TALLES ===
  if (!p.talles || p.talles.trim() === "" || p.talles === "Sin talle") {
      contenedorTalles.innerHTML = "<p style='margin-top:10px;'>Sin talles</p>";
  } else {
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

  document.getElementById("modal-agregar").onclick = () => {
      if (!talleSeleccionado && p.talles !== "Sin talle") {
          alert("Seleccioná un talle");
          return;
      }
      agregarAlCarrito(p, talleSeleccionado ?? "Sin talle", cantidadActual);
      cerrarModal();
  };

  const modal = document.getElementById("modal-producto");
  modal.classList.remove("oculto");

  setTimeout(() => {
      modal.classList.add("show");
  }, 10);
}

function cerrarModal() {
  const modal = document.getElementById("modal-producto");
  modal.classList.remove("show");
  setTimeout(() => {
      modal.classList.add("oculto");
  }, 200);
}

// ================================
// SECCIONES
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
  carrito.push({ ...p, talle, cantidad });
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

  if (document.getElementById("entrega").value === "envio") total += 2000;

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

  if (entrega === "envio") dir.classList.remove("oculto");
  else {
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
  const datos = document.getElementById("datos-pago");

  if (pago === "transferencia") {
    datos.classList.remove("oculto");
    datos.innerHTML = `
      <strong>CBU:</strong> 0930311710100845283600 <br>
      <strong>Titular:</strong> Pequeños Gigantes
    `;
  } else if (pago === "mp") {
    datos.classList.remove("oculto");
    datos.innerHTML = `
      <strong>Alias:</strong> peques.gigantes06 <br>
      <strong>CVU:</strong> 0000003100146278369987
    `;
  } else {
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

// ================================
// CONTADOR REAL (CountAPI)
// ================================
async function contarVisitasReales() {
  try {
      const res = await fetch("https://api.countapi.xyz/hit/pequesgigantes/visitas");
      const data = await res.json();
      document.getElementById("visitas-num").innerText = data.value;
  } catch (err) {
      console.error("Error contador:", err);
  }
}
contarVisitasReales();


// ================================
// LIKE GLOBAL REAL (CountAPI)
// ================================
async function cargarLikes() {
    const res = await fetch("https://api.countapi.xyz/get/pequesgigantes/likes");
    const data = await res.json();
    document.getElementById("like-count").innerText = data.value ?? 0;
}

async function sumarLike() {
    // Evita que la misma persona de like varias veces
    if (localStorage.getItem("like-dado") === "1") {
        alert("¡Ya diste like! ❤️");
        return;
    }

    const res = await fetch("https://api.countapi.xyz/hit/pequesgigantes/likes");
    const data = await res.json();

    document.getElementById("like-count").innerText = data.value;
    localStorage.setItem("like-dado", "1");
}

document.getElementById("btn-like").onclick = sumarLike;

// Cargar likes al iniciar
cargarLikes();


/* === CONTADOR REAL DE VISITAS === */
let visitas = localStorage.getItem("visitasPG") || 0;
visitas++;
localStorage.setItem("visitasPG", visitas);
document.getElementById("visitas-texto").textContent = visitas;


/* === LIKE BUTTON === */
let likes = localStorage.getItem("likesPG") || 0;

document.getElementById("likeBtn").addEventListener("click", () => {
    likes++;
    localStorage.setItem("likesPG", likes);

    let btn = document.getElementById("likeBtn");
    btn.style.transform = "scale(1.2)";
    setTimeout(() => btn.style.transform = "scale(1)", 150);
});

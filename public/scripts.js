
const hostname = window.location.hostname;

const esLocal =
  hostname === "localhost" ||
  hostname === "127.0.0.1" ||
  hostname.startsWith("192.168.") ||
  hostname.startsWith("10.") ||
  hostname.startsWith("172.");

const API_URL = esLocal
  ? `http://${hostname}:3000`
  : window.location.origin;

document.body.classList.add("dark-mode");

let deferredPrompt = null;

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredPrompt = event;

  const installPwaBtn = document.getElementById("installPwaBtn");

  if (installPwaBtn) {
    installPwaBtn.style.display = "block";
  }

  console.log("PWA lista para instalar");
});

document.addEventListener("DOMContentLoaded", () => {
  const installPwaBtn = document.getElementById("installPwaBtn");

  if (!installPwaBtn) return;

  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;

  if (isStandalone) {
    installPwaBtn.style.display = "none";
    return;
  }

  installPwaBtn.addEventListener("click", async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();

      const result = await deferredPrompt.userChoice;
      console.log("Resultado instalación:", result.outcome);

      deferredPrompt = null;
      installPwaBtn.style.display = "none";
    } else {
      alert(
        "Para instalar la app: abre el menú del navegador y selecciona 'Instalar app' o 'Agregar a pantalla principal'."
      );
    }
  });
});

window.addEventListener("appinstalled", () => {
  const installPwaBtn = document.getElementById("installPwaBtn");

  if (installPwaBtn) {
    installPwaBtn.style.display = "none";
  }

  console.log("App instalada correctamente");
});


let monedaActual = localStorage.getItem("monedaActual") || "COP";
let tasaCambio = 1;
let imagenesPreviewProducto = [];
let imagenArrastrandoIndex = null;

const modalImagenRutina = document.getElementById("modalImagenRutina");
const cerrarModalImagenRutina = document.getElementById("cerrarModalImagenRutina");
const imagenRutinaCompleta = document.getElementById("imagenRutinaCompleta");

cerrarModalImagenRutina?.addEventListener("click", () => {
  modalImagenRutina?.classList.remove("activo");
  imagenRutinaCompleta.src = "";
});

modalImagenRutina?.addEventListener("click", e => {
  if (e.target === modalImagenRutina) {
    modalImagenRutina.classList.remove("activo");
    imagenRutinaCompleta.src = "";
  }
});

function formatearPrecio(precio) {
  // Asegúrate de que el precio sea un número válido
  const precioNum = parseFloat(precio);

  // Si el precio no es un número, devuelve un valor predeterminado
  if (isNaN(precioNum)) {
    return `$0.00`;  // Precio no válido, mostrar 0.00
  }

  // Si es un número válido, usa .toFixed() para mostrar el precio con hasta 3 decimales
  return `$${precioNum.toFixed(3)}`;  // Muestra el precio con hasta 3 decimales
}

let categoriaEditandoId = null;
let productoEditandoId = null;
let imagenActualProducto = "";
let imagenesActualesProducto = "[]";
let imagenesActualesPreview = [];

/* =========================
   ADMIN: FLYERS
========================= */

const abrirModalFlyer = document.getElementById("abrirModalFlyer");
const cerrarModalFlyer = document.getElementById("cerrarModalFlyer");
const modalFlyer = document.getElementById("modalFlyer");
const imagenFlyerDesktop = document.getElementById("imagenFlyerDesktop");
const imagenFlyerMobile = document.getElementById("imagenFlyerMobile");
const contenedorFlyers = document.getElementById("contenedorFlyers");

if (
  abrirModalFlyer &&
  cerrarModalFlyer &&
  modalFlyer &&
  formFlyer &&
  imagenFlyerDesktop &&
  imagenFlyerMobile &&
  contenedorFlyers
) {
  abrirModalFlyer.addEventListener("click", () => {
    modalFlyer.classList.add("activo");
  });

  cerrarModalFlyer.addEventListener("click", () => {
    modalFlyer.classList.remove("activo");
  });

  formFlyer.addEventListener("submit", async e => {
    e.preventDefault();

    const archivoDesktop = imagenFlyerDesktop.files[0];
    const archivoMobile = imagenFlyerMobile.files[0];

    if (!archivoDesktop && !flyerEditandoId) {
      alert("Selecciona una imagen para PC");
      return;
    }

    if (!archivoMobile && !flyerEditandoId) {
      alert("Selecciona una imagen para celular");
      return;
    }

    const formData = new FormData();

    if (archivoDesktop) {
      formData.append("imagen_desktop", archivoDesktop);
    }

    if (archivoMobile) {
      formData.append("imagen_mobile", archivoMobile);
    }

    await guardarFlyer(formData);

    formFlyer.reset();
    flyerEditandoId = null;
    modalFlyer.classList.remove("activo");
  });

  cargarFlyersAdmin();
}


function editarFlyer(id) {
  flyerEditandoId = id;
  modalFlyer.classList.add("activo");
}

async function guardarFlyer(formData) {
  try {
    const url = flyerEditandoId
      ? `${API_URL}/flyers/${flyerEditandoId}`
      : `${API_URL}/flyers`;

    const method = flyerEditandoId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      body: formData,
    });

    if (!res.ok) {
      throw new Error("Error al guardar flyer");
    }

    await cargarFlyersAdmin();
    await cargarFlyersIndex();
  } catch (error) {
    console.error(error);
    alert("No se pudo guardar el flyer");
  }
}

async function cargarFlyersAdmin() {
  if (!contenedorFlyers) return;

  try {
    const res = await fetch(`${API_URL}/flyers`);
    const flyers = await res.json();

    contenedorFlyers.innerHTML = `
      <table class="admin-products-table">
        <thead>
          <tr>
            <th>Flyer</th>
            <th>Título</th>
            <th>Estado</th>
            <th>Fecha</th>
            <th>Prioridad</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          ${flyers.map(flyer => `
            <tr>
              <td>
                <img 
                  src="${API_URL}/${flyer.imagen}" 
                  alt="Flyer"
                  class="flyer-admin-img"
                >
              </td>

              <td>
                <div class="admin-product-info">
                  <div>
                    <h4>Flyer #${flyer.id}</h4>
                    <span>Promocional</span>
                  </div>
                </div>
              </td>

              <td>
                <span class="estado-producto activo">
                  Activo
                </span>
              </td>

              <td>${new Date().toLocaleDateString()}</td>

              <td>
                <span class="prioridad-media">Media</span>
              </td>

              <td>
                <div class="admin-actions">
                  <button onclick="editarFlyer(${flyer.id})">
                    <i class="bi bi-pencil"></i>
                  </button>

                  <button>
                    <i class="bi bi-eye"></i>
                  </button>

                  <button class="delete" onclick="eliminarFlyer(${flyer.id})">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  } catch (error) {
    console.error(error);
  }
}
async function eliminarFlyer(id) {
  const confirmar = confirm("¿Seguro que quieres eliminar este flyer?");
  if (!confirmar) return;

  try {
    const res = await fetch(`${API_URL}/flyers/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error("Error al eliminar flyer");
    }

    await cargarFlyersAdmin();
    await cargarFlyersIndex();
  } catch (error) {
    console.error(error);
    alert("No se pudo eliminar el flyer");
  }
}

/* =========================
   INDEX: SWIPER FLYERS
========================= */

async function cargarFlyersIndex() {
  const contenedor = document.getElementById("flyersSwiper");

  if (!contenedor) return;

  try {
    const res = await fetch(`${API_URL}/flyers`);
    const flyers = await res.json();

    contenedor.innerHTML = flyers.map(flyer => {
      const imagenDesktop = flyer.imagen_desktop || flyer.imagen;
      const imagenMobile = flyer.imagen_mobile || flyer.imagen_desktop || flyer.imagen;

      return `
        <div class="swiper-slide flyer-slide">
          <picture class="flyer-picture">
            <source 
              media="(max-width: 768px)" 
              srcset="${API_URL}/${imagenMobile}"
            >

            <img 
              src="${API_URL}/${imagenDesktop}" 
              alt="Flyer"
            >
          </picture>
        </div>
      `;
    }).join("");

    new Swiper(".header-swiper", {
      loop: flyers.length > 1,
      autoplay: {
        delay: 4000,
        disableOnInteraction: false,
      },
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
    });

  } catch (error) {
    console.error(error);
  }
}

cargarFlyersIndex();
/* =========================
   ELEMENTOS ADMIN
========================= */

const abrirModalCategoria = document.getElementById("abrirModalCategoria");
const cerrarModalCategoria = document.getElementById("cerrarModalCategoria");
const modalCategoria = document.getElementById("modalCategoria");
const formCategoria = document.getElementById("formCategoria");
const nombreCategoria = document.getElementById("nombreCategoria");
const imagenCategoria = document.getElementById("imagenCategoria");
const contenedorCategorias = document.getElementById("contenedorCategorias");

let categorias = [];

/* =========================
   ADMIN: CATEGORÍAS
========================= */

if (
  abrirModalCategoria &&
  cerrarModalCategoria &&
  modalCategoria &&
  formCategoria &&
  nombreCategoria &&
  imagenCategoria &&
  contenedorCategorias
) {
  abrirModalCategoria.addEventListener("click", () => {
    modalCategoria.classList.add("activo");
  });

  cerrarModalCategoria.addEventListener("click", () => {
    modalCategoria.classList.remove("activo");
  });

  formCategoria.addEventListener("submit", async e => {
    e.preventDefault();

    const nombre = nombreCategoria.value.trim();
    const archivo = imagenCategoria.files[0];

    if (!nombre) {
      alert("Escribe el nombre de la categoría");
      return;
    }

    if (!archivo) {
      alert("Selecciona una imagen");
      return;
    }

    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("imagen", archivo);

    await guardarCategoria(formData);

    formCategoria.reset();
    modalCategoria.classList.remove("activo");
  });

  cargarCategoriasAdmin();
}


async function guardarCategoria(formData) {
  try {
    const url = categoriaEditandoId
      ? `${API_URL}/categorias/${categoriaEditandoId}`
      : `${API_URL}/categorias`;

    const method = categoriaEditandoId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      body: formData,
    });

    if (!res.ok) {
      throw new Error("Error al guardar la categoría");
    }

    await cargarCategoriasAdmin();

  } catch (error) {
    console.error(error);
    alert("No se pudo guardar la categoría");
  }
}
async function cargarCategoriasAdmin() {
  if (!contenedorCategorias) return;

  try {
    const res = await fetch(`${API_URL}/categorias`);
    const categorias = await res.json();

    contenedorCategorias.innerHTML = `
      <table class="admin-products-table">
        <thead>
          <tr>
            <th>Imagen</th>
            <th>Nombre</th>
            <th>Productos</th>
            <th>Estado</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          ${categorias.map(categoria => `
            <tr>
              <td>
                <img 
                  src="${API_URL}/${categoria.imagen}" 
                  alt="${categoria.nombre}"
                  class="categoria-admin-img"
                >
              </td>

              <td>
                <div class="admin-product-info">
                  <div>
                    <h4>${categoria.nombre}</h4>
                    <span>ID: ${categoria.id}</span>
                  </div>
                </div>
              </td>

              <td>0</td>

              <td>
                <span class="estado-producto activo">
                  Activa
                </span>
              </td>

              <td>${new Date().toLocaleDateString()}</td>

              <td>
                <div class="admin-actions">

                  <button onclick="editarCategoria(${categoria.id})">
                    <i class="bi bi-pencil"></i>
                  </button>

                  <button class="delete" onclick="eliminarCategoria(${categoria.id})">
                    <i class="bi bi-trash"></i>
                  </button>

                </div>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  } catch (error) {
    console.error(error);
  }
}

function mostrarCategoriasAdmin() {
  if (!contenedorCategorias) return;

  contenedorCategorias.innerHTML = "";

  categorias.forEach(categoria => {
    contenedorCategorias.innerHTML += `
      <div class="categoria-card">
        <button class="eliminar-categoria" onclick="eliminarCategoria(${categoria.id})">X</button>
        <img src="${API_URL}/${categoria.imagen}" alt="${categoria.nombre}">
        <h3>${categoria.nombre}</h3>
      </div>
    `;
  });
}

async function eliminarCategoria(id) {
  const confirmar = confirm("¿Seguro que quieres eliminar esta categoría?");

  if (!confirmar) return;

  try {
    const res = await fetch(`${API_URL}/categorias/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error("Error al eliminar la categoría");
    }

    await cargarCategoriasAdmin();
    categoriaEditandoId = null;
    await cargarCategoriasIndex();
  } catch (error) {
    console.error(error);
    alert("No se pudo eliminar la categoría");
  }
}

async function editarCategoria(id) {
  const res = await fetch(`${API_URL}/categorias`);
  const categorias = await res.json();

  const categoria = categorias.find(c => c.id == id);

  if (!categoria) return;

  categoriaEditandoId = id;
  nombreCategoria.value = categoria.nombre;
  modalCategoria.classList.add("activo");
}
/* =========================
   INDEX: CATEGORÍAS
========================= */

async function cargarCategoriasIndex() {
  const contenedor = document.getElementById("categoriasIndex");

  if (!contenedor) return;

  try {
    const res = await fetch(`${API_URL}/categorias`);

    if (!res.ok) {
      throw new Error("Error al cargar categorías");
    }

    const categoriasIndex = await res.json();

    contenedor.innerHTML = categoriasIndex.map(categoria => `
      <a href="catalogo.html?categoria=${categoria.id}" class="categoria-card categoria-link">
        <img src="${API_URL}/${categoria.imagen}" alt="${categoria.nombre}">
        <h3>${categoria.nombre}</h3>
      </a>
    `).join("");

  } catch (error) {
    console.error(error);
    contenedor.innerHTML = "<p>No se pudieron cargar las categorías.</p>";
  }
}

cargarCategoriasIndex();

let flyerEditandoId = null;

function editarFlyer(id) {
  flyerEditandoId = id;
  modalFlyer.classList.add("activo");
}


/* =========================
   ADMIN: MODAL PRODUCTOS
========================= */

const abrirModalProducto = document.getElementById("abrirModalProducto");
const cerrarModalProducto = document.getElementById("cerrarModalProducto");
const modalProducto = document.getElementById("modalProducto");
const cancelarProducto = document.getElementById("cancelarProducto");
const formProducto = document.getElementById("formProducto");

const nombreProducto = document.getElementById("nombreProducto");
const precioProducto = document.getElementById("precioProducto");
const descripcionProducto = document.getElementById("descripcionProducto");
const categoriaProducto = document.getElementById("categoriaProducto");
const marcaProducto = document.getElementById("marcaProducto");
const stockProducto = document.getElementById("stockProducto");
const agregarVarianteProducto = document.getElementById("agregarVarianteProducto");
const listaVariantesProducto = document.getElementById("listaVariantesProducto");

const inputTalla = document.getElementById("inputTalla");
const agregarTalla = document.getElementById("agregarTalla");
const listaTallas = document.getElementById("listaTallas");
const bloqueTallasProducto = document.getElementById("bloqueTallasProducto");
const opcionesTallas = document.getElementById("opcionesTallas");
const editorTallaPersonalizada = document.getElementById("editorTallaPersonalizada");

const bloqueColoresProducto = document.getElementById("bloqueColoresProducto");
const inputColor = document.getElementById("inputColor");
const agregarColor = document.getElementById("agregarColor");
const listaColores = document.getElementById("listaColores");

const imagenesProducto = document.getElementById("imagenesProducto");
const previewGaleria = document.getElementById("previewGaleria");
const contadorImagenes = document.getElementById("contadorImagenes");

const contenedorProductos = document.getElementById("contenedorProductos");

let tallasProducto = [];
let coloresProducto = [];
let imagenesSeleccionadas = [];
let variantesProducto = [];

let usaTallasProducto = true;
let usaColoresProducto = true;
let tipoTallaProducto = "";

const plantillasTallas = {
  "ropa-adulto": ["XS", "S", "M", "L", "XL", "XXL"],
  "ropa-nino": ["2", "4", "6", "8", "10", "12", "14", "16"],
  "ropa-rango": ["2-4", "6-8", "10-12", "14-16"],
  "calzado-adulto": ["35", "36", "37", "38", "39", "40", "41", "42", "43"],
  "calzado-nino": ["20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34"],
  "anillos": ["5", "6", "7", "8", "9", "10", "11", "12"],
};

/* ABRIR / CERRAR MODAL */

if (abrirModalProducto && modalProducto) {
  abrirModalProducto.addEventListener("click", () => {
    modalProducto.classList.add("activo");
    cargarCategoriasSelectProducto();
  });
}

if (cerrarModalProducto) {
  cerrarModalProducto.addEventListener("click", cerrarModalProductoAdmin);
}

if (cancelarProducto) {
  cancelarProducto.addEventListener("click", cerrarModalProductoAdmin);
}
function cerrarModalProductoAdmin() {
  if (!modalProducto || !formProducto) return;

  modalProducto.classList.remove("activo");
  formProducto.reset();

  productoEditandoId = null;

  imagenActualProducto = "";
  imagenesActualesProducto = "[]";
  imagenesActualesPreview = [];
  imagenesSeleccionadas = [];
  imagenesPreviewProducto = [];

  tallasProducto = [];
  coloresProducto = [];
  variantesProducto = [];

  usaTallasProducto = true;
  usaColoresProducto = true;
  tipoTallaProducto = "";
  tipoProducto = "normal";

  if (stockProducto) stockProducto.value = "";

  if (bloqueTallasProducto) bloqueTallasProducto.style.display = "block";
  if (bloqueColoresProducto) bloqueColoresProducto.style.display = "block";
  if (editorTallaPersonalizada) editorTallaPersonalizada.style.display = "none";
  if (opcionesTallas) opcionesTallas.innerHTML = "";

  document.querySelectorAll("[data-tallas], [data-colores], [data-tipo-talla], [data-tipo-producto]").forEach(btn => {
    btn.classList.remove("activo");
  });

  document.querySelector('[data-tallas="si"]')?.classList.add("activo");
  document.querySelector('[data-colores="si"]')?.classList.add("activo");
  document.querySelector('[data-tipo-producto="normal"]')?.classList.add("activo");

  mostrarTallasSeleccionadas();
  mostrarColoresSeleccionados();
  mostrarVariantesProducto();
  mostrarPreviewImagenes();
}

/* TALLAS */

document.querySelectorAll("[data-tallas]").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("[data-tallas]").forEach(b => b.classList.remove("activo"));
    btn.classList.add("activo");

    usaTallasProducto = btn.dataset.tallas === "si";

    if (bloqueTallasProducto) {
      bloqueTallasProducto.style.display = usaTallasProducto ? "block" : "none";
    }

    if (!usaTallasProducto) {
      tallasProducto = [];
      tipoTallaProducto = "";
      if (opcionesTallas) opcionesTallas.innerHTML = "";
      mostrarTallasSeleccionadas();
    }
  });
});

document.querySelectorAll("[data-tipo-talla]").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("[data-tipo-talla]").forEach(b => b.classList.remove("activo"));
    btn.classList.add("activo");

    tipoTallaProducto = btn.dataset.tipoTalla;
    tallasProducto = [];

    if (tipoTallaProducto === "personalizada") {
      if (opcionesTallas) opcionesTallas.innerHTML = "";
      if (editorTallaPersonalizada) editorTallaPersonalizada.style.display = "grid";
      mostrarTallasSeleccionadas();
      return;
    }

    if (editorTallaPersonalizada) editorTallaPersonalizada.style.display = "none";
    mostrarOpcionesTallas(plantillasTallas[tipoTallaProducto] || []);
  });
});

function mostrarOpcionesTallas(tallas) {
  if (!opcionesTallas) return;

  opcionesTallas.innerHTML = tallas.map(talla => `
    <label class="talla-check">
      <input type="checkbox" value="${talla}" onchange="toggleTallaProducto(this)">
      ${talla}
    </label>
  `).join("");

  mostrarTallasSeleccionadas();
}

function toggleTallaProducto(input) {
  const talla = input.value;

  if (input.checked) {
    if (!tallasProducto.includes(talla)) {
      tallasProducto.push(talla);
    }
  } else {
    tallasProducto = tallasProducto.filter(item => item !== talla);
  }

  mostrarTallasSeleccionadas();
}

if (agregarTalla && inputTalla) {
  agregarTalla.addEventListener("click", agregarNuevaTallaProducto);

  inputTalla.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      agregarNuevaTallaProducto();
    }
  });
}

function agregarNuevaTallaProducto() {
  if (!inputTalla) return;

  const talla = inputTalla.value.trim();

  if (!talla) return;

  if (!tallasProducto.includes(talla)) {
    tallasProducto.push(talla);
  }

  inputTalla.value = "";
  mostrarTallasSeleccionadas();
}

function mostrarTallasSeleccionadas() {
  if (!listaTallas) return;

  listaTallas.innerHTML = tallasProducto.map(talla => `
    <span class="talla-tag">
      ${talla}
      <button type="button" onclick="eliminarTallaProducto('${talla}')">×</button>
    </span>
  `).join("");
}

function eliminarTallaProducto(talla) {
  tallasProducto = tallasProducto.filter(item => item !== talla);

  document.querySelectorAll("#opcionesTallas input").forEach(input => {
    if (input.value === talla) input.checked = false;
  });

  mostrarTallasSeleccionadas();
}

/* COLORES */

document.querySelectorAll("[data-colores]").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("[data-colores]").forEach(b => b.classList.remove("activo"));
    btn.classList.add("activo");

    usaColoresProducto = btn.dataset.colores === "si";

    if (bloqueColoresProducto) {
      bloqueColoresProducto.style.display = usaColoresProducto ? "block" : "none";
    }

    if (!usaColoresProducto) {
      coloresProducto = [];
      mostrarColoresSeleccionados();
    }
  });
});

if (agregarColor && inputColor) {
  agregarColor.addEventListener("click", agregarNuevoColorProducto);

  inputColor.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      agregarNuevoColorProducto();
    }
  });
}

function agregarNuevoColorProducto() {
  if (!inputColor) return;

  const color = inputColor.value.trim();

  if (!color) return;

  if (!coloresProducto.includes(color)) {
    coloresProducto.push(color);
  }

  inputColor.value = "";
  mostrarColoresSeleccionados();
}

function mostrarColoresSeleccionados() {
  if (!listaColores) return;

  listaColores.innerHTML = coloresProducto.map(color => `
    <span class="color-tag">
      ${color}
      <button type="button" onclick="eliminarColorProducto('${color}')">×</button>
    </span>
  `).join("");
}

function eliminarColorProducto(color) {
  coloresProducto = coloresProducto.filter(item => item !== color);
  mostrarColoresSeleccionados();
}

/* IMÁGENES */

if (imagenesProducto) {
  imagenesProducto.addEventListener("change", e => {
    const archivos = Array.from(e.target.files || []);

    if (archivos.length === 0) return;

    const totalActual = imagenesActualesPreview.length + imagenesSeleccionadas.length;
    const espacioDisponible = 6 - totalActual;

    if (espacioDisponible <= 0) {
      alert("Solo puedes subir máximo 6 imágenes");
      imagenesProducto.value = "";
      return;
    }

    const archivosPermitidos = archivos.slice(0, espacioDisponible);

    imagenesSeleccionadas = [
      ...imagenesSeleccionadas,
      ...archivosPermitidos
    ];

    if (archivos.length > espacioDisponible) {
      alert(`Solo se agregaron ${espacioDisponible} imágenes. El máximo permitido es 6.`);
    }

    imagenesProducto.value = "";

    mostrarPreviewImagenes();
  });
}

function obtenerUrlImagen(ruta) {
  if (!ruta) return "img/no-image.png";

  if (ruta.startsWith("http://") || ruta.startsWith("https://")) {
    return ruta;
  }

  return `${API_URL}/${ruta.replace(/^\/+/, "")}`;
}

function obtenerImagenesProducto(producto) {
  let imagenes = [];

  try {
    imagenes = producto.imagenes ? JSON.parse(producto.imagenes) : [];
  } catch (error) {
    imagenes = [];
  }

  if (!Array.isArray(imagenes)) {
    imagenes = [];
  }

  if (producto.imagen && !imagenes.includes(producto.imagen)) {
    imagenes.unshift(producto.imagen);
  }

  return [...new Set(imagenes)].filter(Boolean);
}

function mostrarPreviewImagenes() {
  if (!previewGaleria) return;

  previewGaleria.innerHTML = "";

  const imagenesPreview = [
    ...imagenesActualesPreview.map(imagen => ({
      tipo: "actual",
      valor: imagen
    })),
    ...imagenesSeleccionadas.map(imagen => ({
      tipo: "nueva",
      valor: imagen
    }))
  ];

  if (contadorImagenes) {
    contadorImagenes.textContent = `${imagenesPreview.length}/6 imágenes`;
  }

  imagenesPreview.forEach((imagen, index) => {
    const item = document.createElement("div");

    item.classList.add("preview-item");
    item.setAttribute("draggable", "true");
    item.dataset.index = index;

    if (imagen.tipo === "actual") {
      item.style.backgroundImage = `url('${obtenerUrlImagen(imagen.valor)}')`;
    }

    if (imagen.tipo === "nueva") {
      const urlTemporal = URL.createObjectURL(imagen.valor);
      item.style.backgroundImage = `url('${urlTemporal}')`;
    }

    item.innerHTML = `
      <span>${index + 1}</span>

      <button 
        type="button" 
        class="btn-eliminar-preview"
        onclick="eliminarImagenPreviewProducto(${index})"
      >
        ×
      </button>
    `;

    item.addEventListener("dragstart", e => {
      e.dataTransfer.setData("index", index);
      item.classList.add("arrastrando");
    });

    item.addEventListener("dragend", () => {
      item.classList.remove("arrastrando");
    });

    item.addEventListener("dragover", e => {
      e.preventDefault();
      item.classList.add("sobre-preview");
    });

    item.addEventListener("dragleave", () => {
      item.classList.remove("sobre-preview");
    });

    item.addEventListener("drop", e => {
      e.preventDefault();

      item.classList.remove("sobre-preview");

      const indexOrigen = Number(e.dataTransfer.getData("index"));
      const indexDestino = Number(item.dataset.index);

      if (indexOrigen === indexDestino) return;

      const imagenMovida = imagenesPreview.splice(indexOrigen, 1)[0];
      imagenesPreview.splice(indexDestino, 0, imagenMovida);

      imagenesActualesPreview = imagenesPreview
        .filter(img => img.tipo === "actual")
        .map(img => img.valor);

      imagenesSeleccionadas = imagenesPreview
        .filter(img => img.tipo === "nueva")
        .map(img => img.valor);

      imagenActualProducto = imagenesActualesPreview[0] || "";
      imagenesActualesProducto = JSON.stringify(imagenesActualesPreview);

      mostrarPreviewImagenes();
    });

    previewGaleria.appendChild(item);
  });
}

function eliminarImagenPreviewProducto(index) {
  const imagenesPreview = [
    ...imagenesActualesPreview.map(imagen => ({
      tipo: "actual",
      valor: imagen
    })),
    ...imagenesSeleccionadas.map(imagen => ({
      tipo: "nueva",
      valor: imagen
    }))
  ];

  imagenesPreview.splice(index, 1);

  imagenesActualesPreview = imagenesPreview
    .filter(img => img.tipo === "actual")
    .map(img => img.valor);

  imagenesSeleccionadas = imagenesPreview
    .filter(img => img.tipo === "nueva")
    .map(img => img.valor);

  imagenActualProducto = imagenesActualesPreview[0] || "";
  imagenesActualesProducto = JSON.stringify(imagenesActualesPreview);

  if (imagenesProducto) {
    imagenesProducto.value = "";
  }

  mostrarPreviewImagenes();
}

function eliminarImagenNuevaProducto(index) {
  imagenesSeleccionadas.splice(index, 1);

  if (imagenesProducto) {
    imagenesProducto.value = "";
  }

  mostrarPreviewImagenes();
}

function eliminarImagenActualProducto(index) {
  imagenesActualesPreview.splice(index, 1);

  imagenActualProducto = imagenesActualesPreview[0] || "";
  imagenesActualesProducto = JSON.stringify(imagenesActualesPreview);

  mostrarPreviewImagenes();
}

/* CATEGORÍAS EN SELECT */

async function cargarCategoriasSelectProducto() {
  if (!categoriaProducto) return;

  try {
    const res = await fetch(`${API_URL}/categorias`);
    const categorias = await res.json();

    categoriaProducto.innerHTML = `
      <option value="">Selecciona una categoría</option>
      ${categorias.map(categoria => `
        <option value="${categoria.id}">${categoria.nombre}</option>
      `).join("")}
    `;
  } catch (error) {
    console.error(error);
  }
}

let tipoProducto = "normal";

document.querySelectorAll("[data-tipo-producto]").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("[data-tipo-producto]").forEach(b => b.classList.remove("activo"));
    btn.classList.add("activo");

    tipoProducto = btn.dataset.tipoProducto;
  });
});

function mostrarVariantesProducto() {
  if (!listaVariantesProducto) return;

  if (variantesProducto.length === 0) {
    listaVariantesProducto.innerHTML = `
      <p class="mini-text">No hay variantes agregadas todavía.</p>
    `;
    return;
  }

  listaVariantesProducto.innerHTML = variantesProducto.map((variante, index) => {
    const colores = variante.colores.length ? variante.colores : ["Sin color"];
    const tallas = variante.tallas.length ? variante.tallas : ["Sin talla"];

    const filas = colores.map(color => `
      <tr>
        <td>${color}</td>

        <td>
          <div class="tallas-tabla-lista">
            ${tallas.map(talla => `
              <span>${talla}</span>
            `).join("")}
          </div>
        </td>

        <td>${variante.stock}</td>
      </tr>
    `).join("");

    return `
      <div class="variante-card">
        <div class="variante-card-header">
          <strong>Variante ${index + 1}</strong>

          <button 
            type="button" 
            onclick="eliminarVarianteProducto(${index})"
          >
            Eliminar
          </button>
        </div>

        <div class="tabla-variantes-scroll">
          <table class="tabla-variantes">
            <thead>
              <tr>
                <th>Color</th>
                <th>Tallas</th>
                <th>Cantidad</th>
              </tr>
            </thead>

            <tbody>
              ${filas}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }).join("");
}

function reiniciarCamposVariante() {
  tallasProducto = [];
  coloresProducto = [];
  tipoTallaProducto = "";

  if (stockProducto) stockProducto.value = "";
  if (inputColor) inputColor.value = "";
  if (inputTalla) inputTalla.value = "";
  if (opcionesTallas) opcionesTallas.innerHTML = "";

  document.querySelectorAll("[data-tipo-talla]").forEach(btn => {
    btn.classList.remove("activo");
  });

  document.querySelectorAll("#opcionesTallas input").forEach(input => {
    input.checked = false;
  });

  if (editorTallaPersonalizada) {
    editorTallaPersonalizada.style.display = "none";
  }

  mostrarTallasSeleccionadas();
  mostrarColoresSeleccionados();
}

function eliminarVarianteProducto(index) {
  variantesProducto.splice(index, 1);
  mostrarVariantesProducto();
}

if (agregarVarianteProducto) {
  agregarVarianteProducto.addEventListener("click", () => {
    const stock = Number(stockProducto?.value?.trim());

    if (usaTallasProducto && tallasProducto.length === 0) {
      alert("Selecciona mínimo una talla para esta variante");
      return;
    }

    if (usaColoresProducto && coloresProducto.length === 0) {
      alert("Agrega mínimo un color para esta variante");
      return;
    }

    if (isNaN(stock) || stock < 1) {
      alert("Escribe una cantidad válida para esta variante");
      return;
    }

    const nuevaVariante = {
      tallas: usaTallasProducto ? [...tallasProducto] : [],
      colores: usaColoresProducto ? [...coloresProducto] : [],
      stock
    };

    variantesProducto.push(nuevaVariante);

    mostrarVariantesProducto();
    reiniciarCamposVariante();
  });
}

function obtenerVariantesParaGuardar() {
  const sinTallas = !usaTallasProducto;
  const sinColores = !usaColoresProducto;

  // Si ya agregaste una variante, usa esa variante.
  // Esto evita que se pierda el stock cuando el input se limpia.
  if (variantesProducto.length > 0) {
    return {
      variantes: variantesProducto
    };
  }

  const stockTexto = stockProducto?.value?.trim();
  const stock = Number(stockTexto);

  // Producto sin tallas y sin colores
  if (sinTallas && sinColores) {
    if (stockTexto === "" || !Number.isInteger(stock) || stock < 1) {
      return {
        error: "Escribe una cantidad válida para el stock del producto."
      };
    }

    return {
      variantes: [
        {
          tallas: [],
          colores: [],
          stock
        }
      ]
    };
  }

  // Producto con tallas o colores
  return {
    error: "Agrega mínimo una variante antes de guardar el producto."
  };
}
function obtenerTotalImagenesProducto() {
  const imagenesActuales = Array.isArray(imagenesActualesPreview)
    ? imagenesActualesPreview.length
    : 0;

  const imagenesNuevas = Array.isArray(imagenesSeleccionadas)
    ? imagenesSeleccionadas.filter(imagen => imagen instanceof File || imagen instanceof Blob).length
    : 0;

  return imagenesActuales + imagenesNuevas;
}

/* GUARDAR PRODUCTO */

if (formProducto) {
  formProducto.addEventListener("submit", async e => {
    e.preventDefault();

    const precio = parseFloat(precioProducto.value);

    if (isNaN(precio) || precio <= 0) {
      alert("Precio no válido");
      return;
    }

    const totalImagenesProducto =
      imagenesActualesPreview.length + imagenesSeleccionadas.length;

    if (totalImagenesProducto === 0) {
      alert("Selecciona mínimo una imagen");
      return;
    }

    const resultadoVariantes = obtenerVariantesParaGuardar();

    if (resultadoVariantes.error) {
      alert(resultadoVariantes.error);
      return;
    }

    const variantesFinales = resultadoVariantes.variantes;

    const formData = new FormData();

    formData.append("nombre", nombreProducto.value.trim());
    formData.append("precio", precio);
    formData.append("descripcion", descripcionProducto.value.trim());
    formData.append("categoria_id", categoriaProducto.value);
    formData.append("marca", marcaProducto.value.trim());
    formData.append("variantes", JSON.stringify(variantesFinales));
    formData.append("tipo_producto", tipoProducto);

    formData.append("imagenActual", imagenActualProducto || imagenesActualesPreview[0] || "");
    formData.append("imagenesActuales", JSON.stringify(imagenesActualesPreview));

    imagenesSeleccionadas.forEach(imagen => {
      formData.append("imagenes", imagen);
    });

    const url = productoEditandoId
      ? `${API_URL}/productos/${productoEditandoId}`
      : `${API_URL}/productos`;

    const method = productoEditandoId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        console.error("ERROR BACKEND:", errorData);
        throw new Error("Error al guardar producto");
      }

      await cargarProductosAdmin();
      cerrarModalProductoAdmin();

      alert("Producto guardado correctamente");

    } catch (error) {
      console.error(error);
      alert("No se pudo guardar el producto");
    }
  });
}
/* MOSTRAR PRODUCTOS ADMIN */

async function cargarProductosAdmin() {
  if (!contenedorProductos) return;

  try {
    const res = await fetch(`${API_URL}/productos`);
    const productos = await res.json();

    contenedorProductos.innerHTML = `
      <table class="admin-products-table">
        <thead>
          <tr>
            <th><input type="checkbox"></th>
            <th>Producto</th>
            <th>Categoría</th>
            <th>Precio</th> <!-- Aquí mostramos el precio -->
            <th>Stock</th>
            <th>Vendidos</th>
            <th>Estado</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          ${productos.map(producto => `
            <tr>
              <td><input type="checkbox"></td>

              <td>
                <div class="admin-product-info">
                  <img src="${API_URL}/${producto.imagen}" alt="${producto.nombre}">
                  <div>
                    <h4>${producto.nombre}</h4>
                    <span>SKU: ${producto.sku || "N/A"}</span>
                  </div>
                </div>
              </td>

              <td>${producto.categoria || "Sin categoría"}</td>

              <!-- Usamos la función formatearPrecio para mostrar el precio -->
              <td>${formatearPrecio(producto.precio)}</td> 

              <td class="${Number(producto.stock) <= 5 ? "stock-low" : "stock-ok"}">
                ${producto.stock || 0}
              </td>

              <td>0</td>

              <td>${new Date().toLocaleDateString()}</td>

              <td>
                <div class="admin-actions">
                  <button onclick="editarProducto(${producto.id})">
                    <i class="bi bi-pencil"></i>
                  </button>

                  <a href="producto.html?id=${producto.id}">
                    <i class="bi bi-eye"></i>
                  </a>

                  <button class="delete" onclick="eliminarProducto(${producto.id})">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  } catch (error) {
    console.error("Error al cargar los productos:", error);
  }
}

// Función para crear la fila de un producto
function crearFilaProducto(producto) {
  const estadoProducto = Number(producto.stock) <= 0 ? "agotado" : "activo";
  const estadoClase = Number(producto.stock) <= 0 ? "agotado" : "activo";
  const stockClase = Number(producto.stock) <= 5 ? "stock-low" : "stock-ok";

  return `
    <tr>
      <td><input type="checkbox"></td>

      <td>
        <div class="admin-product-info">
          <img src="${API_URL}/${producto.imagen}" alt="${producto.nombre}">
          <div>
            <h4>${producto.nombre}</h4>
            <span>SKU: ${producto.sku || "N/A"}</span>
          </div>
        </div>
      </td>

      <td>${producto.categoria || "Sin categoría"}</td>

      <td>${formatearPrecio(producto.precio)}</td>

      <td class="${stockClase}">
        ${producto.stock || 0}
      </td>

      <td>0</td>

      <td>
        <span class="estado-producto ${estadoClase}">
          ${estadoProducto}
        </span>
      </td>

      <td>${new Date().toLocaleDateString()}</td>

      <td>
        <div class="admin-actions">
          <button onclick="editarProducto(${producto.id})">
            <i class="bi bi-pencil"></i>
          </button>

          <a href="producto.html?id=${producto.id}">
            <i class="bi bi-eye"></i>
          </a>

          <button class="delete" onclick="eliminarProducto(${producto.id})">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `;
}

async function eliminarProducto(id) {
  const confirmar = confirm("¿Seguro que quieres eliminar este producto?");

  if (!confirmar) return;

  try {
    const res = await fetch(`${API_URL}/productos/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error("Error al eliminar producto");
    }

    await cargarProductosAdmin();
  } catch (error) {
    console.error(error);
    alert("No se pudo eliminar el producto");
  }
}
async function editarProducto(id) {
  try {
    const res = await fetch(`${API_URL}/productos/${id}`);

    if (!res.ok) {
      throw new Error("Error al obtener el producto");
    }

    const producto = await res.json();

    // =========================
    // Modo edición
    // =========================
    productoEditandoId = id;

    // =========================
    // Imágenes actuales para mover/eliminar
    // =========================
    imagenesPreviewProducto = obtenerImagenesProducto(producto).map(ruta => {
      return {
        tipo: "actual",
        valor: ruta
      };
    });

    imagenesSeleccionadas = [];

    sincronizarImagenesDesdePreview();

    // =========================
    // Cargar categorías
    // =========================
    await cargarCategoriasSelectProducto();

    // =========================
    // Datos principales
    // =========================
    nombreProducto.value = producto.nombre || "";
    precioProducto.value = producto.precio || "";
    descripcionProducto.value = producto.descripcion || "";
    categoriaProducto.value = producto.categoria_id || "";
    marcaProducto.value = producto.marca || "";
    tipoProducto = producto.tipo_producto || "normal";

    // =========================
    // Variantes guardadas
    // =========================
    try {
      variantesProducto = producto.variantes
        ? JSON.parse(producto.variantes)
        : [];
    } catch (error) {
      variantesProducto = [];
    }

    // =========================
    // Limpiar selección temporal
    // =========================
    tallasProducto = [];
    coloresProducto = [];

    if (stockProducto) {
      stockProducto.value = "";
    }

    // =========================
    // Restaurar botones tipo producto
    // =========================
    document.querySelectorAll("[data-tipo-producto]").forEach(btn => {
      btn.classList.remove("activo");

      if (btn.dataset.tipoProducto === tipoProducto) {
        btn.classList.add("activo");
      }
    });

    // =========================
    // Pintar información visual
    // =========================
    mostrarTallasSeleccionadas();
    mostrarColoresSeleccionados();
    mostrarVariantesProducto();
    mostrarPreviewImagenes();

    // =========================
    // Abrir modal
    // =========================
    modalProducto.classList.add("activo");

  } catch (error) {
    console.error(error);
    alert("No se pudo cargar el producto");
  }
}

cargarProductosAdmin();

/* =========================
   INDEX: PRODUCTOS
========================= */

/* =========================
   INDEX: PRODUCTOS SWIPER
========================= */

let productosIndexSwiper = null;

function mezclarProductos(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

async function cargarProductosIndex() {
  const contenedor = document.getElementById("productosIndex");

  if (!contenedor) return;

  try {
    const res = await fetch(`${API_URL}/productos`);
    const productos = await res.json();

    const productosAleatorios = mezclarProductos(productos).slice(0, 12);

    let productosSlider = [...productosAleatorios];

    while (productosSlider.length < 18 && productosAleatorios.length > 0) {
      productosSlider = productosSlider.concat(productosAleatorios);
    }

    contenedor.innerHTML = productosSlider.map(producto => `
      <div class="swiper-slide">
        <a href="producto.html?id=${producto.id}" class="catalogo-card producto-home-card">
          <div class="catalogo-img producto-home-img">
            <img src="${API_URL}/${producto.imagen}" alt="${producto.nombre}">
          </div>

          <div class="catalogo-card-info producto-home-info">
            <h3>${producto.nombre}</h3>
            <strong>${formatearPrecio(producto.precio)}</strong>
            <div class="catalogo-stars">★★★★★ <span>(0)</span></div>
          </div>

          <button 
            type="button"
            class="catalogo-cart btn-carrito-listado" 
            data-id="${producto.id}"
          >
            <i class="bi bi-cart"></i>
          </button>
        </a>
      </div>
    `).join("");

    if (productosIndexSwiper) {
      productosIndexSwiper.destroy(true, true);
    }

    productosIndexSwiper = new Swiper(".productosSwiper", {
      slidesPerView: "auto",
      spaceBetween: 24,
      loop: true,
      speed: 6500,
      grabCursor: true,
      allowTouchMove: true,

      freeMode: {
        enabled: true,
        momentum: false,
      },

      autoplay: {
        delay: 0,
        disableOnInteraction: false,
        pauseOnMouseEnter: false,
      },

      loopAdditionalSlides: productosSlider.length,

      breakpoints: {
        0: {
          spaceBetween: 12,
        },
        480: {
          spaceBetween: 14,
        },
        768: {
          spaceBetween: 18,
        },
        1024: {
          spaceBetween: 24,
        },
      },
    });

  } catch (error) {
    console.error(error);
  }
}

cargarProductosIndex();

/* =========================
   PÁGINA DETALLE PRODUCTO
========================= */

let cantidadDetalle = 1;
let tallaSeleccionadaDetalle = "";
let colorSeleccionadoDetalle = "";
let variantesDetalle = [];

async function cargarDetalleProducto() {
  const contenedor = document.getElementById("productoDetalle");

  if (!contenedor) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    contenedor.innerHTML = "<p>Producto no encontrado.</p>";
    return;
  }

  try {
    const res = await fetch(`${API_URL}/productos/${id}`);
    const producto = await res.json();

    const imagenes = producto.imagenes
      ? JSON.parse(producto.imagenes)
      : [producto.imagen];

    let variantes = [];

    try {
      variantes = producto.variantes ? JSON.parse(producto.variantes) : [];
    } catch (error) {
      variantes = [];
    }

    variantesDetalle = variantes.filter(variante => Number(variante.stock) > 0);

    const coloresDisponibles = [
      ...new Set(
        variantesDetalle.flatMap(variante => variante.colores || [])
      )
    ];

    cantidadDetalle = 1;
    tallaSeleccionadaDetalle = "";
    colorSeleccionadoDetalle = "";

    contenedor.innerHTML = `
      <div class="producto-galeria">
        <div class="producto-miniaturas">
          ${imagenes.map((img, index) => `
            <img 
              src="${API_URL}/${img}" 
              class="${index === 0 ? "activo" : ""}"
              onclick="cambiarImagenProducto('${API_URL}/${img}', this)"
            >
          `).join("")}
        </div>

        <div class="producto-imagen-principal">
          <img id="imagenPrincipalProducto" src="${API_URL}/${imagenes[0]}" alt="${producto.nombre}">
        </div>
      </div>

      <div class="producto-info-detalle">
        <span class="producto-categoria-tag">${producto.categoria}</span>

        <h1>${producto.nombre}</h1>

        <div class="producto-rating">
          ★★★★★ <span>(0 reseñas)</span>
        </div>

        <h2>${formatearPrecio(producto.precio)}</h2>

        <p class="producto-descripcion-detalle">
          ${producto.descripcion || ""}
        </p>

        <hr>
      ${coloresDisponibles.length > 0 ? `
        <div class="producto-opciones">
          <h4>Color</h4>

          <div class="producto-colores-detalle">
            ${coloresDisponibles.map(color => `
              <button 
                type="button"
                class="color-detalle-btn"
                data-color="${color}"
                onclick="seleccionarColorDetalle(this)"
              >
                ${color}
              </button>
            `).join("")}
          </div>
        </div>

        <div class="producto-opciones" id="bloqueTallasDetalle" style="display: none;">
          <h4>Talla</h4>
          <div class="producto-tallas-detalle" id="tallasDetallePorColor"></div>
        </div>
      ` : ""}
        <div class="producto-cantidad">
          <h4>Cantidad</h4>

          <div class="cantidad-control">
            <button type="button" onclick="cambiarCantidadDetalle(-1)">−</button>
            <span id="cantidadDetalle">1</span>
            <button type="button" onclick="cambiarCantidadDetalle(1)">+</button>
          </div>
        </div>

        <div class="producto-botones-detalle">
          <button class="btn-agregar-carrito"><i class="bi bi-cart"></i> Agregar al carrito</button>
          <button class="btn-comprar-ahora">⚡ Comprar ahora</button>
        </div>
      </div>
    `;

    cargarProductosSimilares(producto.categoria_id, producto.id);
  } catch (error) {
    console.error(error);
    contenedor.innerHTML = "<p>No se pudo cargar el producto.</p>";
  }
}

function seleccionarTallaDetalle(boton) {
  document.querySelectorAll(".talla-detalle-btn").forEach(btn => {
    btn.classList.remove("activo");
  });

  boton.classList.add("activo");
  tallaSeleccionadaDetalle = boton.dataset.talla;
}

function seleccionarColorDetalle(boton) {
  document.querySelectorAll(".color-detalle-btn").forEach(btn => {
    btn.classList.remove("activo");
  });

  boton.classList.add("activo");

  colorSeleccionadoDetalle = boton.dataset.color;
  tallaSeleccionadaDetalle = "";

  const bloqueTallas = document.getElementById("bloqueTallasDetalle");
  const contenedorTallas = document.getElementById("tallasDetallePorColor");

  if (!bloqueTallas || !contenedorTallas) return;

  const tallasDisponibles = [
    ...new Set(
      variantesDetalle
        .filter(variante =>
          Number(variante.stock) > 0 &&
          Array.isArray(variante.colores) &&
          variante.colores.includes(colorSeleccionadoDetalle)
        )
        .flatMap(variante => variante.tallas || [])
    )
  ];

  if (tallasDisponibles.length === 0) {
    bloqueTallas.style.display = "none";
    contenedorTallas.innerHTML = "";
    return;
  }

  bloqueTallas.style.display = "block";

  contenedorTallas.innerHTML = tallasDisponibles.map(talla => `
    <button 
      type="button"
      class="talla-detalle-btn"
      data-talla="${talla}"
      onclick="seleccionarTallaDetalle(this)"
    >
      ${talla}
    </button>
  `).join("");
}

function cambiarImagenProducto(src, elemento) {
  document.getElementById("imagenPrincipalProducto").src = src;

  document.querySelectorAll(".producto-miniaturas img").forEach(img => {
    img.classList.remove("activo");
  });

  elemento.classList.add("activo");
}

function cambiarCantidadDetalle(valor) {
  cantidadDetalle += valor;

  if (cantidadDetalle < 1) cantidadDetalle = 1;

  document.getElementById("cantidadDetalle").textContent = cantidadDetalle;
}

async function cargarProductosSimilares(categoriaId, productoActualId) {
  const contenedor = document.getElementById("productosSimilares");

  if (!contenedor) return;

  const res = await fetch(`${API_URL}/productos`);
  const productos = await res.json();

  const similares = productos.filter(producto =>
    producto.categoria_id == categoriaId && producto.id != productoActualId
  );

  contenedor.innerHTML = similares.map(producto => `
    <a href="producto.html?id=${producto.id}" class="catalogo-card">
      <div class="catalogo-img">
        <img src="${API_URL}/${producto.imagen}" alt="${producto.nombre}">
      </div>

      <div class="catalogo-card-info">
        <h3>${producto.nombre}</h3>
        <strong>${formatearPrecio(producto.precio)}</strong>
        <div class="catalogo-stars">★★★★★ <span>(0)</span></div>
      </div>
    </a>
  `).join("");
}

cargarDetalleProducto();
/* =========================
   CATALOGO
========================= */
const buscadorIndex = document.querySelector(".catalogo-search");

if (buscadorIndex && document.getElementById("productosIndex")) {
  buscadorIndex.addEventListener("click", () => {
    window.location.href = "catalogo.html";
  });
}

let productosCatalogoData = [];
let categoriaActivaCatalogo = "todos";

async function cargarCatalogo() {
  const contenedor = document.getElementById("productosCatalogo");
  const filtros = document.getElementById("filtrosCategorias");

  if (!contenedor || !filtros) return;

  try {
    const resProductos = await fetch(`${API_URL}/productos`);
    const resCategorias = await fetch(`${API_URL}/categorias`);

    const todosLosProductos = await resProductos.json();
    productosCatalogoData = todosLosProductos;

    const categorias = await resCategorias.json();

    filtros.innerHTML = `
      <button 
        class="activo" 
        data-categoria="todos"
        onclick="filtrarCatalogoCategoria('todos', this)"
      >
        Todos los productos <span>${productosCatalogoData.length}</span>
      </button>

      ${categorias.map(categoria => {
      const total = productosCatalogoData.filter(p => p.categoria_id == categoria.id).length;

      return `
          <button 
            data-categoria="${categoria.id}"
            onclick="filtrarCatalogoCategoria('${categoria.id}', this)"
          >
            ${categoria.nombre} <span>${total}</span>
          </button>
        `;
    }).join("")}
    `;

    const params = new URLSearchParams(window.location.search);
    const categoriaURL = params.get("categoria");

    if (categoriaURL) {
      categoriaActivaCatalogo = categoriaURL;

      const botonCategoria = document.querySelector(
        `.filtros-categorias button[data-categoria="${categoriaURL}"]`
      );

      document.querySelectorAll(".filtros-categorias button").forEach(btn => {
        btn.classList.remove("activo");
      });

      if (botonCategoria) {
        botonCategoria.classList.add("activo");
      }

      aplicarFiltrosCatalogo();
    } else {
      pintarCatalogo(productosCatalogoData);
    }

  } catch (error) {
    console.error(error);
  }
}

function pintarCatalogo(productos) {
  const contenedor = document.getElementById("productosCatalogo");
  const contador = document.getElementById("contadorCatalogo");

  if (!contenedor) return;

  if (contador) {
    contador.textContent = `Mostrando ${productos.length} productos`;
  }

  contenedor.innerHTML = productos.map(producto => `
    <a href="producto.html?id=${producto.id}" class="catalogo-card">
      <div class="catalogo-img">
        <img src="${API_URL}/${producto.imagen}" alt="${producto.nombre}">
      </div>

      <div class="catalogo-card-info">
        <h3>${producto.nombre}</h3>
        <strong>${formatearPrecio(producto.precio)}</strong>
        <div class="catalogo-stars">★★★★★ <span>(0)</span></div>
      </div>

      <button 
        type="button"
        class="catalogo-cart btn-carrito-listado" 
        data-id="${producto.id}"
      >
        <i class="bi bi-cart"></i>
      </button>
    </a>
  `).join("");
}

function filtrarCatalogoCategoria(categoriaId, boton) {
  categoriaActivaCatalogo = categoriaId;

  document.querySelectorAll(".filtros-categorias button").forEach(btn => {
    btn.classList.remove("activo");
  });

  boton.classList.add("activo");

  aplicarFiltrosCatalogo();
}

function aplicarFiltrosCatalogo() {
  let productos = [...productosCatalogoData];

  const textoBusqueda = document.getElementById("buscarCatalogo")?.value.toLowerCase().trim() || "";

  if (categoriaActivaCatalogo !== "todos") {
    productos = productos.filter(producto => producto.categoria_id == categoriaActivaCatalogo);
  }

  if (textoBusqueda) {
    productos = productos.filter(producto =>
      producto.nombre?.toLowerCase().includes(textoBusqueda)
    );
  }

  const min = Number(document.getElementById("precioMin")?.value || 0);
  const max = Number(document.getElementById("precioMax")?.value || 0);

  if (min > 0) {
    productos = productos.filter(producto => Number(producto.precio) >= min);
  }

  if (max > 0) {
    productos = productos.filter(producto => Number(producto.precio) <= max);
  }

  const orden = document.getElementById("ordenCatalogo")?.value;

  if (orden === "mayor") {
    productos.sort((a, b) => Number(b.precio) - Number(a.precio));
  }

  if (orden === "menor") {
    productos.sort((a, b) => Number(a.precio) - Number(b.precio));
  }

  if (orden === "nombre") {
    productos.sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  pintarCatalogo(productos);
}
document.getElementById("filtrarPrecio")?.addEventListener("click", aplicarFiltrosCatalogo);
document.getElementById("ordenCatalogo")?.addEventListener("change", aplicarFiltrosCatalogo);
document.getElementById("buscarCatalogo")?.addEventListener("input", aplicarFiltrosCatalogo);


cargarCatalogo();

/* =========================
   CARRITO GLOBAL
========================= */

let carritoProductos = JSON.parse(localStorage.getItem("carritoProductos")) || [];

function crearModalCarritoSiNoExiste() {
  if (document.getElementById("modalCarrito")) return;

  document.body.insertAdjacentHTML("beforeend", `
    <button id="btnCarritoFlotante" class="carrito-flotante">
      <i class="bi bi-cart"></i> <span id="contadorCarrito">0</span>
    </button>

    <div id="modalCarrito" class="modal-carrito">
      <div class="modal-carrito-content">
        <span id="cerrarModalCarrito" class="cerrar-carrito">&times;</span>
        <h2>Carrito de compras</h2>
        <div id="listaCarritoModal" class="lista-carrito-modal"></div>

        <div class="carrito-total-box">
          <span>Total:</span>
          <strong id="totalCarrito">$0</strong>
        </div>

        <button class="btn-finalizar-compra">
          Finalizar compra
        </button>
      </div>
    </div>
  `);
}

crearModalCarritoSiNoExiste();

document.addEventListener("click", async e => {
  const btnFlotante = e.target.closest("#btnCarritoFlotante");
  const btnCerrar = e.target.closest("#cerrarModalCarrito");
  const btnDetalle = e.target.closest(".btn-agregar-carrito");
  const btnListado = e.target.closest(".btn-carrito-listado");

  if (btnFlotante) {
    document.getElementById("modalCarrito").classList.add("activo");
    pintarCarritoModal();
    return;
  }

  if (btnCerrar) {
    document.getElementById("modalCarrito").classList.remove("activo");
    return;
  }

  if (btnDetalle) {
    e.preventDefault();
    e.stopPropagation();

    agregarProductoDetalleAlCarrito();
    return;
  }

  if (btnListado) {
    e.preventDefault();
    e.stopPropagation();

    const id = btnListado.dataset.id;
    await agregarProductoListadoAlCarrito(id);
    return;
  }
});

async function agregarProductoListadoAlCarrito(id) {
  try {
    const res = await fetch(`${API_URL}/productos/${id}`);
    const producto = await res.json();

    let variantes = [];

    try {
      variantes = producto.variantes ? JSON.parse(producto.variantes) : [];
    } catch (error) {
      variantes = [];
    }

    const variantesDisponibles = variantes.filter(variante => Number(variante.stock) > 0);

    // Si tiene variantes, debe ir al detalle para escoger color y talla
    const tieneOpciones = variantesDisponibles.some(variante => {
      const tieneColores = Array.isArray(variante.colores) && variante.colores.length > 0;
      const tieneTallas = Array.isArray(variante.tallas) && variante.tallas.length > 0;

      return tieneColores || tieneTallas;
    });

    if (tieneOpciones) {
      window.location.href = `producto.html?id=${producto.id}`;
      return;
    }
    // Si no tiene variantes, sí se puede agregar directo
    carritoProductos.push({
      id: Date.now(),
      producto_id: producto.id,
      nombre: producto.nombre,
      imagen: `${API_URL}/${producto.imagen}`,
      precio: Number(producto.precio),
      cantidad: 1,
      talla: "",
      color: "",
    });

    guardarCarrito();
    pintarCarritoModal();

  } catch (error) {
    console.error(error);
    alert("No se pudo agregar el producto");
  }
}

function agregarProductoDetalleAlCarrito() {
  const nombre = document.querySelector(".producto-info-detalle h1")?.textContent.trim();
  const precioTexto = document.querySelector(".producto-info-detalle h2")?.textContent.replace(/[^\d]/g, "");
  const imagen = document.getElementById("imagenPrincipalProducto")?.src;

  const precio = Number(precioTexto);
  const cantidad = cantidadDetalle || 1;

  if (!nombre || !precio || !imagen) {
    alert("No se pudo agregar el producto");
    return;
  }

  const requiereColor = productoTieneColoresDetalle();
  const requiereTalla = productoTieneTallasDetalle();

  if (requiereColor && !colorSeleccionadoDetalle) {
    alert("Selecciona un color");
    return;
  }

  if (requiereTalla && !tallaSeleccionadaDetalle) {
    alert("Selecciona una talla");
    return;
  }

  carritoProductos.push({
    id: Date.now(),
    nombre,
    imagen,
    precio,
    cantidad,
    talla: tallaSeleccionadaDetalle || "",
    color: colorSeleccionadoDetalle || "",
  });

  guardarCarrito();
  pintarCarritoModal();
}

function productoTieneColoresDetalle() {
  return variantesDetalle.some(variante => {
    return Array.isArray(variante.colores) && variante.colores.length > 0;
  });
}

function productoTieneTallasDetalle() {
  return variantesDetalle.some(variante => {
    return Array.isArray(variante.tallas) && variante.tallas.length > 0;
  });
}

function pintarCarritoModal() {
  const listaCarritoModal = document.getElementById("listaCarritoModal");

  if (!listaCarritoModal) return;

  if (carritoProductos.length === 0) {
    listaCarritoModal.innerHTML = "<p>Tu carrito está vacío.</p>";
    actualizarTotalesCarrito();
    return;
  }

  listaCarritoModal.innerHTML = carritoProductos.map(producto => `
    <div class="item-carrito">
      <img src="${producto.imagen}" alt="${producto.nombre}">

      <div class="item-carrito-info">
        <h4>${producto.nombre}</h4>

        ${producto.talla ? `<p>Talla: ${producto.talla}</p>` : ""}
        ${producto.color ? `<p>Color: ${producto.color}</p>` : ""}

        <div class="item-carrito-precios">
          <p>Precio unitario: <strong>$${producto.precio.toLocaleString()}</strong></p>
          <p>Total: <strong>$${(producto.precio * producto.cantidad).toLocaleString()}</strong></p>
        </div>

        <div class="item-carrito-actions">
          <button onclick="cambiarCantidadCarrito(${producto.id}, -1)">−</button>
          <span>${producto.cantidad}</span>
          <button onclick="cambiarCantidadCarrito(${producto.id}, 1)">+</button>
          <button class="btn-eliminar-item" onclick="eliminarProductoCarrito(${producto.id})">🗑</button>
        </div>
      </div>
    </div>
  `).join("");

  actualizarTotalesCarrito();
}

function cambiarCantidadCarrito(id, valor) {
  carritoProductos = carritoProductos.map(producto => {
    if (producto.id === id) {
      producto.cantidad += valor;
      if (producto.cantidad < 1) producto.cantidad = 1;
    }
    return producto;
  });

  guardarCarrito();
  pintarCarritoModal();
}

function eliminarProductoCarrito(id) {
  carritoProductos = carritoProductos.filter(producto => producto.id !== id);
  guardarCarrito();
  pintarCarritoModal();
}
function actualizarTotalesCarrito() {
  const cantidadTotal = carritoProductos.reduce((total, producto) => {
    return total + Number(producto.cantidad);
  }, 0);

  const precioTotal = carritoProductos.reduce((total, producto) => {
    return total + Number(producto.precio) * Number(producto.cantidad);
  }, 0);

  document.querySelectorAll("#contadorCarrito").forEach(contador => {
    contador.textContent = cantidadTotal;
  });

  document.querySelectorAll("#totalCarrito").forEach(total => {
    total.textContent = `$${precioTotal.toLocaleString()}`;
  });
}

function guardarCarrito() {
  localStorage.setItem("carritoProductos", JSON.stringify(carritoProductos));
  actualizarTotalesCarrito();
}

actualizarTotalesCarrito();

/*MODAL PERSONAL SHOPPER */

const abrirModalServicio = document.getElementById("abrirModalServicio");
const cerrarModalServicio = document.getElementById("cerrarModalServicio");
const modalServicio = document.getElementById("modalServicio");
const formServicio = document.getElementById("formServicio");

if (abrirModalServicio && modalServicio) {
  abrirModalServicio.addEventListener("click", () => {
    modalServicio.classList.add("activo");
  });
}

if (cerrarModalServicio && modalServicio) {
  cerrarModalServicio.addEventListener("click", () => {
    modalServicio.classList.remove("activo");
  });
}

if (formServicio) {
  formServicio.addEventListener("submit", e => {
    e.preventDefault();

    const nombre = document.getElementById("nombreServicio").value.trim();
    const whatsapp = document.getElementById("whatsappServicio").value.trim();
    const correo = document.getElementById("correoServicio").value.trim();
    const mensaje = document.getElementById("mensajeServicio").value.trim();

    const numeroDestino = "+573167858252";

    const texto = `Hola, soy ${nombre}.%0A%0AQuiero solicitar el servicio de Personal Shopper.%0A%0A${mensaje}%0A%0AMi WhatsApp es: ${whatsapp}%0AMi correo es: ${correo}`;

    window.open(`https://wa.me/${numeroDestino}?text=${texto}`, "_blank");

    formServicio.reset();
    modalServicio.classList.remove("activo");
  });
}

/* =========================
   NOVEDADES
========================= */

let productosNovedadesData = [];

async function cargarNovedades() {
  const contenedor = document.getElementById("productosNovedades");

  if (!contenedor) return;

  try {
    const res = await fetch(`${API_URL}/productos`);
    const productos = await res.json();

    const hoy = new Date();
    const limite = new Date();
    limite.setDate(hoy.getDate() - 4);

    productosNovedadesData = productos.filter(producto => {
      const fechaProducto = new Date(producto.created_at);
      return fechaProducto >= limite;
    });

    pintarNovedades(productosNovedadesData);
  } catch (error) {
    console.error(error);
    contenedor.innerHTML = "<p>No se pudieron cargar las novedades.</p>";
  }
}

function pintarNovedades(productos) {
  const contenedor = document.getElementById("productosNovedades");
  const contador = document.getElementById("contadorNovedades");

  if (!contenedor) return;

  if (contador) {
    contador.textContent = `Mostrando ${productos.length} novedades`;
  }

  contenedor.innerHTML = productos.map(producto => `
      <a href="producto.html?id=${producto.id}" class="catalogo-card">
      ${producto.tipo_producto === "preventa" ? `
      <span class="badge-preventa">Preventa</span>
    ` : ""} 
      <div class="catalogo-img">
        <img src="${API_URL}/${producto.imagen}" alt="${producto.nombre}">
      </div>

      <div class="catalogo-card-info">
        <h3>${producto.nombre}</h3>
        <strong>${formatearPrecio(producto.precio)}</strong>
        <div class="catalogo-stars">Nuevo</div>
      </div>

      <button 
        type="button"
        class="catalogo-cart btn-carrito-listado" 
        data-id="${producto.id}"
      >
        <i class="bi bi-cart"></i>
      </button>
    </a>
  `).join("");
}

document.getElementById("ordenNovedades")?.addEventListener("change", e => {
  let productos = [...productosNovedadesData];

  if (e.target.value === "mayor") {
    productos.sort((a, b) => Number(b.precio) - Number(a.precio));
  }

  if (e.target.value === "menor") {
    productos.sort((a, b) => Number(a.precio) - Number(b.precio));
  }

  if (e.target.value === "nombre") {
    productos.sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  pintarNovedades(productos);
});

document.getElementById("buscarNovedades")?.addEventListener("input", e => {
  const texto = e.target.value.toLowerCase();

  const productos = productosNovedadesData.filter(producto =>
    producto.nombre.toLowerCase().includes(texto) ||
    producto.descripcion?.toLowerCase().includes(texto)
  );

  pintarNovedades(productos);
});

cargarNovedades();

// INICIAR MONEDA
async function iniciarMoneda() {
  // Ya no es necesario cargar la tasa de cambio desde el servidor
  tasaCambio = 1;  // Establecer tasa fija a 1

  const inputTasa = document.getElementById("tasaCambioInput");
  if (inputTasa) inputTasa.value = tasaCambio;

  // No necesitas más botones de cambio de moneda
  document.getElementById("btnCOP")?.classList.toggle("active", true);  // Mantener COP siempre activo
  document.getElementById("btnUSD")?.classList.toggle("active", false); // Desactivar USD
}

iniciarMoneda();


/* =========================
   CHECKOUT / PEDIDOS
========================= */

const modalCheckout = document.getElementById("modalCheckout");
const cerrarCheckout = document.getElementById("cerrarCheckout");
const formCheckout = document.getElementById("formCheckout");

const checkoutNombre = document.getElementById("checkoutNombre");
const checkoutWhatsapp = document.getElementById("checkoutWhatsapp");
const checkoutCorreo = document.getElementById("checkoutCorreo");
const checkoutDireccion = document.getElementById("checkoutDireccion");
const checkoutCiudad = document.getElementById("checkoutCiudad");
const checkoutMetodoPago = document.getElementById("checkoutMetodoPago");
const checkoutNotas = document.getElementById("checkoutNotas");
const checkoutComprobante = document.getElementById("checkoutComprobante");
const infoMetodoPago = document.getElementById("infoMetodoPago");

document.addEventListener("click", e => {
  const btnCheckout = e.target.closest(".btn-finalizar-compra");

  if (btnCheckout && modalCheckout) {
    modalCheckout.classList.add("activo");
  }
});

cerrarCheckout?.addEventListener("click", () => {
  modalCheckout?.classList.remove("activo");
});

async function eliminarPedido(id) {
  const confirmar = await Swal.fire({
    title: "¿Eliminar pedido?",
    text: `Esta acción eliminará el pedido #${id}. No se puede deshacer.`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#e0be32",
    cancelButtonColor: "#333"
  });

  if (!confirmar.isConfirmed) return;

  try {
    const res = await fetch(`${API_URL}/pedidos/${id}`, {
      method: "DELETE"
    });

    if (!res.ok) {
      throw new Error("Error al eliminar pedido");
    }

    await cargarPedidosAdmin();

    Swal.fire({
      title: "Pedido eliminado",
      text: "El pedido fue eliminado correctamente.",
      icon: "success",
      confirmButtonColor: "#e0be32"
    });

  } catch (error) {
    console.error(error);

    Swal.fire({
      title: "Error",
      text: "No se pudo eliminar el pedido.",
      icon: "error",
      confirmButtonColor: "#e0be32"
    });
  }
}

/* =========================
   MÉTODO DE PAGO
========================= */

document.querySelectorAll(".metodo-pago-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const metodo = btn.dataset.metodoPago;

    document.querySelectorAll(".metodo-pago-btn").forEach(b => {
      b.classList.remove("activo");
    });

    btn.classList.add("activo");

    if (checkoutMetodoPago) {
      checkoutMetodoPago.value = metodo;
    }

    if (infoMetodoPago) {
      if (metodo === "Nequi") {
        infoMetodoPago.innerHTML = `
          <strong>Pago por Nequi</strong><br>
          Número: 322 334 9682<br>
          Titular: Christian Alejandro Rivera Ortiz<br>
          Luego de pagar, sube el comprobante.
        `;
      }

      if (metodo === "Bancolombia") {
        infoMetodoPago.innerHTML = `
          <strong>Pago por Bancolombia</strong><br>
          Cuenta de ahorros: 59726688871<br>
          Titular: Christian Alejandro Rivera Ortiz<br>
          Luego de pagar, sube el comprobante.
        `;
      }
    }
  });
});

/* =========================
   ENVIAR PEDIDO
========================= */

formCheckout?.addEventListener("submit", async e => {
  e.preventDefault();

  if (carritoProductos.length === 0) {
    alert("Tu carrito está vacío");
    return;
  }

  if (
    !checkoutNombre ||
    !checkoutWhatsapp ||
    !checkoutDireccion ||
    !checkoutCiudad ||
    !checkoutMetodoPago
  ) {
    alert("Faltan campos del formulario de checkout en el HTML.");
    console.error("Faltan elementos del checkout:", {
      checkoutNombre,
      checkoutWhatsapp,
      checkoutDireccion,
      checkoutCiudad,
      checkoutMetodoPago
    });
    return;
  }

  const nombre = checkoutNombre.value.trim();
  const whatsapp = checkoutWhatsapp.value.trim();
  const correo = checkoutCorreo ? checkoutCorreo.value.trim() : "";
  const direccion = checkoutDireccion.value.trim();
  const ciudad = checkoutCiudad.value.trim();
  const metodoPago = checkoutMetodoPago.value;
  const notas = checkoutNotas ? checkoutNotas.value.trim() : "";

  if (!nombre) {
    alert("Escribe tu nombre completo");
    return;
  }

  if (!whatsapp) {
    alert("Escribe tu WhatsApp");
    return;
  }

  if (!direccion) {
    alert("Escribe tu dirección");
    return;
  }

  if (!ciudad) {
    alert("Escribe tu ciudad");
    return;
  }

  if (!metodoPago) {
    alert("Selecciona un método de pago");
    return;
  }

  const totalPedido = carritoProductos.reduce((total, producto) => {
    return total + Number(producto.precio) * Number(producto.cantidad);
  }, 0);

  const formData = new FormData();

  formData.append("nombre", nombre);
  formData.append("whatsapp", whatsapp);
  formData.append("correo", correo);
  formData.append("direccion", direccion);
  formData.append("ciudad", ciudad);
  formData.append("metodo_pago", metodoPago);
  formData.append("notas", notas);
  formData.append("productos", JSON.stringify(carritoProductos));
  formData.append("total", totalPedido);
  formData.append("moneda", "USD");

  const comprobante = checkoutComprobante?.files?.[0];

  if (comprobante) {
    formData.append("comprobante", comprobante);
  }

  try {
    const res = await fetch(`${API_URL}/pedidos`, {
      method: "POST",
      body: formData
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      console.error("ERROR PEDIDO:", errorData);
      throw new Error("Error al crear pedido");
    }

    /* =========================
   MENSAJE WHATSAPP
========================= */

    const productosTexto = carritoProductos.map(producto => {
      return `• ${producto.nombre}
Cantidad: ${producto.cantidad}
Precio: $${producto.precio}`;
    }).join("\n\n");

    const mensaje = `
🛒 NUEVO PEDIDO

👤 Cliente: ${nombre}
📱 WhatsApp: ${whatsapp}
📧 Correo: ${correo || "No proporcionado"}

📍 Dirección: ${direccion}
🏙️ Ciudad: ${ciudad}

💳 Método de pago: ${metodoPago}

🛍️ Productos:
${productosTexto}

💰 Total: $${totalPedido} ${"COP"}

📝 Notas:
${notas || "Sin notas"}
`;

    const numeroNegocio = "573223349682";

    const urlWhatsapp = `https://wa.me/${numeroNegocio}?text=${encodeURIComponent(mensaje)}`;

    window.open(urlWhatsapp, "_blank");

    alert("Pedido enviado correctamente");

    carritoProductos = [];
    guardarCarrito();
    pintarCarritoModal();

    formCheckout.reset();

    document.querySelectorAll(".metodo-pago-btn").forEach(b => {
      b.classList.remove("activo");
    });

    if (infoMetodoPago) {
      infoMetodoPago.innerHTML = "Selecciona un método de pago para ver la información.";
    }

    modalCheckout?.classList.remove("activo");
    document.getElementById("modalCarrito")?.classList.remove("activo");

  } catch (error) {
    console.error(error);
    alert("No se pudo enviar el pedido");
  }
});

/* =========================
   ADMIN: PEDIDOS
========================= */

async function cargarPedidosAdmin() {
  const contenedor = document.getElementById("contenedorPedidos");

  if (!contenedor) return;

  try {
    const res = await fetch(`${API_URL}/pedidos`);
    const pedidos = await res.json();
    const pendientes = pedidos.filter(pedido => pedido.estado === "pendiente").length;

    const contadorPendientes = document.getElementById("contadorPedidosPendientes");

    if (contadorPendientes) {
      contadorPendientes.textContent = pendientes;
    }

    contenedor.innerHTML = `
      <table class="admin-products-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>WhatsApp</th>
            <th>Método</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Comprobante</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          ${pedidos.map(pedido => `
            <tr>
              <td>#${pedido.id}</td>

              <td>
                <div class="admin-product-info">
                  <div>
                    <h4>${pedido.nombre}</h4>
                    <span>${pedido.correo || "Sin correo"}</span>
                  </div>
                </div>
              </td>

              <td>${pedido.whatsapp}</td>

              <td>${pedido.metodo_pago}</td>

              <td>$${Number(pedido.total).toLocaleString()} ${pedido.moneda}</td>

              <td>
                <span 
                  class="estado-pedido ${pedido.estado === "Entregado" ? "entregado" : "clickeable"}"
                  ${pedido.estado === "Entregado" ? "" : `onclick="cambiarEstadoPedido(${pedido.id}, '${pedido.estado || "Activo"}')"`} 
                >
                  ${pedido.estado || "Activo"}
                </span>
              </td>

              <td>
                ${pedido.comprobante ? `
                  <a 
                    href="${API_URL}/${pedido.comprobante}" 
                    target="_blank" 
                    class="link-comprobante"
                  >
                    Ver comprobante
                  </a>
                ` : "Sin comprobante"}
              </td>

              <td>
                <span 
                  class="estado-pedido ${normalizarEstadoPedido(pedido.estado) === "Entregado" ? "entregado" : "clickeable"}"
                  ${normalizarEstadoPedido(pedido.estado) === "Entregado"
        ? ""
        : `onclick="cambiarEstadoPedido(${pedido.id}, '${normalizarEstadoPedido(pedido.estado)}')"`} 
                >
                  ${normalizarEstadoPedido(pedido.estado)}
                </span>
              </td>
              <td>
                <div class="admin-actions">
                  <button onclick="verificarPedido(${pedido.id}, '${pedido.whatsapp}', '${pedido.nombre}')">
                    <i class="bi bi-check-lg"></i>
                  </button>

                  <button onclick='verDetallePedido(${JSON.stringify(pedido.productos)})'>
                    <i class="bi bi-eye"></i>
                  </button>

                  <button 
                    class="btn-eliminar-admin"
                    onclick="eliminarPedido(${pedido.id})">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  } catch (error) {
    console.error(error);
  }
}

function normalizarEstadoPedido(estado) {
  if (!estado || estado === "pendiente") return "Activo";
  if (estado === "verificado") return "Revisado";
  return estado;
}

function obtenerSiguienteEstado(estadoActual) {
  const estados = ["Activo", "Revisado", "En camino", "Entregado"];

  const estadoNormalizado = normalizarEstadoPedido(estadoActual);
  const indexActual = estados.indexOf(estadoNormalizado);

  if (indexActual === -1) return "Activo";
  if (indexActual >= estados.length - 1) return null;

  return estados[indexActual + 1];
}

async function cambiarEstadoPedido(id, estadoActual) {
  const estadoNormalizado = normalizarEstadoPedido(estadoActual);
  const siguienteEstado = obtenerSiguienteEstado(estadoNormalizado);

  if (!siguienteEstado) return;

  const confirmar = await Swal.fire({
    title: "¿Cambiar estado?",
    text: `El pedido pasará de "${estadoNormalizado}" a "${siguienteEstado}".`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí, cambiar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#e0be32",
    cancelButtonColor: "#333"
  });

  if (!confirmar.isConfirmed) return;

  try {
    const res = await fetch(`${API_URL}/pedidos/${id}/estado`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        estado: siguienteEstado
      })
    });

    if (!res.ok) {
      throw new Error("Error al actualizar estado");
    }

    await cargarPedidosAdmin();

    Swal.fire({
      title: "Estado actualizado",
      text: `El pedido ahora está en "${siguienteEstado}".`,
      icon: "success",
      confirmButtonColor: "#e0be32"
    });

  } catch (error) {
    console.error(error);

    Swal.fire({
      title: "Error",
      text: "No se pudo actualizar el estado del pedido.",
      icon: "error",
      confirmButtonColor: "#e0be32"
    });
  }
}

function verDetallePedido(productosJSON) {
  const productos = typeof productosJSON === "string"
    ? JSON.parse(productosJSON)
    : productosJSON;

  const detalle = productos.map(producto => {
    return `${producto.nombre} | Cantidad: ${producto.cantidad} | Talla: ${producto.talla || "N/A"} | Color: ${producto.color || "N/A"}`;
  }).join("\n");

  alert(detalle);
}

cargarPedidosAdmin();

document.addEventListener("click", e => {
  const btn = e.target.closest("#btnMenuMobile");

  if (!btn) return;

  const navbar = document.getElementById("navbarMobile");

  if (navbar) {
    navbar.classList.toggle("activo");
  }
});

/*METODO DE PAGO */

document.querySelectorAll("[data-metodo-pago]").forEach(btn => {
  btn.addEventListener("click", () => {
    const metodo = btn.dataset.metodoPago;
    const inputMetodo = document.getElementById("checkoutMetodoPago");
    const info = document.getElementById("infoMetodoPago");

    document.querySelectorAll("[data-metodo-pago]").forEach(b => {
      b.classList.remove("activo");
    });

    btn.classList.add("activo");
    inputMetodo.value = metodo;

    if (metodo === "Nequi") {
      info.innerHTML = `
        <strong>Pago por Nequi</strong><br>
        Número: 322 334 9682<br>
        Titular: Christian Alejandro Rivera Ortiz<br>
        Después de pagar, sube el comprobante.
      `;
    }

    if (metodo === "Bancolombia") {
      info.innerHTML = `
        <strong>Pago por Bancolombia</strong><br>
        Cuenta de ahorros: 59726688871<br>
        Titular: Christian Alejandro Rivera Ortiz<br>
        Después de pagar, sube el comprobante.
      `;
    }

    if (metodo === "Contra entrega") {
      info.innerHTML = `
        <strong>Pago contra entrega</strong><br>
        Pagas al recibir tu pedido.<br>
        No necesitas subir comprobante.
      `;
    }
  });
});

function sincronizarImagenesDesdePreview() {
  imagenesActualesPreview = imagenesPreviewProducto
    .filter(imagen => imagen.tipo === "actual")
    .map(imagen => imagen.valor);

  imagenesSeleccionadas = imagenesPreviewProducto
    .filter(imagen => imagen.tipo === "nueva")
    .map(imagen => imagen.valor);

  imagenActualProducto = imagenesPreviewProducto[0]
    ? imagenesPreviewProducto[0].valor
    : "";

  imagenesActualesProducto = JSON.stringify(imagenesActualesPreview);
}

function eliminarImagenPreviewProducto(index) {
  imagenesPreviewProducto.splice(index, 1);

  sincronizarImagenesDesdePreview();
  mostrarPreviewImagenes();
}

/* Cambiar De Tema*/



/*MODALES DE RUTINAS */
/* =========================
   ADMIN: MODALES RUTINAS
========================= */

/* =========================
   ADMIN + INDEX: RUTINAS
========================= */

let grupoMuscularEditandoId = null;
let ejercicioRutinaEditandoId = null;

let gruposMuscularesData = [];
let ejerciciosRutinaData = [];

/* =========================
   ELEMENTOS ADMIN RUTINAS
========================= */

const abrirModalGrupoMuscular = document.getElementById("abrirModalGrupoMuscular");
const modalGrupoMuscular = document.getElementById("modalGrupoMuscular");
const cerrarModalGrupoMuscular = document.getElementById("cerrarModalGrupoMuscular");
const cancelarGrupoMuscular = document.getElementById("cancelarGrupoMuscular");

const formGrupoMuscular = document.getElementById("formGrupoMuscular");
const nombreGrupoMuscular = document.getElementById("nombreGrupoMuscular");
const descripcionGrupoMuscular = document.getElementById("descripcionGrupoMuscular");
const ordenGrupoMuscular = document.getElementById("ordenGrupoMuscular");
const tablaGruposMusculares = document.getElementById("tablaGruposMusculares");

const abrirModalEjercicioRutina = document.getElementById("abrirModalEjercicioRutina");
const modalEjercicioRutina = document.getElementById("modalEjercicioRutina");
const cerrarModalEjercicioRutina = document.getElementById("cerrarModalEjercicioRutina");
const cancelarEjercicioRutina = document.getElementById("cancelarEjercicioRutina");

const formEjercicioRutina = document.getElementById("formEjercicioRutina");
const grupoEjercicioRutina = document.getElementById("grupoEjercicioRutina");
const nombreEjercicioRutina = document.getElementById("nombreEjercicioRutina");
const repeticionesEjercicioRutina = document.getElementById("repeticionesEjercicioRutina");
const descripcionEjercicioRutina = document.getElementById("descripcionEjercicioRutina");
const imagenEjercicioRutina = document.getElementById("imagenEjercicioRutina");
const ordenEjercicioRutina = document.getElementById("ordenEjercicioRutina");
const tablaEjerciciosRutina = document.getElementById("tablaEjerciciosRutina");

function obtenerUrlImagenRutina(ruta) {
  if (!ruta) return "img/no-image.png";

  if (ruta.startsWith("http://") || ruta.startsWith("https://")) {
    return ruta;
  }

  return `${API_URL}/${ruta.replace(/^\/+/, "")}`;
}

/* =========================
   MODALES RUTINAS
========================= */

abrirModalGrupoMuscular?.addEventListener("click", () => {
  grupoMuscularEditandoId = null;
  formGrupoMuscular?.reset();
  modalGrupoMuscular?.classList.add("activo");
});

cerrarModalGrupoMuscular?.addEventListener("click", cerrarModalGrupoRutina);
cancelarGrupoMuscular?.addEventListener("click", cerrarModalGrupoRutina);

function cerrarModalGrupoRutina() {
  modalGrupoMuscular?.classList.remove("activo");
  formGrupoMuscular?.reset();
  grupoMuscularEditandoId = null;
}

abrirModalEjercicioRutina?.addEventListener("click", async () => {
  ejercicioRutinaEditandoId = null;
  formEjercicioRutina?.reset();

  if (imagenEjercicioRutina) {
    imagenEjercicioRutina.required = true;
  }

  await cargarGruposMuscularesSelectRutina();

  modalEjercicioRutina?.classList.add("activo");
});

cerrarModalEjercicioRutina?.addEventListener("click", cerrarModalEjercicioAdmin);
cancelarEjercicioRutina?.addEventListener("click", cerrarModalEjercicioAdmin);

function cerrarModalEjercicioAdmin() {
  modalEjercicioRutina?.classList.remove("activo");
  formEjercicioRutina?.reset();
  ejercicioRutinaEditandoId = null;

  if (imagenEjercicioRutina) {
    imagenEjercicioRutina.required = true;
  }
}

/* =========================
   ADMIN: GUARDAR MÚSCULO
========================= */

formGrupoMuscular?.addEventListener("submit", async e => {
  e.preventDefault();

  const nombre = nombreGrupoMuscular.value.trim();
  const descripcion = descripcionGrupoMuscular.value.trim();
  const orden = Number(ordenGrupoMuscular?.value || 0);

  if (!nombre) {
    alert("Escribe el nombre del músculo");
    return;
  }

  const url = grupoMuscularEditandoId
    ? `${API_URL}/grupos-musculares/${grupoMuscularEditandoId}`
    : `${API_URL}/grupos-musculares`;

  const method = grupoMuscularEditandoId ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nombre,
        descripcion,
        orden
      })
    });

    if (!res.ok) {
      throw new Error("Error al guardar músculo");
    }

    cerrarModalGrupoRutina();

    await cargarGruposMuscularesAdmin();
    await cargarGruposMuscularesSelectRutina();
    await cargarRutinasIndex();

    alert("Músculo guardado correctamente");

  } catch (error) {
    console.error(error);
    alert("No se pudo guardar el músculo");
  }
});

/* =========================
   ADMIN: CARGAR MÚSCULOS
========================= */

async function cargarGruposMuscularesAdmin() {
  if (!tablaGruposMusculares) return;

  try {
    const resGrupos = await fetch(`${API_URL}/grupos-musculares`);
    const grupos = await resGrupos.json();

    const resEjercicios = await fetch(`${API_URL}/ejercicios`);
    const ejercicios = await resEjercicios.json();

    gruposMuscularesData = grupos;
    ejerciciosRutinaData = ejercicios;

    if (grupos.length === 0) {
      tablaGruposMusculares.innerHTML = `
        <tr>
          <td colspan="7">No hay músculos creados todavía.</td>
        </tr>
      `;
      return;
    }

    tablaGruposMusculares.innerHTML = grupos.map(grupo => {
      const totalEjercicios = ejercicios.filter(ejercicio => {
        return Number(ejercicio.grupo_id) === Number(grupo.id);
      }).length;

      return `
        <tr>
          <td>#${grupo.id}</td>

          <td>
            <strong>${grupo.nombre}</strong>
          </td>

          <td>${grupo.descripcion || "Sin descripción"}</td>

          <td>${grupo.orden || 0}</td>

          <td>${totalEjercicios}</td>

          <td>
            <span class="estado-producto ${grupo.estado === "activo" ? "activo" : "agotado"}">
              ${grupo.estado || "activo"}
            </span>
          </td>

          <td>
            <div class="admin-actions">
              <button type="button" onclick="editarGrupoMuscularRutina(${grupo.id})">
                <i class="bi bi-pencil"></i>
              </button>

              <button type="button" class="delete" onclick="eliminarGrupoMuscularRutina(${grupo.id})">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");

  } catch (error) {
    console.error(error);
  }
}

async function cargarGruposMuscularesSelectRutina() {
  if (!grupoEjercicioRutina) return;

  try {
    const res = await fetch(`${API_URL}/grupos-musculares`);
    const grupos = await res.json();

    gruposMuscularesData = grupos;

    grupoEjercicioRutina.innerHTML = `
      <option value="">Selecciona un músculo</option>
      ${grupos.map(grupo => `
        <option value="${grupo.id}">
          ${grupo.nombre}
        </option>
      `).join("")}
    `;

  } catch (error) {
    console.error(error);
  }
}

function editarGrupoMuscularRutina(id) {
  const grupo = gruposMuscularesData.find(item => Number(item.id) === Number(id));

  if (!grupo) return;

  grupoMuscularEditandoId = id;

  nombreGrupoMuscular.value = grupo.nombre || "";
  descripcionGrupoMuscular.value = grupo.descripcion || "";
  ordenGrupoMuscular.value = grupo.orden || 0;

  modalGrupoMuscular?.classList.add("activo");
}

async function eliminarGrupoMuscularRutina(id) {
  const confirmar = confirm("¿Seguro que quieres eliminar este músculo? También se eliminarán sus ejercicios.");

  if (!confirmar) return;

  try {
    const res = await fetch(`${API_URL}/grupos-musculares/${id}`, {
      method: "DELETE"
    });

    if (!res.ok) {
      throw new Error("Error al eliminar músculo");
    }

    await cargarGruposMuscularesAdmin();
    await cargarEjerciciosRutinaAdmin();
    await cargarGruposMuscularesSelectRutina();
    await cargarRutinasIndex();

    alert("Músculo eliminado correctamente");

  } catch (error) {
    console.error(error);
    alert("No se pudo eliminar el músculo");
  }
}

/* =========================
   ADMIN: GUARDAR EJERCICIO
========================= */

formEjercicioRutina?.addEventListener("submit", async e => {
  e.preventDefault();

  const grupoId = grupoEjercicioRutina.value;
  const nombre = nombreEjercicioRutina.value.trim();
  const repeticiones = repeticionesEjercicioRutina.value.trim();
  const descripcion = descripcionEjercicioRutina.value.trim();
  const orden = Number(ordenEjercicioRutina.value || 0);
  const archivo = imagenEjercicioRutina.files[0];

  if (!grupoId) {
    alert("Selecciona un músculo");
    return;
  }

  if (!nombre) {
    alert("Escribe el nombre del ejercicio");
    return;
  }

  if (!repeticiones) {
    alert("Escribe las series o repeticiones");
    return;
  }

  if (!descripcion) {
    alert("Escribe la explicación del ejercicio");
    return;
  }

  if (!archivo && !ejercicioRutinaEditandoId) {
    alert("Selecciona una imagen para el ejercicio");
    return;
  }

  const formData = new FormData();

  formData.append("grupo_id", grupoId);
  formData.append("nombre", nombre);
  formData.append("repeticiones", repeticiones);
  formData.append("descripcion", descripcion);
  formData.append("orden", orden);

  if (archivo) {
    formData.append("imagen", archivo);
  }

  const url = ejercicioRutinaEditandoId
    ? `${API_URL}/ejercicios/${ejercicioRutinaEditandoId}`
    : `${API_URL}/ejercicios`;

  const method = ejercicioRutinaEditandoId ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method,
      body: formData
    });

    if (!res.ok) {
      throw new Error("Error al guardar ejercicio");
    }

    cerrarModalEjercicioAdmin();

    await cargarEjerciciosRutinaAdmin();
    await cargarGruposMuscularesAdmin();
    await cargarRutinasIndex();

    alert("Ejercicio guardado correctamente");

  } catch (error) {
    console.error(error);
    alert("No se pudo guardar el ejercicio");
  }
});

/* =========================
   ADMIN: CARGAR EJERCICIOS
========================= */

async function cargarEjerciciosRutinaAdmin() {
  if (!tablaEjerciciosRutina) return;

  try {
    const resEjercicios = await fetch(`${API_URL}/ejercicios`);
    const ejercicios = await resEjercicios.json();

    const resGrupos = await fetch(`${API_URL}/grupos-musculares`);
    const grupos = await resGrupos.json();

    ejerciciosRutinaData = ejercicios;
    gruposMuscularesData = grupos;

    if (ejercicios.length === 0) {
      tablaEjerciciosRutina.innerHTML = `
        <tr>
          <td colspan="7">No hay ejercicios creados todavía.</td>
        </tr>
      `;
      return;
    }

    tablaEjerciciosRutina.innerHTML = ejercicios.map(ejercicio => {
      const grupo = grupos.find(item => Number(item.id) === Number(ejercicio.grupo_id));

      return `
        <tr>
          <td>
            <img 
              src="${obtenerUrlImagenRutina(ejercicio.imagen)}" 
              alt="${ejercicio.nombre}"
              style="width: 70px; height: 70px; object-fit: cover; border-radius: 12px;"
            >
          </td>

          <td>
            <strong>${ejercicio.nombre}</strong>
          </td>

          <td>${grupo ? grupo.nombre : "Sin músculo"}</td>

          <td>${ejercicio.repeticiones || "N/A"}</td>

          <td>${ejercicio.descripcion || "Sin explicación"}</td>

          <td>${ejercicio.orden || 0}</td>

          <td>
            <div class="admin-actions">
              <button type="button" onclick="editarEjercicioRutinaAdmin(${ejercicio.id})">
                <i class="bi bi-pencil"></i>
              </button>

              <button type="button" class="delete" onclick="eliminarEjercicioRutinaAdmin(${ejercicio.id})">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");

  } catch (error) {
    console.error(error);
  }
}

async function editarEjercicioRutinaAdmin(id) {
  const ejercicio = ejerciciosRutinaData.find(item => Number(item.id) === Number(id));

  if (!ejercicio) return;

  ejercicioRutinaEditandoId = id;

  await cargarGruposMuscularesSelectRutina();

  grupoEjercicioRutina.value = ejercicio.grupo_id || "";
  nombreEjercicioRutina.value = ejercicio.nombre || "";
  repeticionesEjercicioRutina.value = ejercicio.repeticiones || "";
  descripcionEjercicioRutina.value = ejercicio.descripcion || "";
  ordenEjercicioRutina.value = ejercicio.orden || 0;

  if (imagenEjercicioRutina) {
    imagenEjercicioRutina.required = false;
  }

  modalEjercicioRutina?.classList.add("activo");
}

async function eliminarEjercicioRutinaAdmin(id) {
  const confirmar = confirm("¿Seguro que quieres eliminar este ejercicio?");

  if (!confirmar) return;

  try {
    const res = await fetch(`${API_URL}/ejercicios/${id}`, {
      method: "DELETE"
    });

    if (!res.ok) {
      throw new Error("Error al eliminar ejercicio");
    }

    await cargarEjerciciosRutinaAdmin();
    await cargarGruposMuscularesAdmin();
    await cargarRutinasIndex();

    alert("Ejercicio eliminado correctamente");

  } catch (error) {
    console.error(error);
    alert("No se pudo eliminar el ejercicio");
  }
}

/* =========================
   INDEX: RUTINAS
========================= */

async function cargarRutinasIndex() {
  const contenedorGrupos = document.getElementById("gruposMuscularesIndex");
  const contenedorImagen = document.getElementById("rutinaImagenPrincipal");
  const contenedorEjercicios = document.getElementById("listaEjerciciosIndex");

  if (!contenedorGrupos || !contenedorImagen || !contenedorEjercicios) return;

  try {
    const res = await fetch(`${API_URL}/grupos-musculares`);
    const grupos = await res.json();

    const gruposActivos = grupos.filter(grupo => {
      return !grupo.estado || grupo.estado === "activo";
    });

    if (gruposActivos.length === 0) {
      contenedorGrupos.innerHTML = "";
      contenedorImagen.innerHTML = "<p>No hay rutinas disponibles.</p>";
      contenedorEjercicios.innerHTML = "";
      return;
    }

    contenedorGrupos.innerHTML = gruposActivos.map((grupo, index) => `
      <button 
        type="button"
        class="${index === 0 ? "activo" : ""}"
        data-grupo-id="${grupo.id}"
      >
        ${grupo.nombre}
      </button>
    `).join("");

    contenedorGrupos.querySelectorAll("button").forEach(btn => {
      btn.addEventListener("click", () => {
        contenedorGrupos.querySelectorAll("button").forEach(b => {
          b.classList.remove("activo");
        });

        btn.classList.add("activo");

        const grupo = gruposActivos.find(item => {
          return Number(item.id) === Number(btn.dataset.grupoId);
        });

        if (grupo) {
          cargarEjerciciosPorGrupoIndex(grupo);
        }
      });
    });

    await cargarEjerciciosPorGrupoIndex(gruposActivos[0]);

  } catch (error) {
    console.error(error);
  }
}

async function cargarEjerciciosPorGrupoIndex(grupo) {
  const contenedorImagen = document.getElementById("rutinaImagenPrincipal");
  const contenedorEjercicios = document.getElementById("listaEjerciciosIndex");

  if (!contenedorImagen || !contenedorEjercicios) return;

  try {
    const res = await fetch(`${API_URL}/ejercicios/grupo/${grupo.id}`);
    let ejercicios = await res.json();

    ejercicios = ejercicios
      .filter(ejercicio => !ejercicio.estado || ejercicio.estado === "activo")
      .sort((a, b) => Number(a.orden || 0) - Number(b.orden || 0));

    if (ejercicios.length === 0) {
      contenedorImagen.innerHTML = `
        <div class="rutina-imagen-info">
          <span>${grupo.nombre}</span>
          <h3>Sin ejercicios</h3>
        </div>
      `;

      contenedorEjercicios.innerHTML = `
        <p>No hay ejercicios disponibles para este músculo.</p>
      `;

      return;
    }

    pintarImagenEjercicioPrincipal(ejercicios[0], grupo.nombre);

    contenedorEjercicios.innerHTML = ejercicios.map((ejercicio, index) => `
      <div class="ejercicio-rutina-item ${index === 0 ? "activo" : ""}" data-index="${index}">
        <div class="ejercicio-rutina-numero">
          ${String(index + 1).padStart(2, "0")}
        </div>

        <div class="ejercicio-rutina-info">
          <h4>
            ${ejercicio.nombre}
            <span class="ejercicio-rutina-reps">${ejercicio.repeticiones || ""}</span>
          </h4>

          <p>${ejercicio.descripcion || ""}</p>
        </div>
      </div>
    `).join("");

    contenedorEjercicios.querySelectorAll(".ejercicio-rutina-item").forEach(item => {
      item.addEventListener("click", () => {
        contenedorEjercicios.querySelectorAll(".ejercicio-rutina-item").forEach(i => {
          i.classList.remove("activo");
        });

        item.classList.add("activo");

        const ejercicio = ejercicios[Number(item.dataset.index)];

        pintarImagenEjercicioPrincipal(ejercicio, grupo.nombre);
      });
    });

  } catch (error) {
    console.error(error);
  }
}

function pintarImagenEjercicioPrincipal(ejercicio, nombreGrupo) {
  const contenedorImagen = document.getElementById("rutinaImagenPrincipal");

  if (!contenedorImagen) return;

  const imagenUrl = obtenerUrlImagenRutina(ejercicio.imagen);

  contenedorImagen.innerHTML = `
    <img 
      src="${imagenUrl}" 
      alt="${ejercicio.nombre}"
      data-imagen-completa="${imagenUrl}"
    >

    <div class="rutina-imagen-info">
      <span>${nombreGrupo}</span>
      <h3>${ejercicio.nombre}</h3>
    </div>
  `;

  contenedorImagen.onclick = () => {
    if (!modalImagenRutina || !imagenRutinaCompleta) return;

    imagenRutinaCompleta.src = imagenUrl;
    modalImagenRutina.classList.add("activo");
  };
}

/* =========================
   INICIAR RUTINAS
========================= */

cargarGruposMuscularesAdmin();
cargarEjerciciosRutinaAdmin();
cargarGruposMuscularesSelectRutina();
cargarRutinasIndex();
/*__________________ */

/* =========================
   ADMIN: CLIENTES Y ASISTENCIA
========================= */

const abrirModalCliente = document.getElementById("abrirModalCliente");
const modalCliente = document.getElementById("modalCliente");
const cerrarModalCliente = document.getElementById("cerrarModalCliente");
const cancelarCliente = document.getElementById("cancelarCliente");

const formCliente = document.getElementById("formCliente");
const nombreCliente = document.getElementById("nombreCliente");
const cedulaCliente = document.getElementById("cedulaCliente");
const whatsappCliente = document.getElementById("whatsappCliente");
const planCliente = document.getElementById("planCliente");
const tablaClientes = document.getElementById("tablaClientes");

const abrirModalAsistencia = document.getElementById("abrirModalAsistencia");
const modalAsistencia = document.getElementById("modalAsistencia");
const tablaAsistencias = document.getElementById("tablaAsistencias");
const cerrarModalAsistencia = document.getElementById("cerrarModalAsistencia");
const cedulaAsistencia = document.getElementById("cedulaAsistencia");
const buscarClienteAsistencia = document.getElementById("buscarClienteAsistencia");
const resultadoAsistencia = document.getElementById("resultadoAsistencia");
const registrarAsistencia = document.getElementById("registrarAsistencia");

let clienteAsistenciaActual = null;

function nombrePlanCliente(plan) {
  if (plan === "diario") return "Plan diario";
  if (plan === "semanal") return "Plan semanal";
  if (plan === "mensual") return "Plan mensual";
  return plan || "Sin plan";
}

function cerrarModalClienteAdmin() {
  modalCliente?.classList.remove("activo");
  formCliente?.reset();
}

function cerrarModalAsistenciaAdmin() {
  modalAsistencia?.classList.remove("activo");

  if (cedulaAsistencia) cedulaAsistencia.value = "";
  if (resultadoAsistencia) resultadoAsistencia.innerHTML = "";
  if (registrarAsistencia) registrarAsistencia.disabled = true;

  clienteAsistenciaActual = null;
}

abrirModalCliente?.addEventListener("click", () => {
  formCliente?.reset();
  modalCliente?.classList.add("activo");
});

cerrarModalCliente?.addEventListener("click", cerrarModalClienteAdmin);
cancelarCliente?.addEventListener("click", cerrarModalClienteAdmin);

abrirModalAsistencia?.addEventListener("click", () => {
  cerrarModalAsistenciaAdmin();
  modalAsistencia?.classList.add("activo");
});

cerrarModalAsistencia?.addEventListener("click", cerrarModalAsistenciaAdmin);

/* REGISTRAR CLIENTE */
formCliente?.addEventListener("submit", async e => {
  e.preventDefault();

  const datos = {
    nombre: nombreCliente.value.trim(),
    cedula: cedulaCliente.value.trim(),
    whatsapp: whatsappCliente.value.trim(),
    plan: planCliente.value
  };

  if (!datos.nombre || !datos.cedula || !datos.whatsapp || !datos.plan) {
    alert("Completa todos los campos");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/clientes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(datos)
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "No se pudo registrar el cliente");
      return;
    }

    cerrarModalClienteAdmin();
    await cargarClientesAdmin();

    alert("Cliente registrado correctamente");

  } catch (error) {
    console.error(error);
    alert("Error al registrar cliente");
  }
});

/* CARGAR CLIENTES */
async function cargarClientesAdmin() {
  if (!tablaClientes) return;

  try {
    const res = await fetch(`${API_URL}/clientes`);
    const clientes = await res.json();

    if (!res.ok || !Array.isArray(clientes)) {
      tablaClientes.innerHTML = `
        <tr>
          <td colspan="7">No se pudieron cargar los clientes.</td>
        </tr>
      `;
      return;
    }

    if (clientes.length === 0) {
      tablaClientes.innerHTML = `
        <tr>
          <td colspan="7">No hay clientes registrados todavía.</td>
        </tr>
      `;
      return;
    }

    tablaClientes.innerHTML = clientes.map(cliente => {
      const estadoPlan = obtenerTextoEstadoPlan(cliente);

      return `
    <tr>
      <td>#${cliente.id}</td>
      <td><strong>${cliente.nombre}</strong></td>
      <td>${cliente.cedula}</td>
      <td>${cliente.whatsapp}</td>
      <td>${nombrePlanCliente(cliente.plan)}</td>
      <td>${formatearFechaCliente(cliente.fecha_inicio)}</td>
      <td>${formatearFechaCliente(cliente.fecha_fin)}</td>
      <td>${cliente.dias_restantes}</td>
      <td>
        <span class="badge-plan ${estadoPlan.clase}">
          ${estadoPlan.texto}
        </span>
      </td>
      <td>
        <span class="estado-producto ${cliente.estado === "activo" ? "activo" : "agotado"}">
          ${cliente.estado}
        </span>
      </td>
    </tr>
  `;
    }).join("");

  } catch (error) {
    console.error(error);
  }
}

function formatearFechaCliente(fecha) {
  if (!fecha) return "Sin fecha";

  return new Date(fecha).toLocaleDateString("es-CO");
}

function obtenerTextoEstadoPlan(cliente) {
  const dias = Number(cliente.dias_restantes);

  if (cliente.estado_plan === "vencido" || dias < 0) {
    return {
      clase: "plan-vencido",
      texto: "Tu plan ha expirado. Renueva para que puedas seguir entrenando."
    };
  }

  if (cliente.estado_plan === "por_vencer" || dias <= 3) {
    return {
      clase: "plan-por-vencer",
      texto: `Tu plan está por vencer. Te quedan ${dias} día(s). Renueva pronto.`
    };
  }

  return {
    clase: "plan-activo",
    texto: `Plan activo. Te quedan ${dias} día(s).`
  };
}

/* BUSCAR CLIENTE PARA ASISTENCIA */
buscarClienteAsistencia?.addEventListener("click", async () => {
  const cedula = cedulaAsistencia.value.trim();

  if (!cedula) {
    alert("Escribe una cédula");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/clientes/cedula/${cedula}`);
    const data = await res.json();

    if (!res.ok) {
      clienteAsistenciaActual = null;
      registrarAsistencia.disabled = true;

      resultadoAsistencia.innerHTML = `
        <div class="asistencia-no-encontrado">
          Cliente no encontrado.
        </div>
      `;
      return;
    }

    clienteAsistenciaActual = data;
    registrarAsistencia.disabled = false;

    const estadoPlan = obtenerTextoEstadoPlan(data);

    resultadoAsistencia.innerHTML = `
      <div class="asistencia-card">
        <h3>${data.nombre}</h3>
        <p><strong>Cédula:</strong> ${data.cedula}</p>
        <p><strong>WhatsApp:</strong> ${data.whatsapp}</p>
        <p><strong>Plan:</strong> ${nombrePlanCliente(data.plan)}</p>
        <p><strong>Inicio:</strong> ${formatearFechaCliente(data.fecha_inicio)}</p>
        <p><strong>Vence:</strong> ${formatearFechaCliente(data.fecha_fin)}</p>
        <p><strong>Días restantes:</strong> ${data.dias_restantes}</p>

        <div class="alerta-plan ${estadoPlan.clase}">
          ${estadoPlan.texto}
        </div>
      </div>
    `;

  } catch (error) {
    console.error(error);
    alert("Error al buscar cliente");
  }
});

/* REGISTRAR ASISTENCIA */
registrarAsistencia?.addEventListener("click", async () => {
  if (!clienteAsistenciaActual) {
    alert("Primero busca un cliente");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/asistencias`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        cedula: clienteAsistenciaActual.cedula
      })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "No se pudo registrar la asistencia");
      return;
    }

    alert("Asistencia registrada correctamente");
    await cargarAsistenciasAdmin();
    cerrarModalAsistenciaAdmin();

  } catch (error) {
    console.error(error);
    alert("Error al registrar asistencia");
  }
});


async function cargarAsistenciasAdmin() {
  if (!tablaAsistencias) return;

  try {
    const res = await fetch(`${API_URL}/asistencias`);
    const asistencias = await res.json();

    if (!res.ok || !Array.isArray(asistencias)) {
      tablaAsistencias.innerHTML = `
        <tr>
          <td colspan="10">No se pudieron cargar las asistencias.</td>
        </tr>
      `;
      return;
    }

    if (asistencias.length === 0) {
      tablaAsistencias.innerHTML = `
        <tr>
          <td colspan="8">No hay asistencias registradas todavía.</td>
        </tr>
      `;
      return;
    }

    tablaAsistencias.innerHTML = asistencias.map(asistencia => `
      <tr>
        <td>#${asistencia.id}</td>
        <td>${new Date(asistencia.fecha).toLocaleString("es-CO")}</td>
        <td><strong>${asistencia.nombre}</strong></td>
        <td>${asistencia.cedula}</td>
        <td>${asistencia.whatsapp}</td>
        <td>${nombrePlanCliente(asistencia.plan)}</td>
        <td>
          <span class="estado-producto ${asistencia.estado === "activo" ? "activo" : "agotado"}">
            ${asistencia.estado}
          </span>
        </td>

        <td>
          <div class="admin-actions">
            <button 
              type="button" 
              class="delete btn-eliminar-asistencia"
              data-asistencia-id="${asistencia.id}"
            >
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join("");

  } catch (error) {
    console.error(error);
  }
}

tablaAsistencias?.addEventListener("click", async e => {
  const boton = e.target.closest(".btn-eliminar-asistencia");

  if (!boton) return;

  const id = boton.dataset.asistenciaId;

  const confirmar = confirm("¿Seguro que quieres eliminar esta asistencia?");

  if (!confirmar) return;

  try {
    const res = await fetch(`${API_URL}/asistencias/${id}`, {
      method: "DELETE"
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "No se pudo eliminar la asistencia");
      return;
    }

    await cargarAsistenciasAdmin();

    alert("Asistencia eliminada correctamente");

  } catch (error) {
    console.error(error);
    alert("Error al eliminar asistencia");
  }
});

cargarAsistenciasAdmin();
cargarClientesAdmin();
/*_________________*/

/* =========================
   ADMIN: DASHBOARD MÉTRICAS
========================= */

const metricVentasTotales = document.getElementById("metricVentasTotales");
const metricVentasInfo = document.getElementById("metricVentasInfo");
const metricPedidos = document.getElementById("metricPedidos");
const metricClientes = document.getElementById("metricClientes");
const metricProductos = document.getElementById("metricProductos");

function formatearCOPDashboard(valor) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
  }).format(Number(valor || 0));
}

async function cargarDashboardMetricas() {
  if (
    !metricVentasTotales &&
    !metricPedidos &&
    !metricClientes &&
    !metricProductos
  ) {
    return;
  }

  try {
    const res = await fetch(`${API_URL}/dashboard-metricas`);
    const data = await res.json();

    if (!res.ok) {
      console.error("Error dashboard:", data);
      return;
    }

    if (metricVentasTotales) {
      metricVentasTotales.textContent = formatearCOPDashboard(data.ventas_totales);
    }

    if (metricPedidos) {
      metricPedidos.textContent = data.pedidos;
    }

    if (metricClientes) {
      metricClientes.textContent = data.clientes;
    }

    if (metricProductos) {
      metricProductos.textContent = data.productos;
    }

    if (metricVentasInfo) {
      metricVentasInfo.textContent = data.columna_total_usada
        ? `Calculado desde pedidos.${data.columna_total_usada}`
        : "No hay columna de total en pedidos";
    }

  } catch (error) {
    console.error("Error al cargar métricas:", error);
  }
}

cargarDashboardMetricas();

/*------------------------------------------------------------------*/

/* =========================
   ADMIN: DASHBOARD GRÁFICAS
========================= */

const graficoBarrasDashboard = document.getElementById("graficoBarrasDashboard");
const graficoPastelDashboard = document.getElementById("graficoPastelDashboard");
const botonesPeriodoDashboard = document.querySelectorAll("[data-periodo-dashboard]");

let instanciaGraficoBarrasDashboard = null;
let instanciaGraficoPastelDashboard = null;

function nombrePlanGrafica(plan) {
  if (plan === "diario") return "Plan diario";
  if (plan === "semanal") return "Plan semanal";
  if (plan === "mensual") return "Plan mensual";
  return plan || "Sin plan";
}

async function cargarGraficasDashboard(periodo = "dia") {
  if (!graficoBarrasDashboard || !graficoPastelDashboard) return;

  if (typeof Chart === "undefined") {
    console.error("Chart.js no está cargado.");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/dashboard-graficas?periodo=${periodo}`);
    const data = await res.json();

    if (!res.ok) {
      console.error("Error dashboard gráficas:", data);
      return;
    }

    if (instanciaGraficoBarrasDashboard) {
      instanciaGraficoBarrasDashboard.destroy();
    }

    if (instanciaGraficoPastelDashboard) {
      instanciaGraficoPastelDashboard.destroy();
    }

    instanciaGraficoBarrasDashboard = new Chart(graficoBarrasDashboard, {
      type: "bar",
      data: {
        labels: data.barras.labels,
        datasets: [
          {
            label: "Asistencias",
            data: data.barras.valores,
            backgroundColor: "rgba(255, 90, 0, 0.75)",
            borderColor: "rgba(255, 90, 0, 1)",
            borderWidth: 1,
            borderRadius: 10
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        }
      }
    });

    instanciaGraficoPastelDashboard = new Chart(graficoPastelDashboard, {
      type: "doughnut",
      data: {
        labels: data.pastel.labels.map(nombrePlanGrafica),
        datasets: [
          {
            data: data.pastel.valores,
            backgroundColor: [
              "rgba(255, 90, 0, 0.85)",
              "rgba(34, 197, 94, 0.85)",
              "rgba(59, 130, 246, 0.85)",
              "rgba(168, 85, 247, 0.85)"
            ],
            borderWidth: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "62%",
        plugins: {
          legend: {
            position: "bottom"
          }
        }
      }
    });

  } catch (error) {
    console.error("Error al cargar gráficas dashboard:", error);
  }
}

botonesPeriodoDashboard.forEach(boton => {
  boton.addEventListener("click", () => {
    botonesPeriodoDashboard.forEach(btn => btn.classList.remove("active"));
    boton.classList.add("active");

    cargarGraficasDashboard(boton.dataset.periodoDashboard);
  });
});

cargarGraficasDashboard("dia");

/*__________________________________________________________________________*/

/* =========================
   COMENTARIOS CLIENTES
========================= */

const formComentarioCliente = document.getElementById("formComentarioCliente");
const nombreComentarioCliente = document.getElementById("nombreComentarioCliente");
const textoComentarioCliente = document.getElementById("textoComentarioCliente");
const comentariosIndex = document.getElementById("comentariosIndex");

const comentariosAdmin = document.getElementById("comentariosAdmin");
const modalComentarioAdmin = document.getElementById("modalComentarioAdmin");
const cerrarModalComentarioAdmin = document.getElementById("cerrarModalComentarioAdmin");
const modalComentarioNombre = document.getElementById("modalComentarioNombre");
const modalComentarioTexto = document.getElementById("modalComentarioTexto");
const eliminarComentarioAdmin = document.getElementById("eliminarComentarioAdmin");

let comentariosClientesData = [];
let comentarioSeleccionadoId = null;
let swiperComentariosIndex = null;

formComentarioCliente?.addEventListener("submit", async e => {
  e.preventDefault();

  const nombre = nombreComentarioCliente.value.trim();
  const comentario = textoComentarioCliente.value.trim();

  if (!nombre || !comentario) {
    alert("Escribe tu nombre y comentario");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/comentarios-clientes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nombre,
        comentario
      })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "No se pudo guardar el comentario");
      return;
    }

    formComentarioCliente.reset();

    await cargarComentariosIndex();
    await cargarComentariosAdmin();

    alert("Gracias por compartir tu experiencia");

  } catch (error) {
    console.error(error);
    alert("Error al enviar comentario");
  }
});

async function cargarComentariosIndex() {
  if (!comentariosIndex) return;

  try {
    const res = await fetch(`${API_URL}/comentarios-clientes`);
    const comentarios = await res.json();

    if (!res.ok || !Array.isArray(comentarios)) {
      comentariosIndex.innerHTML = "";
      return;
    }

    const comentariosActivos = comentarios.filter(item => {
      return !item.estado || item.estado === "activo";
    });

    if (comentariosActivos.length === 0) {
      comentariosIndex.innerHTML = `
        <div class="swiper-slide">
          <div class="comentario-slide-card">
            <p>Aún no hay comentarios. Sé el primero en compartir tu experiencia.</p>
            <div>
              <h4>JYD GYM</h4>
              <span>Experiencias</span>
            </div>
          </div>
        </div>
      `;
      return;
    }

    comentariosIndex.innerHTML = comentariosActivos.map(item => `
      <div class="swiper-slide">
        <div class="comentario-slide-card">
          <p>“${item.comentario}”</p>

          <div>
            <h4>${item.nombre}</h4>
            <span>Cliente</span>
          </div>
        </div>
      </div>
    `).join("");

    if (swiperComentariosIndex) {
      swiperComentariosIndex.destroy(true, true);
    }

    swiperComentariosIndex = new Swiper(".comentarios-swiper", {
      loop: comentariosActivos.length > 2,
      slidesPerView: 2,
      spaceBetween: 18,
      autoplay: {
        delay: 3500,
        disableOnInteraction: false
      },
      pagination: {
        el: ".comentarios-pagination",
        clickable: true
      },
      breakpoints: {
        0: {
          slidesPerView: 1
        },
        768: {
          slidesPerView: 2
        },
        1100: {
          slidesPerView: 3
        }
      }
    });

  } catch (error) {
    console.error(error);
  }
}

async function cargarComentariosAdmin() {
  if (!comentariosAdmin) return;

  try {
    const res = await fetch(`${API_URL}/comentarios-clientes`);
    const comentarios = await res.json();

    if (!res.ok || !Array.isArray(comentarios)) {
      comentariosAdmin.innerHTML = "<p>No se pudieron cargar los comentarios.</p>";
      return;
    }

    comentariosClientesData = comentarios;

    if (comentarios.length === 0) {
      comentariosAdmin.innerHTML = "<p>No hay comentarios registrados todavía.</p>";
      return;
    }

    comentariosAdmin.innerHTML = comentarios.map(item => `
      <div 
        class="comentario-admin-card"
        data-comentario-id="${item.id}"
      >
        <div class="metric-icon">
          <i class="bi bi-chat-left-quote"></i>
        </div>

        <h3>${item.nombre}</h3>

        <p>
          ${item.comentario.slice(0, 90)}${item.comentario.length > 90 ? "..." : ""}
        </p>

        <button 
          type="button"
          class="btn-eliminar-comentario-admin"
          data-comentario-id="${item.id}"
        >
          <i class="bi bi-trash"></i>
          Eliminar
        </button>
      </div>
    `).join("");

  } catch (error) {
    console.error(error);
  }
}

comentariosAdmin?.addEventListener("click", e => {
  const botonEliminar = e.target.closest(".btn-eliminar-comentario-admin");

  if (botonEliminar) {
    e.stopPropagation();

    const id = botonEliminar.dataset.comentarioId;
    eliminarComentarioClienteAdmin(id);

    return;
  }

  const card = e.target.closest(".comentario-admin-card");

  if (!card) return;

  const id = card.dataset.comentarioId;

  const comentario = comentariosClientesData.find(item => {
    return Number(item.id) === Number(id);
  });

  if (!comentario) return;

  comentarioSeleccionadoId = comentario.id;

  modalComentarioNombre.textContent = comentario.nombre;
  modalComentarioTexto.textContent = comentario.comentario;

  modalComentarioAdmin?.classList.add("activo");
});

cerrarModalComentarioAdmin?.addEventListener("click", () => {
  modalComentarioAdmin?.classList.remove("activo");
  comentarioSeleccionadoId = null;
});

eliminarComentarioAdmin?.addEventListener("click", async () => {
  if (!comentarioSeleccionadoId) return;

  const confirmar = confirm("¿Seguro que quieres eliminar este comentario?");

  if (!confirmar) return;

  try {
    const res = await fetch(`${API_URL}/comentarios-clientes/${comentarioSeleccionadoId}`, {
      method: "DELETE"
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "No se pudo eliminar el comentario");
      return;
    }

    modalComentarioAdmin?.classList.remove("activo");
    comentarioSeleccionadoId = null;

    await cargarComentariosAdmin();
    await cargarComentariosIndex();

    alert("Comentario eliminado correctamente");

  } catch (error) {
    console.error(error);
    alert("Error al eliminar comentario");
  }
});

async function eliminarComentarioClienteAdmin(id) {
  const confirmar = confirm("¿Seguro que quieres eliminar este comentario?");

  if (!confirmar) return;

  try {
    const res = await fetch(`${API_URL}/comentarios-clientes/${id}`, {
      method: "DELETE"
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "No se pudo eliminar el comentario");
      return;
    }

    await cargarComentariosAdmin();
    await cargarComentariosIndex();

    alert("Comentario eliminado correctamente");

  } catch (error) {
    console.error(error);
    alert("Error al eliminar comentario");
  }
}

cargarComentariosIndex();
cargarComentariosAdmin();
/*________________________________________________*/

/* =========================
   SERVICIOS SWIPER + TEXTO
========================= */

const serviciosGymData = [
  {
    numero: "Servicio 01",
    icono: "bi bi-person-check",
    titulo: "Entrenamiento Dirigido",
    descripcion: "Programas personalizados diseñados por entrenadores para ayudar a cada persona a alcanzar sus objetivos de fuerza, resistencia, pérdida de peso o aumento muscular.",
    beneficios: [
      "Planes adaptados a tu condición física.",
      "Acompañamiento técnico durante el entrenamiento.",
      "Enfoque en resultados reales y medibles."
    ],
    whatsapp: "Hola quiero más información sobre Entrenamiento Dirigido"
  },
  {
    numero: "Servicio 02",
    icono: "bi bi-activity",
    titulo: "Zona Funcional",
    descripcion: "Espacio especializado para ejercicios funcionales que mejoran la movilidad, coordinación, equilibrio y condición física general.",
    beneficios: [
      "Ejercicios dinámicos y variados.",
      "Mejora de agilidad, fuerza y resistencia.",
      "Ideal para todos los niveles."
    ],
    whatsapp: "Hola quiero más información sobre Zona Funcional"
  },
  {
    numero: "Servicio 03",
    icono: "bi bi-people",
    titulo: "Clases Grupales",
    descripcion: "Entrenamientos dinámicos en grupo que aumentan la motivación, fomentan el trabajo en equipo y ayudan a mantener la constancia.",
    beneficios: [
      "Mayor motivación al entrenar acompañado.",
      "Rutinas dinámicas y energéticas.",
      "Ambiente positivo y disciplinado."
    ],
    whatsapp: "Hola quiero más información sobre Clases Grupales"
  },
  {
    numero: "Servicio 04",
    icono: "bi bi-heart-pulse",
    titulo: "Zona Cardiovascular",
    descripcion: "Área equipada con máquinas para mejorar la salud cardiovascular, aumentar la resistencia y favorecer la quema de calorías.",
    beneficios: [
      "Mejora de resistencia física.",
      "Apoyo en procesos de pérdida de peso.",
      "Entrenamiento seguro y progresivo."
    ],
    whatsapp: "Hola quiero más información sobre Zona Cardiovascular"
  },
  {
    numero: "Servicio 05",
    icono: "bi bi-lightning-charge",
    titulo: "Zona de Pesas",
    descripcion: "Espacio completo para entrenamiento de fuerza e hipertrofia con equipos y pesos libres para todos los niveles.",
    beneficios: [
      "Entrenamiento de fuerza e hipertrofia.",
      "Máquinas y pesos libres.",
      "Ideal para principiantes y avanzados."
    ],
    whatsapp: "Hola quiero más información sobre Zona de Pesas"
  },
  {
    numero: "Servicio 06",
    icono: "bi bi-graph-up-arrow",
    titulo: "Evaluación y Control de Progreso Mensual",
    descripcion: "Seguimiento periódico del avance físico mediante mediciones y evaluaciones para ajustar el plan de entrenamiento y maximizar resultados.",
    beneficios: [
      "Control mensual de progreso.",
      "Ajustes según tus resultados.",
      "Seguimiento para entrenar con mayor precisión."
    ],
    whatsapp: "Hola quiero más información sobre Evaluación y Control de Progreso"
  }
];

const serviciosTextoCard = document.getElementById("serviciosTextoCard");
const servicioIcono = document.getElementById("servicioIcono");
const servicioNumero = document.getElementById("servicioNumero");
const servicioTitulo = document.getElementById("servicioTitulo");
const servicioDescripcion = document.getElementById("servicioDescripcion");
const servicioBeneficios = document.getElementById("servicioBeneficios");
const servicioBoton = document.getElementById("servicioBoton");

function actualizarTextoServicio(index) {
  const servicio = serviciosGymData[index];

  if (!servicio || !serviciosTextoCard) return;

  serviciosTextoCard.classList.remove("animando");
  void serviciosTextoCard.offsetWidth;
  serviciosTextoCard.classList.add("animando");

  servicioIcono.innerHTML = `<i class="${servicio.icono}"></i>`;
  servicioNumero.textContent = servicio.numero;
  servicioTitulo.textContent = servicio.titulo;
  servicioDescripcion.textContent = servicio.descripcion;

  servicioBeneficios.innerHTML = servicio.beneficios.map(item => `
    <li>
      <i class="bi bi-check-circle"></i>
      ${item}
    </li>
  `).join("");

  servicioBoton.href = `https://wa.me/573167858252?text=${encodeURIComponent(servicio.whatsapp)}`;
}

if (document.querySelector(".servicios-img-swiper")) {
  const serviciosImagenSwiper = new Swiper(".servicios-img-swiper", {
    loop: true,
    speed: 850,
    effect: "creative",
    grabCursor: true,
    autoplay: {
      delay: 4500,
      disableOnInteraction: false
    },
    creativeEffect: {
      prev: {
        shadow: true,
        translate: ["-18%", 0, -1],
        opacity: 0.55
      },
      next: {
        translate: ["100%", 0, 0]
      }
    },
    pagination: {
      el: ".servicios-pagination",
      clickable: true
    },
    navigation: {
      nextEl: ".servicios-button-next",
      prevEl: ".servicios-button-prev"
    },
    on: {
      init: function () {
        actualizarTextoServicio(this.realIndex);
      },
      slideChange: function () {
        actualizarTextoServicio(this.realIndex);
      }
    }
  });
}

/* =========================
   ESTADO GLOBAL
========================= */
let aliados = [];
let editId = null;
let galeriaTemp = [];
let aliadoOriginal = null;
let aliadosFiltrados = [];



/* =========================
   CARGAR DATOS
========================= */
async function cargar() {
  const res = await fetch("/api/aliados");
  aliados = await res.json();
  render();
}



/* =========================
   RENDER LISTA
========================= */
function render() {
  const list = document.getElementById("list");

  if (!list) return; // 🔥 evita crash

  list.innerHTML = "";

  aliados.forEach((a, index) => {
    list.innerHTML += `
      <div class="card">
        <div class="card-left">
          <img src="/uploads/aliados/${a.logo}">
          <div>
            <b>${a.nombre}</b>
          </div>
        </div>

        <div>${a.categoria}</div>

        <div class="estado ${a.estado}">
          ${a.estado}
        </div>

        <div class="contacto">
          📞 ${a.contacto}
        </div>

        <button onclick="verDetalle(${index})">
          Ver detalle
        </button>
      </div>
    `;
  });
}

/* =========================
   MODALES
========================= */
function openModal() {
  document.getElementById("modal").style.display = "flex";
}

function closeModal() {
  document.getElementById("modal").style.display = "none";

  // reset modo edición
  editId = null;
  document.querySelector("button[type='submit']").innerText = "Guardar";
}



/* =========================
   DETALLE
========================= */
function verDetalle(index) {
  const a = aliados[index];

  document.getElementById("modalDetalle").style.display = "flex";

  document.getElementById("modalBody").innerHTML = `
    <div class="detalle-container">

      <div class="detalle-header">
        <img class="logo" src="/uploads/aliados/${a.logo}" />

        <div>
          <h2>${a.nombre}</h2>
          <span class="estado ${a.estado}">${a.estado}</span>
        </div>
      </div>

      <div class="detalle-banner">
        <img src="/uploads/aliados/${a.imagen_principal}" />
      </div>

      <div class="detalle-grid">

        <div class="box">
          <h3>Descripción</h3>
          <p>${a.descripcion}</p>
        </div>

        <div class="box">
          <h3>Contacto</h3>
          <p>📞 ${a.contacto}</p>
        </div>

        <div class="box">
          <h3>Ubicación</h3>
          <p>📍 ${a.ubicacion}</p>
        </div>

      </div>

      <div class="galeria">
        ${(JSON.parse(a.galeria || "[]")).map(img => `
          <img src="/uploads/aliados/${img}" />
        `).join("")}
      </div>

      <div class="acciones">
        <button class="edit" onclick="abrirEditar(${index})">Editar</button>
        <button class="delete" onclick="eliminarAliado(${a.id})">Eliminar</button>
        <button onclick="cerrarDetalle()">Cerrar</button>
      </div>

    </div>
  `;
}

function cerrarDetalle() {
  document.getElementById("modalDetalle").style.display = "none";
}



/* =========================
   EDITAR
========================= */
function abrirEditar(index) {

  const a = aliados[index];

  editId = a.id;
  aliadoOriginal = JSON.stringify(a);

  document.getElementById("modal").style.display = "flex";

  document.querySelector("button[type='submit']").innerText = "Actualizar";

  document.querySelector("[name='nombre']").value = a.nombre;
  document.querySelector("[name='categoria']").value = a.categoria;
  document.querySelector("[name='descripcion']").value = a.descripcion;
  document.querySelector("[name='ubicacion']").value = a.ubicacion;
  document.querySelector("[name='contacto']").value = a.contacto;

  galeriaTemp = JSON.parse(a.galeria || "[]");

  renderGaleriaPreview();
}



/* =========================
   GALERÍA PREVIEW
========================= */
function renderGaleriaPreview() {

  const cont = document.getElementById("galeriaPreview");
  cont.innerHTML = "";

  galeriaTemp.forEach((img, index) => {

    cont.innerHTML += `
      <div class="img-box"
        draggable="true"
        ondragstart="drag(event, ${index})"
        ondrop="drop(event, ${index})"
        ondragover="event.preventDefault()">

        <img 
          src="/uploads/aliados/${img}" 
          onclick="openPreview('/uploads/aliados/${img}')"
          class="preview-img"
        />

        <button onclick="eliminarImg(${index})">✖</button>

      </div>
    `;
  });
}

function eliminarImg(index) {
  galeriaTemp.splice(index, 1);
  renderGaleriaPreview();
}



/* =========================
   DRAG & DROP
========================= */
let dragIndex = null;

function drag(e, index) {
  dragIndex = index;
}

function drop(e, index) {
  const temp = galeriaTemp[dragIndex];
  galeriaTemp[dragIndex] = galeriaTemp[index];
  galeriaTemp[index] = temp;

  renderGaleriaPreview();
}



/* =========================
   VALIDACIÓN IMÁGENES
========================= */
document.addEventListener("DOMContentLoaded", () => {

  const galeriaInput = document.querySelector("[name='galeria']");

  if (!galeriaInput) return;

  galeriaInput.addEventListener("change", (e) => {

    const files = Array.from(e.target.files);

    if (galeriaTemp.length + files.length > 6) {

      Swal.fire({
        icon: "error",
        title: "Límite de imágenes",
        text: "Solo puedes subir máximo 6 imágenes"
      });

      e.target.value = "";
      return;
    }

  });

});
const form = document.getElementById("form");

if (form) {
  form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const formData = new FormData(e.target);

    // limpiar vacíos
    for (let [key, value] of formData.entries()) {
      if (value === "" || value === "undefined") {
        formData.delete(key);
      }
    }

    formData.append("galeriaActual", JSON.stringify(galeriaTemp));

    const url = editId
      ? `/api/aliados/${editId}`
      : "/api/aliados";

    const method = editId ? "PUT" : "POST";

    await fetch(url, {
      method,
      body: formData
    });

    editId = null;
    galeriaTemp = [];
    closeModal();
    cargar();
    e.target.reset();

  });
}

/* =========================
   ELIMINAR
========================= */
async function eliminarAliado(id) {

  const result = await Swal.fire({
    title: "¿Eliminar aliado?",
    text: "Esta acción no se puede deshacer",
    icon: "warning",
    background: "#0f0f10",
    color: "#fff",
    showCancelButton: true,
    confirmButtonColor: "#ff8c00",
    cancelButtonColor: "#333",
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar"
  });

  if (!result.isConfirmed) return;

  await fetch(`/api/aliados/${id}`, {
    method: "DELETE"
  });

  await Swal.fire({
    title: "Eliminado",
    text: "El aliado fue eliminado correctamente",
    icon: "success",
    background: "#0f0f10",
    color: "#fff",
    confirmButtonColor: "#ff8c00"
  });

  cerrarDetalle();
  cargar();
}



/* =========================
   INIT
========================= */
cargar();

document.addEventListener("DOMContentLoaded", () => {

  const grid = document.getElementById("aliadosGrid");
  if (!grid) return;

  cargarAliados();

  const buscar = document.getElementById("buscarAliados");
  if (buscar) {
    buscar.addEventListener("input", (e) => {
      filtrarAliados(e.target.value);
    });
  }
});

async function cargarAliados() {

  const grid = document.getElementById("aliadosGrid");

  if (!grid) return; // 👈 evita crash total

  const res = await fetch("/api/aliados");
  const aliados = await res.json();

  grid.innerHTML = "";

  aliados.forEach(a => {
    grid.innerHTML += `
      <div class="aliado-card" onclick="verAliado(${a.id})">
        <img src="/uploads/aliados/${a.logo}">
        <h3>${a.nombre}</h3>
        <p>${a.categoria}</p>
      </div>
    `;
  });
}

cargarAliados();

async function verAliado(id) {

  const res = await fetch("/api/aliados");
  const aliados = await res.json();

  const a = aliados.find(x => x.id == id);

  if (!a) return;

  const modal = document.getElementById("modalAliado");
  const body = document.getElementById("modalAliadoBody");

  if (!modal || !body) return;

  modal.style.display = "flex";

  body.innerHTML = `
    <div class="detalle-container">

      <div class="detalle-header">
        <img class="logo" src="/uploads/aliados/${a.logo}" />

        <div class="aja">
          <h2>${a.nombre}</h2>
          <span class="estado ${a.estado}">${a.estado}</span>
        </div>
      </div>

      <div class="detalle-banner">
        <img src="/uploads/aliados/${a.imagen_principal}" />
      </div>

      <div class="detalle-grid">

        <div class="box">
          <h3>Descripción</h3>
          <p>${a.descripcion}</p>
        </div>

        <div class="box">
          <h3>Contacto</h3>
          <p>📞 ${a.contacto}</p>
        </div>

        <div class="box">
          <h3>Ubicación</h3>
          <p>📍 ${a.ubicacion}</p>
        </div>

      </div>

      <div class="galeria">
        ${(JSON.parse(a.galeria || "[]")).map(img => `
          <img src="/uploads/aliados/${img}" />
        `).join("")}
      </div>

  `;
}

function cerrarModal() {
  const modal = document.getElementById("modalAliado");
  if (modal) modal.style.display = "none";
}

function renderAliados(aliados) {
  const grid = document.getElementById("aliadosGrid");
  if (!grid) return;

  let html = "";

  aliados.forEach(a => {
    html += `
      <div class="aliado-card" onclick="verAliado(${a.id})">
        <img src="/uploads/aliados/${a.logo}">
        <h3>${a.nombre}</h3>
        <p>${a.categoria}</p>
      </div>
    `;
  });

  grid.innerHTML = html;
}

function filtrarAliados(texto) {

  const filtro = texto.toLowerCase();

  aliadosFiltrados = aliados.filter(a => {
    return (
      a.nombre.toLowerCase().includes(filtro) ||
      a.categoria.toLowerCase().includes(filtro)
    );
  });

  renderAliados(aliadosFiltrados);
}

function abrirModalAliado(a) {
  alert(`Aliado: ${a.nombre}`);
}

window.openPreview = function(src){
  const lb = document.getElementById("lightbox");
  const img = document.getElementById("lightboxImg");

  if(!lb || !img) return;

  img.src = src;
  lb.style.display = "flex";
} 

document.getElementById("lightbox").onclick = function(){
  this.style.display = "none";
};

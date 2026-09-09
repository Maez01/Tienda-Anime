// =========================================================================
// admin.js — SOLO PARA admin.html
// =========================================================================

// ---------- Guardia de acceso: solo entra un Admin logueado ----------
const sesionActual = obtenerSesion();
if (!sesionActual || sesionActual.rol !== "Admin") {
    alert("Debes iniciar sesión como administrador para ver esta página.");
    window.location.href = "Inicio_sesion.html";
}

const tablaProductos = document.getElementById("tabla-productos-admin");
const tablaPapelera = document.getElementById("tabla-papelera-admin");
const formAgregarManga = document.getElementById("formAgregarManga");
const errorFormAdmin = document.getElementById("errorFormAdmin");
const navUsuarioActual = document.getElementById("nav-usuario-actual");
const btnCerrarSesion = document.getElementById("btn-cerrar-sesion");

// ---------- Modal "Gestionar tomos" ----------
const tablaTomos = document.getElementById("tabla-tomos-admin");
const modalTomosTitulo = document.getElementById("modalTomosAdminTitulo");
const formAgregarTomo = document.getElementById("formAgregarTomo");
const errorFormTomo = document.getElementById("errorFormTomo");
let mangaIdAbierto = null; // qué manga está abierto en el modal de tomos

/**
 * Pinta la tabla con todos los mangas del catálogo (base + agregados por el admin).
 */
function renderizarTablaProductos() {
    if (!tablaProductos) return;

    const catalogo = obtenerCatalogoCompleto();
    tablaProductos.innerHTML = "";

    if (catalogo.length === 0) {
        tablaProductos.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No quedan mangas en el catálogo.</td></tr>`;
        return;
    }

    catalogo.forEach(manga => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td><img src="${manga.imgPortada}" alt="${manga.titulo}" style="width:50px;height:65px;object-fit:cover;border-radius:4px;"></td>
            <td>${manga.titulo}</td>
            <td class="text-uppercase">${manga.genero}</td>
            <td>${manga.volumenes.length}</td>
            <td>
                <button class="btn btn-outline-secondary btn-sm fw-bold btn-gestionar-tomos" data-manga-id="${manga.id}">
                    Gestionar tomos
                </button>
                <button class="btn btn-outline-danger btn-sm fw-bold btn-eliminar-manga" data-manga-id="${manga.id}">
                    Eliminar
                </button>
            </td>
        `;
        tablaProductos.appendChild(fila);
    });

    // Conecta cada botón "Eliminar" recién creado
    document.querySelectorAll(".btn-eliminar-manga").forEach(btn => {
        btn.addEventListener("click", () => {
            const mangaId = parseInt(btn.dataset.mangaId, 10);
            const fila = btn.closest("tr");
            const titulo = fila.children[1].textContent;

            if (confirm(`¿Eliminar "${titulo}" del catálogo? (queda en la papelera, se puede restaurar)`)) {
                eliminarManga(mangaId);
                renderizarTablaProductos();
                renderizarTablaPapelera();
            }
        });
    });

    // Conecta cada botón "Gestionar tomos" recién creado
    document.querySelectorAll(".btn-gestionar-tomos").forEach(btn => {
        btn.addEventListener("click", () => {
            const mangaId = parseInt(btn.dataset.mangaId, 10);
            abrirModalTomos(mangaId);
        });
    });
}

/**
 * Abre el modal de tomos para un manga puntual y lo llena.
 */
function abrirModalTomos(mangaId) {
    mangaIdAbierto = mangaId;
    const manga = obtenerCatalogoCompleto().find(m => m.id === mangaId);
    if (!manga) return;

    modalTomosTitulo.textContent = `Tomos de: ${manga.titulo}`;
    formAgregarTomo.reset();
    errorFormTomo.textContent = "";
    renderizarTablaTomos();

    const modal = new bootstrap.Modal(document.getElementById("modalTomosAdmin"));
    modal.show();
}

/**
 * Pinta la tabla de tomos del manga actualmente abierto en el modal.
 */
function renderizarTablaTomos() {
    if (!tablaTomos || mangaIdAbierto === null) return;

    const manga = obtenerCatalogoCompleto().find(m => m.id === mangaIdAbierto);
    if (!manga) return;

    tablaTomos.innerHTML = "";

    if (manga.volumenes.length === 0) {
        tablaTomos.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Este manga no tiene tomos.</td></tr>`;
    }

    manga.volumenes.forEach(vol => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>Vol. ${vol.tomo}</td>
            <td>
                <input type="number" min="0" class="form-control form-control-sm input-precio-tomo" style="width:100px;" value="${vol.precio}" data-tomo="${vol.tomo}">
            </td>
            <td>
                <input type="number" min="0" class="form-control form-control-sm input-stock-tomo" style="width:90px;" value="${vol.stock}" data-tomo="${vol.tomo}">
            </td>
            <td class="text-nowrap">
                <button class="btn btn-outline-primary btn-sm btn-guardar-tomo" data-tomo="${vol.tomo}">Guardar</button>
                <button class="btn btn-outline-danger btn-sm btn-eliminar-tomo" data-tomo="${vol.tomo}">Eliminar</button>
            </td>
        `;
        tablaTomos.appendChild(fila);
    });

    // Guardar nuevo precio y stock de un tomo
    document.querySelectorAll(".btn-guardar-tomo").forEach(btn => {
        btn.addEventListener("click", () => {
            const tomo = parseInt(btn.dataset.tomo, 10);
            const inputPrecio = document.querySelector(`.input-precio-tomo[data-tomo="${tomo}"]`);
            const inputStock = document.querySelector(`.input-stock-tomo[data-tomo="${tomo}"]`);
            const nuevoPrecio = parseFloat(inputPrecio.value);
            const nuevoStock = parseInt(inputStock.value, 10);

            if (isNaN(nuevoPrecio) || nuevoPrecio < 0 || isNaN(nuevoStock) || nuevoStock < 0) {
                alert("Precio y stock deben ser números válidos (0 o más).");
                return;
            }

            cambiarPrecioTomo(mangaIdAbierto, tomo, nuevoPrecio);
            cambiarStockTomo(mangaIdAbierto, tomo, nuevoStock);
            renderizarTablaProductos();
        });
    });

    // Eliminar un tomo puntual
    document.querySelectorAll(".btn-eliminar-tomo").forEach(btn => {
        btn.addEventListener("click", () => {
            const tomo = parseInt(btn.dataset.tomo, 10);
            if (confirm(`¿Eliminar el Vol. ${tomo}? (esto sí es permanente; puedes volver a agregarlo abajo)`)) {
                eliminarTomo(mangaIdAbierto, tomo);
                renderizarTablaTomos();
                renderizarTablaProductos();
            }
        });
    });
}

/**
 * Agrega un tomo nuevo al manga abierto en el modal.
 */
function manejarAgregarTomo(event) {
    event.preventDefault();
    errorFormTomo.textContent = "";

    const precio = parseFloat(document.getElementById("nuevoTomoPrecio").value);
    const stock = parseInt(document.getElementById("nuevoTomoStock").value, 10);
    const img = document.getElementById("nuevoTomoImg").value.trim();

    if (!img) {
        errorFormTomo.textContent = "Ingresa una imagen para el tomo.";
        return;
    }
    if (isNaN(precio) || precio < 0 || isNaN(stock) || stock < 0) {
        errorFormTomo.textContent = "Precio y stock deben ser números válidos (0 o más).";
        return;
    }

    agregarTomo(mangaIdAbierto, { precio, stock, img });

    formAgregarTomo.reset();
    renderizarTablaTomos();
    renderizarTablaProductos();
}

/**
 * Pinta la tabla de la papelera (mangas eliminados, aún recuperables).
 */
function renderizarTablaPapelera() {
    if (!tablaPapelera) return;

    const papelera = obtenerPapelera();
    tablaPapelera.innerHTML = "";

    if (papelera.length === 0) {
        tablaPapelera.innerHTML = `<tr><td colspan="4" class="text-center text-muted">La papelera está vacía.</td></tr>`;
        return;
    }

    papelera.forEach(manga => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td><img src="${manga.imgPortada}" alt="${manga.titulo}" style="width:50px;height:65px;object-fit:cover;border-radius:4px;opacity:0.6;"></td>
            <td class="text-muted"><del>${manga.titulo}</del></td>
            <td class="text-uppercase text-muted">${manga.genero}</td>
            <td>
                <button class="btn btn-outline-success btn-sm fw-bold btn-restaurar-manga" data-manga-id="${manga.id}">
                    Restaurar
                </button>
            </td>
        `;
        tablaPapelera.appendChild(fila);
    });

    // Conecta cada botón "Restaurar" recién creado
    document.querySelectorAll(".btn-restaurar-manga").forEach(btn => {
        btn.addEventListener("click", () => {
            const mangaId = parseInt(btn.dataset.mangaId, 10);
            restaurarManga(mangaId);
            renderizarTablaProductos();
            renderizarTablaPapelera();
        });
    });
}

/**
 * Valida y agrega el manga del formulario.
 */
function manejarAgregarManga(event) {
    event.preventDefault();
    errorFormAdmin.textContent = "";

    const titulo = document.getElementById("nuevoTitulo").value.trim();
    const genero = document.getElementById("nuevoGenero").value.trim();
    const sinopsis = document.getElementById("nuevaSinopsis").value.trim();
    const imgPortada = document.getElementById("nuevaImagen").value.trim();
    const precio = parseFloat(document.getElementById("nuevoPrecio").value);
    const stock = parseInt(document.getElementById("nuevoStock").value, 10);

    if (!titulo || !genero || !sinopsis || !imgPortada) {
        errorFormAdmin.textContent = "Completa todos los campos de texto.";
        return;
    }
    if (isNaN(precio) || precio < 0 || isNaN(stock) || stock < 0) {
        errorFormAdmin.textContent = "Precio y stock deben ser números válidos (0 o más).";
        return;
    }

    agregarManga({ titulo, genero, sinopsis, imgPortada, precio, stock });

    formAgregarManga.reset();
    renderizarTablaProductos();
}

// ---------- Inicialización ----------
document.addEventListener("DOMContentLoaded", () => {
    if (navUsuarioActual && sesionActual) {
        navUsuarioActual.textContent = `${sesionActual.nombre} (${sesionActual.rol})`;
    }

    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener("click", () => {
            cerrarSesion();
            window.location.href = "Inicio_sesion.html";
        });
    }

    if (formAgregarManga) {
        formAgregarManga.addEventListener("submit", manejarAgregarManga);
    }

    if (formAgregarTomo) {
        formAgregarTomo.addEventListener("submit", manejarAgregarTomo);
    }

    renderizarTablaProductos();
    renderizarTablaPapelera();
});

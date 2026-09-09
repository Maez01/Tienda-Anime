// =========================================================================
// catalogo-mangas.js
// =========================================================================

const contenedorMangas = document.getElementById("contenedor-mangas");
const filtroGenero = document.getElementById("filtroGenero");
const filtroOrden = document.getElementById("filtroOrden");
const buscarManga = document.getElementById("buscarManga");

/**
 * Renderiza las tarjetas de mangas dentro de #contenedor-mangas.
 * No hace nada si no estamos en Mangas.html (evita errores en el resto del sitio).
 */
function renderizarMangas(lista = baseDatosMangas) {
    if (!contenedorMangas) return;

    contenedorMangas.innerHTML = "";

    if (lista.length === 0) {
        contenedorMangas.innerHTML = `<p class="text-center col-12 my-5 text-muted fs-5">No existen registros que coincidan con la búsqueda.</p>`;
        return;
    }

    lista.forEach(manga => {
        const col = document.createElement("div");
        col.className = "col";

        col.innerHTML = `
            <div class="card card-manga h-100 shadow border-0">
                <img src="${manga.imgPortada}" class="card-img-top" style="height: 280px; object-fit: cover;" alt="${manga.titulo}">
                <div class="card-body d-flex flex-column">
                    <span class="badge bg-secondary align-self-start mb-2 text-uppercase">${manga.genero}</span>
                    <h5 class="card-title fw-bold text-dark">${manga.titulo}</h5>
                    <p class="card-text text-muted small">${manga.volumenes.length} tomos registrados</p>
                    <button class="btn btn-primary mt-auto w-100 fw-bold btn-ver-volumenes" data-manga-id="${manga.id}">
                        Ver Volúmenes
                    </button>
                </div>
            </div>
        `;

        contenedorMangas.appendChild(col);
    });

    // Conecta cada botón "Ver Volúmenes" recién creado
    document.querySelectorAll(".btn-ver-volumenes").forEach(btn => {
        btn.addEventListener("click", () => {
            const mangaId = parseInt(btn.dataset.mangaId, 10);
            abrirModalVolumenes(mangaId);
        });
    });
}

/**
 * Abre el modal de Bootstrap y lo llena con los tomos del manga seleccionado.
 */
function abrirModalVolumenes(mangaId) {
    const manga = baseDatosMangas.find(m => m.id === mangaId);
    if (!manga) return;

    document.getElementById("modalMangaTitulo").textContent = manga.titulo;
    document.getElementById("modalMangaSinopsis").textContent = manga.sinopsis;

    const contenedorTomos = document.getElementById("contenedor-tomos");
    contenedorTomos.innerHTML = "";

    manga.volumenes.forEach(vol => {
        const sinStock = vol.stock === 0;

        const col = document.createElement("div");
        col.className = "col";

        col.innerHTML = `
            <div class="card h-100 bg-secondary bg-opacity-20 border-secondary text-center p-2 text-white">
                <img src="${vol.img}" class="card-img-top rounded" style="height: 150px; object-fit: cover;" alt="Tomo ${vol.tomo}">
                <div class="card-body p-1 d-flex flex-column justify-content-between">
                    <h6 class="card-title my-1 fs-6">Vol. ${vol.tomo}</h6>
                    <p class="text-warning mb-1 fw-bold">${formatearPrecio(vol.precio)}</p>
                    <p class="mb-1 small ${sinStock ? "text-danger" : "text-success"} fw-bold">
                        ${sinStock ? "Agotado" : "Stock: " + vol.stock + " u."}
                    </p>
                    <button
                        class="btn btn-warning btn-sm mt-2 fw-bold w-100 btn-comprar-tomo"
                        data-manga-id="${manga.id}"
                        data-tomo="${vol.tomo}"
                        data-titulo="${manga.titulo}"
                        data-precio="${vol.precio}"
                        data-img="${vol.img}"
                        ${sinStock ? "disabled" : ""}
                    >
                        ${sinStock ? "Sin stock" : "Comprar"}
                    </button>
                </div>
            </div>
        `;

        contenedorTomos.appendChild(col);
    });

    // Conecta cada botón "Comprar" recién creado
    document.querySelectorAll(".btn-comprar-tomo").forEach(btn => {
        btn.addEventListener("click", () => {
            const agregado = agregarAlCarrito({
                mangaId: parseInt(btn.dataset.mangaId, 10),
                titulo: btn.dataset.titulo,
                tomo: parseInt(btn.dataset.tomo, 10),
                precio: parseFloat(btn.dataset.precio),
                img: btn.dataset.img
            });

            if (agregado) {
                const textoOriginal = btn.textContent;
                btn.textContent = "Agregado ✓";
                setTimeout(() => (btn.textContent = textoOriginal), 1200);
            }
        });
    });

    const modal = new bootstrap.Modal(document.getElementById("modalVolumenes"));
    modal.show();
}

/**
 * Procesa los filtros de género, ordenamiento y caja de texto de forma combinada.
 */
function procesarFiltros() {
    let filtrados = baseDatosMangas.filter(manga => {
        const cumpleGenero = filtroGenero.value === "todos" || manga.genero.toLowerCase() === filtroGenero.value.toLowerCase();
        const cumpleBusqueda = manga.titulo.toLowerCase().includes(buscarManga.value.toLowerCase());
        return cumpleGenero && cumpleBusqueda;
    });

    if (filtroOrden.value === "mas-vistos") {
        filtrados.sort((a, b) => b.vistas - a.vistas);
    } else if (filtroOrden.value === "recientes") {
        filtrados.sort((a, b) => new Date(b.fechaAgregado) - new Date(a.fechaAgregado));
    }

    renderizarMangas(filtrados);
}



// =========================================================================
// INICIALIZACIÓN (Mangas.html)
// =========================================================================
document.addEventListener("DOMContentLoaded", () => {
    if (!contenedorMangas) return;
    filtroGenero.addEventListener("change", procesarFiltros);
    filtroOrden.addEventListener("change", procesarFiltros);
    buscarManga.addEventListener("input", procesarFiltros);
    procesarFiltros();
});

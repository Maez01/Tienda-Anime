// =========================================================================
// MÓDULO 1: GESTIÓN DE VISORES DE IMÁGENES (Para la Página de Inicio / Home)
// =========================================================================

/**
 * Abre cualquier visor de imágenes en la portada pasando su número identificador.
 * @param {number} numero - ID del visor (ej: 1, 2, 3)
 */
function abrirImagen(numero) {
    const visor = document.getElementById("visor" + numero);
    if (visor) {
        visor.style.display = "flex";
    }
}

/**
 * Cierra el visor de imágenes activo en la portada.
 * @param {number} numero - ID del visor (ej: 1, 2, 3)
 */
function cerrarImagen(numero) {
    const visor = document.getElementById("visor" + numero);
    if (visor) {
        visor.style.display = "none";
    }
}


// =========================================================================
// MÓDULO 2: BASE DE DATOS SIMULADA DE MANGAS (Para la Página Mangas.html)
// =========================================================================

// Estructura escalable ideal para migrar a React en la entrega 2
const baseDatosMangas = [
    {
        id: 1,
        titulo: "Chainsaw Man",
        genero: "shonen",
        vistas: 4500,
        fechaAgregado: "2026-08-15",
        sinopsis: "Denji es un joven desamparado que fusiona su cuerpo con el Demonio Motosierra para sobrevivir.",
        imgPortada: "https://via.placeholder.com/300x420/1f1f1f/ffffff?text=Chainsaw+Man",
        volumenes: [
            { tomo: 1, precio: 9990, stock: 5, img: "https://via.placeholder.com/200x280/333?text=CSM+Vol+1" },
            { tomo: 2, precio: 9990, stock: 0, img: "https://via.placeholder.com/200x280/333?text=CSM+Vol+2" },
            { tomo: 12, precio: 10990, stock: 8, img: "https://via.placeholder.com/200x280/333?text=CSM+Vol+12" }
        ]
    },
    {
        id: 2,
        titulo: "Berserk",
        genero: "seinen",
        vistas: 9800,
        fechaAgregado: "2026-01-10",
        sinopsis: "Guts viaja a través de una tierra devastada buscando venganza en esta fantasía oscura medieval.",
        imgPortada: "https://via.placeholder.com/300x420/1f1f1f/ffffff?text=Berserk",
        volumenes: [
            { tomo: 1, precio: 15990, stock: 3, img: "https://via.placeholder.com/200x280/333?text=Berserk+1" },
            { tomo: 2, precio: 15990, stock: 2, img: "https://via.placeholder.com/200x280/333?text=Berserk+2" }
        ]
    }
    // Nota: Aquí podrás meter los 50 mangas hacia abajo siguiendo este formato exacto.
];


// =========================================================================
// MÓDULO 3: LÓGICA DE CONTROL DEL CATÁLOGO E INTERFAZ DINÁMICA
// =========================================================================

// Capturamos los elementos del DOM (Solo si existen en la página actual)
const contenedorMangas = document.getElementById("contenedor-mangas");
const filtroGenero = document.getElementById("filtroGenero");
const filtroOrden = document.getElementById("filtroOrden");
const buscarManga = document.getElementById("buscarManga");

/**
 * Renderiza la parrilla de series de manga en el HTML.
 */
function renderizarCatalogo(lista) {
    if (!contenedorMangas) return; // Evita errores si estamos en Inicio tienda.html
    
    contenedorMangas.innerHTML = "";
    
    if (lista.length === 0) {
        contenedorMangas.innerHTML = `<p class="text-center col-12 my-5 text-muted fs-5">No existen registros que coincidan con la búsqueda.</p>`;
        return;
    }

    lista.forEach(manga => {
        const tarjeta = `
            <div class="col">
                <div class="card h-100 shadow border-0 card-manga">
                    <img src="${manga.imgPortada}" class="card-img-top" style="height: 280px; object-fit: cover;" alt="${manga.titulo}">
                    <div class="card-body d-flex flex-column">
                        <span class="badge bg-secondary align-self-start mb-2 text-uppercase">${manga.genero}</span>
                        <h5 class="card-title fw-bold text-dark">${manga.titulo}</h5>
                        <p class="card-text text-muted small">${manga.volumenes.length} tomos registrados</p>
                        <button onclick="desplegarTomos(${manga.id})" class="btn btn-primary mt-auto w-100 fw-bold" data-bs-toggle="modal" data-bs-target="#modalVolumenes">
                            Ver Volúmenes
                        </button>
                    </div>          
                </div>
            </div>
        `;
        contenedorMangas.innerHTML += tarjeta;
    });
}

/**
 * Busca un manga por ID y dibuja sus volúmenes dentro del Modal de Bootstrap.
 */
function desplegarTomos(id) {
    const manga = baseDatosMangas.find(m => m.id === id);
    if (!manga) return;

    document.getElementById("modalMangaTitulo").innerText = manga.titulo;
    document.getElementById("modalMangaSinopsis").innerText = manga.sinopsis;

    const contenedorTomos = document.getElementById("contenedor-tomos");
    contenedorTomos.innerHTML = "";

    manga.volumenes.forEach(vol => {
        const stockTexto = vol.stock > 0 
            ? `<span class="text-success fw-bold small">Stock: ${vol.stock} u.</span>` 
            : `<span class="text-danger fw-bold small">Agotado</span>`;
            
        const btnDeshabilitado = vol.stock === 0 ? "disabled" : "";

        const itemTomo = `
            <div class="col">
                <div class="card h-100 bg-secondary bg-opacity-20 border-secondary text-center p-2 text-white">
                    <img src="${vol.img}" class="card-img-top rounded" style="height: 150px; object-fit: cover;">
                    <div class="card-body p-1 d-flex flex-column justify-content-between">
                        <h6 class="card-title my-1 fs-6">Vol. ${vol.tomo}</h6>
                        <p class="text-warning mb-1 fw-bold">$${vol.precio.toLocaleString('es-CL')}</p>
                        ${stockTexto}
                        <button class="btn btn-warning btn-sm mt-2 fw-bold w-100" ${btnDeshabilitado}>Comprar</button>
                    </div>
                </div>
            </div>
        `;
        contenedorTomos.innerHTML += itemTomo;
    });
}

/**
 * Procesa los filtros de género, ordenamiento y caja de texto de forma combinada.
 */
function procesarFiltros() {
    let filtrados = baseDatosMangas.filter(manga => {
        const cumpleGenero = filtroGenero.value === "todos" || manga.genero === filtroGenero.value;
        const cumpleBusqueda = manga.titulo.toLowerCase().includes(buscarManga.value.toLowerCase());
        return cumpleGenero && cumpleBusqueda;
    });

    // Orden dinámico requerido (Más vistos o Recientes)
    if (filtroOrden.value === "mas-vistos") {
        filtrados.sort((a, b) => b.vistas - a.vistas);
    } else if (filtroOrden.value === "recientes") {
        filtrados.sort((a, b) => new Date(b.fechaAgregado) - new Date(a.fechaAgregado));
    }

    renderizarCatalogo(filtrados);
}

// =========================================================================
// MÓDULO 4: INICIALIZACIÓN DE EVENTOS
// =========================================================================

// Escuchamos los cambios del usuario solo si estamos en la vista de mangas
if (contenedorMangas) {
    filtroGenero.addEventListener("change", procesarFiltros);
    filtroOrden.addEventListener("change", procesarFiltros);
    buscarManga.addEventListener("input", procesarFiltros);

    // Carga inicial automática del catálogo al abrir la vista
    procesarFiltros();
}
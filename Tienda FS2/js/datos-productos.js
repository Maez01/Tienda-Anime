// =========================================================================
//  — CAPA DE ADMINISTRACIÓN SOBRE baseDatosMangas
// =========================================================================
const CATALOGO_KEY = "catalogoManga";
const PAPELERA_KEY = "papeleraManga";

/**
 * copia baseDatosMangas a localStorage y la usa como punto de partida.
 */
function obtenerCatalogoCompleto() {
    const data = localStorage.getItem(CATALOGO_KEY);
    if (data) return JSON.parse(data);

    // Copia profunda (para no compartir referencias con baseDatosMangas).
    const copiaInicial = JSON.parse(JSON.stringify(baseDatosMangas));
    guardarCatalogo(copiaInicial);
    return copiaInicial;
}

function guardarCatalogo(catalogo) {
    localStorage.setItem(CATALOGO_KEY, JSON.stringify(catalogo));
}

function obtenerPapelera() {
    const data = localStorage.getItem(PAPELERA_KEY);
    return data ? JSON.parse(data) : [];
}

function guardarPapelera(lista) {
    localStorage.setItem(PAPELERA_KEY, JSON.stringify(lista));
}

/**
 * Genera un id nuevo que nunca choca con ninguno ya usado (ni siquiera con
 * uno que esté en la papelera).
 */
function generarNuevoIdManga() {
    const idsCatalogo = obtenerCatalogoCompleto().map(m => m.id);
    const idsPapelera = obtenerPapelera().map(m => m.id);
    return Math.max(0, ...idsCatalogo, ...idsPapelera) + 1;
}

/**
 * Agrega un manga nuevo (versión básica: 1 solo tomo).
 * @param {Object} datos - { titulo, genero, sinopsis, imgPortada, precio, stock }
 */
function agregarManga(datos) {
    const catalogo = obtenerCatalogoCompleto();

    const nuevoManga = {
        id: generarNuevoIdManga(),
        titulo: datos.titulo,
        genero: datos.genero,
        vistas: 0,
        fechaAgregado: new Date().toISOString().slice(0, 10),
        sinopsis: datos.sinopsis,
        imgPortada: datos.imgPortada,
        volumenes: [
            { tomo: 1, precio: datos.precio, stock: datos.stock, img: datos.imgPortada }
        ]
    };

    catalogo.push(nuevoManga);
    guardarCatalogo(catalogo);

    return nuevoManga;
}

/**
 * Manda un manga a la papelera (no lo borra para siempre).
 */
function eliminarManga(id) {
    const catalogo = obtenerCatalogoCompleto();
    const manga = catalogo.find(m => m.id === id);
    if (!manga) return;

    guardarCatalogo(catalogo.filter(m => m.id !== id));

    const papelera = obtenerPapelera();
    papelera.push(manga);
    guardarPapelera(papelera);
}

/**
 * Devuelve un manga desde la papelera al catálogo activo.
 */
function restaurarManga(id) {
    const papelera = obtenerPapelera();
    const manga = papelera.find(m => m.id === id);
    if (!manga) return;

    guardarPapelera(papelera.filter(m => m.id !== id));

    const catalogo = obtenerCatalogoCompleto();
    catalogo.push(manga);
    guardarCatalogo(catalogo);
}

/**
 * Calcula el próximo número de tomo libre para un manga.
 */
function generarNuevoTomo(mangaId) {
    const manga = obtenerCatalogoCompleto().find(m => m.id === mangaId);
    const tomos = manga ? manga.volumenes.map(v => v.tomo) : [];
    return Math.max(0, ...tomos) + 1;
}

/**
 * Agrega un tomo nuevo a un manga que ya existe.
 * @param {number} mangaId
 * @param {Object} datos - { precio, stock, img }
 */
function agregarTomo(mangaId, datos) {
    const catalogo = obtenerCatalogoCompleto();
    const manga = catalogo.find(m => m.id === mangaId);
    if (!manga) return;

    manga.volumenes.push({
        tomo: generarNuevoTomo(mangaId),
        precio: datos.precio,
        stock: datos.stock,
        img: datos.img
    });

    guardarCatalogo(catalogo);
}

/**
 * Elimina un tomo específico de un manga (no todo el manga). Esto sí es
 * permanente: si te equivocas, vuelve a agregarlo con "Agregar tomo".
 */
function eliminarTomo(mangaId, tomo) {
    const catalogo = obtenerCatalogoCompleto();
    const manga = catalogo.find(m => m.id === mangaId);
    if (!manga) return;

    manga.volumenes = manga.volumenes.filter(v => v.tomo !== tomo);
    guardarCatalogo(catalogo);
}

/**
 * Cambia el stock de un tomo puntual.
 */
function cambiarStockTomo(mangaId, tomo, nuevoStock) {
    const catalogo = obtenerCatalogoCompleto();
    const manga = catalogo.find(m => m.id === mangaId);
    if (!manga) return;

    const vol = manga.volumenes.find(v => v.tomo === tomo);
    if (vol) vol.stock = nuevoStock;

    guardarCatalogo(catalogo);
}

/**
 * Cambia el precio de un tomo puntual.
 */
function cambiarPrecioTomo(mangaId, tomo, nuevoPrecio) {
    const catalogo = obtenerCatalogoCompleto();
    const manga = catalogo.find(m => m.id === mangaId);
    if (!manga) return;

    const vol = manga.volumenes.find(v => v.tomo === tomo);
    if (vol) vol.precio = nuevoPrecio;

    guardarCatalogo(catalogo);
}

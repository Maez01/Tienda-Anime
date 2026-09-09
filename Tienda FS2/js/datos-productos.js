// =========================================================================
// datos-productos.js — CAPA DE ADMINISTRACIÓN SOBRE baseDatosMangas
// =========================================================================
// baseDatosMangas (datos-mangas.js) es un array fijo en el código: no se
// puede modificar en tiempo real ni persiste cambios. Esta capa agrega tres
// listas en localStorage:
//   - mangasAgregados          -> mangas nuevos creados desde el panel de admin
//   - mangasEliminados         -> ids de mangas (de la base fija) que el admin borró
//   - mangasAgregadosEliminados -> mangas (agregados por el admin) que borró después
//
// "Eliminar" NO es permanente: es como mandar a una papelera. Desde
// obtenerPapelera() se puede listar lo borrado y con restaurarManga(id)
// se devuelve al catálogo.
//
// obtenerCatalogoCompleto() combina todo eso y es lo que SIEMPRE debe usarse
// para pintar el catálogo o buscar un manga (en vez de baseDatosMangas
// directamente), así los cambios del admin se reflejan en toda la tienda.
//
// Cárgalo DESPUÉS de datos-mangas.js y ANTES de carrito.js,
// catalogo-mangas.js y admin.js.

const AGREGADOS_KEY = "mangasAgregados";
const ELIMINADOS_KEY = "mangasEliminados";
const AGREGADOS_ELIMINADOS_KEY = "mangasAgregadosEliminados";

// ---- Edición a nivel de TOMO para mangas de la base fija ----
// (para mangas "agregados" por el admin no hace falta nada de esto: como
// son 100% nuestros, sus tomos se editan directo en su propio objeto)
const TOMOS_ELIMINADOS_KEY = "tomosEliminados";   // [{ mangaId, tomo }]
const TOMOS_AGREGADOS_KEY = "tomosAgregados";     // [{ mangaId, tomo, precio, stock, img }]
const STOCK_OVERRIDES_KEY = "stockOverrides";     // { "mangaId-tomo": nuevoStock }
const PRECIO_OVERRIDES_KEY = "precioOverrides";   // { "mangaId-tomo": nuevoPrecio }

function obtenerMangasAgregados() {
    const data = localStorage.getItem(AGREGADOS_KEY);
    return data ? JSON.parse(data) : [];
}

function guardarMangasAgregados(lista) {
    localStorage.setItem(AGREGADOS_KEY, JSON.stringify(lista));
}

function obtenerMangasEliminados() {
    const data = localStorage.getItem(ELIMINADOS_KEY);
    return data ? JSON.parse(data) : [];
}

function guardarMangasEliminados(lista) {
    localStorage.setItem(ELIMINADOS_KEY, JSON.stringify(lista));
}

function obtenerMangasAgregadosEliminados() {
    const data = localStorage.getItem(AGREGADOS_ELIMINADOS_KEY);
    return data ? JSON.parse(data) : [];
}

function guardarMangasAgregadosEliminados(lista) {
    localStorage.setItem(AGREGADOS_ELIMINADOS_KEY, JSON.stringify(lista));
}

function obtenerTomosEliminados() {
    const data = localStorage.getItem(TOMOS_ELIMINADOS_KEY);
    return data ? JSON.parse(data) : [];
}

function guardarTomosEliminados(lista) {
    localStorage.setItem(TOMOS_ELIMINADOS_KEY, JSON.stringify(lista));
}

function obtenerTomosAgregados() {
    const data = localStorage.getItem(TOMOS_AGREGADOS_KEY);
    return data ? JSON.parse(data) : [];
}

function guardarTomosAgregados(lista) {
    localStorage.setItem(TOMOS_AGREGADOS_KEY, JSON.stringify(lista));
}

function obtenerStockOverrides() {
    const data = localStorage.getItem(STOCK_OVERRIDES_KEY);
    return data ? JSON.parse(data) : {};
}

function guardarStockOverrides(obj) {
    localStorage.setItem(STOCK_OVERRIDES_KEY, JSON.stringify(obj));
}

function obtenerPrecioOverrides() {
    const data = localStorage.getItem(PRECIO_OVERRIDES_KEY);
    return data ? JSON.parse(data) : {};
}

function guardarPrecioOverrides(obj) {
    localStorage.setItem(PRECIO_OVERRIDES_KEY, JSON.stringify(obj));
}

/**
 * Arma el array de volúmenes "real" de un manga de la BASE FIJA, aplicando
 * los tomos eliminados, los tomos agregados y los cambios de stock que
 * haya hecho el admin (todo guardado en localStorage, ya que el array
 * original de datos-mangas.js no se puede tocar de verdad).
 */
function construirVolumenesBase(manga) {
    const tomosElim = obtenerTomosEliminados()
        .filter(t => t.mangaId === manga.id)
        .map(t => t.tomo);

    const stockOverrides = obtenerStockOverrides();
    const precioOverrides = obtenerPrecioOverrides();

    const volumenesOriginales = manga.volumenes
        .filter(v => !tomosElim.includes(v.tomo))
        .map(v => {
            const clave = `${manga.id}-${v.tomo}`;
            const stock = stockOverrides.hasOwnProperty(clave) ? stockOverrides[clave] : v.stock;
            const precio = precioOverrides.hasOwnProperty(clave) ? precioOverrides[clave] : v.precio;
            return { ...v, stock, precio };
        });

    const tomosExtra = obtenerTomosAgregados()
        .filter(t => t.mangaId === manga.id)
        .map(t => ({ tomo: t.tomo, precio: t.precio, stock: t.stock, img: t.img }));

    return volumenesOriginales.concat(tomosExtra);
}

/**
 * Catálogo real a usar en toda la tienda: la base fija (con sus tomos ya
 * editados por el admin), menos los mangas eliminados, más los mangas
 * agregados por el admin.
 */
function obtenerCatalogoCompleto() {
    const eliminados = obtenerMangasEliminados();
    const base = baseDatosMangas
        .filter(m => !eliminados.includes(m.id))
        .map(m => ({ ...m, volumenes: construirVolumenesBase(m) }));
    const agregados = obtenerMangasAgregados();
    return base.concat(agregados);
}

/**
 * Todo lo que está en la papelera (eliminado, pero recuperable): tanto
 * mangas de la base fija como mangas que el propio admin había agregado.
 */
function obtenerPapelera() {
    const idsEliminadosBase = obtenerMangasEliminados();
    const eliminadosBase = baseDatosMangas.filter(m => idsEliminadosBase.includes(m.id));
    const eliminadosAgregados = obtenerMangasAgregadosEliminados();
    return eliminadosBase.concat(eliminadosAgregados);
}

/**
 * Genera un id nuevo que nunca choca con uno ya usado (ni siquiera con uno
 * que esté en la papelera), para que no se repitan ids si borra y agrega
 * varias veces.
 */
function generarNuevoIdManga() {
    const idsBase = baseDatosMangas.map(m => m.id);
    const idsAgregados = obtenerMangasAgregados().map(m => m.id);
    const idsAgregadosEliminados = obtenerMangasAgregadosEliminados().map(m => m.id);
    return Math.max(0, ...idsBase, ...idsAgregados, ...idsAgregadosEliminados) + 1;
}

/**
 * Agrega un manga nuevo (versión básica: 1 solo tomo).
 * @param {Object} datos - { titulo, genero, sinopsis, imgPortada, precio, stock }
 * @returns {Object} el manga creado, ya con su id.
 */
function agregarManga(datos) {
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

    const agregados = obtenerMangasAgregados();
    agregados.push(nuevoManga);
    guardarMangasAgregados(agregados);

    return nuevoManga;
}

/**
 * Manda un manga a la papelera (NO lo borra para siempre, se puede
 * recuperar después con restaurarManga). Funciona tanto para mangas de la
 * base fija como para los que el admin agregó.
 */
function eliminarManga(id) {
    // Si es un manga agregado por el admin, se saca de "agregados" y se
    // guarda completo en su propia papelera (para poder restaurarlo tal cual).
    let agregados = obtenerMangasAgregados();
    const mangaAgregado = agregados.find(m => m.id === id);
    if (mangaAgregado) {
        agregados = agregados.filter(m => m.id !== id);
        guardarMangasAgregados(agregados);

        const papeleraAgregados = obtenerMangasAgregadosEliminados();
        papeleraAgregados.push(mangaAgregado);
        guardarMangasAgregadosEliminados(papeleraAgregados);
        return;
    }

    // Si es de la base fija, se marca como eliminado (no se puede borrar
    // del código, así que se recuerda su id para excluirlo del catálogo).
    const eliminados = obtenerMangasEliminados();
    if (!eliminados.includes(id)) {
        eliminados.push(id);
        guardarMangasEliminados(eliminados);
    }
}

/**
 * Devuelve un manga desde la papelera al catálogo activo.
 */
function restaurarManga(id) {
    // Caso 1: era de la base fija, solo hay que sacarlo de "eliminados".
    let eliminados = obtenerMangasEliminados();
    if (eliminados.includes(id)) {
        eliminados = eliminados.filter(idEliminado => idEliminado !== id);
        guardarMangasEliminados(eliminados);
        return;
    }

    // Caso 2: era un manga agregado por el admin, se devuelve a "agregados".
    let papeleraAgregados = obtenerMangasAgregadosEliminados();
    const mangaRecuperado = papeleraAgregados.find(m => m.id === id);
    if (mangaRecuperado) {
        papeleraAgregados = papeleraAgregados.filter(m => m.id !== id);
        guardarMangasAgregadosEliminados(papeleraAgregados);

        const agregados = obtenerMangasAgregados();
        agregados.push(mangaRecuperado);
        guardarMangasAgregados(agregados);
    }
}

/**
 * Calcula el próximo número de tomo libre para un manga (no choca con
 * ninguno que ya tenga, sea original o agregado).
 */
function generarNuevoTomo(mangaId) {
    const manga = obtenerCatalogoCompleto().find(m => m.id === mangaId);
    const tomos = manga ? manga.volumenes.map(v => v.tomo) : [];
    return Math.max(0, ...tomos) + 1;
}

/**
 * Agrega un tomo nuevo a un manga que ya existe (sea de la base fija o uno
 * que el admin haya agregado).
 * @param {number} mangaId
 * @param {Object} datos - { precio, stock, img }
 */
function agregarTomo(mangaId, datos) {
    const nuevoTomo = generarNuevoTomo(mangaId);

    // Si el manga es uno que el admin agregó, se edita directo su array.
    const agregados = obtenerMangasAgregados();
    const mangaAgregado = agregados.find(m => m.id === mangaId);
    if (mangaAgregado) {
        mangaAgregado.volumenes.push({ tomo: nuevoTomo, precio: datos.precio, stock: datos.stock, img: datos.img });
        guardarMangasAgregados(agregados);
        return;
    }

    // Si es un manga de la base fija, el tomo nuevo se guarda aparte.
    const tomosAgregados = obtenerTomosAgregados();
    tomosAgregados.push({ mangaId, tomo: nuevoTomo, precio: datos.precio, stock: datos.stock, img: datos.img });
    guardarTomosAgregados(tomosAgregados);
}

/**
 * Elimina un tomo específico de un manga (no todo el manga).
 * A diferencia de eliminarManga, esto SÍ es permanente (no hay papelera de
 * tomos): si te equivocas, vuelve a agregarlo con "Agregar tomo".
 */
function eliminarTomo(mangaId, tomo) {
    // Caso 1: es un tomo que el admin le había agregado a un manga BASE.
    let tomosAgregados = obtenerTomosAgregados();
    const eraTomoAgregadoDeBase = tomosAgregados.some(t => t.mangaId === mangaId && t.tomo === tomo);
    if (eraTomoAgregadoDeBase) {
        tomosAgregados = tomosAgregados.filter(t => !(t.mangaId === mangaId && t.tomo === tomo));
        guardarTomosAgregados(tomosAgregados);
        return;
    }

    // Caso 2: el manga completo es uno que el admin agregó, se edita directo.
    const agregados = obtenerMangasAgregados();
    const mangaAgregado = agregados.find(m => m.id === mangaId);
    if (mangaAgregado) {
        mangaAgregado.volumenes = mangaAgregado.volumenes.filter(v => v.tomo !== tomo);
        guardarMangasAgregados(agregados);
        return;
    }

    // Caso 3: es un tomo original de un manga de la base fija.
    const tomosEliminados = obtenerTomosEliminados();
    if (!tomosEliminados.some(t => t.mangaId === mangaId && t.tomo === tomo)) {
        tomosEliminados.push({ mangaId, tomo });
        guardarTomosEliminados(tomosEliminados);
    }
}

/**
 * Cambia el stock de un tomo puntual (sirve tanto para sumar como para
 * restar unidades: solo mandas el nuevo valor final).
 */
function cambiarStockTomo(mangaId, tomo, nuevoStock) {
    // Caso 1: el manga completo es uno que el admin agregó.
    const agregados = obtenerMangasAgregados();
    const mangaAgregado = agregados.find(m => m.id === mangaId);
    if (mangaAgregado) {
        const vol = mangaAgregado.volumenes.find(v => v.tomo === tomo);
        if (vol) {
            vol.stock = nuevoStock;
            guardarMangasAgregados(agregados);
        }
        return;
    }

    // Caso 2: es un tomo que el admin le había agregado a un manga base.
    const tomosAgregados = obtenerTomosAgregados();
    const tomoAgregado = tomosAgregados.find(t => t.mangaId === mangaId && t.tomo === tomo);
    if (tomoAgregado) {
        tomoAgregado.stock = nuevoStock;
        guardarTomosAgregados(tomosAgregados);
        return;
    }

    // Caso 3: es un tomo original de un manga de la base fija.
    const overrides = obtenerStockOverrides();
    overrides[`${mangaId}-${tomo}`] = nuevoStock;
    guardarStockOverrides(overrides);
}

/**
 * Cambia el precio de un tomo puntual. Mismo patrón que cambiarStockTomo.
 */
function cambiarPrecioTomo(mangaId, tomo, nuevoPrecio) {
    // Caso 1: el manga completo es uno que el admin agregó.
    const agregados = obtenerMangasAgregados();
    const mangaAgregado = agregados.find(m => m.id === mangaId);
    if (mangaAgregado) {
        const vol = mangaAgregado.volumenes.find(v => v.tomo === tomo);
        if (vol) {
            vol.precio = nuevoPrecio;
            guardarMangasAgregados(agregados);
        }
        return;
    }

    // Caso 2: es un tomo que el admin le había agregado a un manga base.
    const tomosAgregados = obtenerTomosAgregados();
    const tomoAgregado = tomosAgregados.find(t => t.mangaId === mangaId && t.tomo === tomo);
    if (tomoAgregado) {
        tomoAgregado.precio = nuevoPrecio;
        guardarTomosAgregados(tomosAgregados);
        return;
    }

    // Caso 3: es un tomo original de un manga de la base fija.
    const overrides = obtenerPrecioOverrides();
    overrides[`${mangaId}-${tomo}`] = nuevoPrecio;
    guardarPrecioOverrides(overrides);
}

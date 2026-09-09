// =========================================================================
// carrito.js — MOTOR DEL CARRITO DE COMPRAS (genérico, no depende de mangas)
// =========================================================================
// Se guarda en localStorage (a diferencia de los usuarios registrados, que
// usan sessionStorage) para que sobreviva entre pestañas, recargas y cierres
// del navegador.
//
// Cárgalo en TODA página que tenga el ícono/contador del carrito en la
// navbar: Mangas.html, carrito.html, Inicio tienda.html, etc.
//
// Requiere que exista una variable global "baseDatosMangas" (la define
// datos-mangas.js) SOLO para poder validar el stock disponible al agregar o
// cambiar cantidades — si datos-mangas.js no está cargado, igual funciona,
// simplemente no limita por stock (obtenerVolumen devuelve null).
// Cuando agregues Figuras u otra categoría con su propio archivo de datos,
// este mismo motor les sirve tal cual: solo cambia qué "item" le pasas a
// agregarAlCarrito({ mangaId, titulo, tomo, precio, img }) — el nombre de
// los campos es heredado de mangas, pero no le importa el origen del dato.

const CARRITO_KEY = "carritoAnimate";

/**
 * Formatea números como precio chileno: 8990 -> "$8.990"
 * (Antes estaba duplicada en catalogo.js y carrito.js; queda una sola vez.)
 */
function formatearPrecio(valor) {
    return "$" + valor.toLocaleString("es-CL");
}

/**
 * Devuelve el array del carrito guardado en localStorage.
 * Si no existe nada guardado, devuelve un array vacío.
 */
function obtenerCarrito() {
    const data = localStorage.getItem(CARRITO_KEY);
    return data ? JSON.parse(data) : [];
}

/**
 * Guarda el array del carrito completo en localStorage y refresca
 * el contador del ícono del carrito en la navbar (si existe en la página).
 */
function guardarCarrito(carrito) {
    localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito));
    actualizarContadorCarrito();
}

/**
 * Busca el volumen (tomo) real en baseDatosMangas para saber su stock.
 * Se usa para no dejar agregar/incrementar más unidades de las disponibles.
 */
function obtenerVolumen(mangaId, tomo) {
    // Si existe datos-productos.js, usamos el catálogo completo (base + lo que
    // haya agregado/eliminado el admin). Si no, caemos a baseDatosMangas tal cual.
    let catalogo;
    if (typeof obtenerCatalogoCompleto === "function") {
        catalogo = obtenerCatalogoCompleto();
    } else if (typeof baseDatosMangas !== "undefined") {
        catalogo = baseDatosMangas;
    } else {
        return null; // datos-mangas.js no está cargado en esta página
    }

    const manga = catalogo.find(m => m.id === mangaId);
    if (!manga) return null;
    return manga.volumenes.find(v => v.tomo === tomo) || null;
}

/**
 * Agrega un tomo al carrito. Si el mismo manga+tomo ya está en el carrito,
 * suma 1 a la cantidad en vez de duplicar la fila, sin superar nunca el
 * stock real definido en baseDatosMangas.
 *
 * @param {Object} item - { mangaId, titulo, tomo, precio, img }
 * @returns {boolean} true si se agregó/incrementó, false si no hay stock.
 */
function agregarAlCarrito(item) {
    const volumen = obtenerVolumen(item.mangaId, item.tomo);
    const stockDisponible = volumen ? volumen.stock : Infinity;

    const carrito = obtenerCarrito();
    const existente = carrito.find(
        p => p.mangaId === item.mangaId && p.tomo === item.tomo
    );

    if (existente) {
        if (existente.cantidad >= stockDisponible) {
            alert(`Ya tienes en el carrito todo el stock disponible (${stockDisponible} u.) de este tomo.`);
            return false;
        }
        existente.cantidad += 1;
    } else {
        if (stockDisponible <= 0) {
            alert("Este tomo no tiene stock disponible.");
            return false;
        }
        carrito.push({ ...item, cantidad: 1 });
    }

    guardarCarrito(carrito);
    return true;
}

/**
 * Elimina por completo un producto del carrito (sin importar la cantidad).
 */
function eliminarDelCarrito(mangaId, tomo) {
    let carrito = obtenerCarrito();
    carrito = carrito.filter(p => !(p.mangaId === mangaId && p.tomo === tomo));
    guardarCarrito(carrito);
    return carrito;
}

/**
 * Cambia la cantidad de un producto. Si queda en 0 o menos, lo elimina.
 * Nunca deja superar el stock real disponible.
 */
function cambiarCantidad(mangaId, tomo, delta) {
    const carrito = obtenerCarrito();
    const item = carrito.find(p => p.mangaId === mangaId && p.tomo === tomo);
    if (!item) return carrito;

    const volumen = obtenerVolumen(mangaId, tomo);
    const stockDisponible = volumen ? volumen.stock : Infinity;
    const nuevaCantidad = item.cantidad + delta;

    if (nuevaCantidad <= 0) {
        return eliminarDelCarrito(mangaId, tomo);
    }

    if (nuevaCantidad > stockDisponible) {
        alert(`Solo hay ${stockDisponible} u. disponibles de este tomo.`);
        return carrito;
    }

    item.cantidad = nuevaCantidad;
    guardarCarrito(carrito);
    return carrito;
}

/**
 * Calcula el total en $ del carrito completo.
 */
function calcularTotalCarrito() {
    const carrito = obtenerCarrito();
    return carrito.reduce((total, item) => total + item.precio * item.cantidad, 0);
}

/**
 * Devuelve cuántos productos (sumando cantidades) hay en el carrito.
 */
function contarItemsCarrito() {
    const carrito = obtenerCarrito();
    return carrito.reduce((total, item) => total + item.cantidad, 0);
}

/**
 * Actualiza el contador del ícono del carrito en la navbar.
 * Requiere un elemento con id="contador-carrito", ej:
 * <a href="carrito.html">Carrito <span id="contador-carrito">0</span></a>
 * No hace nada si la página actual no tiene ese elemento.
 */
function actualizarContadorCarrito() {
    const contador = document.getElementById("contador-carrito");
    if (contador) {
        contador.textContent = contarItemsCarrito();
    }
}



// =========================================================================
// INICIALIZACIÓN (corre en cualquier página que cargue este archivo)
// =========================================================================
document.addEventListener("DOMContentLoaded", () => {
    actualizarContadorCarrito();
});

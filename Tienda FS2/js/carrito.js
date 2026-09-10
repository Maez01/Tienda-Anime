// =========================================================================
// carrito.js — MOTOR DEL CARRITO DE COMPRAS
// =========================================================================

const CARRITO_KEY = "carritoAnimate";

/**
 * Formatea números como precio chileno: 8990 -> "$8.990"
 */
function formatearPrecio(valor) {
    return "$" + valor.toLocaleString("es-CL");
}

/**
 * Devuelve el array del carrito guardado en localStorage.
 */
function obtenerCarrito() {
    const data = localStorage.getItem(CARRITO_KEY);
    return data ? JSON.parse(data) : [];
}

/**
 * Guarda el array del carrito completo en localStorage y refresca
 */
function guardarCarrito(carrito) {
    localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito));
    actualizarContadorCarrito();
}

/**
 * Busca el tomo real en baseDatosMangas para saber su stock.
 * Se usa para no dejar agregar/incrementar más unidades de las disponibles.
 */
function obtenerVolumen(mangaId, tomo) {
    let catalogo;
    if (typeof obtenerCatalogoCompleto === "function") {
        catalogo = obtenerCatalogoCompleto();
    } else if (typeof baseDatosMangas !== "undefined") {
        catalogo = baseDatosMangas;
    } else {
        return null;
    }

    const manga = catalogo.find(m => m.id === mangaId);
    if (!manga) return null;
    return manga.volumenes.find(v => v.tomo === tomo) || null;
}

/**
 * Agrega un tomo al carrito. Si el mismo manga+tomo ya está en el carrito,
 * suma 1 a la cantidad en vez de duplicar la fila, sin superar nunca el
 * stock real definido en baseDatosMangas.
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
            alert("No quedan más unidades de este tomo.");
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
 * Elimina por completo un producto del carrito o más que eliminar crea el carrito de nuevo sin ese producto.
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
        alert("No quedan más unidades de este tomo.");
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
 * Devuelve cuántos productos hay en el carrito.
 */
function contarItemsCarrito() {
    const carrito = obtenerCarrito();
    return carrito.reduce((total, item) => total + item.cantidad, 0);
}

/**
 * Actualiza el contador del ícono del carrito en la navbar.
 */
function actualizarContadorCarrito() {
    const contador = document.getElementById("contador-carrito");
    if (contador) {
        contador.textContent = contarItemsCarrito();
    }
}

// =========================================================================
// INICIALIZACIÓN
// =========================================================================
document.addEventListener("DOMContentLoaded", () => {
    actualizarContadorCarrito();
});

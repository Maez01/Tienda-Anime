// =========================================================================
// pagina-carrito.js — SOLO PARA carrito.html
// =========================================================================


function renderizarCarrito() {
    const contenedor = document.getElementById("Lista-carrito");
    if (!contenedor) return; // No estamos en carrito.html

    const carrito = obtenerCarrito();
    contenedor.innerHTML = "";

    if (carrito.length === 0) {
        contenedor.innerHTML = `<p class="text-center opacity-75">Tu carrito está vacío.</p>`;
        actualizarTotal();
        return;
    }

    carrito.forEach(item => {
        const fila = document.createElement("div");
        fila.className = "d-flex align-items-center gap-3 border-bottom border-secondary py-3";

        fila.innerHTML = `
            <img src="${item.img}" alt="${item.titulo}" style="width:60px;height:84px;object-fit:cover;border-radius:6px;">
            <div class="flex-grow-1">
                <p class="mb-1 fw-bold">${item.titulo} - Tomo ${item.tomo}</p>
                <p class="mb-1 opacity-75">${formatearPrecio(item.precio)} c/u</p>
                <div class="d-flex align-items-center gap-2">
                    <button class="btn btn-outline-secondary fw-bold btn-restar" style="width:34px;height:34px;padding:0;line-height:1;" data-manga-id="${item.mangaId}" data-tomo="${item.tomo}">−</button>
                    <span class="fw-bold fs-5 mx-1">${item.cantidad}</span>
                    <button class="btn btn-outline-secondary fw-bold btn-sumar" style="width:34px;height:34px;padding:0;line-height:1;" data-manga-id="${item.mangaId}" data-tomo="${item.tomo}">+</button>
                </div>
            </div>
            <div class="text-end">
                <p class="fw-bold mb-2">${formatearPrecio(item.precio * item.cantidad)}</p>
                <button class="btn btn-sm btn-outline-danger btn-eliminar" data-manga-id="${item.mangaId}" data-tomo="${item.tomo}">
                    Eliminar
                </button>
            </div>
        `;

        contenedor.appendChild(fila);
    });

    conectarBotonesCarrito();
    actualizarTotal();
}

function conectarBotonesCarrito() {
    document.querySelectorAll(".btn-sumar").forEach(btn => {
        btn.addEventListener("click", () => {
            cambiarCantidad(parseInt(btn.dataset.mangaId, 10), parseInt(btn.dataset.tomo, 10), 1);
            renderizarCarrito();
        });
    });

    document.querySelectorAll(".btn-restar").forEach(btn => {
        btn.addEventListener("click", () => {
            cambiarCantidad(parseInt(btn.dataset.mangaId, 10), parseInt(btn.dataset.tomo, 10), -1);
            renderizarCarrito();
        });
    });

    document.querySelectorAll(".btn-eliminar").forEach(btn => {
        btn.addEventListener("click", () => {
            eliminarDelCarrito(parseInt(btn.dataset.mangaId, 10), parseInt(btn.dataset.tomo, 10));
            renderizarCarrito();
        });
    });
}

function actualizarTotal() {
    const totalEl = document.getElementById("total");
    if (totalEl) totalEl.textContent = calcularTotalCarrito().toLocaleString("es-CL");
}

function conectarFinalizarCompra() {
    const btnFinalizar = document.getElementById("btn-finalizar-compra");
    if (!btnFinalizar) return;

    btnFinalizar.addEventListener("click", () => {
        const carrito = obtenerCarrito();
        if (carrito.length === 0) {
            alert("Tu carrito está vacío.");
            return;
        }

        alert("¡Gracias por tu compra! Total: " + formatearPrecio(calcularTotalCarrito()));
        guardarCarrito([]); // vacía el carrito
        renderizarCarrito();
    });
}


// =========================================================================

// =========================================================================
// INICIALIZACIÓN (carrito.html)
// =========================================================================
document.addEventListener("DOMContentLoaded", () => {
    renderizarCarrito();
    conectarFinalizarCompra();
});

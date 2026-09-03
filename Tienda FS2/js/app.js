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

// Wrappers de compatibilidad, por si el HTML aún llama a las funciones
// individuales (abrirImagen1(), cerrarImagen2(), etc.). Si actualizas
// los onclick en el HTML a abrirImagen(1), abrirImagen(2)..., puedes
// borrar este bloque completo.
function abrirImagen1() { abrirImagen(1); }
function cerrarImagen1() { cerrarImagen(1); }
function abrirImagen2() { abrirImagen(2); }
function cerrarImagen2() { cerrarImagen(2); }
function abrirImagen3() { abrirImagen(3); }
function cerrarImagen3() { cerrarImagen(3); }


// =========================================================================
// MÓDULO 2: REGISTRO Y LOGIN DE USUARIOS
// =========================================================================

// ---------- Usuarios base (Admins fijos) ----------
const usuariosBase = [
    { nombre: "Ana", apellido: "Gonzales", correo: "ana@email.com", contrasenia: "admin123", rol: "Admin" },
    { nombre: "Carlos", apellido: "Calderon", correo: "carlos@email.com", contrasenia: "laraña", rol: "Usuario" },
];

// ---------- Usuarios registrados en la pagina (se borran al cerrar la ventana) ----------
const REGISTRADOS_KEY = "usuariosRegistrados";

function cargarUsuariosRegistrados() {
    const guardado = sessionStorage.getItem(REGISTRADOS_KEY);
    return guardado ? JSON.parse(guardado) : [];
}

function guardarUsuariosRegistrados(lista) {
    sessionStorage.setItem(REGISTRADOS_KEY, JSON.stringify(lista));
}

let usuariosRegistrados = cargarUsuariosRegistrados();

// Combina los admins fijos + los registrados en esta sesión
function obtenerTodosUsuarios() {
    return usuariosBase.concat(usuariosRegistrados);
}

// Solo letras y espacios (incluye tildes y ñ)
const soloLetras = /^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]+$/;
// Formato básico de correo
const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---------- Utilidades ----------
function mostrarError(id, mensaje) {
    const el = document.getElementById(id);
    if (el) el.textContent = mensaje;
}

function limpiarErrores(ids) {
    ids.forEach(id => mostrarError(id, ""));
}

// ---------- Registro ----------
function registrarUsuario(event) {
    event.preventDefault();

    const nombre = document.getElementById("nombres").value.trim();
    const apellido = document.getElementById("apellidos").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const contrasenia = document.getElementById("contrasenia").value;

    limpiarErrores(["error-nombres", "error-apellidos", "error-correo", "error-contrasenia"]);

    let esValido = true;
    const todos = obtenerTodosUsuarios();

    // Campos vacíos
    if (nombre === "" || apellido === "" || correo === "" || contrasenia === "") {
        if (nombre === "") mostrarError("error-nombres", "El nombre es obligatorio");
        if (apellido === "") mostrarError("error-apellidos", "El apellido es obligatorio");
        if (correo === "") mostrarError("error-correo", "El correo es obligatorio");
        if (contrasenia === "") mostrarError("error-contrasenia", "La contraseña es obligatoria");
        return;
    }

    // Solo letras en nombre y apellido
    if (!soloLetras.test(nombre)) {
        mostrarError("error-nombres", "El nombre solo debe contener letras");
        esValido = false;
    }
    if (!soloLetras.test(apellido)) {
        mostrarError("error-apellidos", "El apellido solo debe contener letras");
        esValido = false;
    }

    // Formato de correo válido
    if (!formatoCorreo.test(correo)) {
        mostrarError("error-correo", "Ingrese un correo válido");
        esValido = false;
    }

    // No repetidos (comparando en minúsculas, contra TODOS: base + registrados)
    const nombreRepetido = todos.some(u => u.nombre.toLowerCase() === nombre.toLowerCase());
    const apellidoRepetido = todos.some(u => u.apellido.toLowerCase() === apellido.toLowerCase());
    const correoRepetido = todos.some(u => u.correo.toLowerCase() === correo.toLowerCase());

    if (nombreRepetido) {
        mostrarError("error-nombres", "Ese nombre ya está registrado");
        esValido = false;
    }
    if (apellidoRepetido) {
        mostrarError("error-apellidos", "Ese apellido ya está registrado");
        esValido = false;
    }
    if (correoRepetido) {
        mostrarError("error-correo", "Ese correo ya está registrado");
        esValido = false;
    }

    if (!esValido) return;

    // Se guarda SIEMPRE con rol "Usuario", nunca "Admin"
    usuariosRegistrados.push({ nombre, apellido, correo, contrasenia, rol: "Usuario" });
    guardarUsuariosRegistrados(usuariosRegistrados);

    alert("Usuario registrado con éxito");
    window.location.href = "inicio_sesion.html";
}

// ---------- Inicio de sesión ----------
function iniciarSesion(event) {
    event.preventDefault();

    const correo = document.getElementById("correo").value.trim();
    const contrasenia = document.getElementById("contrasenia").value;

    limpiarErrores(["error-correo", "error-contrasenia", "error-login"]);

    if (correo === "" || contrasenia === "") {
        mostrarError("error-login", "Complete correo y contraseña");
        return;
    }

    const todos = obtenerTodosUsuarios();
    const usuario = todos.find(
        u => u.correo.toLowerCase() === correo.toLowerCase() && u.contrasenia === contrasenia
    );

    if (!usuario) {
        mostrarError("error-login", "Correo o contraseña incorrectos");
        return;
    }

    redirigirSegunRol(usuario);
}

// ---------- Redirección según el rol ----------
function redirigirSegunRol(usuario) {
    if (usuario.rol === "Admin") {

        // Reemplazar "link_pagina.html" por la página real
        window.location.href = "link_pagina.html";

    } else if (usuario.rol === "Usuario") {
        // Reemplazar "link_pagina.html" por la página real
        window.location.href = "link_pagina.html";
    }
}

// ---------- Conexión de eventos ----------
const formRegistro = document.getElementById("formRegistro");
if (formRegistro) {
    formRegistro.addEventListener("submit", registrarUsuario);
}

const formLogin = document.getElementById("formLogin");
if (formLogin) {
    formLogin.addEventListener("submit", iniciarSesion);
}


// =========================================================================
// MÓDULO 3: BASE DE DATOS SIMULADA DE MANGAS (Para la Página Mangas.html)
// =========================================================================

// Estructura escalable ideal para migrar a React en la entrega 2
const baseDatosMangas = [
    {
        id: 1,
        titulo: "Manga 1",
        genero: "shonen",
        vistas: 10976,
        fechaAgregado: "2026-01-05",
        sinopsis: "Sinopsis pendiente para Manga 1. Reemplaza este texto con la descripción real de la serie.",
        imgPortada: "https://via.placeholder.com/300x420/1f1f1f/ffffff?text=Manga+1",
        volumenes: [
            { tomo: 1, precio: 8990, stock: 8, img: "https://via.placeholder.com/200x280/333?text=Manga+1+Vol+1" },
            { tomo: 2, precio: 10990, stock: 0, img: "https://via.placeholder.com/200x280/333?text=Manga+1+Vol+2" }
        ]
    },
    {
        id: 2,
        titulo: "Manga 2",
        genero: "seinen",
        vistas: 4157,
        fechaAgregado: "2026-01-22",
        sinopsis: "Sinopsis pendiente para Manga 2. Reemplaza este texto con la descripción real de la serie.",
        imgPortada: "https://via.placeholder.com/300x420/1f1f1f/ffffff?text=Manga+2",
        volumenes: [
            { tomo: 1, precio: 8990, stock: 8, img: "https://via.placeholder.com/200x280/333?text=Manga+2+Vol+1" },
            { tomo: 2, precio: 15990, stock: 0, img: "https://via.placeholder.com/200x280/333?text=Manga+2+Vol+2" },
            { tomo: 3, precio: 15990, stock: 3, img: "https://via.placeholder.com/200x280/333?text=Manga+2+Vol+3" }
        ]
    },
    {
        id: 3,
        titulo: "Manga 3",
        genero: "shojo",
        vistas: 1020,
        fechaAgregado: "2026-02-10",
        sinopsis: "Sinopsis pendiente para Manga 3. Reemplaza este texto con la descripción real de la serie.",
        imgPortada: "https://via.placeholder.com/300x420/1f1f1f/ffffff?text=Manga+3",
        volumenes: [
            { tomo: 1, precio: 8990, stock: 0, img: "https://via.placeholder.com/200x280/333?text=Manga+3+Vol+1" },
            { tomo: 2, precio: 9990, stock: 5, img: "https://via.placeholder.com/200x280/333?text=Manga+3+Vol+2" }
        ]
    },
    {
        id: 4,
        titulo: "Manga 4",
        genero: "josei",
        vistas: 10363,
        fechaAgregado: "2026-02-28",
        sinopsis: "Sinopsis pendiente para Manga 4. Reemplaza este texto con la descripción real de la serie.",
        imgPortada: "https://via.placeholder.com/300x420/1f1f1f/ffffff?text=Manga+4",
        volumenes: [
            { tomo: 1, precio: 15990, stock: 0, img: "https://via.placeholder.com/200x280/333?text=Manga+4+Vol+1" },
            { tomo: 2, precio: 15990, stock: 3, img: "https://via.placeholder.com/200x280/333?text=Manga+4+Vol+2" }
        ]
    },
    {
        id: 5,
        titulo: "Manga 5",
        genero: "isekai",
        vistas: 4111,
        fechaAgregado: "2026-03-14",
        sinopsis: "Sinopsis pendiente para Manga 5. Reemplaza este texto con la descripción real de la serie.",
        imgPortada: "https://via.placeholder.com/300x420/1f1f1f/ffffff?text=Manga+5",
        volumenes: [
            { tomo: 1, precio: 15990, stock: 2, img: "https://via.placeholder.com/200x280/333?text=Manga+5+Vol+1" },
            { tomo: 2, precio: 8990, stock: 10, img: "https://via.placeholder.com/200x280/333?text=Manga+5+Vol+2" },
            { tomo: 3, precio: 9990, stock: 8, img: "https://via.placeholder.com/200x280/333?text=Manga+5+Vol+3" },
            { tomo: 4, precio: 12990, stock: 2, img: "https://via.placeholder.com/200x280/333?text=Manga+5+Vol+4" }
        ]
    },
    {
        id: 6,
        titulo: "Manga 6",
        genero: "kodomo",
        vistas: 5052,
        fechaAgregado: "2026-03-30",
        sinopsis: "Sinopsis pendiente para Manga 6. Reemplaza este texto con la descripción real de la serie.",
        imgPortada: "https://via.placeholder.com/300x420/1f1f1f/ffffff?text=Manga+6",
        volumenes: [
            { tomo: 1, precio: 9990, stock: 10, img: "https://via.placeholder.com/200x280/333?text=Manga+6+Vol+1" },
            { tomo: 2, precio: 10990, stock: 0, img: "https://via.placeholder.com/200x280/333?text=Manga+6+Vol+2" },
            { tomo: 3, precio: 8990, stock: 3, img: "https://via.placeholder.com/200x280/333?text=Manga+6+Vol+3" }
        ]
    },
    {
        id: 7,
        titulo: "Manga 7",
        genero: "shonen",
        vistas: 2084,
        fechaAgregado: "2026-04-11",
        sinopsis: "Sinopsis pendiente para Manga 7. Reemplaza este texto con la descripción real de la serie.",
        imgPortada: "https://via.placeholder.com/300x420/1f1f1f/ffffff?text=Manga+7",
        volumenes: [
            { tomo: 1, precio: 10990, stock: 5, img: "https://via.placeholder.com/200x280/333?text=Manga+7+Vol+1" },
            { tomo: 2, precio: 10990, stock: 10, img: "https://via.placeholder.com/200x280/333?text=Manga+7+Vol+2" },
            { tomo: 3, precio: 8990, stock: 8, img: "https://via.placeholder.com/200x280/333?text=Manga+7+Vol+3" }
        ]
    },
    {
        id: 8,
        titulo: "Manga 8",
        genero: "seinen",
        vistas: 8027,
        fechaAgregado: "2026-04-25",
        sinopsis: "Sinopsis pendiente para Manga 8. Reemplaza este texto con la descripción real de la serie.",
        imgPortada: "https://via.placeholder.com/300x420/1f1f1f/ffffff?text=Manga+8",
        volumenes: [
            { tomo: 1, precio: 12990, stock: 0, img: "https://via.placeholder.com/200x280/333?text=Manga+8+Vol+1" },
            { tomo: 2, precio: 15990, stock: 2, img: "https://via.placeholder.com/200x280/333?text=Manga+8+Vol+2" }
        ]
    },
    {
        id: 9,
        titulo: "Manga 9",
        genero: "shojo",
        vistas: 10799,
        fechaAgregado: "2026-05-08",
        sinopsis: "Sinopsis pendiente para Manga 9. Reemplaza este texto con la descripción real de la serie.",
        imgPortada: "https://via.placeholder.com/300x420/1f1f1f/ffffff?text=Manga+9",
        volumenes: [
            { tomo: 1, precio: 15990, stock: 0, img: "https://via.placeholder.com/200x280/333?text=Manga+9+Vol+1" },
            { tomo: 2, precio: 8990, stock: 0, img: "https://via.placeholder.com/200x280/333?text=Manga+9+Vol+2" },
            { tomo: 3, precio: 9990, stock: 10, img: "https://via.placeholder.com/200x280/333?text=Manga+9+Vol+3" }
        ]
    },
    {
        id: 10,
        titulo: "Manga 10",
        genero: "josei",
        vistas: 5241,
        fechaAgregado: "2026-05-19",
        sinopsis: "Sinopsis pendiente para Manga 10. Reemplaza este texto con la descripción real de la serie.",
        imgPortada: "https://via.placeholder.com/300x420/1f1f1f/ffffff?text=Manga+10",
        volumenes: [
            { tomo: 1, precio: 9990, stock: 10, img: "https://via.placeholder.com/200x280/333?text=Manga+10+Vol+1" },
            { tomo: 2, precio: 8990, stock: 3, img: "https://via.placeholder.com/200x280/333?text=Manga+10+Vol+2" }
        ]
    },
    {
        id: 11,
        titulo: "Manga 11",
        genero: "isekai",
        vistas: 5054,
        fechaAgregado: "2026-06-02",
        sinopsis: "Sinopsis pendiente para Manga 11. Reemplaza este texto con la descripción real de la serie.",
        imgPortada: "https://via.placeholder.com/300x420/1f1f1f/ffffff?text=Manga+11",
        volumenes: [
            { tomo: 1, precio: 10990, stock: 0, img: "https://via.placeholder.com/200x280/333?text=Manga+11+Vol+1" },
            { tomo: 2, precio: 10990, stock: 2, img: "https://via.placeholder.com/200x280/333?text=Manga+11+Vol+2" },
            { tomo: 3, precio: 9990, stock: 8, img: "https://via.placeholder.com/200x280/333?text=Manga+11+Vol+3" },
            { tomo: 4, precio: 10990, stock: 8, img: "https://via.placeholder.com/200x280/333?text=Manga+11+Vol+4" }
        ]
    },
    {
        id: 12,
        titulo: "Manga 12",
        genero: "kodomo",
        vistas: 11699,
        fechaAgregado: "2026-06-17",
        sinopsis: "Sinopsis pendiente para Manga 12. Reemplaza este texto con la descripción real de la serie.",
        imgPortada: "https://via.placeholder.com/300x420/1f1f1f/ffffff?text=Manga+12",
        volumenes: [
            { tomo: 1, precio: 15990, stock: 8, img: "https://via.placeholder.com/200x280/333?text=Manga+12+Vol+1" },
            { tomo: 2, precio: 9990, stock: 5, img: "https://via.placeholder.com/200x280/333?text=Manga+12+Vol+2" }
        ]
    },
    {
        id: 13,
        titulo: "Manga 13",
        genero: "shonen",
        vistas: 4510,
        fechaAgregado: "2026-07-01",
        sinopsis: "Sinopsis pendiente para Manga 13. Reemplaza este texto con la descripción real de la serie.",
        imgPortada: "https://via.placeholder.com/300x420/1f1f1f/ffffff?text=Manga+13",
        volumenes: [
            { tomo: 1, precio: 12990, stock: 3, img: "https://via.placeholder.com/200x280/333?text=Manga+13+Vol+1" },
            { tomo: 2, precio: 10990, stock: 8, img: "https://via.placeholder.com/200x280/333?text=Manga+13+Vol+2" },
            { tomo: 3, precio: 15990, stock: 0, img: "https://via.placeholder.com/200x280/333?text=Manga+13+Vol+3" }
        ]
    },
    {
        id: 14,
        titulo: "Manga 14",
        genero: "seinen",
        vistas: 11716,
        fechaAgregado: "2026-07-14",
        sinopsis: "Sinopsis pendiente para Manga 14. Reemplaza este texto con la descripción real de la serie.",
        imgPortada: "https://via.placeholder.com/300x420/1f1f1f/ffffff?text=Manga+14",
        volumenes: [
            { tomo: 1, precio: 8990, stock: 0, img: "https://via.placeholder.com/200x280/333?text=Manga+14+Vol+1" },
            { tomo: 2, precio: 8990, stock: 10, img: "https://via.placeholder.com/200x280/333?text=Manga+14+Vol+2" },
            { tomo: 3, precio: 10990, stock: 3, img: "https://via.placeholder.com/200x280/333?text=Manga+14+Vol+3" }
        ]
    },
    {
        id: 15,
        titulo: "Manga 15",
        genero: "shojo",
        vistas: 4886,
        fechaAgregado: "2026-07-29",
        sinopsis: "Sinopsis pendiente para Manga 15. Reemplaza este texto con la descripción real de la serie.",
        imgPortada: "https://via.placeholder.com/300x420/1f1f1f/ffffff?text=Manga+15",
        volumenes: [
            { tomo: 1, precio: 9990, stock: 5, img: "https://via.placeholder.com/200x280/333?text=Manga+15+Vol+1" },
            { tomo: 2, precio: 10990, stock: 0, img: "https://via.placeholder.com/200x280/333?text=Manga+15+Vol+2" }
        ]
    },
    {
        id: 16,
        titulo: "Manga 16",
        genero: "josei",
        vistas: 11238,
        fechaAgregado: "2026-08-03",
        sinopsis: "Sinopsis pendiente para Manga 16. Reemplaza este texto con la descripción real de la serie.",
        imgPortada: "https://via.placeholder.com/300x420/1f1f1f/ffffff?text=Manga+16",
        volumenes: [
            { tomo: 1, precio: 12990, stock: 8, img: "https://via.placeholder.com/200x280/333?text=Manga+16+Vol+1" },
            { tomo: 2, precio: 12990, stock: 0, img: "https://via.placeholder.com/200x280/333?text=Manga+16+Vol+2" },
            { tomo: 3, precio: 10990, stock: 0, img: "https://via.placeholder.com/200x280/333?text=Manga+16+Vol+3" },
            { tomo: 4, precio: 9990, stock: 8, img: "https://via.placeholder.com/200x280/333?text=Manga+16+Vol+4" }
        ]
    },
    {
        id: 17,
        titulo: "Manga 17",
        genero: "isekai",
        vistas: 9697,
        fechaAgregado: "2026-08-11",
        sinopsis: "Sinopsis pendiente para Manga 17. Reemplaza este texto con la descripción real de la serie.",
        imgPortada: "https://via.placeholder.com/300x420/1f1f1f/ffffff?text=Manga+17",
        volumenes: [
            { tomo: 1, precio: 15990, stock: 3, img: "https://via.placeholder.com/200x280/333?text=Manga+17+Vol+1" },
            { tomo: 2, precio: 15990, stock: 3, img: "https://via.placeholder.com/200x280/333?text=Manga+17+Vol+2" },
            { tomo: 3, precio: 10990, stock: 0, img: "https://via.placeholder.com/200x280/333?text=Manga+17+Vol+3" }
        ]
    },
    {
        id: 18,
        titulo: "Manga 18",
        genero: "kodomo",
        vistas: 2766,
        fechaAgregado: "2026-08-18",
        sinopsis: "Sinopsis pendiente para Manga 18. Reemplaza este texto con la descripción real de la serie.",
        imgPortada: "https://via.placeholder.com/300x420/1f1f1f/ffffff?text=Manga+18",
        volumenes: [
            { tomo: 1, precio: 8990, stock: 10, img: "https://via.placeholder.com/200x280/333?text=Manga+18+Vol+1" },
            { tomo: 2, precio: 8990, stock: 10, img: "https://via.placeholder.com/200x280/333?text=Manga+18+Vol+2" },
            { tomo: 3, precio: 8990, stock: 0, img: "https://via.placeholder.com/200x280/333?text=Manga+18+Vol+3" },
            { tomo: 4, precio: 9990, stock: 10, img: "https://via.placeholder.com/200x280/333?text=Manga+18+Vol+4" }
        ]
    },
    {
        id: 19,
        titulo: "Manga 19",
        genero: "shonen",
        vistas: 11649,
        fechaAgregado: "2026-08-24",
        sinopsis: "Sinopsis pendiente para Manga 19. Reemplaza este texto con la descripción real de la serie.",
        imgPortada: "https://via.placeholder.com/300x420/1f1f1f/ffffff?text=Manga+19",
        volumenes: [
            { tomo: 1, precio: 15990, stock: 0, img: "https://via.placeholder.com/200x280/333?text=Manga+19+Vol+1" },
            { tomo: 2, precio: 12990, stock: 3, img: "https://via.placeholder.com/200x280/333?text=Manga+19+Vol+2" },
            { tomo: 3, precio: 15990, stock: 3, img: "https://via.placeholder.com/200x280/333?text=Manga+19+Vol+3" },
            { tomo: 4, precio: 15990, stock: 2, img: "https://via.placeholder.com/200x280/333?text=Manga+19+Vol+4" }
        ]
    },
    {
        id: 20,
        titulo: "Manga 20",
        genero: "seinen",
        vistas: 9564,
        fechaAgregado: "2026-08-30",
        sinopsis: "Sinopsis pendiente para Manga 20. Reemplaza este texto con la descripción real de la serie.",
        imgPortada: "https://via.placeholder.com/300x420/1f1f1f/ffffff?text=Manga+20",
        volumenes: [
            { tomo: 1, precio: 8990, stock: 8, img: "https://via.placeholder.com/200x280/333?text=Manga+20+Vol+1" },
            { tomo: 2, precio: 15990, stock: 10, img: "https://via.placeholder.com/200x280/333?text=Manga+20+Vol+2" }
        ]
    }
];


// =========================================================================
// MÓDULO 4: LÓGICA DE CONTROL DEL CATÁLOGO E INTERFAZ DINÁMICA
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
// MÓDULO 5: INICIALIZACIÓN DE EVENTOS
// =========================================================================

// Escuchamos los cambios del usuario solo si estamos en la vista de mangas
if (contenedorMangas) {
    filtroGenero.addEventListener("change", procesarFiltros);
    filtroOrden.addEventListener("change", procesarFiltros);
    buscarManga.addEventListener("input", procesarFiltros);

    // Carga inicial automática del catálogo al abrir la vista
    procesarFiltros();
}

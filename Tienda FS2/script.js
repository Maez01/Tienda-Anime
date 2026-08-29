//imagen 1
function abrirImagen1() {
    document.getElementById("visor1").style.display = "flex";
}
function cerrarImagen1() {
    document.getElementById("visor1").style.display = "none";
}

//imagen 2
function abrirImagen2() {
    document.getElementById("visor2").style.display = "flex";
}
function cerrarImagen2() {
    document.getElementById("visor2").style.display = "none";
}

//imagen 3
function abrirImagen3() {
    document.getElementById("visor3").style.display = "flex";
}
function cerrarImagen3() {
    document.getElementById("visor3").style.display = "none";
}



// Registro y login

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

function mostrarSeccion(nombre, boton) {

    // Obtener todas las secciones
    const secciones = document.querySelectorAll(".seccion");

    // Ocultar todas las secciones
    secciones.forEach(seccion => {
        seccion.classList.remove("activa");
    });

    // Mostrar la sección seleccionada
    const seccionSeleccionada = document.getElementById(nombre);

    if (!seccionSeleccionada) {
        return;
    }

    seccionSeleccionada.classList.add("activa");

    // Quitar selección de todos los botones
    const botones = document.querySelectorAll(".menu-btn");

    botones.forEach(btn => {
        btn.classList.remove("activo");
    });

    // Activar el botón seleccionado
    boton.classList.add("activo");

    // Cambiar título del dashboard
    const titulos = {
        inicio: "Mi Dashboard",
        perfil: "Mi perfil",
        proyectos: "Mis proyectos",
        intereses: "Mis intereses"
    };

    document.getElementById("titulo-seccion").textContent =
        titulos[nombre];
}

document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    const $ = (selector, scope = document) => scope.querySelector(selector);
    const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

    const botonMensaje = $("#botonMensaje");
    const mensaje = $("#mensaje");
    const detalleHobby = $("#detalleHobby");
    const imprimirCV = $("#imprimirCV");
    const imprimirHorario = $("#imprimirHorario");
    const actividadInput = $("#actividad");
    const agregarActividad = $("#agregarActividad");
    const mensajeHorario = $("#mensajeHorario");
    const calendarioElemento = $("#calendar");
    const anioActual = $("#anioActual");

    if (anioActual) anioActual.textContent = String(new Date().getFullYear());

    // Mensaje de bienvenida
    if (botonMensaje && mensaje) {
        botonMensaje.addEventListener("click", function () {
            mensaje.textContent = "¡Hola! Gracias por visitar mi página. Me alegra compartir contigo mis gustos y actividades.";
            mensaje.classList.remove("mensaje-animado");
            void mensaje.offsetWidth;
            mensaje.classList.add("mensaje-animado");
        });
    }

    // Información de hobbies
    const descripcionesHobbies = {
        "Música": "La música me ayuda a relajarme, mejorar mi ánimo y disfrutar de mis canciones favoritas.",
        "Lectura": "La lectura me permite ampliar mis conocimientos, desarrollar mi imaginación y aprender cada día.",
        "Videojuegos": "Los videojuegos me entretienen, presentan desafíos y ayudan a desarrollar el pensamiento estratégico.",
        "Fútbol": "El fútbol combina ejercicio, diversión, disciplina y trabajo en equipo."
    };

    $$(".card-btn").forEach(function (boton) {
        boton.addEventListener("click", function () {
            const hobby = boton.dataset.hobby;
            if (!detalleHobby || !descripcionesHobbies[hobby]) return;
            detalleHobby.textContent = hobby + ": " + descripcionesHobbies[hobby];
            detalleHobby.classList.remove("d-none");
            detalleHobby.scrollIntoView({ behavior: "smooth", block: "nearest" });
        });
    });

    // Impresión A4 por sección. No se genera ni se exporta PDF desde JavaScript.
    function imprimirSeccion(clase) {
        document.body.classList.remove("imprimir-cv", "imprimir-horario");
        document.body.classList.add(clase);

        let limpiezaRealizada = false;
        function limpiar() {
            if (limpiezaRealizada) return;
            limpiezaRealizada = true;
            document.body.classList.remove(clase);
            window.removeEventListener("afterprint", limpiar);
        }

        window.addEventListener("afterprint", limpiar, { once: true });
        window.print();
        // Respaldo para navegadores que no disparan afterprint correctamente.
        window.setTimeout(limpiar, 1500);
    }

    if (imprimirCV) {
        imprimirCV.addEventListener("click", function () {
            imprimirSeccion("imprimir-cv");
        });
    }

    // Actividades del calendario
    const CLAVE_ACTIVIDADES = "actividades";
    function cargarActividades() {
        try {
            const datos = JSON.parse(localStorage.getItem(CLAVE_ACTIVIDADES) || "[]");
            if (!Array.isArray(datos)) return [];
            return datos.filter(function (evento) {
                return evento && typeof evento.title === "string" &&
                    typeof evento.start === "string";
            });
        } catch (error) {
            console.error("Error al cargar actividades:", error);
            return [];
        }
    }

    let actividadesGuardadas = cargarActividades();
    let fechaSeleccionada = null;
    let calendario = null;

    function mostrarMensajeHorario(texto, esError = false) {
        if (!mensajeHorario) return;
        mensajeHorario.textContent = texto;
        mensajeHorario.classList.toggle("text-danger", esError);
        mensajeHorario.classList.toggle("text-success", !esError);
    }

    function formatearFecha(fecha) {
        if (!fecha) return "Sin fecha";
        const partes = String(fecha).substring(0, 10).split("-");
        if (partes.length !== 3) return fecha;
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }

    function convertirEvento(evento) {
        return {
            id: evento.id,
            title: evento.title,
            start: evento.startStr,
            allDay: evento.allDay
        };
    }

    function obtenerEventosActuales() {
        if (!calendario) return [];
        return calendario.getEvents().map(convertirEvento);
    }

    function guardarActividades() {
        try {
            localStorage.setItem(CLAVE_ACTIVIDADES, JSON.stringify(actividadesGuardadas));
            return true;
        } catch (error) {
            console.error("Error al guardar actividades:", error);
            mostrarMensajeHorario("No se pudieron guardar las actividades. Comprueba el almacenamiento del navegador.", true);
            return false;
        }
    }

    if (calendarioElemento && window.FullCalendar) {
        calendario = new FullCalendar.Calendar(calendarioElemento, {
            initialView: "dayGridMonth",
            locale: "es",
            height: "auto",
            expandRows: true,
            dayMaxEvents: true,
            selectable: true,
            nowIndicator: true,
            fixedWeekCount: false,
            headerToolbar: {
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,listWeek"
            },
            buttonText: { today: "Hoy", month: "Mes", week: "Semana", list: "Lista" },
            events: actividadesGuardadas,
            dateClick: function (informacion) {
                fechaSeleccionada = informacion.dateStr;
                if (actividadInput) actividadInput.focus();
                mostrarMensajeHorario("Fecha seleccionada: " + formatearFecha(fechaSeleccionada) + ". Escribe tu actividad.");
            },
            eventDrop: function () {
                actividadesGuardadas = obtenerEventosActuales();
                guardarActividades();
            },
            eventChange: function () {
                actividadesGuardadas = obtenerEventosActuales();
                guardarActividades();
            },
            eventClick: function (informacion) {
                const evento = informacion.event;
                const eliminar = window.confirm(
                    "Actividad: " + evento.title +
                    "\nFecha: " + formatearFecha(evento.startStr) +
                    "\n\n¿Deseas eliminar esta actividad?"
                );
                if (!eliminar) return;
                evento.remove();
                actividadesGuardadas = obtenerEventosActuales();
                guardarActividades();
                mostrarMensajeHorario("La actividad se eliminó correctamente.");
            },
            eventDidMount: function (informacion) {
                informacion.el.title = informacion.event.title + " - " + formatearFecha(informacion.event.startStr);
            }
        });
        calendario.render();
    } else if (calendarioElemento) {
        mostrarMensajeHorario("No se pudo cargar el calendario. Comprueba tu conexión.", true);
    }

    function agregarNuevaActividad() {
        if (!calendario || !actividadInput) {
            mostrarMensajeHorario("El calendario no está disponible.", true);
            return;
        }
        const nombre = actividadInput.value.trim();
        if (!nombre) {
            mostrarMensajeHorario("Escribe el nombre de la actividad.", true);
            actividadInput.focus();
            return;
        }
        if (!fechaSeleccionada) {
            mostrarMensajeHorario("Primero selecciona un día del calendario.", true);
            return;
        }

        const nuevaActividad = {
            id: Date.now().toString() + "-" + Math.random().toString(36).slice(2, 8),
            title: nombre,
            start: fechaSeleccionada,
            allDay: true
        };
        calendario.addEvent(nuevaActividad);
        actividadesGuardadas = obtenerEventosActuales();

        if (!guardarActividades()) {
            calendario.getEventById(nuevaActividad.id)?.remove();
            actividadesGuardadas = obtenerEventosActuales();
            return;
        }

        actividadInput.value = "";
        mostrarMensajeHorario("Actividad agregada para el " + formatearFecha(fechaSeleccionada) + ".");
    }

    if (agregarActividad) agregarActividad.addEventListener("click", agregarNuevaActividad);
    if (actividadInput) {
        actividadInput.addEventListener("keydown", function (evento) {
            if (evento.key === "Enter") {
                evento.preventDefault();
                agregarNuevaActividad();
            }
        });
    }

    // Construye una tabla ordenada para imprimir el horario en papel A4.
    function crearVistaA4() {
        const anterior = $("#vistaA4");
        if (anterior) anterior.remove();

        const hoja = document.createElement("section");
        hoja.id = "vistaA4";
        hoja.className = "vista-a4";

        const titulo = document.createElement("h2");
        titulo.textContent = "Mi horario personal";

        const fecha = document.createElement("p");
        fecha.className = "fecha-impresion";
        fecha.textContent = "Fecha de impresión: " + new Date().toLocaleDateString("es-PE");

        const tabla = document.createElement("table");
        const thead = document.createElement("thead");
        const filaTitulo = document.createElement("tr");

        ["Fecha", "Actividad"].forEach(function (texto) {
            const th = document.createElement("th");
            th.textContent = texto;
            filaTitulo.appendChild(th);
        });
        thead.appendChild(filaTitulo);

        const tbody = document.createElement("tbody");
        const eventos = calendario
            ? calendario.getEvents().slice().sort(function (a, b) {
                return a.startStr.localeCompare(b.startStr) || a.title.localeCompare(b.title, "es");
            })
            : [];

        if (eventos.length === 0) {
            const fila = document.createElement("tr");
            const celda = document.createElement("td");
            celda.colSpan = 2;
            celda.textContent = "No hay actividades registradas.";
            fila.appendChild(celda);
            tbody.appendChild(fila);
        } else {
            eventos.forEach(function (evento) {
                const fila = document.createElement("tr");
                const celdaFecha = document.createElement("td");
                const celdaActividad = document.createElement("td");
                celdaFecha.textContent = formatearFecha(evento.startStr);
                celdaActividad.textContent = evento.title;
                fila.append(celdaFecha, celdaActividad);
                tbody.appendChild(fila);
            });
        }

        tabla.append(thead, tbody);
        const total = document.createElement("p");
        total.id = "totalActividades";
        total.textContent = "Total de actividades: " + eventos.length;
        hoja.append(titulo, fecha, tabla, total);
        document.body.appendChild(hoja);
        return hoja;
    }

    if (imprimirHorario) {
        imprimirHorario.addEventListener("click", function () {
            if (!calendario) {
                mostrarMensajeHorario("No se puede imprimir el horario porque el calendario no está disponible.", true);
                return;
            }
            document.body.classList.remove("imprimir-cv", "imprimir-horario");
            const hoja = crearVistaA4();
            document.body.classList.add("imprimir-horario");

            let limpiezaRealizada = false;
            function limpiarImpresion() {
                if (limpiezaRealizada) return;
                limpiezaRealizada = true;
                document.body.classList.remove("imprimir-horario");
                if (hoja.isConnected) hoja.remove();
                window.removeEventListener("afterprint", limpiarImpresion);
            }

            window.addEventListener("afterprint", limpiarImpresion, { once: true });
            window.print();
            window.setTimeout(limpiarImpresion, 1500);
        });
    }
});

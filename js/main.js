/*
=====================================================
ARCHIVO: js/main.js
PROYECTO: MinLabs - Página de Presupuestos
=====================================================
*/

// --- 1. SELECCIÓN DE ELEMENTOS DEL DOM ---
// Guardamos en variables los elementos del HTML con los que vamos a interactuar.
// -----------------------------------------------------

// El formulario completo para escuchar el 'submit'
const formPresupuesto = document.querySelector('#form-presupuesto');

// Los campos (inputs) del formulario para leer su valor
const inputNombre = document.querySelector('#input-nombre');
const inputEmail = document.querySelector('#input-email');
const selectServicio = document.querySelector('#select-servicio');
const inputDescripcion = document.querySelector('#input-descripcion');

// El contenedor <ul> donde "dibujaremos" la lista de presupuestos
const listaPresupuestos = document.querySelector('#lista-presupuestos');

// Seleccionamos el contenedor padre de todas las tarjetas
const contenedorServicios = document.querySelector('#servicios .row');

// --- 2. BASE DE DATOS Y ESTADO GLOBAL ---
// Aquí definimos nuestro array principal.
// Intentamos cargarlo desde localStorage. Si no hay nada guardado (`null`),
// `|| []` asegura que empecemos con un array vacío y no con un error.
// -----------------------------------------------------
let presupuestos = JSON.parse(localStorage.getItem('minlabs_presupuestos')) || [];


// --- 3. EVENT LISTENERS (LOS "SENSORES") ---
// Aquí le decimos a JavaScript cuándo debe ejecutar nuestras funciones.
// -----------------------------------------------------

// Evento 1: Cuando el DOM (HTML) se haya cargado completamente.
// Esto es para mostrar la lista de presupuestos que ya estaban guardados.
document.addEventListener('DOMContentLoaded', () => {
    renderizarPresupuestos();
});

// Evento 2: Cuando se "envía" el formulario.
// Escuchamos el evento 'submit' en el <form>.
formPresupuesto.addEventListener('submit', agregarPresupuesto);

// Evento 3: Cuando se hace 'click' en la lista de presupuestos.
// Usamos "Event Delegation": un solo listener en el <ul> padre
// para manejar los clics en los botones "Eliminar" que aún no existen.
listaPresupuestos.addEventListener('click', manejarClickEnLista);

// Añadimos un solo 'click' listener al contenedor padre
contenedorServicios.addEventListener('click', (event) => {
    
    // 'event.target' es lo que clickeamos. 
    // '.closest()' busca el ancestro más cercano que tenga la clase '.service-card'
    const card = event.target.closest('.service-card');

    // Si el clic no fue dentro de una tarjeta, 'card' será null. En ese caso, no hacemos nada.
    if (!card) {
        return; 
    }

    // Ahora, alternamos (toggle) el contenido.
    toggleCardInfo(card);
});


// --- 4. FUNCIONES PRINCIPALES (LÓGICA DEL CRUD) ---
// Aquí está el cerebro de la aplicación.
// -----------------------------------------------------

/**
 * Función CREATE: Se activa al enviar el formulario.
 * Lee los datos, crea un objeto, lo añade al array y actualiza la vista.
 */
function agregarPresupuesto(event) {
    // 1. event.preventDefault() es CRUCIAL.
    // Evita que el formulario se envíe de la forma tradicional y recargue la página.
    event.preventDefault();

    // 2. Creamos el objeto del nuevo presupuesto.
    // Generamos un ID único usando la fecha y hora en milisegundos.
    const nuevoPresupuesto = {
        id: Date.now(),
        nombre: inputNombre.value,
        email: inputEmail.value,
        servicio: selectServicio.value,
        descripcion: inputDescripcion.value
    };

    // 3. Añadimos el nuevo objeto al INICIO del array con 'unshift()'
    // (Usamos 'unshift' en lugar de 'push' para que los nuevos aparezcan arriba)
    presupuestos.unshift(nuevoPresupuesto);

    // 4. Limpiamos el formulario para que el usuario pueda agregar otro.
    formPresupuesto.reset();

    // 5. Guardamos el array actualizado en LocalStorage.
    guardarEnStorage();

    // 6. Volvemos a "dibujar" toda la lista en el HTML.
    renderizarPresupuestos();
}

/**
 * Función READ: "Dibuja" el array de presupuestos en el HTML.
 * Se llama al cargar la página y después de cada CREADO o BORRADO.
 */
function renderizarPresupuestos() {
    // 1. Limpiamos el contenido actual de la lista.
    // Esto evita que se dupliquen elementos cada vez que renderizamos.
    listaPresupuestos.innerHTML = '';

    // 2. Recorremos el array de presupuestos.
    presupuestos.forEach(presupuesto => {
        // 3. Creamos un nuevo elemento <li> por cada presupuesto.
        const li = document.createElement('li');
        // Usamos 'list-group-item' como contenedor principal del item
        li.classList.add('list-group-item');

        // Generamos un ID único para el DIV colapsable de este item
        const formId = `edit-form-${presupuesto.id}`;

        // 4. Le añadimos las clases de Bootstrap para que se vea bien.
        // 'list-group-item': Estilo base de la lista.
        // 'd-flex', 'justify-content-between', 'align-items-center': Clases de Flexbox
        // para alinear el texto a la izquierda y el botón a la derecha.
        li.classList.add('list-group-item');

        // 5. Creamos el contenido HTML del <li>.
        // Usamos backticks (`) para insertar variables fácilmente.
        li.innerHTML = `
            <div class="d-flex justify-content-between align-items-center w-100">
                <div>
                    <strong>${presupuesto.servicio}</strong>
                    <span class="text-muted d-block small">${presupuesto.nombre} (${presupuesto.email})</span>
                </div>
                
                <div>
                    <button class="btn btn-warning btn-sm me-2" 
                            type="button" 
                            data-bs-toggle="collapse" 
                            data-bs-target="#${formId}">
                        Editar
                    </button>

                    <button class="btn btn-danger btn-sm boton-eliminar" data-id="${presupuesto.id}">
                        Eliminar
                    </button>
                </div>
            </div>

            <div class="collapse pt-3 w-100" id="${formId}">
                <div class="mb-2">
                    <label class="form-label small">Nombre:</label>
                    <input type="text" class="form-control edit-nombre" value="${presupuesto.nombre}">
                </div>
                <div class="mb-2">
                    <label class="form-label small">Email:</label>
                    <input type="email" class="form-control edit-email" value="${presupuesto.email}">
                </div>
                <div class="mb-2">
                    <label class="form-label small">Servicio:</label>
                    <select class="form-select edit-servicio">
                        <option value="Prototipado" ${presupuesto.servicio === 'Prototipado' ? 'selected' : ''}>Prototipado Rápido</option>
                        <option value="Inversa" ${presupuesto.servicio === 'Inversa' ? 'selected' : ''}>Ingeniería Inversa</option>
                        <option value="CAD" ${presupuesto.servicio === 'CAD' ? 'selected' : ''}>Diseño CAD</option>
                        <option value="Compuestos" ${presupuesto.servicio === 'Compuestos' ? 'selected' : ''}>Materiales Compuestos</option>
                    </select>
                </div>
                <div class="mb-2">
                    <label class="form-label small">Descripción:</label>
                    <textarea class="form-control edit-descripcion">${presupuesto.descripcion}</textarea>
                </div>
                
                <button class="btn btn-success btn-sm w-100 boton-guardar" data-id="${presupuesto.id}">
                    Guardar Cambios
                </button>
            </div>
        `;

        // 6. Añadimos el <li> recién creado a la <ul> en el HTML.
        listaPresupuestos.appendChild(li);
    });
}

/**
 * Función UPDATE: Actualiza un presupuesto en el array.
 */
function actualizarPresupuesto(id, botonGuardar) {
    // 1. Encontrar el <li> padre que contiene todo (el botón, el form, etc.)
    // Usamos .closest() para buscar el ancestro 'list-group-item' más cercano
    const li = botonGuardar.closest('.list-group-item');

    // 2. Leer los nuevos valores desde el formulario de edición DENTRO de ese <li>
    // Por esto usamos clases ('.edit-nombre') en lugar de IDs.
    const nuevoNombre = li.querySelector('.edit-nombre').value;
    const nuevoEmail = li.querySelector('.edit-email').value;
    const nuevoServicio = li.querySelector('.edit-servicio').value;
    const nuevaDescripcion = li.querySelector('.edit-descripcion').value;

    // 3. Encontrar el presupuesto en nuestro array de datos usando su ID
    const presupuestoAActualizar = presupuestos.find(presupuesto => presupuesto.id === id);

    // 4. Si existe, actualizamos sus propiedades
    if (presupuestoAActualizar) {
        presupuestoAActualizar.nombre = nuevoNombre;
        presupuestoAActualizar.email = nuevoEmail;
        presupuestoAActualizar.servicio = nuevoServicio;
        presupuestoAActualizar.descripcion = nuevaDescripcion;
    }

    // 5. Guardamos el array (ya modificado) en LocalStorage
    guardarEnStorage();

    // 6. Volvemos a "dibujar" toda la lista
    // Esto es genial, porque automáticamente reconstruirá el HTML
    // y el formulario de edición volverá a estar oculto.
    renderizarPresupuestos();
}

/**
 * Función DELETE: Elimina un presupuesto del array.
 * Esta función es llamada por 'manejarClickEnLista'.
 */
function eliminarPresupuesto(id) {
    // 1. Usamos .filter() para crear un NUEVO array
    // que contenga todos los elementos EXCEPTO el que tiene el 'id' a borrar.
    presupuestos = presupuestos.filter(presupuesto => presupuesto.id !== id);

    // 2. Guardamos el array (ya filtrado) en LocalStorage.
    guardarEnStorage();

    // 3. Volvemos a "dibujar" la lista.
    renderizarPresupuestos();
}

/**
 * Alterna el contenido y el color de una tarjeta de servicio específica.
 */
function toggleCardInfo(card) {
    // 1. Encontrar las descripciones DENTRO de esa tarjeta específica
    const shortDesc = card.querySelector('.description-short');
    const detailedDesc = card.querySelector('.description-detailed');

    // 2. Alternar la clase 'd-none' (oculto/visible) en ambas descripciones
    shortDesc.classList.toggle('d-none');
    detailedDesc.classList.toggle('d-none');

    // 3. Alternar una clase en la tarjeta para el cambio de color
    // Esta clase '.card-flipped' la definiremos en nuestro CSS
    card.classList.toggle('card-flipped');
}

// --- 5. FUNCIONES AUXILIARES (HELPERS) ---
// Funciones que realizan tareas de apoyo.
// -----------------------------------------------------

/**
 * Esta función maneja los clics dentro del <ul>.
 * Verifica si el clic fue en un botón de eliminar.
 */
function manejarClickEnLista(event) {
    // event.target es el elemento exacto donde se hizo clic (ej: el <button>)
    // .classList.contains() verifica si ese elemento tiene la clase 'boton-eliminar'.
    if (event.target.classList.contains('boton-eliminar')) {
        
        // 1. Obtenemos el ID que guardamos en el atributo 'data-id'.
        // Lo convertimos a número con parseInt() para seguridad.
        const id = parseInt(event.target.dataset.id);

        // 2. Llamamos a la función de eliminar pasándole ese ID.
        eliminarPresupuesto(id);
    }
    // CASO 2: Si se hizo clic en "Guardar Cambios"
    else if (event.target.classList.contains('boton-guardar')) {
        // 1. Obtenemos el ID del botón de guardar
        const id = parseInt(event.target.dataset.id);
        
        // 2. Llamamos a la nueva función de actualizar
        actualizarPresupuesto(id, event.target);
    }
}

/**
 * Guarda el estado actual del array 'presupuestos' en LocalStorage.
 */
function guardarEnStorage() {
    // Usamos 'JSON.stringify' para convertir el array de objetos en un string
    // (localStorage solo puede guardar strings).
    localStorage.setItem('minlabs_presupuestos', JSON.stringify(presupuestos));
}
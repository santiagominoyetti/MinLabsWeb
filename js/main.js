const BREAKPOINT_MD = 768;

document.addEventListener('DOMContentLoaded', function() {
    const dropdowns = document.querySelectorAll('.dropdown');

    dropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('.nav-link');

        link.addEventListener('click', function(event) {
            // Prevenir que el link navegue si es un '#'
            if (this.getAttribute('href') === '#') {
                event.preventDefault();
            }

                const menu = dropdown.querySelector('.dropdown-menu');
                // Alternar la visibilidad del menú usando una clase CSS
                const menu = dropdown.querySelector('.dropdown-menu');
                // Verificar que el menú exista antes de alternar su visibilidad
                if (menu) {
                    if (menu.style.display === 'block') {
                        menu.style.display = 'none';
                    } else {
                        menu.style.display = 'block';
                    }
                }

// DOM Elements
        const openBtn = document.getElementById('openMenuBtn');
        const closeBtn = document.getElementById('closeMenuBtn');
        const drawer = document.getElementById('drawer');
        const overlay = document.getElementById('overlay');

        // Functions to open/close menu
        function openMenu() {
            drawer.classList.add('active');
            overlay.classList.add('active');
        }

        function closeMenu() {
            drawer.classList.remove('active');
            overlay.classList.remove('active');
        }

        // Event Listeners
        openBtn.addEventListener('click', openMenu);
        closeBtn.addEventListener('click', closeMenu);
        overlay.addEventListener('click', closeMenu); // Close when clicking background
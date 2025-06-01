// cosmic_scripts.js - Custom JavaScript for the Cosmic Explorer website

document.addEventListener('DOMContentLoaded', () => {
    // --- Full Page Parallax Scroll Effect ---
    const layerFar = document.getElementById('parallax-layer-far');
    const layerMid = document.getElementById('parallax-layer-mid');
    const layerNear = document.getElementById('parallax-layer-near');

    if (layerFar && layerMid && layerNear) {
        window.addEventListener('scroll', function() {
            const scrollPosition = window.pageYOffset;

            // Apply parallax transformation
            // Adjust speed factors as needed (smaller = slower, further away)
            layerFar.style.transform = `translateY(${scrollPosition * 0.1}px)`;
            layerMid.style.transform = `translateY(${scrollPosition * 0.3}px)`;
            layerNear.style.transform = `translateY(${scrollPosition * 0.5}px)`;
        });
    } else {
        console.warn('One or more parallax layers not found for full page effect.');
    }

    // --- Starmap Navigation Logic ---
    const starmapNavLinks = document.querySelectorAll('#starmap-nav .starmap-nav-link');
    const contentModules = document.querySelectorAll('.content-module');

    if (starmapNavLinks.length > 0 && contentModules.length > 0) {
        starmapNavLinks.forEach(link => {
            link.addEventListener('click', function(event) {
                event.preventDefault();

                // Get the target module ID from href
                const targetModuleId = this.getAttribute('href').substring(1);

                // Hide all content modules - prepare for out-animation if any, then hide
                contentModules.forEach(module => {
                    module.classList.remove('visible'); // For out-animation if one was defined
                    // Add 'hidden' after a delay if out-animations are desired,
                    // otherwise, direct 'hidden' might be fine if in-animation is primary focus.
                    // For now, simple hide then show with animation:
                    module.classList.add('hidden');
                });

                // Show the target content module
                const targetModule = document.getElementById(targetModuleId);
                if (targetModule) {
                    targetModule.classList.remove('hidden'); // Remove display:none
                    // Force reflow to ensure transition plays if element was display:none
                    void targetModule.offsetWidth;
                    targetModule.classList.add('visible'); // Add class that triggers transition
                }

                // Update active link state
                starmapNavLinks.forEach(navLink => {
                    navLink.classList.remove('active'); // Assuming 'active' is the class styled in CSS
                });
                this.classList.add('active');
            });
        });

        // Initial State for Default Active Module
        if (starmapNavLinks.length > 0) {
            const firstLink = starmapNavLinks[0];
            const firstModuleId = firstLink.getAttribute('href').substring(1);
            const firstModule = document.getElementById(firstModuleId);

            contentModules.forEach(module => { // Ensure all are hidden and not visible initially
                module.classList.add('hidden');
                module.classList.remove('visible');
            });

            if (firstModule) {
                firstModule.classList.remove('hidden');
                void firstModule.offsetWidth; // Reflow
                firstModule.classList.add('visible');
                firstLink.classList.add('active');
            } else {
                const welcomeModule = document.getElementById('welcome-module');
                if (welcomeModule) { // Fallback to welcome module if first link's target fails
                    welcomeModule.classList.remove('hidden');
                    void welcomeModule.offsetWidth; // Reflow
                    welcomeModule.classList.add('visible');
                }
            }
        }


    } else {
        console.warn('Starmap navigator links or content modules not found.');
    }

    // --- Update Footer Year ---
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
});

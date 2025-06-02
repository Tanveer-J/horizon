// enchanted_scripts.js - Custom JavaScript for the Enchanted Forest Nook website

document.addEventListener('DOMContentLoaded', () => {
    const forestPathLinks = document.querySelectorAll('#forest-paths-nav .forest-path-link');
    const forestClearingModules = document.querySelectorAll('.forest-clearing-module');
    const welcomeModule = document.getElementById('welcome-clearing-module'); // Get welcome module specifically

    if (forestPathLinks.length > 0 && forestClearingModules.length > 0) {
        // Function to show a specific module and update active link
        function showModule(moduleId) {
            let moduleToShow = null;
            // Hide all content modules
            forestClearingModules.forEach(module => {
                module.classList.add('hidden');
                // For animations (added in a later step, prepare for it)
                // module.classList.remove('visible');
            });

            // Show the target content module
            if (moduleId) {
                moduleToShow = document.getElementById(moduleId);
                if (moduleToShow) {
                    moduleToShow.classList.remove('hidden');
                    // For animations (added in a later step)
                    // void moduleToShow.offsetWidth; // Force reflow
                    // moduleToShow.classList.add('visible');
                }
            }

            // Update active link state
            forestPathLinks.forEach(navLink => {
                if (moduleId && navLink.getAttribute('href') === '#' + moduleId) {
                    navLink.classList.add('active');
                } else {
                    navLink.classList.remove('active');
                }
            });
            return moduleToShow; // Return the module that was shown
        }

        // Add click event listeners to navigation links
        forestPathLinks.forEach(link => {
            link.addEventListener('click', function(event) {
                event.preventDefault();
                const targetModuleId = this.getAttribute('href').substring(1);
                showModule(targetModuleId);
            });
        });

        // Set initial state: Activate the first link and show its module
        if (forestPathLinks.length > 0) {
            const firstLink = forestPathLinks[0];
            const firstModuleId = firstLink.getAttribute('href').substring(1);

            // Ensure welcome module is hidden if we are showing another module by default
            if (welcomeModule && firstModuleId !== welcomeModule.id) {
                welcomeModule.classList.add('hidden');
                // welcomeModule.classList.remove('visible');
            }
            showModule(firstModuleId);

        } else if (welcomeModule) {
            // If no nav links, ensure welcome module is visible (it should be by default HTML)
            welcomeModule.classList.remove('hidden');
            // welcomeModule.classList.add('visible');
        }

    } else {
        console.warn('Forest Path links or Clearing modules not found.');
    }
});

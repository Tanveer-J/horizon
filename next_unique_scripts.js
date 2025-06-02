// next_unique_scripts.js - Custom JavaScript for unique sections in next.html

document.addEventListener('DOMContentLoaded', () => {
    const sandCanvas = document.getElementById('sand-canvas');
    if (sandCanvas) {
        const ctx = sandCanvas.getContext('2d');
        let isRaking = false;
        let lastX = 0;
        let lastY = 0;

        // Set canvas display size (match CSS) and drawing buffer size
        function resizeCanvas() {
            sandCanvas.width = sandCanvas.offsetWidth;
            sandCanvas.height = sandCanvas.offsetHeight;
            // Redraw initial sand texture if needed after resize (simple fill for now)
            ctx.fillStyle = getComputedStyle(sandCanvas).backgroundColor || 'var(--zen-color-sand, #E0D6B3)'; // Use CSS var or fallback
            ctx.fillRect(0, 0, sandCanvas.width, sandCanvas.height);
        }

        // Call resizeCanvas initially and on window resize
        resizeCanvas(); // Initial size
        window.addEventListener('resize', resizeCanvas);


        // Rake line style
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)'; // Darker, semi-transparent lines for trails
        ctx.lineWidth = 3; // Adjust for desired thickness
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        sandCanvas.addEventListener('mousedown', (e) => {
            isRaking = true;
            [lastX, lastY] = [e.offsetX, e.offsetY];
        });

        sandCanvas.addEventListener('mousemove', (e) => {
            if (!isRaking) return;
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.stroke();
            [lastX, lastY] = [e.offsetX, e.offsetY];
        });

        sandCanvas.addEventListener('mouseup', () => isRaking = false);
        sandCanvas.addEventListener('mouseleave', () => isRaking = false);

        // Touch events for basic mobile support
        sandCanvas.addEventListener('touchstart', (e) => {
            if (e.targetTouches.length === 1) {
                e.preventDefault(); // Prevent scrolling
                isRaking = true;
                const touch = e.targetTouches[0];
                const rect = sandCanvas.getBoundingClientRect();
                [lastX, lastY] = [touch.clientX - rect.left, touch.clientY - rect.top];
            }
        }, { passive: false });

        sandCanvas.addEventListener('touchmove', (e) => {
            if (!isRaking || e.targetTouches.length !== 1) return;
            e.preventDefault(); // Prevent scrolling
            const touch = e.targetTouches[0];
            const rect = sandCanvas.getBoundingClientRect();
            const currentX = touch.clientX - rect.left;
            const currentY = touch.clientY - rect.top;

            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(currentX, currentY);
            ctx.stroke();
            [lastX, lastY] = [currentX, currentY];
        }, { passive: false });

        sandCanvas.addEventListener('touchend', () => isRaking = false);
        sandCanvas.addEventListener('touchcancel', () => isRaking = false);

    } else {
        console.warn('Sand canvas element not found.');
    }

    // --- Reflecting Pond Logic ---
    const pondCanvas = document.getElementById('pond-canvas');
    if (pondCanvas) {
        const pCtx = pondCanvas.getContext('2d');
        let pondWidth, pondHeight;
        const ripples = [];
        const koi = [ // Simple Koi properties: x, y, width, height, color, speedX, speedY
            { x: 50, y: 50, w: 30, h: 12, color: 'rgba(255, 100, 0, 0.7)', speedX: 0.3, speedY: 0.1 },
            { x: 150, y: 100, w: 35, h: 14, color: 'rgba(200, 200, 200, 0.8)', speedX: -0.2, speedY: 0.2 },
            { x: 100, y: 180, w: 28, h: 11, color: 'rgba(255, 165, 0, 0.75)', speedX: 0.1, speedY: -0.25 }
        ];

        function resizePondCanvas() {
            pondCanvas.width = pondCanvas.offsetWidth;
            pondCanvas.height = pondCanvas.offsetHeight;
            pondWidth = pondCanvas.width;
            pondHeight = pondCanvas.height;
        }
        resizePondCanvas();
        window.addEventListener('resize', resizePondCanvas);

        function drawKoi(fish) {
            pCtx.fillStyle = fish.color;
            pCtx.beginPath();
            pCtx.ellipse(fish.x, fish.y, fish.w / 2, fish.h / 2, 0, 0, 2 * Math.PI);
            pCtx.fill();
            // Simple tail (triangle)
            pCtx.beginPath();
            const tailDirection = fish.speedX > 0 ? -1 : 1;
            pCtx.moveTo(fish.x - (fish.w / 2 * tailDirection), fish.y);
            pCtx.lineTo(fish.x - ((fish.w / 2 + 10) * tailDirection), fish.y - 6);
            pCtx.lineTo(fish.x - ((fish.w / 2 + 10) * tailDirection), fish.y + 6);
            pCtx.closePath();
            pCtx.fill();
        }

        function updateKoi(fish) {
            fish.x += fish.speedX;
            fish.y += fish.speedY;
            if (fish.x - fish.w/2 < 0 || fish.x + fish.w/2 > pondWidth) fish.speedX *= -1;
            if (fish.y - fish.h/2 < 0 || fish.y + fish.h/2 > pondHeight) fish.speedY *= -1;
        }

        function createRipple(x, y) {
            ripples.push({ x, y, radius: 0, maxRadius: 50, speed: 1, opacity: 1, lineWidth: 2 });
        }

        function drawRipples() {
            for (let i = ripples.length - 1; i >= 0; i--) {
                const r = ripples[i];
                pCtx.beginPath();
                pCtx.arc(r.x, r.y, r.radius, 0, 2 * Math.PI);
                pCtx.strokeStyle = `rgba(255, 255, 255, ${r.opacity})`;
                pCtx.lineWidth = r.lineWidth;
                pCtx.stroke();

                r.radius += r.speed;
                r.opacity -= 0.02;
                r.lineWidth -= 0.03;

                if (r.opacity <= 0 || r.lineWidth <=0) {
                    ripples.splice(i, 1);
                }
            }
        }

        function pondLoop() {
            pCtx.clearRect(0, 0, pondWidth, pondHeight); // Clear canvas
            // Set background (could also be done by CSS on canvas if static)
            pCtx.fillStyle = getComputedStyle(pondCanvas).backgroundColor || 'var(--zen-color-water, #A2C4C6)';
            pCtx.fillRect(0, 0, pondWidth, pondHeight);

            koi.forEach(fish => {
                updateKoi(fish);
                drawKoi(fish);
            });
            drawRipples();
            requestAnimationFrame(pondLoop);
        }

        pondCanvas.addEventListener('click', (e) => {
            createRipple(e.offsetX, e.offsetY);
        });
        pondCanvas.addEventListener('touchstart', (e) => {
            if (e.targetTouches.length === 1) {
                e.preventDefault();
                const touch = e.targetTouches[0];
                const rect = pondCanvas.getBoundingClientRect();
                createRipple(touch.clientX - rect.left, touch.clientY - rect.top);
            }
        }, { passive: false });

        pondLoop(); // Start animation loop
    } else {
        console.warn('Pond canvas element not found.');
    }

    // --- Stone Lantern Logic ---
    const stoneLanterns = document.querySelectorAll('.stone-lantern');
    if (stoneLanterns.length > 0) {
        stoneLanterns.forEach(lantern => {
            const quoteText = lantern.dataset.quote;
            const quoteElement = lantern.querySelector('.lantern-quote');
            if (quoteElement && quoteText) {
                quoteElement.textContent = quoteText;
            }

            lantern.addEventListener('click', () => {
                // Toggle 'lit' class on the clicked lantern
                // Option 1: Only one lantern lit at a time
                // stoneLanterns.forEach(l => l.classList.remove('lit'));
                // lantern.classList.add('lit');

                // Option 2: Toggle individual lanterns
                lantern.classList.toggle('lit');
            });

            // Optional: Hide quote on mouseleave if using hover instead of click for 'lit'
            // lantern.addEventListener('mouseleave', () => {
            //     lantern.classList.remove('lit');
            // });
        });
    } else {
        console.warn('Stone lantern elements not found.');
    }

    // --- Data Sculpture Logic ---
    const sculptureCanvas = document.getElementById('data-sculpture-canvas');
    if (sculptureCanvas) {
        const sCtx = sculptureCanvas.getContext('2d');
        let sculptureWidth, sculptureHeight;
        let particles = [];
        const mouse = { x: null, y: null, radius: 100 }; // Mouse influence radius

        const PARTICLE_COUNT = 100; // Number of particles
        const PARTICLE_SPEED = 0.5;
        const CONNECTION_DISTANCE = 80; // Max distance to draw a line between particles

        function resizeSculptureCanvas() {
            sculptureCanvas.width = sculptureCanvas.offsetWidth;
            sculptureCanvas.height = sculptureCanvas.offsetHeight;
            sculptureWidth = sculptureCanvas.width;
            sculptureHeight = sculptureCanvas.height;
        }
        resizeSculptureCanvas();
        window.addEventListener('resize', () => {
            resizeSculptureCanvas();
            // Re-initialize particles on resize for simplicity, or update their positions
            initParticles();
        });

        class Particle {
            constructor() {
                this.x = Math.random() * sculptureWidth;
                this.y = Math.random() * sculptureHeight;
                this.size = Math.random() * 2 + 1; // Particle size
                this.speedX = (Math.random() * 2 - 1) * PARTICLE_SPEED; // Random horizontal speed
                this.speedY = (Math.random() * 2 - 1) * PARTICLE_SPEED; // Random vertical speed
                this.color = `rgba(0, 240, 255, ${Math.random() * 0.5 + 0.3})`; // --ds-color-accent-primary with random alpha
            }
            update() {
                // Mouse interaction: repulsion
                if (mouse.x !== null && mouse.y !== null) {
                    const dx = this.x - mouse.x;
                    const dy = this.y - mouse.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < mouse.radius) {
                        const forceDirectionX = dx / distance;
                        const forceDirectionY = dy / distance;
                        const force = (mouse.radius - distance) / mouse.radius;
                        this.x += forceDirectionX * force * 2; // Increase repulsion strength
                        this.y += forceDirectionY * force * 2;
                    }
                }

                // Movement & boundary check
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.x > sculptureWidth || this.x < 0) this.speedX *= -1;
                if (this.y > sculptureHeight || this.y < 0) this.speedY *= -1;
            }
            draw() {
                sCtx.fillStyle = this.color;
                sCtx.beginPath();
                sCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                sCtx.fill();
            }
        }

        function initParticles() {
            particles = [];
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                particles.push(new Particle());
            }
        }
        initParticles();

        function connectParticles() {
            for (let a = 0; a < particles.length; a++) {
                for (let b = a + 1; b < particles.length; b++) { // Start b from a+1 to avoid duplicates and self-connection
                    const dx = particles[a].x - particles[b].x;
                    const dy = particles[a].y - particles[b].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < CONNECTION_DISTANCE) {
                        sCtx.strokeStyle = `rgba(240, 0, 255, ${1 - (distance / CONNECTION_DISTANCE) * 0.8})`; // --ds-color-accent-secondary with alpha based on distance
                        sCtx.lineWidth = 0.5;
                        sCtx.beginPath();
                        sCtx.moveTo(particles[a].x, particles[a].y);
                        sCtx.lineTo(particles[b].x, particles[b].y);
                        sCtx.stroke();
                    }
                }
            }
        }

        function sculptureLoop() {
            sCtx.fillStyle = 'rgba(8, 8, 10, 0.1)'; // --ds-color-background with low alpha for trails
            sCtx.fillRect(0, 0, sculptureWidth, sculptureHeight); // Semi-transparent clear for trails
            // sCtx.clearRect(0,0, sculptureWidth, sculptureHeight); // For no trails

            particles.forEach(p => {
                p.update();
                p.draw();
            });
            connectParticles(); // Draw lines between nearby particles

            requestAnimationFrame(sculptureLoop);
        }

        sculptureCanvas.addEventListener('mousemove', (e) => {
            const rect = sculptureCanvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });
        sculptureCanvas.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });

        sculptureLoop(); // Start animation

        const snippetsOverlay = document.getElementById('data-snippets-overlay');
        const placeholderSnippets = [
            "Flux::Pattern.match(0xDEADBEEF)",
            "Signal_Integrity: 78.3%",
            "Resonance_Freq: 1.21GHz",
            "[ERR_SUBSPACE_INTERFERENCE]",
            "Data_Stream_Active",
            "Quantum_Entanglement_Verified",
            "Sector 7G: Anomaly Persists",
            "Energy_Spike_Detected: Type Gamma"
        ];

        if (snippetsOverlay) { // Check if snippetsOverlay exists as well
            sculptureCanvas.addEventListener('click', function(event) {
                const snippetText = placeholderSnippets[Math.floor(Math.random() * placeholderSnippets.length)];

                const snippetElement = document.createElement('p');
                snippetElement.classList.add('data-snippet');
                snippetElement.textContent = snippetText;

                // Prepend to make it appear at the top of the flex-reversed column (visually bottom)
                snippetsOverlay.prepend(snippetElement);

                // Remove the snippet element after animation completes (5s)
                setTimeout(() => {
                    snippetElement.remove();
                }, 5000);

                // Limit number of snippets visible
                while (snippetsOverlay.children.length > 5) { // Keep max 5 snippets
                    snippetsOverlay.lastChild.remove(); // Remove the oldest (which is visually at the top)
                }
            });
        }

    } else {
        console.warn('Data sculpture canvas not found.');
    }

    // --- Storybook Logic ---
    const storybookScene = document.getElementById('storybook-scene');
    if (storybookScene) {
        const sbLayerSky = document.getElementById('sb-layer-sky');
        const sbLayerFarHills = document.getElementById('sb-layer-far-hills');
        const sbLayerMidground = document.getElementById('sb-layer-midground');
        // const sbLayerCharacters = document.getElementById('sb-layer-characters'); // Characters might move with midground or have own logic
        const sbLayerForeground = document.getElementById('sb-layer-foreground');

        // Apply parallax only if section is somewhat in view (basic check)
        // More advanced: Intersection Observer
        window.addEventListener('scroll', () => {
            const sceneRect = storybookScene.getBoundingClientRect();
            // Only apply parallax if the scene is roughly in the viewport
            if (sceneRect.top < window.innerHeight && sceneRect.bottom > 0) {
                // Calculate scroll amount relative to the start of the document or a relevant parent
                // For simplicity, using window.pageYOffset, but this makes layers move even if section isn't fully visible
                let scrollOffset = window.pageYOffset;

                // Adjust these factors for desired parallax intensity
                // Sky should move very little or not at all if it's a fixed backdrop
                if (sbLayerSky) sbLayerSky.style.transform = `translateY(${scrollOffset * 0.05}px)`;
                if (sbLayerFarHills) sbLayerFarHills.style.transform = `translateY(${scrollOffset * 0.15}px)`;
                if (sbLayerMidground) sbLayerMidground.style.transform = `translateY(${scrollOffset * 0.3}px)`;
                // Character layer could move with midground or have its own factor
                // if (sbLayerCharacters) sbLayerCharacters.style.transform = `translateY(${scrollOffset * 0.3}px)`;
                if (sbLayerForeground) sbLayerForeground.style.transform = `translateY(${scrollOffset * 0.5}px)`;
            }
        });

        // Click-to-reveal story popup
        const sirReginaldChar = document.getElementById('sir-reginald');
        const storyPopup1 = document.getElementById('sb-popup-1');

        if (sirReginaldChar && storyPopup1) {
            sirReginaldChar.addEventListener('click', () => {
                // Toggle visibility of the popup
                if (storyPopup1.classList.contains('hidden')) {
                    storyPopup1.classList.remove('hidden');
                    void storyPopup1.offsetWidth; // Force reflow
                    storyPopup1.classList.add('visible');
                } else {
                    storyPopup1.classList.remove('visible');
                    // Add hidden back after transition (if one is defined for hiding)
                    // For now, just use Tailwind's hidden which is display:none
                    setTimeout(() => { // allow fade out if .visible removal triggers it
                       if (!storyPopup1.classList.contains('visible')) { // check if still not visible
                           storyPopup1.classList.add('hidden');
                       }
                    }, 300); // Match CSS transition duration
                }
            });
        }
    } else {
        console.warn('Storybook scene element not found.');
    }

    // --- Horology Engine Info Plaque Logic ---
    const infoPlaques = document.querySelectorAll('#horology-engine-section .info-plaque');
    const plaqueDetailsDisplay = document.querySelector('#horology-engine-section .info-plaque-details');
    let currentPlaqueSource = null; // To track which plaque's info is shown

    if (infoPlaques.length > 0 && plaqueDetailsDisplay) {
        infoPlaques.forEach(plaque => {
            plaque.addEventListener('click', function(event) {
                event.stopPropagation(); // Prevent click from bubbling to document listener immediately

                const infoText = this.dataset.info;

                if (plaqueDetailsDisplay.classList.contains('visible') && currentPlaqueSource === this) {
                    // Clicked the same plaque that's already showing details: hide it
                    plaqueDetailsDisplay.classList.remove('visible');
                    // Add hidden back after transition for display:none behavior if needed by other logic
                    setTimeout(() => {
                        if (!plaqueDetailsDisplay.classList.contains('visible')) {
                            plaqueDetailsDisplay.classList.add('hidden');
                        }
                    }, 300); // Match CSS transition duration
                    currentPlaqueSource = null;
                } else {
                    // Clicked a new plaque or details are hidden: show/update details
                    plaqueDetailsDisplay.textContent = infoText;
                    plaqueDetailsDisplay.classList.remove('hidden');
                    void plaqueDetailsDisplay.offsetWidth; // Force reflow for transition
                    plaqueDetailsDisplay.classList.add('visible');
                    currentPlaqueSource = this;
                }
            });
        });

        // Optional: Click outside the details panel to hide it
        document.addEventListener('click', function(event) {
            if (plaqueDetailsDisplay.classList.contains('visible')) {
                // Check if the click was outside the plaqueDetailsDisplay and not on an info-plaque
                const isClickInsidePlaque = Array.from(infoPlaques).some(p => p.contains(event.target));
                if (!plaqueDetailsDisplay.contains(event.target) && !isClickInsidePlaque) {
                    plaqueDetailsDisplay.classList.remove('visible');
                    setTimeout(() => {
                        if (!plaqueDetailsDisplay.classList.contains('visible')) {
                            plaqueDetailsDisplay.classList.add('hidden');
                        }
                    }, 300);
                    currentPlaqueSource = null;
                }
            }
        });

    } else {
        console.warn('Info plaques or details display element not found in Horology Engine.');
    }
});

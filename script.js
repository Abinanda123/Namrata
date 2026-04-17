document.addEventListener("DOMContentLoaded", () => {
    
    // --- Elements ---
    const giftBox = document.getElementById("gift-box");
    const giftScreen = document.getElementById("gift-screen");
    const mainContent = document.getElementById("main-content");
    const bgMusic = document.getElementById("bg-music");
    const cakeContainer = document.getElementById("cake-container");
    const flame = document.getElementById("flame");
    const wishText = document.getElementById("wish-text");

    // --- Floating Particles Generator ---
    function createParticles() {
        const bg = document.getElementById("floating-bg");
        for (let i = 0; i < 25; i++) {
            const particle = document.createElement("div");
            if (Math.random() > 0.4) {
                particle.classList.add("particle");
                const size = Math.random() * 15 + 5;
                particle.style.width = `${size}px`;
                particle.style.height = `${size}px`;
            } else {
                particle.classList.add("particle", "heart");
                particle.innerHTML = "💖";
                particle.style.fontSize = `${Math.random() * 20 + 15}px`;
            }
            particle.style.left = `${Math.random() * 100}vw`;
            particle.style.animationDuration = `${Math.random() * 6 + 6}s`;
            particle.style.animationDelay = `${Math.random() * 5}s`;
            bg.appendChild(particle);
        }
    }
    createParticles();

    // --- Unwrap the Gift Interaction ---
    giftBox.addEventListener("click", () => {
        try {
            bgMusic.volume = 0.4;
            bgMusic.play().catch(e => console.log("Audio not provided or autoplay blocked."));
        } catch (e) {}

        confetti({
            particleCount: 200, spread: 90, origin: { y: 0.6 },
            colors: ['#ffb3c6', '#ff5d8f', '#ffffff', '#FFD700']
        });

        giftScreen.style.opacity = "0";
        giftScreen.style.visibility = "hidden";

        setTimeout(() => {
            giftScreen.style.display = "none";
            mainContent.classList.remove("hidden");
            window.dispatchEvent(new Event('scroll'));
        }, 1000); 
    });

    // --- Fluid Scroll Animations ---
    const hiddenElements = document.querySelectorAll('.hidden-scroll');
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('show-scroll');
                    // We purposefully don't unobserve here if you want it to trigger constantly,
                    // but usually once is best for a clean UI experience.
                    observer.unobserve(entry.target); 
                }
            });
        }, { threshold: 0.15 });

        hiddenElements.forEach((el) => observer.observe(el));
    } else {
        hiddenElements.forEach((el) => el.classList.add('show-scroll'));
    }

    // --- BULLETPROOF Scratch-Off Ticket Logic using Pointer Events ---
    // This perfectly fixes scratch breaking on mobile touching or fast PC mouse movements
    const canvas = document.getElementById("scratch-canvas");
    if(canvas) {
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        let isDrawing = false;

        function initCanvas() {
            // Guarantee precise pixel mapping
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            
            // Foil coating
            ctx.fillStyle = '#C0C0C0';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Texture Pattern
            ctx.fillStyle = "#A8A8A8";
            for(let i=0; i<40; i++) {
                ctx.beginPath();
                ctx.arc(Math.random()*canvas.width, Math.random()*canvas.height, Math.random()*15 + 5, 0, Math.PI*2);
                ctx.fill();
            }

            // Text
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 26px 'Quicksand', sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("SCRATCH HERE", canvas.width/2, canvas.height/2);
        }

        function getPointerPos(e) {
            const rect = canvas.getBoundingClientRect();
            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        }

        function scratch(e) {
            if (!isDrawing) return;
            const pos = getPointerPos(e);
            
            ctx.globalCompositeOperation = "destination-out"; // Erases existing pixels
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 25, 0, Math.PI * 2);
            ctx.fill();
        }

        // Pointer Events perfectly unify mouse and touch, and setPointerCapture stops it from dropping tracking
        canvas.addEventListener("pointerdown", (e) => {
            isDrawing = true;
            // Capture the pointer to the canvas so it never drops if dragged fast outside
            canvas.setPointerCapture(e.pointerId);
            scratch(e);
        });

        canvas.addEventListener("pointermove", (e) => {
            scratch(e);
        });

        canvas.addEventListener("pointerup", (e) => {
            isDrawing = false;
            canvas.releasePointerCapture(e.pointerId);
        });
        
        // TouchAction is none in CSS, but adding this ensures no weird mobile zoom behaviors
        canvas.addEventListener("touchstart", (e) => e.preventDefault(), { passive: false });

        // Wait to ensure CSS has fully applied sizes
        setTimeout(initCanvas, 200);
        
        // Re-init on severe window resize (debounced)
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(initCanvas, 250);
        });
    }

    // --- Blow out the candle Interaction ---
    cakeContainer.addEventListener("click", () => {
        if (!flame.classList.contains("extinguished")) {
            flame.classList.add("extinguished");
            var duration = 4000;
            var end = Date.now() + duration;

            (function frame() {
                confetti({ particleCount: 8, angle: 60, spread: 80, origin: { x: 0 }, colors: ['#ffb3c6', '#ff5d8f', '#ffffff'] });
                confetti({ particleCount: 8, angle: 120, spread: 80, origin: { x: 1 }, colors: ['#ffb3c6', '#ff5d8f', '#ffffff'] });
                if (Date.now() < end) requestAnimationFrame(frame);
            }());

            wishText.classList.remove("hidden");
        }
    });

});

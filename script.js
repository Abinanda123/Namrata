document.addEventListener("DOMContentLoaded", () => {
    
    // --- Configuration ---
    const CONFIG = {
        particleCount: 25,
        scratchRadius: 25,
        canvasPadding: 10,
        audioVolume: 0.4,
        confettiColors: ['#ffb3c6', '#ff5d8f', '#ffffff', '#FFD700'],
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
    };

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
        if (CONFIG.reducedMotion) return;
        
        const bg = document.getElementById("floating-bg");
        for (let i = 0; i < CONFIG.particleCount; i++) {
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
    function openGift() {
        try {
            bgMusic.volume = CONFIG.audioVolume;
            const playPromise = bgMusic.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => console.log("Audio playback blocked:", e.message));
            }
        } catch (e) {
            console.log("Audio error:", e);
        }

        if (!CONFIG.reducedMotion) {
            confetti({
                particleCount: 200, spread: 90, origin: { y: 0.6 },
                colors: CONFIG.confettiColors
            });
        }

        giftScreen.style.opacity = "0";
        giftScreen.style.visibility = "hidden";

        setTimeout(() => {
            giftScreen.style.display = "none";
            mainContent.classList.remove("hidden");
            window.dispatchEvent(new Event('scroll'));
            
            // Move focus to main content for accessibility
            mainContent.setAttribute('tabindex', '-1');
            mainContent.focus();
        }, 1000);
    }

    giftBox.addEventListener("click", openGift);
    giftBox.addEventListener("keydown", (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openGift();
        }
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
            // Guarantee precise pixel mapping for high-DPI displays
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
            
            // Store CSS size for reference
            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${rect.height}px`;
            
            // Foil coating
            ctx.fillStyle = '#C0C0C0';
            ctx.fillRect(0, 0, rect.width, rect.height);
            
            // Texture Pattern
            ctx.fillStyle = "#A8A8A8";
            for(let i=0; i<40; i++) {
                ctx.beginPath();
                ctx.arc(Math.random()*rect.width, Math.random()*rect.height, Math.random()*15 + 5, 0, Math.PI*2);
                ctx.fill();
            }

            // Text
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 26px 'Quicksand', sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("SCRATCH HERE", rect.width/2, rect.height/2);
        }

        function getPointerPos(e) {
            const rect = canvas.getBoundingClientRect();
            return {
                x: (e.clientX - rect.left),
                y: (e.clientY - rect.top)
            };
        }

        function scratch(e) {
            if (!isDrawing) return;
            const pos = getPointerPos(e);
            
            ctx.globalCompositeOperation = "destination-out"; // Erases existing pixels
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, CONFIG.scratchRadius, 0, Math.PI * 2);
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
            
            if (!CONFIG.reducedMotion) {
                var duration = 4000;
                var end = Date.now() + duration;

                (function frame() {
                    confetti({ particleCount: 8, angle: 60, spread: 80, origin: { x: 0 }, colors: CONFIG.confettiColors });
                    confetti({ particleCount: 8, angle: 120, spread: 80, origin: { x: 1 }, colors: CONFIG.confettiColors });
                    if (Date.now() < end) requestAnimationFrame(frame);
                }());
            }

            wishText.classList.remove("hidden");
        }
    });

    // Add keyboard support for cake interaction
    cakeContainer.setAttribute('tabindex', '0');
    cakeContainer.setAttribute('role', 'button');
    cakeContainer.setAttribute('aria-label', 'Tap to blow out the candle');
    cakeContainer.addEventListener("keydown", (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            cakeContainer.click();
        }
    });

    // --- Mobile Flip Card Fix ---
    const flipCards = document.querySelectorAll('.flip-card');
    flipCards.forEach(card => {
        card.addEventListener('click', function() {
            this.classList.toggle('flipped');
        });
    });

});

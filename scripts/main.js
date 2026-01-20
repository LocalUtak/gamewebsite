/**
 * VANTIX CORE ENGINE v8.2
 * High-Fidelity Particles + Mechanical Navigation
 */

const Vantix = {
    UI: {
        boot() {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    document.body.classList.add('system-ready');
                    Vantix.UI.syncThemeLabels();
                }, 400);
            });
        },

        syncThemeLabels() {
            const label = document.getElementById('ui-theme-name');
            const classes = document.documentElement.classList;
            let active = "SYNCED";
            classes.forEach(c => {
                if (c.startsWith('theme-')) active = c.replace('theme-', '').toUpperCase();
            });
            if (label) label.innerText = active;
        },

        nav(el, page) {
            const bar = document.querySelector('.loading-fill');
            const frame = document.getElementById('content-iframe');

            document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
            el.classList.add('active');

            // TRANSITION SEQUENCE
            bar.style.width = "40%";
            frame.style.opacity = "0.2";
            frame.style.filter = "blur(8px)";
            frame.style.transform = "scale(0.99) translateY(5px)";

            setTimeout(() => {
                frame.src = "pages/" + page;
                frame.onload = () => {
                    bar.style.width = "100%";
                    frame.style.opacity = "1";
                    frame.style.filter = "blur(0px)";
                    frame.style.transform = "scale(1) translateY(0)";
                    setTimeout(() => {
                        bar.style.width = "0%";
                    }, 400);
                };
            }, 250);
        },

        // Add this to the Vantix.UI block in scripts/main.js
        navToGame(gameId) {
            // Find the Library link in the sidebar to simulate a click
            const libraryLink = document.querySelector('.nav-link[onclick*="games.html"]');

            // Use your existing nav function to handle the animation and page swap
            // We append the gameId as a search parameter
            this.nav(libraryLink, `games.html?launch=${gameId}`);
        },
    },

    Visuals: {
        run() {
            const canvas = document.getElementById('particle-canvas');
            const ctx = canvas.getContext('2d');
            let particles = [];

            const resize = () => {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            };
            window.addEventListener('resize', resize);
            resize();

            class Particle {
                constructor() {
                    this.init();
                }
                init() {
                    this.x = Math.random() * canvas.width;
                    this.y = Math.random() * canvas.height;
                    this.vx = (Math.random() - 0.5) * 0.3;
                    this.vy = (Math.random() - 0.5) * 0.3;
                    this.size = Math.random() * 2;
                }
                update() {
                    this.x += this.vx;
                    this.y += this.vy;
                    if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.init();
                }
                draw() {
                    const acc = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
                    ctx.fillStyle = acc;
                    ctx.globalAlpha = 0.15;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            for (let i = 0; i < 80; i++) particles.push(new Particle());

            const animate = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                particles.forEach(p => { p.update(); p.draw(); });
                requestAnimationFrame(animate);
            };
            animate();
        }
    },

    Telemetry: {
        start() {
            setInterval(() => {
                const load = Math.floor(Math.random() * 15) + 5;
                const loadEl = document.getElementById('load-pct');
                const fillEl = document.getElementById('load-fill');
                if (loadEl) loadEl.innerText = load + "%";
                if (fillEl) fillEl.style.width = load + "%";
            }, 3000);
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Vantix.UI.boot();
    Vantix.Visuals.run();
    Vantix.Telemetry.start();
});

/**
 * VANTIX LIVE-SYNC BRIDGE
 * Add to index.html to enable instant theme swapping
 */
window.addEventListener('storage', (event) => {
    // 1. Listen for Theme Changes
    if (event.key === 'vantix-theme') {
        const newTheme = event.newValue;
        document.documentElement.className = `theme-${newTheme}`;
        console.log(`[ZENITH] Theme synced: ${newTheme}`);
    }

    // 2. Listen for Wallpaper Changes
    if (event.key === 'vantix-custom-bg') {
        const newBg = event.newValue;
        if (newBg) {
            document.body.style.backgroundImage = `url(${newBg})`;
            document.body.style.backgroundSize = 'cover';
        } else {
            document.body.style.backgroundImage = 'none';
        }
    }
});

// Initial Load: Apply saved settings on startup
(function () {
    const savedTheme = localStorage.getItem('vantix-theme');
    const savedBg = localStorage.getItem('vantix-custom-bg');
    if (savedTheme) document.documentElement.className = `theme-${savedTheme}`;
    if (savedBg) document.body.style.backgroundImage = `url(${savedBg})`;
})();


window.addEventListener('message', (event) => {
    if (event.data.action === 'changePage') {
        const targetPage = event.data.page; // 'games' or 'favorites'
        
        // This targets the exact links in your index.html sidebar
        const sidebarLink = document.querySelector(`.nav-link[onclick*="${targetPage}.html"]`);
        
        if (sidebarLink) {
            // This triggers your core nav function (animations + highlight swap)
            Vantix.UI.nav(sidebarLink, `${targetPage}.html`);
        } else {
            // Fallback for safety
            const frame = document.getElementById('content-iframe');
            if (frame) frame.src = `pages/${targetPage}.html`;
        }
    }
});
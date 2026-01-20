/**
 * VANTIX HOME ENGINE
 * Modern dashboard with theme support
 */

class VantixHome {
    constructor() {
        this.phrases = ["VANTIX", "THE ARADE", "BEAUTY", "PEACE"];
        this.pIdx = 0;
        this.cIdx = 0;
        this.isDel = false;
        this.init();
    }

    init() {
        this.updateHUD();
        this.handleBattery();
        this.typeAnimation();
        setInterval(() => this.updateHUD(), 1000);
    }

    updateHUD() {
        const now = new Date();
        document.getElementById('v-clock').innerText = now.toLocaleTimeString('en-US', { hour12: false });
        document.getElementById('v-ping').innerText = Math.floor(Math.random() * 15 + 5) + "MS";
    }

    handleBattery() {
        // Try modern Battery Status API
        if (navigator.getBattery) {
            navigator.getBattery().then(bat => {
                const update = () => {
                    this.updateBatteryUI(bat.level, bat.charging);
                };
                update();
                bat.onlevelchange = update;
                bat.onchargingchange = update;
            });
        }
        // Fallback: Try older API
        else if (navigator.battery) {
            const bat = navigator.battery;
            const update = () => {
                this.updateBatteryUI(bat.level, bat.charging);
            };
            update();
            bat.addEventListener('levelchange', update);
            bat.addEventListener('chargingchange', update);
        }
        // If API not available, show default
        else {
            document.getElementById('v-bat-percent').innerText = "--";
        }
    }

    updateBatteryUI(level, charging) {
        const percent = Math.floor(level * 100);
        const fillEl = document.getElementById('v-bat-fill');
        const percentEl = document.getElementById('v-bat-percent');
        const boltEl = document.getElementById('v-bolt-icon');

        // Calculate color from green to red based on battery level
        let color;
        if (percent >= 50) {
            // Green to Yellow (100% to 50%)
            const ratio = (100 - percent) / 50;
            const r = Math.floor(255 * ratio);
            const g = 255;
            const b = 0;
            color = `rgb(${r}, ${g}, ${b})`;
        } else {
            // Yellow to Red (50% to 0%)
            const ratio = percent / 50;
            const r = 255;
            const g = Math.floor(255 * ratio);
            const b = 0;
            color = `rgb(${r}, ${g}, ${b})`;
        }

        fillEl.style.width = percent + "%";
        fillEl.style.background = color;
        fillEl.style.boxShadow = `0 0 8px ${color}80`;
        percentEl.innerText = percent + "%";
        percentEl.style.color = color;

        if (charging) {
            boltEl.classList.add('charging');
        } else {
            boltEl.classList.remove('charging');
        }
    }

    typeAnimation() {
        const target = document.getElementById('hero-text');
        const phrase = this.phrases[this.pIdx];

        if (!this.isDel) {
            target.innerText = phrase.substring(0, this.cIdx++);
            let speed = 100;

            if (this.cIdx > phrase.length) {
                speed = 2500;
                this.isDel = true;
            }
            setTimeout(() => this.typeAnimation(), speed);
        } else {
            target.innerText = phrase.substring(0, this.cIdx--);
            let speed = 50;

            if (this.cIdx < 0) {
                speed = 500;
                this.isDel = false;
                this.pIdx = (this.pIdx + 1) % this.phrases.length;
                this.cIdx = 0;
            }
            setTimeout(() => this.typeAnimation(), speed);
        }
    }
}

function playGame(slug) {
    console.log("Launching game: " + slug);
    // Navigate to game
}

// Apply theme from localStorage
document.addEventListener('DOMContentLoaded', () => {
    const exploreBtn = document.querySelector('.explore-btn'); // Double check these classes
    const favsBtn = document.querySelector('.favorite-btn');

    if (exploreBtn) {
        exploreBtn.onclick = () => {
            // Sends a message to main.js
            window.parent.postMessage({ action: 'changePage', page: 'games' }, '*');
        };
    }

    if (favsBtn) {
        favsBtn.onclick = () => {
            window.parent.postMessage({ action: 'changePage', page: 'favorites' }, '*');
        };
    }
    // Get theme from cookie set by engine.js
    const getVantixCookie = (name) => {
        let value = `; ${document.cookie}`;
        let parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    };

    const activeTheme = getVantixCookie('vantix-theme') || 'default';
    if (activeTheme !== 'default') {
        document.documentElement.classList.add(`theme-${activeTheme}`);
    }

    // Initialize home engine
    new VantixHome();
});

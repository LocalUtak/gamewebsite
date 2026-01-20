/**
 * VANTIX ZENITH COMMAND ENGINE v4.0.2
 * Direct bridge to engine.js Cookie/Storage schema
 */

class ZenithKernel {
    constructor() {
        this.startTime = Date.now();
        this.logs = [];
        this.tips = [
            "Use 'About:Blank' cloaking for maximum tab stealth.",
            "Storage exceeding 10MB may degrade system performance.",
            "Panic keys can be bound to almost any non-system key.",
            "Themes require 'engine.js' to be active in the page header."
        ];

        this.init();
    }

    async init() {
        this.bindEvents();
        this.startSystemClocks();
        await this.calculateStorage(); // Wait for the disk scan
        this.loadCurrentState();
        this.log("Zenith Kernel Handshake: SUCCESS");
    }

    // --- SYSTEM UTILS ---
    log(msg) {
        const terminal = document.getElementById('v-kernel-terminal');
        const entry = document.createElement('div');
        entry.className = 'v-log-line';
        entry.innerText = `[${new Date().toLocaleTimeString()}] > ${msg}`;
        terminal.prepend(entry);
        console.log(`[VANTIX] ${msg}`);
    }

    notify(title, message) {
        const hub = document.getElementById('v-notification-dispatcher');
        const toast = document.createElement('div');
        toast.className = 'v-toast';
        toast.innerHTML = `<h4>${title.toUpperCase()}</h4><p>${message}</p>`;

        hub.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 500);
        }, 5000);
    }

    setVantixCookie(name, value) {
        const d = new Date();
        d.setTime(d.getTime() + (30 * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`;
    }

    // --- CORE LOGIC ---
    bindEvents() {
        // Navigation Switcher
        document.querySelectorAll('.v-nav-item').forEach(btn => {
            btn.onclick = () => {
                const target = btn.dataset.target;
                document.querySelectorAll('.v-nav-item, .v-panel').forEach(el => el.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById(`panel-${target}`).classList.add('active');
                this.log(`Navigation: Panel switch -> ${target}`);
            };
        });

        // Theme Selection Preview
        document.getElementById('v-theme-select').onchange = (e) => {
            const theme = e.target.value;
            document.getElementById('v-mock-ui').className = `v-mock-shell theme-${theme}`;
            this.log(`System: Buffering theme preview -> ${theme}`);
        };

        // Commit Appearance
        document.getElementById('v-save-appearance').onclick = () => {
            const theme = document.getElementById('v-theme-select').value;
            const bgUrl = document.getElementById('v-bg-url').value;

            // Save to LocalStorage to trigger the 'storage' event in other tabs
            localStorage.setItem('vantix-theme', theme);

            if (bgUrl) {
                localStorage.setItem('vantix-custom-bg', bgUrl);
            }

            // Still set the cookie for engine.js compatibility
            this.setVantixCookie('vantix-theme', theme);

            // Update the settings page UI immediately too
            document.documentElement.className = `theme-${theme}`;

            this.notify("Live Sync Active", "Theme broadcasted to all Vantix tabs.");
            this.log(`Broadcast: Theme [${theme}] sent to system bus.`);
        };

        // BG File Upload
        document.getElementById('v-bg-upload').onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = () => {
                localStorage.setItem('vantix-custom-bg', reader.result);
                this.notify("Asset Buffered", "Background image converted to binary.");
                this.calculateStorage();
            };
            reader.readAsDataURL(file);
        };

        // BG Purge
        document.getElementById('v-purge-bg').onclick = () => {
            localStorage.removeItem('vantix-custom-bg');
            this.notify("Asset Purged", "Background cache cleared.");
            this.calculateStorage();
        };

        // Cloak Presets
        document.querySelectorAll('.v-preset-item').forEach(item => {
            item.onclick = () => {
                document.getElementById('v-cloak-title').value = item.dataset.title;
                document.getElementById('v-cloak-icon').value = item.dataset.icon;
                this.log(`Preset: Loaded ${item.dataset.title} cloak data.`);
            };
        });

        // Save Cloak
        document.getElementById('v-save-cloak').onclick = () => {
            const cloak = {
                title: document.getElementById('v-cloak-title').value,
                icon: document.getElementById('v-cloak-icon').value
            };
            localStorage.setItem('vantix-cloak-data', JSON.stringify(cloak));
            this.notify("Cloak Deployed", "Refresh to apply tab disguise.");
        };

        // Save Panic
        document.getElementById('v-save-panic').onclick = () => {
            localStorage.setItem('vantix-panic-key', document.getElementById('v-panic-key').value);
            localStorage.setItem('vantix-panic-url', document.getElementById('v-panic-url').value);
            this.notify("Panic Armed", "Emergency protocols active.");
        };

        // Download Data
        document.getElementById('v-download-data').onclick = () => {
            this.exportData();
        };

        // Upload Data
        document.getElementById('v-upload-data').onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                this.importData(file);
            }
        };

        // Factory Reset
        // Factory Reset
        // Universal Nuclear Factory Reset
        document.getElementById('v-factory-reset').onclick = async () => {
            if (confirm("EXECUTE TOTAL PURGE? This will wipe all game saves, favorites, and settings across ALL tabs.")) {

                // 1. BROADCAST: Tell all other open tabs to clear and redirect
                localStorage.setItem('vantix-purge-signal', Date.now().toString());

                // 2. LOCAL STORAGE & SESSION: Clear immediately
                localStorage.clear();
                sessionStorage.clear();

                // 3. COOKIES: Loop through and incinerate every cookie found
                const cookies = document.cookie.split(";");
                for (let i = 0; i < cookies.length; i++) {
                    const cookie = cookies[i];
                    const eqPos = cookie.indexOf("=");
                    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();

                    // Delete for root path and potential sub-domains
                    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
                    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname.replace(/^www\./, '')};`;
                }

                // 4. INDEXEDDB: Delete all Game Databases (The part that resets the games)
                if (window.indexedDB && window.indexedDB.databases) {
                    try {
                        const dbs = await window.indexedDB.databases();
                        for (const db of dbs) {
                            window.indexedDB.deleteDatabase(db.name);
                        }
                    } catch (e) {
                        console.log("Database purge skipped or failed.");
                    }
                }

                // 5. UI NOTIFICATION
                if (this.notify) {
                    this.notify("SYSTEM PURGED", "All site data and game saves incinerated.");
                }

                // 6. FINAL REDIRECT: Kick back to homepage after a short delay
                setTimeout(() => {
                    window.location.href = "../pages/home.html";
                }, 1200);
            }
        };
    }

    // --- DATA EXPORT/IMPORT ---
    // --- DATA EXPORT/IMPORT ---
    // --- DATA EXPORT/IMPORT ---

    // 1. Add this to your init() or constructor to load the library immediately
    injectEncryptionEngine() {
        if (!document.querySelector('#crypto-js-lib')) {
            const s = document.createElement("script");
            s.id = 'crypto-js-lib';
            s.src = "https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js";
            document.head.appendChild(s);
            this.log("Kernel: Encryption Engine requested...");
        }
    }

    // 2. The Fixed Export Function
    async exportData() {
        try {
            const bundle = {
                ls: { ...localStorage },
                ck: document.cookie
            };

            const blob = new Blob([JSON.stringify(bundle)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');

            a.href = url;
            a.download = `backup_${Date.now()}.save`;
            document.body.appendChild(a);
            a.click();

            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Export failed:", err);
        }
    }




    async importData(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const bundle = JSON.parse(e.target.result);

                // 1. Restore LocalStorage
                localStorage.clear();
                for (const [key, value] of Object.entries(bundle.ls)) {
                    localStorage.setItem(key, value);
                }

                // 2. Restore Cookies (Forced to Root Path)
                if (bundle.ck) {
                    const cookies = bundle.ck.split(';');
                    for (let cookie of cookies) {
                        const trimmed = cookie.trim();
                        if (trimmed) {
                            // The 'path=/' is the fix for settings.html
                            document.cookie = `${trimmed}; expires=Tue, 19 Jan 2027 00:00:00 UTC; path=/; SameSite=Lax`;
                        }
                    }
                }

                alert("Import Successful. System Reloading...");
                window.location.href = "index.html";
            } catch (err) {
                console.error("Import failed:", err);
                alert("Error: Invalid save file.");
            }
        };
        reader.readAsText(file);
    }




    // --- SYSTEM MONITORING ---
    async calculateStorage() {
        this.log("Diagnostic: Initializing Deep Storage Scan...");

        let lsBytes = 0; // LocalStorage
        let idbBytes = 0; // IndexedDB & Cache
        let cookieBytes = encodeURI(document.cookie).split(/;(?=\s)|(?<=\s);/).join("").length;

        // 1. Calculate LocalStorage (Settings, Themes, Panic Keys)
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const val = localStorage.getItem(key);
            lsBytes += (key.length + val.length) * 2; // UTF-16 characters = 2 bytes
        }

        // 2. Calculate IndexedDB (Game Saves & Assets)
        // Using the StorageManager API for absolute accuracy
        if (navigator.storage && navigator.storage.estimate) {
            const estimate = await navigator.storage.estimate();
            idbBytes = estimate.usage || 0;
        }

        const totalBytes = lsBytes + idbBytes + cookieBytes;
        const totalMb = (totalBytes / (1024 * 1024)).toFixed(2);

        // 3. Update UI Elements
        // We'll set a 50MB "Soft Limit" for the progress bar 
        // because IndexedDB can technically grow to GBs
        const maxDisplayBytes = 50 * 1024 * 1024;
        const percent = Math.min((totalBytes / maxDisplayBytes) * 100, 100);

        const bar = document.getElementById('v-storage-bar');
        const usedLabel = document.getElementById('v-storage-used');
        const totalStorageEl = document.getElementById('v-total-storage');
        const cacheSizeEl = document.getElementById('v-cache-size');

        if (bar) bar.style.width = `${percent}%`;
        if (usedLabel) usedLabel.innerText = `${totalMb} MB`;

        if (totalStorageEl) {
            totalStorageEl.innerText = `${totalMb} MB`;
        }

        // Specific breakdown for the logs
        const idbMb = (idbBytes / (1024 * 1024)).toFixed(2);
        const lsKb = (lsBytes / 1024).toFixed(1);

        this.log(`Diagnostic: Total ${totalMb}MB [Database: ${idbMb}MB | Kernel: ${lsKb}KB]`);

        // If a custom background exists, update the "Cache" stat specifically
        if (cacheSizeEl) {
            const bg = localStorage.getItem('vantix-custom-bg') || "";
            const bgMb = ((bg.length * 2) / (1024 * 1024)).toFixed(2);
            cacheSizeEl.innerText = `${bgMb} MB`;
        }
    }

    startSystemClocks() {
        setInterval(() => {
            const clock = document.getElementById('v-live-clock');
            if (clock) clock.innerText = new Date().toLocaleTimeString();
        }, 1000);
    }

    loadCurrentState() {
        // Fetch theme from both Cookie (Engine) and LocalStorage (Kernel)
        const theme = localStorage.getItem('vantix-theme') || 'default';
        const label = document.getElementById('v-active-theme-label');

        if (label) label.innerText = theme.toUpperCase();
        document.documentElement.className = `theme-${theme}`;

        this.log(`Kernel: Environment set to [${theme}] mode.`);
    }
}

// Initialize Kernel
document.addEventListener('DOMContentLoaded', () => {
    window.Kernel = new ZenithKernel();
});

// --- Update this specific block in your settings.js ---

document.addEventListener("DOMContentLoaded", () => {
    const themes = ['default', 'mocha', 'midnight', 'ocean', 'cyberpunk', 'forest', 'sunset', 'lavender', 'emerald', 'strawberry', 'deep-space', 'sunset-blaze', 'mint', 'noir'];
    let currentTheme = localStorage.getItem('v_theme') || 'default';
    let favorites = JSON.parse(localStorage.getItem('v_favs')) || [];

    // 1. APPLY THEME
    const applyT = (theme) => {
        document.body.className = '';
        if (theme !== 'default') document.body.classList.add(`theme-${theme}`);
        localStorage.setItem('v_theme', theme);
    };
    applyT(currentTheme);

    // 2. BUILD OVERLAY (With All Buttons & Spinner)
    const overlay = document.createElement('div');
    overlay.id = 'game-overlay';
    overlay.innerHTML = `
        <div id="game-splash-container">
            <div class="splash-rays"></div>
            <div class="splash-content">
                <img id="splash-icon" src="">
                <h1 id="splash-title" style="margin:0; font-size:3rem; color:#fff;"></h1>
                <p style="color:var(--accent); letter-spacing:4px; font-weight:800; margin-bottom:30px;">VANTIX ULTRA READY</p>
                <button id="play-now-trigger" class="play-btn-pro">PLAY NOW</button>
            </div>
        </div>
        <div id="game-loader" style="position:absolute; inset:0; bottom:90px; background:var(--bg-dark); display:none; flex-direction:column; align-items:center; justify-content:center; z-index:11;">
            <div class="v-spinner"></div>
            <p style="margin-top:20px; color:var(--accent); font-weight:800; letter-spacing:2px;">LOADING ENGINE...</p>
        </div>
        <iframe id="game-iframe" style="display:none;" allow="autoplay; fullscreen; keyboard"></iframe>
        <div class="game-controls">
            <span id="active-game-name">STANDBY...</span>
            <div class="btn-group">
                <button class="control-btn" id="fav-btn" data-tip="Favorite"><span class="material-symbols-rounded">star</span></button>
                <button class="control-btn" id="cloak-btn" data-tip="Secret Tab"><span class="material-symbols-rounded">open_in_new</span></button>
                <button class="control-btn" id="reload-btn" data-tip="Reload"><span class="material-symbols-rounded">refresh</span></button>
                <button class="control-btn" id="full-btn" data-tip="Fullscreen"><span class="material-symbols-rounded">fullscreen</span></button>
                <button class="control-btn" id="close-btn" data-tip="Exit" style="background:#ff4444; border:none;"><span class="material-symbols-rounded">close</span></button>
            </div>
        </div>
    `;

    const updateFavUI = (name) => {
        const btn = document.getElementById('fav-btn');
        if (!btn) return;
        const isFav = favorites.includes(name);
        btn.querySelector('span').style.fontVariationSettings = isFav ? "'FILL' 1" : "'FILL' 0";
        btn.style.color = isFav ? "var(--accent)" : "white";
    };

    document.body.appendChild(overlay);

    const iframe = document.getElementById('game-iframe');
    const splash = document.getElementById('game-splash-container');
    const loader = document.getElementById('game-loader');
    let curUrl = ""; let curName = "";

    // 3. LAUNCH LOGIC
    const launch = (url, name, thumb) => {
        curUrl = url; curName = name;
        document.getElementById('splash-icon').src = thumb;
        document.getElementById('splash-title').innerText = name.toUpperCase();

        // Create a flag so we only reload ONCE
        window.needsReload = true;

        updateFavUI(name);
        overlay.style.display = 'flex';
        splash.style.display = 'flex';
        iframe.style.display = 'none';
        loader.style.display = 'none';
    };


    // This watches the game window for that "Black Screen" state
    iframe.addEventListener('load', () => {
        if (window.needsReload) {
            window.needsReload = false; // Turn off the flag so it doesn't loop
            console.log("[SYSTEM] Black-screen prevention: Forcing engine restart...");

            // Use a tiny timeout to let the browser settle
            setTimeout(() => {
                iframe.contentWindow.location.reload();
            }, 50);
        }
    });

    // Add this inside your DOMContentLoaded block
    // DELETE THIS PART COMPLETELY




    const showNotification = (message) => {
        const notif = document.createElement('div');
        notif.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--accent);
            color: var(--bg-dark);
            padding: 15px 25px;
            border-radius: 8px;
            font-weight: 800;
            letter-spacing: 2px;
            z-index: 999;
            animation: slideIn 0.3s ease-out;
        `;
        notif.innerText = message;
        document.body.appendChild(notif);
        setTimeout(() => {
            notif.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notif.remove(), 300);
        }, 2000);
    };

    document.getElementById('play-now-trigger').onclick = () => {
        splash.style.display = 'none';
        loader.style.display = 'flex';
        iframe.src = curUrl;
        iframe.onload = () => {
            loader.style.display = 'none';
            iframe.style.display = 'block';
            document.getElementById('active-game-name').innerText = curName.toUpperCase();
        };
    };

    // 4. GRID & SEARCH
    document.querySelector('.game-grid').onclick = (e) => {
        const a = e.target.closest('a');
        if (a) { e.preventDefault(); launch(a.href, a.querySelector('img').alt, a.querySelector('img').src); }
    };

    document.getElementById('gameSearch').oninput = (e) => {
        const val = e.target.value.toLowerCase();
        document.querySelectorAll('.game-grid a').forEach(card => {
            const name = card.querySelector('img').alt.toLowerCase();
            card.classList.toggle('loaded', name.includes(val));
            card.style.display = name.includes(val) ? 'block' : 'none';
        });
    };

    // 5. BUTTON ACTIONS
    // Update your existing fav-btn logic:
    document.getElementById('fav-btn').onclick = () => {
        if (!curName) return;

        if (favorites.includes(curName)) {
            favorites = favorites.filter(f => f !== curName);
        } else {
            favorites.push(curName);
        }

        localStorage.setItem('v_favs', JSON.stringify(favorites));
        updateFavUI(curName);
    };



    document.getElementById('cloak-btn').onclick = () => {
        const win = window.open('about:blank', '_blank');
        win.document.body.innerHTML = `<iframe src="${curUrl}" style="position:fixed; inset:0; width:100%; height:100%; border:none;"></iframe>`;
    };

    document.getElementById('close-btn').onclick = () => { overlay.style.display = 'none'; iframe.src = 'about:blank'; };
    document.getElementById('reload-btn').onclick = () => iframe.src = curUrl;
    document.getElementById('full-btn').onclick = () => iframe.requestFullscreen();

    // Random Game + Theme Cycle
    const rBtn = document.querySelector('.random-btn');
    if (rBtn) {
        rBtn.onclick = () => {
            const all = Array.from(document.querySelectorAll('.game-grid a.loaded'));
            if (all.length > 0) {
                const p = all[Math.floor(Math.random() * all.length)];
                launch(p.href, p.querySelector('img').alt, p.querySelector('img').src);
            }
        };
        rBtn.oncontextmenu = (e) => {
            e.preventDefault();
            let idx = (themes.indexOf(currentTheme) + 1) % themes.length;
            currentTheme = themes[idx];
            applyT(currentTheme);
        };
    }

    // 6. ADDED: SHUFFLE GRID FUNCTION
    window.shuffleLibrary = () => {
        const grid = document.querySelector('.game-grid');
        const cards = Array.from(grid.children);
        for (let i = cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            grid.appendChild(cards[j]);
        }
        showNotification('LIBRARY SHUFFLED');
    };

    // 7. ADDED: TRENDING / AUTO-LAUNCH LOGIC
    const checkForAutoLaunch = () => {
        const params = new URLSearchParams(window.location.search);
        const gameId = params.get('launch');

        if (gameId) {
            const cleanId = gameId.toLowerCase().replace(/-/g, ' ');
            const allGames = document.querySelectorAll('.game-grid a');
            let found = null;

            allGames.forEach(a => {
                const alt = a.querySelector('img').alt.toLowerCase();
                if (alt.includes(cleanId) || cleanId.includes(alt)) {
                    found = a;
                }
            });

            if (found) {
                setTimeout(() => {
                    launch(found.href, found.querySelector('img').alt, found.querySelector('img').src);
                }, 200);
            }
        }
    };

    // Initialize Card Titles
    document.querySelectorAll('.game-grid a').forEach(a => {
        const t = document.createElement('div');
        t.className = 'game-title-auto';
        t.innerText = a.querySelector('img').alt;
        a.appendChild(t);
        a.classList.add('loaded');
    });

    document.querySelectorAll('.game-grid a').forEach(card => {
        const name = card.querySelector('img').alt;
        if (favorites.includes(name)) card.classList.add('favorited');
    });



    // Run Auto-Launch check on load
    checkForAutoLaunch();
});
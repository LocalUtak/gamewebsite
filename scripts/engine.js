(function () {
    /** * KEEPING OLD LOGIC: Theme Engine 
     */
    const getVantixCookie = (name) => {
        let value = `; ${document.cookie}`;
        let parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    };

    const activeTheme = getVantixCookie('vantix-theme') || 'default';
    if (activeTheme !== 'default') {
        document.documentElement.classList.add(`theme-${activeTheme}`);
    }

    /** * KEEPING OLD LOGIC: Global Panic Key
     */
    window.addEventListener('keydown', (e) => {
        const panicKey = localStorage.getItem('vantix-panic-key');
        const panicUrl = localStorage.getItem('vantix-panic-url') || "https://classroom.google.com";

        if (e.key === panicKey) {
            window.top.location.href = panicUrl.startsWith('http') ? panicUrl : `https://${panicUrl}`;
        }
    });

    /** * CLOAKING & VISUALS + NEW FAVORITES LOGIC
     */
    document.addEventListener('DOMContentLoaded', async () => {
        // --- Keep Old Logic: Backgrounds ---
        const customBg = localStorage.getItem('vantix-custom-bg');
        if (customBg) {
            document.body.style.backgroundImage = `url(${customBg})`;
            document.body.style.backgroundSize = "cover";
            document.body.style.backgroundAttachment = "fixed";
        }

        // --- Keep Old Logic: Tab Cloak ---
        const cloak = JSON.parse(localStorage.getItem('vantix-cloak-data'));
        if (cloak) {
            document.title = cloak.title;
            let link = document.querySelector("link[rel*='icon']") || document.createElement('link');
            link.rel = 'shortcut icon';
            link.href = cloak.icon;
            document.head.appendChild(link);
        }

        // --- NEW LOGIC: Populate Favorites Grid ---
        const grid = document.getElementById('favoriteGrid');
        if (grid) {
            try {
                // Fetch games.html to get card data
                const response = await fetch('games.html');
                const html = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');

                grid.innerHTML = '';
                const favorites = JSON.parse(localStorage.getItem('v_favs')) || [];

                favorites.forEach(favName => {
                    const originalCard = doc.querySelector(`.game-grid a img[alt="${favName}"]`)?.parentElement;
                    if (originalCard) {
                        const clone = originalCard.cloneNode(true);
                        clone.classList.add('loaded');

                        // --- BALANCED TITLE INJECTOR ---
                        const titleContainer = document.createElement('div');
                        titleContainer.className = 'game-title-auto';

                        // Overriding to hit that "middle ground"
                        titleContainer.style.padding = "14px 10px";      // Reduced from 20px to make it less "chunky"
                        titleContainer.style.fontSize = "0.9rem";       // Increased from 0.7rem for better visibility
                        titleContainer.style.fontWeight = "800";        // Keeps it bold and premium
                        titleContainer.style.letterSpacing = "0.5px";   // Tighter spacing for larger text
                        titleContainer.style.lineHeight = "1.2";

                        titleContainer.innerText = favName; // Removed toUpperCase for a more natural look

                        clone.appendChild(titleContainer);

                        clone.onclick = (e) => {
                            e.preventDefault();
                            window.location.href = `games.html?launch=${encodeURIComponent(favName)}`;
                        };
                        grid.appendChild(clone);
                    }
                });

                if (favorites.length === 0) {
                    grid.innerHTML = '<div style="color:var(--accent); text-align:center; grid-column:1/-1; padding:40px;">No favorites added yet.</div>';
                }
            } catch (err) {
                console.error("Favorites load error:", err);
            }
        }
    });
})();

// KEEPING OLD LOGIC: Live Sync Bridge
window.addEventListener('storage', (event) => {
    if (event.key === 'vantix-theme') {
        const newTheme = event.newValue;
        document.documentElement.className = `theme-${newTheme}`;
    }
    if (event.key === 'vantix-custom-bg') {
        const newBg = event.newValue;
        document.body.style.backgroundImage = newBg ? `url(${newBg})` : 'none';
    }
});
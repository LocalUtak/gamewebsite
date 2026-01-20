/**
 * VANTIX TRENDING ENGINE
 * Location: Root/scripts/trending.js
 * Purpose: Bridges Home Page cards to the Games Library
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Select all trending cards on the home page
    const trendingCards = document.querySelectorAll('.trend-card');

    trendingCards.forEach(card => {
        card.style.cursor = 'pointer';

        card.addEventListener('click', () => {
            // 2. Extract game info from the card
            // We use the H4 text as the unique identifier for the launch param
            const gameTitle = card.querySelector('h4').innerText.trim();
            
            // 3. Construct the redirection URL
            // We encode the URI to handle spaces (e.g., "Drive Mad" -> "Drive%20Mad")
            // ADJUST PATH: If your games page is in the same folder, remove 'pages/'
            const targetUrl = `pages/games.html?launch=${encodeURIComponent(gameTitle)}`;

            console.log(`[SYSTEM] Initializing handoff for: ${gameTitle}`);
            
            // 4. Execute redirect
            window.location.href = targetUrl;
        });
    });
});
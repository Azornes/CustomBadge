/**
 * Custom Badge Generator - Client Side
 * Generates vertical SVG badges with profile view counts from visitor-badge API
 *
 * Note: This file requires badge-core.js to be loaded first
 */

/**
 * Fetches profile views from visitor-badge API
 * @param {string} username - GitHub username
 * @returns {Promise<number>} - Number of views
 */
async function fetchProfileViews(username) {
    console.log(`Fetching views for: ${username}`);
    
    // Try multiple CORS proxies in order
    const proxies = [
        'https://corsproxy.io/?',
        'https://api.allorigins.win/raw?url=',
        'https://cors-anywhere.herokuapp.com/'
    ];
    
    const badgeUrl = `https://visitor-badge.laobi.icu/badge?page_id=${username}.${username}`;
    
    for (const proxyUrl of proxies) {
        try {
            console.log(`Trying proxy: ${proxyUrl}`);
            const url = proxyUrl + encodeURIComponent(badgeUrl);
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'image/svg+xml,*/*'
                }
            });
            
            if (!response.ok) {
                console.warn(`Proxy ${proxyUrl} returned status: ${response.status}`);
                continue;
            }
            
            const svgContent = await response.text();
            
            // Parse number from SVG <text> element
            const match = svgContent.match(/<text[^>]*textLength="140\.0"[^>]*>(\d+)<\/text>/);
            
            if (match) {
                const totalViews = parseInt(match[1], 10);
                console.log(`✓ Views parsed: ${totalViews}`);
                return totalViews;
            } else {
                // Try alternative parsing method
                const altMatch = svgContent.match(/>(\d+)</g);
                if (altMatch && altMatch.length > 0) {
                    const lastMatch = altMatch[altMatch.length - 1];
                    const views = parseInt(lastMatch.replace(/[<>]/g, ''), 10);
                    if (!isNaN(views)) {
                        console.log(`✓ Views parsed (alternative): ${views}`);
                        return views;
                    }
                }
            }
            
            console.warn('Could not parse views from response');
        } catch (error) {
            console.warn(`Proxy ${proxyUrl} failed:`, error.message);
            continue;
        }
    }
    
    // All proxies failed, return fallback
    console.error('All proxies failed, using fallback value');
    return 1;
}


/**
 * Generates badge for a specific user
 * @param {string} username - GitHub username
 * @param {string} style - Badge style: 'classic' or 'animated' (default: 'animated')
 * @returns {Promise<string>} - SVG content
 */
async function generateBadgeForUser(username, style = 'animated') {
    try {
        const views = await fetchProfileViews(username);
        return BadgeCore.generateBadgeSVG(views, style);
    } catch (error) {
        console.error('Error generating badge:', error);
        // Return error badge
        return BadgeCore.generateBadgeSVG(0, style);
    }
}

/**
 * Check if we're being accessed as a direct badge request
 * If URL is like /CustomBadge/username, return SVG directly
 */
function handleDirectBadgeRequest() {
    const path = window.location.pathname;
    const match = path.match(/\/CustomBadge\/([^\/]+)\/?$/i);
    
    if (match) {
        const username = match[1];
        console.log(`Direct badge request for: ${username}`);
        
        // Set content type to SVG
        document.documentElement.innerHTML = '';
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        
        generateBadgeForUser(username).then(svgContent => {
            // Replace entire page with SVG
            document.open();
            document.write(svgContent);
            document.close();
            
            // Set proper content type in meta tag
            const meta = document.createElement('meta');
            meta.httpEquiv = 'Content-Type';
            meta.content = 'image/svg+xml';
            document.head.appendChild(meta);
        }).catch(error => {
            console.error('Error:', error);
            document.write(BadgeCore.generateBadgeSVG(0));
        });
        
        return true;
    }
    
    return false;
}

// Check for direct badge request on page load
if (window.location.pathname !== '/CustomBadge/' && 
    window.location.pathname !== '/CustomBadge/index.html' &&
    !window.location.pathname.endsWith('/')) {
    handleDirectBadgeRequest();
}
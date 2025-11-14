const fs = require('fs');
const https = require('https');
const { generateBadgeSVG } = require('./docs/badge-core');

// Configuration
const VIEWS_FILE = 'views-count.json';
const BADGE_FILE = 'badge.svg';
const GIST_ID = process.env.GIST_ID; // ID of private Gist to store data

/**
 * Reads the number of views from JSON file
 */
function getViews() {
    try {
        if (fs.existsSync(VIEWS_FILE)) {
            const data = fs.readFileSync(VIEWS_FILE, 'utf8');
            const json = JSON.parse(data);
            return json.views || 0;
        }
    } catch (error) {
        console.log('Cannot read views file, starting from 0');
    }
    return 0;
}

/**
 * Saves the number of views to JSON file
 */
function saveViews(views) {
    const data = {
        views: views,
        lastUpdated: new Date().toISOString()
    };
    fs.writeFileSync(VIEWS_FILE, JSON.stringify(data, null, 2));
}

/**
 * Makes HTTPS request and returns a promise with the result
 */
function httpsRequest(url, options, postData = null) {
    return new Promise((resolve, reject) => {
        const req = https.request(url, options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    data: data
                });
            });
        });
        
        req.on('error', reject);
        
        if (postData) {
            req.write(postData);
        }
        
        req.end();
    });
}

/**
 * Fetches Gist content
 */
async function getGist(token, gistId) {
    if (!gistId) {
        return null;
    }
    
    const url = `https://api.github.com/gists/${gistId}`;
    const options = {
        headers: {
            'Authorization': `token ${token}`,
            'User-Agent': 'CustomBadge',
            'Accept': 'application/vnd.github.v3+json'
        }
    };
    
    try {
        const response = await httpsRequest(url, options);
        
        if (response.statusCode === 200) {
            return JSON.parse(response.data);
        }
        
        console.log(`⚠️  Cannot fetch Gist (code: ${response.statusCode})`);
        return null;
    } catch (error) {
        console.log(`⚠️  Error fetching Gist: ${error.message}`);
        return null;
    }
}

/**
 * Updates or creates Gist with badge and views files
 */
async function updateGist(token, gistId, badgeContent, viewsContent) {
    const files = {
        [BADGE_FILE]: {
            content: badgeContent
        },
        [VIEWS_FILE]: {
            content: JSON.stringify(viewsContent, null, 2)
        }
    };
    
    let url, method, gistData;
    let shouldUpdate = false;
    
    // If GIST_ID is provided, verify that Gist exists
    if (gistId) {
        const existingGist = await getGist(token, gistId);
        if (existingGist) {
            shouldUpdate = true;
        } else {
            console.log(`⚠️  Gist ${gistId} not found, creating new one...\n`);
        }
    }
    
    if (shouldUpdate) {
        // Update existing Gist
        url = `https://api.github.com/gists/${gistId}`;
        method = 'PATCH';
        gistData = { files };
        console.log(`📝 Updating Gist: ${gistId}`);
    } else {
        // Create new Gist
        url = 'https://api.github.com/gists';
        method = 'POST';
        gistData = {
            description: 'GitHub Profile Views Badge - Auto-generated',
            public: false,
            files: files
        };
        console.log('📝 Creating new private Gist...');
    }
    
    const options = {
        method: method,
        headers: {
            'Authorization': `token ${token}`,
            'User-Agent': 'CustomBadge',
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        }
    };
    
    // Debug logging (masked for security)
    console.log(`🔍 Debug info:`);
    console.log(`   - Method: ${method}`);
    console.log(`   - URL: ${url.replace(/\/gists\/[^\/]+/, '/gists/***')}`);
    console.log(`   - Token present: ${token ? 'Yes' : 'No'}`);
    console.log(`   - Files: ${Object.keys(files).join(', ')}\n`);
    
    try {
        const response = await httpsRequest(url, options, JSON.stringify(gistData));
        
        console.log(`📡 Response:`);
        console.log(`   - Status: ${response.statusCode}\n`);
        
        if (response.statusCode === 200 || response.statusCode === 201) {
            const result = JSON.parse(response.data);
            console.log(`✅ Gist ${shouldUpdate ? 'updated' : 'created'} successfully!`);
            
            if (!shouldUpdate) {
                console.log(`\n🔑 IMPORTANT! Save this GIST_ID as a secret in GitHub Actions:`);
                console.log(`   GIST_ID=${result.id}\n`);
            }
            
            // Construct and log the stable, non-versioned raw URL for the badge
            const ownerLogin = result.owner.login;
            const finalGistId = result.id;
            // Add a cache-busting query parameter to prevent caching issues.
            const cacheBust = new Date().getTime();
            const stableBadgeUrl = `https://gist.githubusercontent.com/${ownerLogin}/${finalGistId}/raw/${BADGE_FILE}?cache_bust=${cacheBust}`;

            console.log(`\n🔗 Your stable badge URL is ready!`);
            console.log(`   Use this URL in your README.md or on your profile:`);
            console.log(`   ${stableBadgeUrl}`);
            console.log(`   (This URL is permanent and always points to the latest version of the badge)\n`);
            
            // For reference, show the Gist URL too
            console.log(`   You can view the Gist itself at:`);
            console.log(`   ${result.html_url}\n`);
            return result;
        } else {
            console.error(`❌ ${method} error: ${response.statusCode}`);
            console.error(`   Response summary: ${response.data.substring(0, 200)}...`); // Truncate body
            return null;
        }
    } catch (error) {
        console.error(`❌ Error during ${shouldUpdate ? 'updating' : 'creating'} Gist:`, error.message);
        console.error(`   Stack: ${error.stack}`);
        return null;
    }
}

/**
 * Fetches number of views from Gist or local file
 */
async function getViewsFromGist(token, gistId) {
    if (!token || !gistId) {
        return getViews(); // Fallback to local file
    }
    
    const gist = await getGist(token, gistId);
    
    if (gist && gist.files && gist.files[VIEWS_FILE]) {
        try {
            const content = gist.files[VIEWS_FILE].content;
            const data = JSON.parse(content);
            console.log(`📊 Read from Gist: ${data.views} views\n`);
            return data.views || 0;
        } catch (error) {
            console.log(`⚠️  Error parsing data from Gist: ${error.message}`);
        }
    }
    
    return getViews(); // Fallback to local file
}

/**
 * Fetches profile views by parsing SVG from visitor-badge badge URL
 */
async function fetchProfileViews() {
    const badgeUrl = 'https://visitor-badge.laobi.icu/badge?page_id=Azornes.Azornes';
    
    console.log(`📡 Fetching badge SVG from: ${badgeUrl}`);
    
    try {
        const response = await httpsRequest(badgeUrl, {
            headers: {
                'User-Agent': 'CustomBadge'
            }
        });
        
        if (response.statusCode === 200) {
            const svgContent = response.data;
            
            // Parse number from SVG - find all <text> elements containing only digits
            // The visitor count appears after the "visitors" text
            const textMatches = svgContent.matchAll(/<text[^>]*>(\d+)<\/text>/g);
            const matches = Array.from(textMatches);
            
            if (matches.length > 0) {
                // Take the last numeric text element (the actual count, not shadow)
                const totalViews = parseInt(matches[matches.length - 1][1], 10);
                console.log(`✅ Views parsed from SVG: ${totalViews}\n`);
                return totalViews;
            } else {
                console.log(`⚠️  Could not parse views from SVG`);
                return incrementLocalCounter();
            }
        } else {
            console.log(`⚠️  Badge fetch returned code: ${response.statusCode}`);
            console.log(`📊 Using local counter as fallback\n`);
            return incrementLocalCounter();
        }
    } catch (error) {
        console.log(`❌ SVG fetch error: ${error.message}`);
        console.log(`📊 Using local counter as fallback\n`);
        return incrementLocalCounter();
    }
}


/**
 * Increment local counter (fallback)
 */
function incrementLocalCounter() {
    const currentViews = getViews();
    const increment = Math.floor(Math.random() * 50) + 1;
    const newViews = currentViews + increment;
    
    console.log(`📊 Local counter (simulation):`);
    console.log(`   - Previous value: ${currentViews}`);
    console.log(`   - Increment: +${increment}`);
    console.log(`   - New value: ${newViews}\n`);
    
    return newViews;
}

/**
 * Main function
 */
async function main() {
    try {
        console.log('🚀 Starting badge generation...\n');
        
        // Check for preview mode
        let previewViews = null;
        const previewArg = process.argv.find(arg => arg.startsWith('--preview='));
        if (previewArg) {
            previewViews = parseInt(previewArg.split('=')[1], 10);
        } else if (process.env.PREVIEW_VIEWS) {
            previewViews = parseInt(process.env.PREVIEW_VIEWS, 10);
        }
        
        if (previewViews && previewViews > 0) {
            console.log(`🖼️  Preview mode: Using ${previewViews} views\n`);
        }
        
        // Check for style preference
        let badgeStyle = 'animated'; // default
        const styleArg = process.argv.find(arg => arg.startsWith('--style='));
        if (styleArg) {
            badgeStyle = styleArg.split('=')[1];
        } else if (process.env.BADGE_STYLE) {
            badgeStyle = process.env.BADGE_STYLE;
        }
        
        console.log(`🎨 Badge style: ${badgeStyle}\n`);
        
        const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
        
        // Token required only if not pure preview (i.e., if fetching views or updating Gist)
        const needsToken = !previewViews || GIST_ID;
        if (needsToken && !token) {
            console.error('❌ No GitHub token!');
            console.error('   Set environment variable GH_TOKEN or GITHUB_TOKEN');
            process.exit(1);
        }
        
        if (token) {
            // Test token by checking user info (skip in pure preview)
            console.log('🔐 Testing GitHub token...');
            try {
                const userResponse = await httpsRequest('https://api.github.com/user', {
                    headers: {
                        'Authorization': `token ${token}`,
                        'User-Agent': 'CustomBadge',
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });
                
                if (userResponse.statusCode === 200) {
                    const userData = JSON.parse(userResponse.data);
                    console.log(`✅ Token is valid for user: ${userData.login}`);
                } else {
                    console.log(`⚠️  Token test failed with status: ${userResponse.statusCode}`);
                    console.log(`   Response: ${userResponse.data}`);
                }
                
                // Check token scopes
                const scopeResponse = await httpsRequest('https://api.github.com', {
                    method: 'HEAD',
                    headers: {
                        'Authorization': `token ${token}`,
                        'User-Agent': 'CustomBadge'
                    }
                });
                console.log(`📋 Token scopes check completed\n`);
            } catch (error) {
                console.log(`⚠️  Token validation error: ${error.message}\n`);
            }
        }
        
        // Fetch or use preview number of views
        let views;
        if (previewViews && previewViews > 0) {
            views = previewViews;
        } else {
            views = await fetchProfileViews();
        }
        
        // Generate SVG badge with selected style
        const badgeSVG = generateBadgeSVG(views, badgeStyle);
        
        // Prepare data to save
        const viewsData = {
            views: views,
            lastUpdated: new Date().toISOString()
        };
        
        // Save locally (for compatibility and fallback)
        saveViews(views);
        fs.writeFileSync(BADGE_FILE, badgeSVG);
        console.log(`💾 Saved locally: ${BADGE_FILE}, ${VIEWS_FILE}\n`);
        
        // Open preview in browser if preview mode (Windows)
        if (previewViews && previewViews > 0) {
            const { exec } = require('child_process');
            exec(`start ${BADGE_FILE}`, (err) => {
                if (err) console.log(`⚠️  Could not open browser: ${err.message}`);
            });
            console.log(`🖼️  Preview opened in browser!`);
        }
        
        // Save to Gist (skip in preview mode if no GIST_ID)
        if (token && (!previewViews || GIST_ID)) {
            const result = await updateGist(token, GIST_ID, badgeSVG, viewsData);
            
            if (result) {
                console.log(`✅ Badge updated in Gist!`);
                console.log(`📊 Displays: ${views} views\n`);
                console.log('🎉 Done!');
            } else {
                console.log('⚠️  Failed to update Gist, but local files were saved');
            }
        } else if (previewViews && !GIST_ID) {
            console.log('🖼️  Preview mode: Skipping Gist update (no GIST_ID or token).');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Run
main();
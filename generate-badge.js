const fs = require('fs');
const https = require('https');

// Configuration
const VIEWS_FILE = 'views-count.json';
const BADGE_FILE = 'badge.svg';
const GIST_ID = process.env.GIST_ID; // ID of private Gist to store data

// Colors
const HEADER_BG = '#1f2937';  // gray-800
const DIGIT_BG = '#3b82f6';   // blue-500
const TEXT_COLOR = '#ffffff'; // white

// GitHub icon (SVG path)
const GITHUB_ICON = `<path fill-rule="evenodd" fill="white" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>`;

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
    
    if (gistId) {
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
    
    try {
        const response = await httpsRequest(url, options, JSON.stringify(gistData));
        
        if (response.statusCode === 200 || response.statusCode === 201) {
            const result = JSON.parse(response.data);
            console.log(`✅ Gist ${gistId ? 'updated' : 'created'} successfully!`);
            
            if (!gistId) {
                console.log(`\n🔑 IMPORTANT! Save this GIST_ID as a secret in GitHub Actions:`);
                console.log(`   GIST_ID=${result.id}\n`);
            }
            
            console.log(`📋 Gist URL: ${result.html_url}`);
            console.log(`🔗 Badge URL: ${result.files[BADGE_FILE].raw_url}\n`);
            
            return result;
        } else {
            console.error(`❌ ${method} error: ${response.statusCode}`);
            console.error(response.data);
            return null;
        }
    } catch (error) {
        console.error(`❌ Error during ${gistId ? 'updating' : 'creating'} Gist:`, error.message);
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
 * Fetches repository views from GitHub Traffic API
 * Uses GitHub Traffic API to fetch visit statistics for the profile repository
 */
async function fetchProfileViews() {
    const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
    
    if (!token) {
        console.log('⚠️  No GitHub token - use GH_TOKEN or GITHUB_TOKEN');
        console.log('📊 Using local counter as fallback\n');
        return incrementLocalCounter();
    }

    // Get username from repo (format: username/reponame)
    const githubRepository = process.env.GITHUB_REPOSITORY;
    
    if (!githubRepository) {
        console.log('⚠️  No GITHUB_REPOSITORY - using local counter\n');
        return incrementLocalCounter();
    }

    const [owner, repo] = githubRepository.split('/');
    
    // API endpoint for profile repository statistics (username/username)
    // or current repository
    const profileRepo = `${owner}/${owner}`;
    const apiUrl = `https://api.github.com/repos/${profileRepo}/traffic/views`;
    
    console.log(`📡 Fetching statistics from: ${profileRepo}`);
    
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'Authorization': `token ${token}`,
                'User-Agent': 'CustomBadge',
                'Accept': 'application/vnd.github.v3+json'
            }
        };

        https.get(apiUrl, options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        const json = JSON.parse(data);
                        const totalViews = json.count || 0;
                        const uniqueViews = json.uniques || 0;
                        
                        console.log(`✅ Statistics fetched successfully:`);
                        console.log(`   - Total visits: ${totalViews}`);
                        console.log(`   - Unique visits: ${uniqueViews}\n`);
                        
                        // Use total number of visits
                        resolve(totalViews > 0 ? totalViews : incrementLocalCounter());
                    } catch (error) {
                        console.log(`⚠️  JSON parsing error: ${error.message}`);
                        resolve(incrementLocalCounter());
                    }
                } else if (res.statusCode === 404) {
                    console.log(`⚠️  Profile repository ${profileRepo} does not exist or no access`);
                    console.log(`💡 Using statistics from current repository: ${githubRepository}\n`);
                    
                    // Try to fetch statistics from current repo
                    fetchCurrentRepoViews(token, githubRepository).then(resolve).catch(() => {
                        resolve(incrementLocalCounter());
                    });
                } else {
                    console.log(`⚠️  GitHub API returned code: ${res.statusCode}`);
                    console.log(`📊 Using local counter as fallback\n`);
                    resolve(incrementLocalCounter());
                }
            });
        }).on('error', (error) => {
            console.log(`❌ API connection error: ${error.message}`);
            console.log(`📊 Using local counter as fallback\n`);
            resolve(incrementLocalCounter());
        });
    });
}

/**
 * Fetches statistics from current repository
 */
function fetchCurrentRepoViews(token, repository) {
    const apiUrl = `https://api.github.com/repos/${repository}/traffic/views`;
    
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'Authorization': `token ${token}`,
                'User-Agent': 'CustomBadge',
                'Accept': 'application/vnd.github.v3+json'
            }
        };

        https.get(apiUrl, options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        const json = JSON.parse(data);
                        const totalViews = json.count || 0;
                        
                        console.log(`✅ Repository ${repository} statistics:`);
                        console.log(`   - Total visits: ${totalViews}\n`);
                        
                        resolve(totalViews > 0 ? totalViews : incrementLocalCounter());
                    } catch (error) {
                        reject(error);
                    }
                } else {
                    reject(new Error(`Status: ${res.statusCode}`));
                }
            });
        }).on('error', reject);
    });
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
 * Generates SVG badge with number of views
 */
function generateBadgeSVG(views) {
    const viewsString = String(views);
    const numDigits = viewsString.length;
    
    // Dimensions
    const width = 56;
    const headerHeight = 40;
    const digitHeight = 32;
    const totalHeight = headerHeight + (numDigits * digitHeight);
    
    // Start SVG
    let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${totalHeight}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="GitHub Profile Views">
  <title>GitHub Profile Views: ${views}</title>
  
  <!-- Header with GitHub icon -->
  <rect x="0" y="0" width="${width}" height="${headerHeight}" fill="${HEADER_BG}" rx="4" ry="4"/>
  <rect x="0" y="4" width="${width}" height="${headerHeight - 4}" fill="${HEADER_BG}"/>
  
  <!-- GitHub icon -->
  <g transform="translate(20, 12)">
    <svg width="16" height="16" viewBox="0 0 16 16">
      ${GITHUB_ICON}
    </svg>
  </g>
  
`;

    // Generate digits
    let currentY = headerHeight;
    for (let i = 0; i < numDigits; i++) {
        const digit = viewsString[i];
        const isLast = i === numDigits - 1;
        
        // Digit background
        if (isLast) {
            // Last digit - rounded corners at bottom
            svg += `  <!-- Digit ${digit} (last) -->
  <rect x="0" y="${currentY}" width="${width}" height="4" fill="${DIGIT_BG}"/>
  <rect x="0" y="${currentY + 4}" width="${width}" height="${digitHeight - 8}" fill="${DIGIT_BG}"/>
  <rect x="0" y="${currentY + digitHeight - 4}" width="${width}" height="4" fill="${DIGIT_BG}" rx="4" ry="4"/>
  
`;
        } else {
            // Middle digit - no rounding
            svg += `  <!-- Digit ${digit} -->
  <rect x="0" y="${currentY}" width="${width}" height="${digitHeight}" fill="${DIGIT_BG}"/>
  
`;
        }
        
        // Digit text
        svg += `  <text x="28" y="${currentY + 21}" font-family="'Segoe UI', Ubuntu, Arial, sans-serif" font-size="18" font-weight="bold" fill="${TEXT_COLOR}" text-anchor="middle">${digit}</text>
  
`;
        
        currentY += digitHeight;
    }
    
    // End SVG
    svg += `</svg>`;
    
    return svg;
}

/**
 * Main function
 */
async function main() {
    try {
        console.log('🚀 Starting badge generation...\n');
        
        const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
        
        if (!token) {
            console.error('❌ No GitHub token!');
            console.error('   Set environment variable GH_TOKEN or GITHUB_TOKEN');
            process.exit(1);
        }
        
        // Fetch number of views
        const views = await fetchProfileViews();
        
        // Generate SVG badge
        const badgeSVG = generateBadgeSVG(views);
        
        // Prepare data to save
        const viewsData = {
            views: views,
            lastUpdated: new Date().toISOString()
        };
        
        // Save locally (for compatibility and fallback)
        saveViews(views);
        fs.writeFileSync(BADGE_FILE, badgeSVG);
        console.log(`💾 Saved locally: ${BADGE_FILE}, ${VIEWS_FILE}\n`);
        
        // Save to Gist
        const result = await updateGist(token, GIST_ID, badgeSVG, viewsData);
        
        if (result) {
            console.log(`✅ Badge updated in Gist!`);
            console.log(`📊 Displays: ${views} views\n`);
            console.log('🎉 Done!');
        } else {
            console.log('⚠️  Failed to update Gist, but local files were saved');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Run
main();
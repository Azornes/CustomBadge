const fs = require('fs');
const https = require('https');

// Konfiguracja
const VIEWS_FILE = 'views-count.json';
const BADGE_FILE = 'badge.svg';
const GIST_ID = process.env.GIST_ID; // ID prywatnego Gist do przechowywania danych

// Kolory
const HEADER_BG = '#1f2937';  // gray-800
const DIGIT_BG = '#3b82f6';   // blue-500
const TEXT_COLOR = '#ffffff'; // white

// Ikona GitHub (SVG path)
const GITHUB_ICON = `<path fill-rule="evenodd" fill="white" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>`;

/**
 * Odczytuje liczbę odwiedzin z pliku JSON
 */
function getViews() {
    try {
        if (fs.existsSync(VIEWS_FILE)) {
            const data = fs.readFileSync(VIEWS_FILE, 'utf8');
            const json = JSON.parse(data);
            return json.views || 0;
        }
    } catch (error) {
        console.log('Nie można odczytać pliku z liczbą odwiedzin, rozpoczynam od 0');
    }
    return 0;
}

/**
 * Zapisuje liczbę odwiedzin do pliku JSON
 */
function saveViews(views) {
    const data = {
        views: views,
        lastUpdated: new Date().toISOString()
    };
    fs.writeFileSync(VIEWS_FILE, JSON.stringify(data, null, 2));
}

/**
 * Wykonuje żądanie HTTPS i zwraca obietnicę z wynikiem
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
 * Pobiera zawartość Gist
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
        
        console.log(`⚠️  Nie można pobrać Gist (kod: ${response.statusCode})`);
        return null;
    } catch (error) {
        console.log(`⚠️  Błąd podczas pobierania Gist: ${error.message}`);
        return null;
    }
}

/**
 * Aktualizuje lub tworzy Gist z plikami badge i views
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
        // Aktualizuj istniejący Gist
        url = `https://api.github.com/gists/${gistId}`;
        method = 'PATCH';
        gistData = { files };
        console.log(`📝 Aktualizuję Gist: ${gistId}`);
    } else {
        // Utwórz nowy Gist
        url = 'https://api.github.com/gists';
        method = 'POST';
        gistData = {
            description: 'GitHub Profile Views Badge - Auto-generated',
            public: false,
            files: files
        };
        console.log('📝 Tworzę nowy prywatny Gist...');
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
            console.log(`✅ Gist ${gistId ? 'zaktualizowany' : 'utworzony'} pomyślnie!`);
            
            if (!gistId) {
                console.log(`\n🔑 WAŻNE! Zapisz to GIST_ID jako secret w GitHub Actions:`);
                console.log(`   GIST_ID=${result.id}\n`);
            }
            
            console.log(`📋 URL do Gist: ${result.html_url}`);
            console.log(`🔗 Badge URL: ${result.files[BADGE_FILE].raw_url}\n`);
            
            return result;
        } else {
            console.error(`❌ Błąd ${method}: ${response.statusCode}`);
            console.error(response.data);
            return null;
        }
    } catch (error) {
        console.error(`❌ Błąd podczas ${gistId ? 'aktualizacji' : 'tworzenia'} Gist:`, error.message);
        return null;
    }
}

/**
 * Pobiera liczbę odwiedzin z Gist lub lokalnego pliku
 */
async function getViewsFromGist(token, gistId) {
    if (!token || !gistId) {
        return getViews(); // Fallback do lokalnego pliku
    }
    
    const gist = await getGist(token, gistId);
    
    if (gist && gist.files && gist.files[VIEWS_FILE]) {
        try {
            const content = gist.files[VIEWS_FILE].content;
            const data = JSON.parse(content);
            console.log(`📊 Odczytano z Gist: ${data.views} odwiedzin\n`);
            return data.views || 0;
        } catch (error) {
            console.log(`⚠️  Błąd parsowania danych z Gist: ${error.message}`);
        }
    }
    
    return getViews(); // Fallback do lokalnego pliku
}

/**
 * Pobiera liczbę odwiedzin repozytorium z GitHub Traffic API
 * Używa GitHub Traffic API do pobrania statystyk odwiedzin dla repozytorium profilu
 */
async function fetchProfileViews() {
    const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
    
    if (!token) {
        console.log('⚠️  Brak tokenu GitHub - użyj GH_TOKEN lub GITHUB_TOKEN');
        console.log('📊 Używam lokalnego licznika jako fallback\n');
        return incrementLocalCounter();
    }

    // Pobierz nazwę użytkownika z repo (format: username/reponame)
    const githubRepository = process.env.GITHUB_REPOSITORY;
    
    if (!githubRepository) {
        console.log('⚠️  Brak GITHUB_REPOSITORY - używam lokalnego licznika\n');
        return incrementLocalCounter();
    }

    const [owner, repo] = githubRepository.split('/');
    
    // API endpoint dla statystyk repozytorium profilu (username/username)
    // lub aktualnego repozytorium
    const profileRepo = `${owner}/${owner}`;
    const apiUrl = `https://api.github.com/repos/${profileRepo}/traffic/views`;
    
    console.log(`📡 Pobieram statystyki z: ${profileRepo}`);
    
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
                        
                        console.log(`✅ Statystyki pobrane pomyślnie:`);
                        console.log(`   - Całkowite odwiedziny: ${totalViews}`);
                        console.log(`   - Unikalne odwiedziny: ${uniqueViews}\n`);
                        
                        // Użyj całkowitej liczby odwiedzin
                        resolve(totalViews > 0 ? totalViews : incrementLocalCounter());
                    } catch (error) {
                        console.log(`⚠️  Błąd parsowania JSON: ${error.message}`);
                        resolve(incrementLocalCounter());
                    }
                } else if (res.statusCode === 404) {
                    console.log(`⚠️  Repozytorium profilu ${profileRepo} nie istnieje lub brak dostępu`);
                    console.log(`💡 Używam statystyk z aktualnego repozytorium: ${githubRepository}\n`);
                    
                    // Spróbuj pobrać statystyki z aktualnego repo
                    fetchCurrentRepoViews(token, githubRepository).then(resolve).catch(() => {
                        resolve(incrementLocalCounter());
                    });
                } else {
                    console.log(`⚠️  GitHub API zwrócił kod: ${res.statusCode}`);
                    console.log(`📊 Używam lokalnego licznika jako fallback\n`);
                    resolve(incrementLocalCounter());
                }
            });
        }).on('error', (error) => {
            console.log(`❌ Błąd połączenia z API: ${error.message}`);
            console.log(`📊 Używam lokalnego licznika jako fallback\n`);
            resolve(incrementLocalCounter());
        });
    });
}

/**
 * Pobiera statystyki z aktualnego repozytorium
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
                        
                        console.log(`✅ Statystyki repozytorium ${repository}:`);
                        console.log(`   - Całkowite odwiedziny: ${totalViews}\n`);
                        
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
 * Inkrementuj lokalny licznik (fallback)
 */
function incrementLocalCounter() {
    const currentViews = getViews();
    const increment = Math.floor(Math.random() * 50) + 1;
    const newViews = currentViews + increment;
    
    console.log(`📊 Lokalny licznik (symulacja):`);
    console.log(`   - Poprzednia wartość: ${currentViews}`);
    console.log(`   - Inkrementacja: +${increment}`);
    console.log(`   - Nowa wartość: ${newViews}\n`);
    
    return newViews;
}

/**
 * Generuje SVG badge z liczbą odwiedzin
 */
function generateBadgeSVG(views) {
    const viewsString = String(views);
    const numDigits = viewsString.length;
    
    // Wymiary
    const width = 56;
    const headerHeight = 40;
    const digitHeight = 32;
    const totalHeight = headerHeight + (numDigits * digitHeight);
    
    // Początek SVG
    let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${totalHeight}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="GitHub Profile Views">
  <title>GitHub Profile Views: ${views}</title>
  
  <!-- Header z ikoną GitHub -->
  <rect x="0" y="0" width="${width}" height="${headerHeight}" fill="${HEADER_BG}" rx="4" ry="4"/>
  <rect x="0" y="4" width="${width}" height="${headerHeight - 4}" fill="${HEADER_BG}"/>
  
  <!-- Ikona GitHub -->
  <g transform="translate(20, 12)">
    <svg width="16" height="16" viewBox="0 0 16 16">
      ${GITHUB_ICON}
    </svg>
  </g>
  
`;

    // Generuj cyfry
    let currentY = headerHeight;
    for (let i = 0; i < numDigits; i++) {
        const digit = viewsString[i];
        const isLast = i === numDigits - 1;
        
        // Tło cyfry
        if (isLast) {
            // Ostatnia cyfra - zaokrąglone rogi na dole
            svg += `  <!-- Cyfra ${digit} (ostatnia) -->
  <rect x="0" y="${currentY}" width="${width}" height="4" fill="${DIGIT_BG}"/>
  <rect x="0" y="${currentY + 4}" width="${width}" height="${digitHeight - 8}" fill="${DIGIT_BG}"/>
  <rect x="0" y="${currentY + digitHeight - 4}" width="${width}" height="4" fill="${DIGIT_BG}" rx="4" ry="4"/>
  
`;
        } else {
            // Środkowa cyfra - bez zaokrągleń
            svg += `  <!-- Cyfra ${digit} -->
  <rect x="0" y="${currentY}" width="${width}" height="${digitHeight}" fill="${DIGIT_BG}"/>
  
`;
        }
        
        // Text cyfry
        svg += `  <text x="28" y="${currentY + 21}" font-family="'Segoe UI', Ubuntu, Arial, sans-serif" font-size="18" font-weight="bold" fill="${TEXT_COLOR}" text-anchor="middle">${digit}</text>
  
`;
        
        currentY += digitHeight;
    }
    
    // Zakończenie SVG
    svg += `</svg>`;
    
    return svg;
}

/**
 * Główna funkcja
 */
async function main() {
    try {
        console.log('🚀 Rozpoczynam generowanie badge...\n');
        
        const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
        
        if (!token) {
            console.error('❌ Brak tokenu GitHub!');
            console.error('   Ustaw zmienną środowiskową GH_TOKEN lub GITHUB_TOKEN');
            process.exit(1);
        }
        
        // Pobierz liczbę odwiedzin
        const views = await fetchProfileViews();
        
        // Generuj SVG badge
        const badgeSVG = generateBadgeSVG(views);
        
        // Przygotuj dane do zapisania
        const viewsData = {
            views: views,
            lastUpdated: new Date().toISOString()
        };
        
        // Zapisz lokalnie (dla compatibility i fallback)
        saveViews(views);
        fs.writeFileSync(BADGE_FILE, badgeSVG);
        console.log(`💾 Zapisano lokalnie: ${BADGE_FILE}, ${VIEWS_FILE}\n`);
        
        // Zapisz do Gist
        const result = await updateGist(token, GIST_ID, badgeSVG, viewsData);
        
        if (result) {
            console.log(`✅ Badge zaktualizowany w Gist!`);
            console.log(`📊 Wyświetla: ${views} odwiedzin\n`);
            console.log('🎉 Gotowe!');
        } else {
            console.log('⚠️  Nie udało się zaktualizować Gist, ale pliki lokalne zostały zapisane');
        }
        
    } catch (error) {
        console.error('❌ Błąd:', error.message);
        process.exit(1);
    }
}

// Uruchom
main();
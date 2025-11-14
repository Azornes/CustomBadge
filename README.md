# Custom GitHub Profile Views Badge

![Profile Views Badge](badge.svg)

Automatically generated vertical badge showing the number of GitHub profile visits, stored in a private Gist.

## 🎯 Features

- ✨ Unique vertical badge design
- 🔄 Automatic update every hour via GitHub Actions
- 🎨 **Two badge styles**: Classic (simple) and Animated (advanced with effects)
- 👁️ GitHub icon at the top, visit digits below
- 📊 Tracking GitHub profile visits
- 🔐 Data stored in private Gist (doesn't clutter the repository)
- ⚙️ Configurable badge style via workflow input or secret

## 🚀 Installation

### Step 1: Fork this repository

Click the "Fork" button in the top right corner of this page.

### Step 2: Enable GitHub Actions

1. Go to the **Actions** tab in your fork
2. Click "I understand my workflows, go ahead and enable them"

### Step 3: Add Personal Access Token

1. Go to [GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Name it: `PROFILE_VIEWS_TOKEN`
4. Select permissions:
   - `repo` (full access to repositories)
   - `gist` (access to manage gists)
5. Click "Generate token" and copy the token
6. In your fork, go to **Settings > Secrets and variables > Actions**
7. Click "New repository secret"
8. Name: `GH_TOKEN`
9. Value: paste the copied token
10. Click "Add secret"

### Step 4: Run workflow manually (first time)

1. Go to the **Actions** tab
2. Select the "Update Profile Views Badge" workflow
3. Click "Run workflow" > "Run workflow"
4. Wait for the workflow to complete
5. Check the logs - you'll find information about the created Gist and its ID

### Step 5: Add GIST_ID to secrets

After the first workflow run, check the logs in Actions. You'll find the message:

```
🔑 IMPORTANT! Save this GIST_ID as a secret in GitHub Actions:
   GIST_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

1. Copy the Gist ID from the logs
2. Go to **Settings > Secrets and variables > Actions**
3. Click "New repository secret"
4. Name: `GIST_ID`
5. Value: paste the copied ID
6. Click "Add secret"

### Step 6: Find the badge URL in Gist

After adding `GIST_ID`, run the workflow again. In the logs, you'll find:

```
🔗 Your stable badge URL is ready!
   Use this URL in your README.md or on your profile:
   https://gist.githubusercontent.com/USERNAME/GIST_ID/raw/badge.svg?cache_bust=TIMESTAMP
```

The `cache_bust` parameter ensures the badge always displays the latest version.

### Step 7: Add badge to your profile

Add the following code to README.md in your profile repository (username/username):

```markdown
![Profile Views](https://gist.githubusercontent.com/YOUR_USERNAME/GIST_ID/raw/badge.svg)
```

Replace:
- `YOUR_USERNAME` with your GitHub username
- `GIST_ID` with your Gist ID (found in workflow logs)

## 📁 Project Structure

```
CustomBadge/
├── .github/
│   └── workflows/
│       └── update-badge.yml    # GitHub Actions workflow (runs hourly)
├── generate-badge.js            # Main script - badge generation & Gist management
├── package.json                 # Node.js dependencies (no external packages required)
├── badge.svg                    # Generated badge (local copy, auto-update)
├── views-count.json             # Visit count storage (local copy, auto-update)
├── README.md                    # Documentation
├── SETUP.md                     # Step-by-step setup guide
└── LICENSE                      # MIT License
```

## 🔧 Script Functions

The [`generate-badge.js`](generate-badge.js) script includes several key functions:

### Core Functions

- **[`fetchProfileViews()`](generate-badge.js:237)** - Fetches view count from visitor-badge API
  - Makes HTTPS request to `visitor-badge.laobi.icu`
  - Parses SVG response to extract view count
  - Falls back to local counter on error

- **[`generateBadgeSVG(views)`](generate-badge.js:295)** - Generates vertical SVG badge
  - Creates header with GitHub icon
  - Renders each digit in separate blue section
  - Applies rounded corners (top and bottom)
  - Returns complete SVG as string

- **[`updateGist(token, gistId, badgeContent, viewsContent)`](generate-badge.js:109)** - Manages Gist storage
  - Creates new private Gist if `GIST_ID` not provided
  - Updates existing Gist if `GIST_ID` exists
  - Stores both `badge.svg` and `views-count.json`
  - Returns stable raw URL with cache-busting parameter

### Utility Functions

- **[`getViews()`](generate-badge.js:20)** - Reads view count from local JSON file
- **[`saveViews(views)`](generate-badge.js:36)** - Saves view count to local JSON file
- **[`httpsRequest(url, options, postData)`](generate-badge.js:47)** - Promise-based HTTPS wrapper
- **[`getGist(token, gistId)`](generate-badge.js:77)** - Fetches Gist content from GitHub API
- **[`incrementLocalCounter()`](generate-badge.js:279)** - Fallback counter with random increment (1-50)

### Environment Variables

- `GH_TOKEN` or `GITHUB_TOKEN` - GitHub Personal Access Token (required for Gist operations)
- `GIST_ID` - ID of the Gist to update (optional, auto-created on first run)
- `PREVIEW_VIEWS` - Number for preview mode (optional, for testing)
- `BADGE_STYLE` - Badge style: `classic` or `animated` (default: `animated`)

## 🎨 Badge Styles

The badge is available in two styles:

### Animated Style (Default)
- Advanced animations with gradients and glow effects
- Floating particles and morphing shapes
- Eye-blinking animation
- Gradient color shifts (pink/purple theme)
- Dynamic pulse effects on digits

### Classic Style
- Simple, clean design with solid colors
- Gray header (`#1f2937`) with GitHub icon
- Blue digits (`#3b82f6`) on solid background
- No animations, lightweight SVG

### Choosing a Style

**Option 1: Manual Workflow Run**
1. Go to **Actions** → "Update Profile Views Badge"
2. Click **Run workflow**
3. Select your preferred style from the dropdown menu
4. Click **Run workflow**

**Option 2: Set Default Style (via Secret)**
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `BADGE_STYLE`
4. Value: `classic` or `animated`
5. Click **Add secret**

**Option 3: Command Line (for local testing)**
```bash
# Classic style
BADGE_STYLE=classic node generate-badge.js

# Animated style
BADGE_STYLE=animated node generate-badge.js

# Or using command line argument
node generate-badge.js --style=classic
```

The style selection priority:
1. Manual workflow input (when running manually)
2. `BADGE_STYLE` secret (for automatic runs)
3. Default: `animated`

## ⚙️ How It Works

1. **GitHub Actions** runs every hour (or manually)
2. **Node.js script** fetches visit statistics:
   - Fetches real-time data from visitor-badge API (`visitor-badge.laobi.icu`)
   - Parses the SVG response to extract view count
   - In case of error, uses local counter as fallback (random increment)
3. **Generates SVG** - creates vertical badge with GitHub icon and digits
4. **Saves to Gist** - updates private Gist with [`badge.svg`](badge.svg) and [`views-count.json`](views-count.json) files
5. **Auto-update** - badge in README automatically updates from Gist

### Data Source

The badge fetches data from **visitor-badge.laobi.icu API**:
- Fetches SVG badge for `page_id=Azornes.Azornes`
- Parses the view count from the SVG `<text>` element
- Falls back to local counter with random increment (1-50) if API fails
- All data is stored in `views-count.json` with timestamp

⚠️ **Note**: The visitor badge API tracks views continuously. Local counter is used only as a fallback when the API is unavailable.

## 🔧 Configuration

### Update Frequency

Edit the `.github/workflows/update-badge.yml` file:

```yaml
schedule:
  - cron: '0 * * * *'  # Every hour (default)
  # - cron: '0 */6 * * *'  # Every 6 hours
  # - cron: '0 0 * * *'  # Once a day
```

### Change Badge Colors (Classic Style Only)

The classic style uses solid colors defined in [`badge-core.js`](docs/badge-core.js):

```javascript
const CLASSIC_HEADER_BG = '#1f2937';  // gray-800 - Header background
const CLASSIC_DIGIT_BG = '#3b82f6';   // blue-500 - Digit background
const CLASSIC_TEXT_COLOR = '#ffffff'; // white - Text color
```

The animated style uses dynamic gradients and cannot be easily customized without modifying the animation keyframes.

### Preview Mode

You can test the badge locally with a custom view count:

```bash
# Using command line argument
node generate-badge.js --preview=12345

# Using environment variable
PREVIEW_VIEWS=12345 node generate-badge.js
```

In preview mode:
- Badge is generated with the specified view count
- Opens automatically in browser (Windows)
- Skips Gist update unless `GIST_ID` is set
- Useful for testing different view counts and badge appearance

### Track Different Page

By default, the script fetches data from `visitor-badge.laobi.icu` for `page_id=Azornes.Azornes`.

To track a different page, modify the [`fetchProfileViews()`](generate-badge.js:237) function in [`generate-badge.js`](generate-badge.js):

```javascript
const badgeUrl = 'https://visitor-badge.laobi.icu/badge?page_id=YOUR_USERNAME.YOUR_USERNAME';
```

## 🐛 Troubleshooting

### Badge Not Updating

1. Check if the workflow executed: **Actions** → "Update Profile Views Badge"
2. Check workflow logs - did it create/update the Gist
3. Check if `GH_TOKEN` is correctly set in Secrets
4. Check if `GIST_ID` is set (after first run)
5. Ensure the token has `repo` and `gist` permissions

### "Bad credentials" or 401 error

Token expired or lacks permissions. Generate a new token with permissions:
- ✅ `repo` (Full control of private repositories)
- ✅ `gist` (Create and update gists)

### No GIST_ID in logs

Check if:
1. Token has `gist` permissions
2. Workflow executed successfully
3. Logs contain "Creating new private Gist..."

### Badge Not Displaying in README

1. Check if the URL is correct (copied from workflow logs)
2. URL should be in format: `https://gist.githubusercontent.com/USERNAME/GIST_ID/raw/badge.svg`
3. Gist must be created (check at https://gist.github.com/)

### Badge Shows Low Visit Count

The visitor badge API tracks views from when it was first accessed. If your page is new or rarely visited, the count may be low. The badge will increment as more people visit your profile.

### Workflow Not Running Automatically

GitHub Actions may disable crons in inactive repositories. Run the workflow manually occasionally or add a commit.

## 📝 License

MIT License - you can freely use and modify this project!

## 🤝 Contributing

Issues and Pull Requests are welcome!

---

## 🛠️ Technical Details

### Dependencies

The script uses **only built-in Node.js modules**:
- `fs` - File system operations (reading/writing local files)
- `https` - Making API requests to GitHub and visitor-badge
- `child_process` - Opening browser in preview mode (Windows only)

No external npm packages required! This makes the project lightweight and easy to maintain.

### Data Flow

1. **Fetch Views** → Script makes HTTPS GET request to `visitor-badge.laobi.icu`
2. **Parse SVG** → Extracts view count using regex: `/<text[^>]*textLength="140\.0"[^>]*>(\d+)<\/text>/`
3. **Generate Badge** → Creates SVG with dynamic height based on digit count
4. **Save Locally** → Writes `badge.svg` and `views-count.json` to disk
5. **Update Gist** → PATCH request to GitHub API with new content
6. **Return URL** → Provides stable raw URL with cache-busting parameter

### Fallback Mechanism

The script has multiple fallback layers:

1. **Primary**: Fetch from visitor-badge API
2. **Fallback 1**: Use local counter if API fails
3. **Fallback 2**: Start from 0 if no local file exists

Local counter uses random increment (1-50) to simulate realistic view growth.

### SVG Generation Details

The badge is dynamically sized:
- **Width**: Fixed at 40px
- **Height**: 40px (header) + 32px × number of digits
- **Header**: Contains GitHub icon on gray background (`#1f2937`)
- **Digits**: Each digit on blue background (`#3b82f6`)
- **Corners**: Rounded corners (4px radius) at top and bottom

Each digit is rendered separately, allowing for vertical stacking.

---

## 📸 Usage Example

Add the badge to your profile (in `username/username` repository):

```markdown
## 📊 Profile Stats

![Profile Views](https://gist.githubusercontent.com/USERNAME/GIST_ID/raw/badge.svg)
```

## 🔍 Why Gist?

- **No repository clutter** - no constant commits every hour
- **Privacy** - Gist is private, only badge.svg is public via raw URL
- **Easier management** - all data in one place
- **Faster updates** - no need to push to repository

---

⭐ If you like this project, leave a star!
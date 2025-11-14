# Custom Badge Service - GitHub Pages

Dynamiczna usługa generowania badge'y dla profili GitHub, hostowana na GitHub Pages.

## 🚀 Jak używać?

### Metoda 1: Bezpośredni URL z nazwą użytkownika

Użyj URL w formacie:
```
https://azornes.github.io/CustomBadge/NAZWA_UŻYTKOWNIKA
```

Przykład dla użytkownika `Azornes`:
```markdown
![Profile Views](https://azornes.github.io/CustomBadge/Azornes)
```

### Metoda 2: Parametr URL

Alternatywnie możesz użyć parametru query:
```
https://azornes.github.io/CustomBadge/badge.html?user=NAZWA_UŻYTKOWNIKA
```

Przykład:
```markdown
![Profile Views](https://azornes.github.io/CustomBadge/badge.html?user=Azornes)
```

## 📖 Jak to działa?

1. **Żądanie badge** - Użytkownik wstawia URL w README
2. **Wykrycie użytkownika** - System ekstrahuje nazwę użytkownika z URL
3. **Pobieranie danych** - JavaScript pobiera dane z visitor-badge API
4. **Generowanie SVG** - Tworzy pionowy badge z liczbą odwiedzin
5. **Zwrot obrazu** - Zwraca gotowy SVG do wyświetlenia

## 🎨 Cechy

- ✨ **Zero konfiguracji** - po prostu użyj URL!
- 🔄 **Dynamiczne dane** - zawsze aktualne liczby odwiedzin
- 🎯 **Szybkie** - generowanie po stronie klienta
- 📱 **Responsywne** - działa wszędzie
- 🆓 **Darmowe** - w 100% open source

## 🛠️ Struktura plików

```
docs/
├── index.html          # Strona główna z demo
├── badge-generator.js  # Logika generowania badge'y
├── badge.html          # Endpoint dla badge z parametrem
├── 404.html            # Obsługa dynamicznych URL (/username)
└── README.md           # Ta dokumentacja
```

## 🔧 Konfiguracja GitHub Pages

1. Przejdź do **Settings** → **Pages**
2. W sekcji **Source** wybierz:
   - Branch: `main` (lub `master`)
   - Folder: `/docs`
3. Kliknij **Save**
4. Po chwili strona będzie dostępna pod adresem podanym przez GitHub

## 💡 Przykłady użycia

### W README.md profilu GitHub
```markdown
## 👀 Profile Views
![Profile Views](https://azornes.github.io/CustomBadge/Azornes)
```

### W README.md projektu
```markdown
![Project Views](https://azornes.github.io/CustomBadge/YOUR_USERNAME)
```

### W HTML
```html
<img src="https://azornes.github.io/CustomBadge/YOUR_USERNAME" alt="Profile Views">
```

## 🎯 API Reference

### Endpoints

#### `/{username}`
Główny endpoint - automatycznie generuje badge dla podanego użytkownika.

**Przykład:**
```
https://azornes.github.io/CustomBadge/Azornes
```

#### `/badge.html?user={username}`
Alternatywny endpoint z parametrem query.

**Przykład:**
```
https://azornes.github.io/CustomBadge/badge.html?user=Azornes
```

### Źródło danych

Badge pobiera dane z visitor-badge API:
```
https://visitor-badge.laobi.icu/badge?page_id={username}.{username}
```

## 🎨 Personalizacja

Aby zmienić kolory badge, edytuj stałe w [`badge-generator.js`](badge-generator.js):

```javascript
const HEADER_BG = '#1f2937';  // Kolor tła nagłówka (ikona oka)
const DIGIT_BG = '#3b82f6';   // Kolor tła cyfr
const TEXT_COLOR = '#ffffff'; // Kolor tekstu
```

## 📊 Specyfikacja SVG

- **Szerokość:** 40px (stała)
- **Wysokość:** 40px (nagłówek) + 32px × liczba cyfr
- **Nagłówek:** Szare tło z ikoną oka
- **Cyfry:** Niebieskie tło, każda cyfra w osobnej sekcji
- **Zaokrąglenia:** 4px na górze i dole badge'a

## 🐛 Rozwiązywanie problemów

### Badge nie wyświetla się

1. Sprawdź, czy GitHub Pages jest włączone
2. Sprawdź URL - czy zawiera poprawną nazwę użytkownika?
3. Otwórz Developer Tools i sprawdź konsolę

### Nieprawidłowa liczba odwiedzin

Badge pokazuje dane z visitor-badge API. Jeśli liczba się nie zgadza:
- API może być niedostępne (używany jest fallback)
- Licznik zaczyna się od pierwszego wywołania API

### CORS errors

GitHub Pages automatycznie obsługuje CORS. Jeśli widzisz błędy CORS, sprawdź czy używasz HTTPS.

## 📝 Licencja

MIT License - możesz swobodnie używać i modyfikować!

---

⭐ [Zobacz demo na żywo](https://azornes.github.io/CustomBadge/)
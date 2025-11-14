# Custom GitHub Profile Views Badge

Automatycznie generowany, pionowy badge pokazujący liczbę odwiedzin profilu GitHub.

## 🎯 Funkcje

- ✨ Unikalny, pionowy design badge
- 🔄 Automatyczna aktualizacja co godzinę przez GitHub Actions
- 🎨 Ikona GitHub na górze, cyfry odwiedzin poniżej
- 📊 Śledzenie odwiedzin profilu GitHub

## 🚀 Instalacja

### Krok 1: Fork tego repozytorium

Kliknij przycisk "Fork" w prawym górnym rogu tej strony.

### Krok 2: Włącz GitHub Actions

1. Przejdź do zakładki **Actions** w swoim forku
2. Kliknij "I understand my workflows, go ahead and enable them"

### Krok 3: Dodaj Personal Access Token

1. Przejdź do [GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)](https://github.com/settings/tokens)
2. Kliknij "Generate new token (classic)"
3. Nadaj nazwę: `PROFILE_VIEWS_TOKEN`
4. Wybierz uprawnienia:
   - `repo` (pełen dostęp)
5. Kliknij "Generate token" i skopiuj token
6. W swoim forku przejdź do **Settings > Secrets and variables > Actions**
7. Kliknij "New repository secret"
8. Nazwa: `GH_TOKEN`
9. Wartość: wklej skopiowany token
10. Kliknij "Add secret"

### Krok 4: Uruchom workflow ręcznie (pierwszy raz)

1. Przejdź do zakładki **Actions**
2. Wybierz workflow "Update Profile Views Badge"
3. Kliknij "Run workflow" > "Run workflow"

### Krok 5: Dodaj badge do swojego profilu

Dodaj następujący kod do README.md w swoim repozytorium profilu (username/username):

```markdown
![Profile Views](https://raw.githubusercontent.com/TWOJA_NAZWA_UŻYTKOWNIKA/CustomBadge/main/badge.svg)
```

Zamień `TWOJA_NAZWA_UŻYTKOWNIKA` na swoją nazwę użytkownika GitHub.

## 📁 Struktura projektu

```
CustomBadge/
├── .github/
│   └── workflows/
│       └── update-badge.yml    # GitHub Actions workflow
├── generate-badge.js            # Skrypt generujący SVG badge
├── package.json                 # Zależności Node.js
├── badge.svg                    # Wygenerowany badge (auto-update)
├── views-count.json             # Liczba odwiedzin (auto-update)
└── README.md                    # Ten plik
```

## 🎨 Wygląd Badge

Badge jest pionowy i składa się z:
- Szarej sekcji z ikoną GitHub na górze
- Niebieskich sekcji z pojedynczymi cyframi reprezentującymi liczbę odwiedzin

## ⚙️ Jak to działa

1. **GitHub Actions** uruchamia się co godzinę (lub ręcznie)
2. **Skrypt Node.js** pobiera statystyki odwiedzin:
   - Najpierw próbuje pobrać dane z repozytorium profilu (`username/username`)
   - Jeśli nie istnieje, używa statystyk z repozytorium CustomBadge
   - Wykorzystuje GitHub Traffic API do pobierania rzeczywistych danych
   - W przypadku błędu używa lokalnego licznika jako fallback
3. **Generuje SVG** - tworzy pionowy badge z ikoną GitHub i cyframi
4. **Zapisuje zmiany** - commituje `badge.svg` i `views-count.json`
5. **Auto-update** - badge w README automatycznie się aktualizuje

### Źródło danych

Badge wykorzystuje **GitHub Traffic API**, które dostarcza:
- **Całkowitą liczbę odwiedzin** (count) - wyświetlana na badge
- **Unikalne odwiedziny** (uniques) - logowane w konsoli
- **Dane z ostatnich 14 dni** - ograniczenie API GitHub

⚠️ **Uwaga**: GitHub Traffic API pokazuje tylko odwiedziny z ostatnich 14 dni. Dla długoterminowego śledzenia, dane są zapisywane w `views-count.json`.

## 🔧 Konfiguracja

### Częstotliwość aktualizacji

Edytuj plik `.github/workflows/update-badge.yml`:

```yaml
schedule:
  - cron: '0 * * * *'  # Co godzinę (domyślnie)
  # - cron: '0 */6 * * *'  # Co 6 godzin
  # - cron: '0 0 * * *'  # Raz dziennie
```

### Zmiana kolorów badge

W pliku `generate-badge.js` możesz dostosować kolory:

```javascript
const HEADER_BG = '#1f2937';  // Kolor tła nagłówka (ikona GitHub)
const DIGIT_BG = '#3b82f6';   // Kolor tła cyfr
const TEXT_COLOR = '#ffffff'; // Kolor tekstu
```

### Śledzenie różnych repozytoriów

Domyślnie skrypt próbuje pobrać statystyki z:
1. Repozytorium profilu: `username/username`
2. Bieżącego repozytorium: `username/CustomBadge`

Możesz zmodyfikować logikę w funkcji [`fetchProfileViews()`](generate-badge.js:51) w pliku `generate-badge.js`.

## 🐛 Rozwiązywanie problemów

### Badge nie aktualizuje się

1. Sprawdź czy workflow się wykonał: **Actions** → "Update Profile Views Badge"
2. Sprawdź czy `GH_TOKEN` jest poprawnie ustawiony w Secrets
3. Upewnij się że token ma uprawnienia `repo`

### "Bad credentials" lub błąd 401

Token wygasł lub nie ma odpowiednich uprawnień. Wygeneruj nowy token z uprawnieniami:
- ✅ `repo` (Full control of private repositories)

### Badge pokazuje 0 odwiedzin

GitHub Traffic API zwraca dane tylko z ostatnich 14 dni. Jeśli repozytorium jest nowe, liczba może być niska lub zerowa. Skrypt wtedy użyje lokalnego licznika.

### Workflow nie uruchamia się automatycznie

GitHub Actions może dezaktywować crony w nieaktywnych repozytoriach. Uruchom workflow ręcznie raz na jakiś czas lub dodaj commit.

## 📝 Licencja

MIT License - możesz swobodnie używać i modyfikować ten projekt!

## 🤝 Współpraca

Issue i Pull Requesty są mile widziane!

---

## 📸 Przykład użycia

Dodaj badge do swojego profilu (w repozytorium `username/username`):

```markdown
## 📊 Profile Stats

![Profile Views](https://raw.githubusercontent.com/Azornes/CustomBadge/main/badge.svg)
```

---

⭐ Jeśli ten projekt Ci się podoba, zostaw gwiazdkę!
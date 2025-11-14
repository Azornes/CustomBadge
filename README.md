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

1. GitHub Actions uruchamia się co godzinę (lub ręcznie)
2. Skrypt odczytuje aktualną liczbę odwiedzin z API GitHub
3. Generuje nowy plik SVG z zaktualizowaną liczbą
4. Commituje zmiany do repozytorium
5. Badge w README automatycznie się aktualizuje

## 🔧 Konfiguracja

Możesz dostosować częstotliwość aktualizacji edytując plik `.github/workflows/update-badge.yml`:

```yaml
schedule:
  - cron: '0 * * * *'  # Co godzinę (domyślnie)
  # - cron: '0 */6 * * *'  # Co 6 godzin
  # - cron: '0 0 * * *'  # Raz dziennie
```

## 📝 Licencja

MIT License - możesz swobodnie używać i modyfikować ten projekt!

## 🤝 Współpraca

Issue i Pull Requesty są mile widziane!

---

⭐ Jeśli ten projekt Ci się podoba, zostaw gwiazdkę!
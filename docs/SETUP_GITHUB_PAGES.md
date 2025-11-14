# Konfiguracja GitHub Pages dla Custom Badge Service

## 📋 Wymagania

- Konto GitHub
- Fork tego repozytorium lub własne repo z kodem

## 🚀 Kroki instalacji

### Krok 1: Włącz GitHub Pages

1. Przejdź do swojego repozytorium na GitHubie
2. Kliknij **Settings** (Ustawienia) w górnym menu
3. W lewym menu wybierz **Pages**
4. W sekcji **Source** (Źródło):
   - **Branch**: Wybierz `main` (lub `master`)
   - **Folder**: Wybierz `/docs`
5. Kliknij **Save**

### Krok 2: Poczekaj na deployment

1. GitHub rozpocznie automatyczny deployment
2. Po chwili (zwykle 1-2 minuty) pojawi się link do Twojej strony
3. Link będzie w formacie: `https://TWOJA_NAZWA.github.io/NAZWA_REPO/`

### Krok 3: Przetestuj

1. Otwórz link do swojej strony GitHub Pages
2. Powinieneś zobaczyć stronę z demo
3. Przetestuj generowanie badge dla różnych użytkowników

### Krok 4: Użyj w swoim profilu

Dodaj do README.md w swoim profilu:

```markdown
![Profile Views](https://TWOJA_NAZWA.github.io/NAZWA_REPO/TWOJA_NAZWA_UŻYTKOWNIKA)
```

**Przykład:**
Jeśli Twoja nazwa to `octocat` i repo to `CustomBadge`:
```markdown
![Profile Views](https://octocat.github.io/CustomBadge/octocat)
```

## ✅ Weryfikacja

### Sprawdź czy działa:

1. **Strona główna** - `https://TWOJA_NAZWA.github.io/NAZWA_REPO/`
   - Powinna wyświetlić się strona z demo

2. **Badge endpoint** - `https://TWOJA_NAZWA.github.io/NAMA_REPO/UŻYTKOWNIK`
   - Powinien zwrócić SVG badge

3. **W README** - Dodaj badge do README i sprawdź czy się wyświetla

## 🐛 Rozwiązywanie problemów

### Strona nie wyświetla się (404)

**Możliwe przyczyny:**
1. GitHub Pages nie jest włączone
2. Wybrany niewłaściwy folder (musi być `/docs`)
3. Branch nie jest opublikowany

**Rozwiązanie:**
- Sprawdź ustawienia w Settings → Pages
- Upewnij się że wybrano folder `/docs`
- Poczekaj kilka minut na deployment

### Badge nie generuje się

**Możliwe przyczyny:**
1. Nieprawidłowy URL
2. Visitor-badge API nie odpowiada
3. CORS errors

**Rozwiązanie:**
- Sprawdź konsolę przeglądarki (F12)
- Upewnij się że używasz HTTPS
- Sprawdź czy nazwa użytkownika jest poprawna

### Badge pokazuje 0 lub 1

**To normalne!** 
- Visitor-badge API zaczyna licznik od pierwszego wywołania
- Licznik rośnie z każdą wizytą na Twoim profilu
- Może zająć czas zanim liczba się zwiększy

## 🔧 Własna domena (opcjonalnie)

Jeśli chcesz użyć własnej domeny:

1. W Settings → Pages → Custom domain wpisz swoją domenę
2. W ustawieniach DNS dodaj rekord CNAME wskazujący na `TWOJA_NAZWA.github.io`
3. Poczekaj na propagację DNS (może zająć do 24h)

## 📚 Dodatkowe zasoby

- [Dokumentacja GitHub Pages](https://docs.github.com/en/pages)
- [Własna domena w GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
- [Troubleshooting GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/troubleshooting-404-errors-for-github-pages-sites)

## ✨ Gotowe!

Twoja usługa badge jest teraz dostępna publicznie! 🎉

Możesz ją używać w:
- README profilu GitHub
- README projektów
- Dokumentacji
- Stronach internetowych
- Wszędzie gdzie można wstawić obrazek!

---

💡 **Pro tip:** Dodaj parametr `?v=timestamp` do URL aby wymusić odświeżenie badge:
```markdown
![Profile Views](https://TWOJA_NAZWA.github.io/NAZWA_REPO/UŻYTKOWNIK?v=123)
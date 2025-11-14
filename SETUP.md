# 🚀 Szybki Start - GitHub Gist Badge

## Krok po kroku - Konfiguracja

### 1️⃣ Wygeneruj Personal Access Token

1. Przejdź do https://github.com/settings/tokens
2. Kliknij **"Generate new token (classic)"**
3. Nazwa: `PROFILE_VIEWS_BADGE`
4. Wybierz uprawnienia:
   - ✅ `repo` - pełen dostęp do repozytoriów
   - ✅ `gist` - tworzenie i zarządzanie gistami
5. Kliknij **"Generate token"** i **SKOPIUJ TOKEN** (nie będziesz mógł go zobaczyć ponownie!)

### 2️⃣ Dodaj token do GitHub Secrets

1. W tym repozytorium przejdź do **Settings** → **Secrets and variables** → **Actions**
2. Kliknij **"New repository secret"**
3. Nazwa: `GH_TOKEN`
4. Wartość: wklej skopiowany token
5. Kliknij **"Add secret"**

### 3️⃣ Pierwsze uruchomienie workflow

1. Przejdź do zakładki **Actions**
2. Wybierz workflow **"Update Profile Views Badge"**
3. Kliknij **"Run workflow"** → **"Run workflow"**
4. Poczekaj na zakończenie (ok. 10-30 sekund)

### 4️⃣ Znajdź GIST_ID w logach

1. Kliknij na zakończony workflow
2. Kliknij na job **"update-badge"**
3. Rozwiń sekcję **"Generate and upload badge to Gist"**
4. Znajdź linię:
   ```
   🔑 WAŻNE! Zapisz to GIST_ID jako secret w GitHub Actions:
      GIST_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
5. **SKOPIUJ ten GIST_ID**

### 5️⃣ Dodaj GIST_ID do Secrets

1. Wróć do **Settings** → **Secrets and variables** → **Actions**
2. Kliknij **"New repository secret"**
3. Nazwa: `GIST_ID`
4. Wartość: wklej skopiowane GIST_ID
5. Kliknij **"Add secret"**

### 6️⃣ Uruchom workflow ponownie

1. Przejdź znów do **Actions** → **"Update Profile Views Badge"**
2. Kliknij **"Run workflow"** → **"Run workflow"**
3. Po zakończeniu sprawdź logi, znajdziesz tam:
   ```
   🔗 Badge URL: https://gist.githubusercontent.com/TWOJA_NAZWA/GIST_ID/raw/badge.svg
   ```
4. **SKOPIUJ ten URL**

### 7️⃣ Dodaj badge do swojego profilu

1. Przejdź do swojego repozytorium profilu (`username/username`)
2. Edytuj `README.md`
3. Dodaj:
   ```markdown
   ![Profile Views](https://gist.githubusercontent.com/TWOJA_NAZWA/GIST_ID/raw/badge.svg)
   ```
4. Commit i gotowe! 🎉

## ✅ Sprawdzenie

- [ ] Token `GH_TOKEN` dodany do Secrets
- [ ] Workflow uruchomiony po raz pierwszy
- [ ] `GIST_ID` skopiowany z logów
- [ ] `GIST_ID` dodany do Secrets
- [ ] Workflow uruchomiony po raz drugi
- [ ] Badge URL skopiowany z logów
- [ ] Badge dodany do README profilu
- [ ] Badge wyświetla się poprawnie

## 🔧 Rozwiązywanie problemów

### ❌ "Bad credentials" w logach
- Sprawdź czy token ma uprawnienia `repo` i `gist`
- Wygeneruj nowy token jeśli wygasł

### ❌ Nie widzę GIST_ID w logach
- Sprawdź czy `GH_TOKEN` jest poprawnie ustawiony
- Sprawdź czy workflow zakończył się sukcesem (zielony checkmark)

### ❌ Badge nie wyświetla się
- Sprawdź czy URL jest poprawny
- Sprawdź czy Gist został utworzony na https://gist.github.com/

## 📝 Uwagi

- Badge będzie aktualizowany automatycznie co godzinę
- Gist jest prywatny, ale badge.svg jest dostępny przez raw URL
- Nie musisz więcej nic robić - wszystko działa automatycznie!
- Możesz usunąć pliki `badge.svg` i `views-count.json` z lokalnego repozytorium (są w `.gitignore`)

## 🎯 Co dalej?

Po konfiguracji:
- Workflow będzie uruchamiał się automatycznie co godzinę
- Badge będzie aktualizował się w Twoim profilu
- Wszystkie dane są bezpiecznie w prywatnym Gist
- Nie ma więcej commitów w tym repozytorium (czysto!)
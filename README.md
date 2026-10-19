# 📊 LV-Analytic App `v2.13.0`

> **Siemens Internal AI-Tool** zur automatisierten Analyse von Leistungsverzeichnissen (LV) für Niederspannungshauptverteilungen (NSHV).

[![Siemens](https://img.shields.io/badge/Siemens-Electrical%20Products-009999)](https://www.siemens.com)
[![Version](https://img.shields.io/badge/Version-2.13.0-blue)](https://code.siemens.com)
[![Status](https://img.shields.io/badge/Status-Lauffähig-success)]()

---

## 🌟 Überblick

Die **LV-Analytic App** unterstützt Vertriebsmitarbeiter und technische Planer bei der schnellen Einwertung von Ausschreibungsunterlagen. Mithilfe von **Google Gemini AI** extrahiert die App technische Parameter aus PDF- oder GAEB-Dateien und gibt eine fundierte Empfehlung für das passende Siemens-System ab.

### 🎯 Hauptfunktionen

*   **KI-Extraktion:** Automatisches Auslesen von Bemessungsstrom, Kurzschlussfestigkeit, Spannung, IP-Schutzart und mehr.
*   **System-Check:** Sofortige Empfehlung zwischen **SIVACON S8**, **ALPHA 3200 classic** und **ALPHA 3200 eco**.
*   **Beleg-Tracking:** Direktzitate aus dem LV werden als Beweis für jeden extrahierten Wert angezeigt.
*   **Interaktiver Chat:** Ein KI-Experte steht für Detailfragen zum LV und den Siemens-Systemen zur Verfügung.
*   **Projektverwaltung:** Speichern von Analysen in einer lokalen Datenbank (Browser-basiert).
*   **Excel-Export:** Alle Projekte können gesammelt für Kalkulationstools exportiert werden.

---

## 🛠 Technologie-Stack

*   **Frontend:** React (Vite) + Tailwind CSS
*   **KI-Engine:** Google Gemini API (`gemini-3-flash`, `gemini-3.1-flash-lite`)
*   **PDF-Engine:** PDF.js
*   **Datenformate:** PDF, GAEB (.d83, .p83), Excel Export
*   **Deployment:** GitLab Pages (statisches Hosting)

---

## 🚀 Installation & Lokaler Build

Da die Siemens-Netzwerkumgebung (Proxy) den Build-Prozess in der Cloud einschränkt, wird die App lokal gebaut und der fertige Stand (`dist`-Ordner) hochgeladen.

### 1. Repository klonen
```bash
git clone https://code.siemens.com:panel-builder/lv-analytic-app.git
cd lv-analytic-app

### 2. Abhängigkeiten installieren
```powershell
npm install
```

### 3. API-Key konfigurieren
Erstelle eine Datei `.env` im Hauptverzeichnis:
```env
VITE_GEMINI_API_KEY=dein_schlüssel_hier
```

### 4. Build erstellen
```powershell
npm run build
```

### 5. Deployment
Lade den Ordner `dist` in das GitLab-Repository hoch. Die Pipeline erledigt den Rest automatisch.

---

## 📋 Changelog (Highlights)

*   **v2.13.0:** Optimierung der Wahrheitsreue (Halliuzinations-Schutz) & neue README.
*   **v2.12.0:** Performance-Optimierung durch Modell-Queue (Flash Lite Fallback).
*   **v2.11.0:** Einführung der Evidence-Check Logik (Werte werden nur bei Textbeleg validiert).
*   **v2.10.0:** Umstellung auf statisches Hosting (GitLab Pages).

---

## ✉️ Kontakt & Support

**Andreas Schreiber**  
Siemens Deutschland | RC-DE SI EP INF PB  
Siemenspromenade 2, 91058 Erlangen  

📧 [schreiber.andreas@siemens.com](mailto:schreiber.andreas@siemens.com)  
📱 +49 (172) 9408230

---
*Hinweis: Dieses Tool ist ein interner Prototyp. Bitte technische Ergebnisse immer gegenprüfen.*
@AGENTS.md

# Rregull: dizajn i njëtrajtshëm

Çdo pamje e re e RideShare duhet të duket si pjesa tjetër e aplikacionit. Kodi i gatshëm nga ushtrimet e javës (faqja e kursit) përshtatet me dizajnin tonë para se të shtohet; nuk kopjohen ngjyrat, fontet ose stilet e modelit.

- **Burimi i dizajnit:** `src/app/globals.css`. Ngjyrat merren vetëm nga variablat (`--background`, `--surface`, `--foreground`, `--muted`, `--border`, `--accent`, `--positive`, `--danger`); nuk shkruhen ngjyra të reja.
- **Tema e çelët dhe e errët:** çdo pamje e ndjek `data-theme` dhe zgjedhjen në `localStorage` (`theme`), si `layout.tsx` dhe `NderruesiTemes`.
- **Përbërësit ekzistues:** përdor klasat që kemi (`top-bar`, `brand`, `trip-card`, `trip-meta`, `badge`, `action`, `action.secondary`, `note`, `details`, `lead`, `back`) dhe komponentet (`KartaUdhetimi`, `OraUdhetimit`). Kartat e udhëtimit tregojnë gjithmonë shoferin dhe orën e ndryshuar (`08:15 → 09:15`).
- **Mos i zhvendos elementet:** e njëjta përmbajtje ka të njëjtën strukturë dhe radhë kudo. Karta e udhëtimit është gjithmonë: titulli → `trip-meta` (Ora · Shoferi · badge) → butoni “Shiko detajet” brenda kartës. Rrjedha nuk ndryshon: karta → “Shiko detajet” → detajet → “Kërko vend” / anulimi. Mos e zëvendëso “Shiko detajet” me një buton tjetër; kur veprimi s’është i mundur (p.sh. offline), i njëjti buton vetëm çaktivizohet. Butonat që i përkasin një karte nuk dalin jashtë saj; butonat që i përkasin një mesazhi (p.sh. “Rifresko listën”) qëndrojnë në kutinë e atij mesazhi. Mos shto fusha që kartat e listës kryesore nuk i kanë.
- **Pa `style={{…}}`** në komponente: stilet e reja shkojnë te `globals.css` me një klasë.
- **Kolona:** `max-width: 560px`, `padding: 0 20px`, rrethime `12px` (butonat) / `16px` (kartat), lartësi prekjeje ≥ 44px.
- **Faqet statike pa Next.js** (p.sh. `public/offline.html`) mbajnë CSS-në brenda dokumentit, por me të njëjtat vlera si `globals.css`. Kur ndryshon `globals.css`, ndrysho edhe këto.
- **Ikonat dhe manifesti:** ngjyrat tona (`#0f0f10`, `#fafafa`, e gjelbra `--positive`), jo ngjyrat e modelit.
- **Kontrolli:** pas çdo ndryshimi pamjeje, krahaso me pamje ekrani faqen e re me listën kryesore, në temë të çelët dhe të errët, në gjerësi telefoni.

Funksionaliteti i ushtrimit (ID-të, rrugët, emrat e skedarëve, mesazhet e kërkuara) ruhet ashtu siç e kërkon profesori; ndryshon vetëm pamja.

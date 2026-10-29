# RideShare — Java 6 · PWA dhe puna offline

## Çfarë ndërtova
RideShare tani lexon listën publike të udhëtimeve edhe pa internet, por nuk konfirmon asgjë pa serverin. Puna ka tri pjesë:
- **Manifesti** (`src/app/manifest.ts`, i shërbyer si `/manifest.webmanifest`): identiteti i aplikacionit, pra emri “RideShare AAB”, ikonat 192×192 e 512×512, hapja `standalone` dhe ngjyrat. Manifesti nuk ruan udhëtime; instalimi në telefon vetëm nuk provon leximin offline.
- **Service worker** (`public/sw.js`): skript që punon në shfletues dhe trajton vetëm disa kërkesa. Për `GET /api/udhetimet` provon së pari rrjetin (network-first). Kur përgjigjja është e mirë, e ruan me kohën e ruajtjes; kur serveri nuk arrihet, lexon kopjen e fundit. Kur faqja `/` nuk hapet pa rrjet, kthen lexuesin `offline.html`. Paneli, hyrja (`/api/auth`) dhe çdo `POST` nuk ruhen dhe nuk ridërgohen.
- **Kopja publike në pajisje**: në Cache Storage, te `rideshare-public-v1`, ruhen vetëm `offline.html`, dy ikonat dhe lista publike. Kjo kopje është në këtë shfletues, mund të fshihet dhe nuk është backup i databazës. Neon mbetet burimi i të dhënave.

Endpoint-i `GET /api/udhetimet` rishfrytëzon `lexoUdhetimet()` të Javës 4 dhe kthen vetëm fushat publike. Pa email, profil ose sesion. Komponenti `Pwa.tsx` në layout regjistron worker-in dhe e kërkon listën një herë, që kopja të mbushet qysh në vizitën e parë.

Kodin e udhëzimit e përshtata me dizajnin e aplikacionit tim. Lexuesi offline përdor të njëjtat ngjyra, butonat dhe temën e çelët/errët si lista kryesore. Kartat janë të njëjta me ato të listës: titulli, pastaj Ora · Shoferi · vendet, pastaj “Shiko detajet” brenda kartës. Rrjedha mbetet karta → detajet → kërkesa për vend ose anulimi. Kur lista vjen nga kopja, “Shiko detajet” është i çaktivizuar, sepse detajet dhe kërkesa nuk hapen pa server; me server është lidhje normale te `/udhetimi/<id>`. “Rifresko listën” qëndron te kutia e mesazhit për burimin dhe kohën e kopjes. Që kartat të tregojnë shoferin dhe orën e ndryshuar (~~08:15~~ → 09:15), endpoint-i kthen edhe `shoferi` dhe `ora_e_meparshme`, që shfaqen gjithsesi te lista publike. Ikonat dhe ngjyrat e manifestit janë në stilin e aplikacionit.

## Provat që bëra
### Prova 1: Manifesti dhe vizita online
Në Chrome, me profil të ri pa kopje, hapa `http://localhost:3000/manifest.webmanifest`. Emri ishte “RideShare AAB”, `short_name` “RideShare”, me dy ikona: `/icons/icon-192.png` (192×192) dhe `/icons/icon-512.png` (512×512). Të dyja adresat u hapën si PNG me këto përmasa. Pastaj hapa `/` me internet. Service worker `/sw.js` ishte `activated` dhe e kontrollonte faqen. Te Cache Storage → `rideshare-public-v1` ishin `/offline.html`, dy ikonat dhe `/api/udhetimet`, pra lista u ruajt. `/offline.html` me internet tregoi tri kartat, “Lista erdhi nga serveri. Lexo sërish para çdo veprimi.” dhe kohën e ruajtjes 22/10/2026, 18:53:33. Butonat “Shiko detajet” ishin lidhje te `/udhetimi/1`, `/udhetimi/2` dhe `/udhetimi/3`. Instalimin në telefon nuk e provova; prova u bë në shfletuesin e kompjuterit.

### Prova 2: Pa internet dhe pas rifreskimit
Ndërprerjen e simulova me Network → Offline vetëm për tab-in RideShare, përfshirë service worker-in. Hapa `/` dhe e rifreskova faqen. U hap lexuesi offline (“RideShare · Lista e ruajtur”) me tri kartat: Prishtinë 08:00 (2 vende), Fushë Kosovë ~~08:15~~ → 09:15 (1 vend) dhe Lipjan 07:45 (pa vende), secila me shoferin. Mesazhi ishte “Lista e fundit e ruajtur · Mund të jetë vjetruar. Serveri nuk u arrit.”, me kohën 22/10/2026, 18:53:33. Në secilën kartë “Shiko detajet” ishte i çaktivizuar, prandaj nuk mund të arrihej as kërkesa “Kërko vend”, që te aplikacioni im ndodhet te detajet. Nuk kishte konfirmim rezervimi, sepse kopja vetëm kujton listën e fundit. Pa server nuk dihet nëse vendi ende ekziston, dhe kërkesa ka nevojë për sesionin dhe kontrollin në server të Javës 5.

### Prova 3: Lidhja rikthehet
RideShare mbeti offline. Në Neon, ID 2 kishte `ora` = 09:15 (kjo është ora fillestare në databazën time, me `ora_e_meparshme` = 08:15). Ekzekutova `UPDATE udhetimet SET ora = '08:25' WHERE id = '2';` dhe Neon tregoi 08:25. Offline, edhe pas “Rifresko listën”, aplikacioni shfaqte ende 09:15 nga kopja e 18:53:33 dhe mesazhin “Serveri nuk u arrit”. E ktheva rrjetin në Online dhe klikova “Rifresko listën”. ID 2 tregoi ~~08:15~~ → 08:25, burimin “Lista erdhi nga serveri” dhe kohën e re 18:54:06; “Shiko detajet” u bë sërish lidhje. Pastaj riktheva orën fillestare me `UPDATE udhetimet SET ora = '09:15' WHERE id = '2';`, rifreskova listën dhe ID 2 tregoi sërish 09:15 (kopja e re 18:54:09).

## Ku gjendet puna
Repository: https://github.com/mala19830/rideshare-mobile

Skedarët e rinj:
- `aplikacioni/src/app/manifest.ts`: manifesti i aplikacionit
- `aplikacioni/public/icons/icon-192.png` dhe `icon-512.png`: ikonat
- `aplikacioni/src/app/api/udhetimet/route.ts`: `GET /api/udhetimet` me fushat publike
- `aplikacioni/public/sw.js`: service worker, me rrjetin së pari dhe kopjen në dështim
- `aplikacioni/public/offline.html`: lexuesi offline, me stilet dhe skriptin brenda dokumentit
- `aplikacioni/src/components/Pwa.tsx`: regjistrimi i worker-it dhe lidhja për lexuesin

Skedarët që ndryshova:
- `aplikacioni/src/app/layout.tsx`: shtova `<Pwa />` nën shiritin e sipërm
- `aplikacioni/src/app/globals.css`: stilet e lidhjes `.pwa-note`
- `aplikacioni/CLAUDE.md`: rregulli i dizajnit të njëtrajtshëm

Prova u bë lokalisht; aplikacioni nuk është publikuar në Vercel.

## Çfarë mbetet për përmirësim
Në vizitën e parë pa internet nuk ka kopje: worker-i ende nuk është regjistruar dhe lista nuk është ruajtur. Lexuesi duhet të shfaqë “Ende nuk ka listë të ruajtur. Hape aplikacionin me internet dhe provo përsëri.” dhe nuk shpik udhëtime. Leximi offline ka edhe kufizime të tjera:
- Lexohet vetëm lista publike, jo detajet, paneli ose kërkesa.
- Kopja mund të jetë e vjetër: ora dhe vendet mund të kenë ndryshuar, siç u pa te Prova 3.
- Kopja ruhet vetëm në këtë shfletues dhe mund të fshihet.
- Asnjë veprim nuk konfirmohet pa serverin.

Për ndryshimet e ardhshme të `offline.html` duhet rritur versioni i cache-s (`rideshare-public-v2`), që worker-i ta ruajë faqen e re.

## Ndihma nga AI (Artificial Intelligence – inteligjencë artificiale)
Përdora AI (Claude Code) për të shtuar kodin A–F të udhëzimit në projektin tim dhe për ta përshtatur me dizajnin tim: lexuesin offline, lidhjen në layout, ikonat dhe ngjyrat e manifestit. AI testoi çdo hap me `tsc`, lint dhe pamje ekrani në temë të çelët dhe të errët. Me kërkesën time AI ekzekutoi edhe tri provat në një dritare Chrome, ku Network → Offline u aktivizua përmes DevTools Protocol. AI ekzekutoi edhe dy `UPDATE`-t e orës në Neon, nga projekti, pa e hapur `.env.local`. Unë i ndoqa provat në dritare dhe i kontrollova rezultatet. Sekretet nuk janë në kod, në raport ose në GitHub.

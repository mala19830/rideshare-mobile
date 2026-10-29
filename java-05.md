# RideShare — Java 5 · Hyrja dhe lejet

## Çfarë ndërtova
Shtova hyrjen me GitHub përmes NextAuth (`next-auth@4.24.15`) dhe një ndryshim të mbrojtur: shoferi ndryshon orën e udhëtimit të vet. Në aplikacion këto janë tri gjëra të ndara:
- **Identiteti** (kush je): e verifikon GitHub. Pas hyrjes, sesioni mban ID-në e përdoruesit nga biblioteka, jo nga një fushë e formularit.
- **Roli** (çfarë lejohesh të bësh): ruhet në tabelën `profilet` në Neon. Çdo hyrje e re fillon si `udhetar`; rolin `shofer` e cakton vetëm administratori nga SQL Editor. Serveri e lexon rolin përsëri para çdo ruajtjeje.
- **Pronësia** (cilit i përket udhëtimi): kolona `shofer_id` te `udhetimet`. `UPDATE` ka kushtin `shofer_id` = ID-ja e sesionit, prandaj edhe një shofer nuk mund ta ndryshojë udhëtimin e një shoferi tjetër.

Kontrolli bëhet në server (`src/lib/lejet.ts`) me radhë: ka sesion → është shofer → ID dhe ora janë të vlefshme → është pronari. Fshehja e formularit për udhëtarin e bën faqen më të qartë, por mbrojtja e vërtetë është kontrolli në server.

Shtova edhe katër elemente të miat:
1. Kërkesa për vend kërkon llogari. Pa hyrje, faqja `/udhetimi/[id]/kerkesa` ridrejton te paneli me mesazhin “Për të kërkuar vend në udhëtim duhet të hysh me llogarinë tënde GitHub.”
2. Pas hyrjes, përdoruesi kthehet te kërkesa që kishte nisur. Paneli pranon vetëm adresa të formës `/udhetimi/<numër>/kerkesa`, që askush të mos e përdorë për ridrejtim në faqe të huaj.
3. Shiriti i sipërm tregon gjendjen në çdo faqe. Pa hyrje shfaq “Hyr / Paneli im”; me hyrje shfaq ikonën e profilit, emrin, rolin dhe një ikonë për dalje.
4. Kur shoferi e ndryshon orën, ora e vjetër ruhet në kolonën `ora_e_meparshme`, në të njëjtin `UPDATE` me kontrollin e pronarit. Lista, detajet dhe kërkesa e shfaqin si ~~08:25~~ → 08:15.

## Provat që bëra
### Prova 1: Hyrja, rifreskimi dhe dalja
Para hyrjes, `/panel` shfaqte “Lista është publike. Për panelin hyr me llogarinë tënde GitHub.” dhe butonin “Hyr me GitHub”; shiriti i sipërm tregonte “Hyr / Paneli im”. Pas hyrjes me GitHub u shfaq “Përshëndetje, …”, ID-ja ime GitHub dhe roli `udhetar`. Pas rifreskimit emri dhe roli mbetën. Pasi klikova “Dil”, paneli kërkoi përsëri “Hyr me GitHub”.

### Prova 2: Shoferi ndryshon udhëtimin e vet
Pasi u caktova `shofer` dhe pronar i ID 2 nga SQL Editor, paneli shfaqi formularin. Ruajta 08:25 dhe paneli tregoi “Ora u ruajt me sukses. Kontrollo listën dhe detajet.” Lista dhe detajet e ID 2 treguan orën e re 08:25, me orën e mëparshme të vijëzuar përpara saj. Në Neon rreshti i ID 2 kishte `ora` = 08:25. E riktheva në 08:15; lista dhe detajet treguan ~~08:25~~ → 08:15, dhe Neon tregoi `ora` = 08:15, `ora_e_meparshme` = 08:25.

### Prova 3: Veprimi pa leje refuzohet
Në panel hapa DevTools (Inspect mbi “Ruaj orën”), te `<input type="hidden" name="id" value="2">` e ndryshova vlerën në 1 dhe pa rifreskuar klikova “Ruaj orën”. Paneli shfaqi “Nuk ke leje për këtë udhëtim. Ora nuk ndryshoi.” Në Neon, me `SELECT id, ora, ora_e_meparshme, shofer_id FROM udhetimet ORDER BY id;`, ID 1 mbeti 08:00, pa orë të mëparshme dhe me pronarin `DEMO-SHOFER-2`. Serveri e merr pronarin nga sesioni, prandaj `UPDATE` nuk gjeti rresht me të dy kushtet. Pas rifreskimit formulari u kthye te ID 2.

## Ku gjendet puna
Repository: https://github.com/mala19830/rideshare-mobile

Skedarët e rinj:
- `aplikacioni/schema-java05.sql`: tabela `profilet` dhe kolonat `shofer_id` e `ora_e_meparshme`
- `aplikacioni/src/lib/auth.ts`: konfigurimi i hyrjes me GitHub dhe sesioni
- `aplikacioni/src/app/api/auth/[...nextauth]/route.ts`: adresa që trajton hyrjen
- `aplikacioni/src/lib/lejet.ts`: `profiliIm` dhe `ndryshoOren`, me kontrollin e rolit dhe të pronarit
- `aplikacioni/src/app/panel/actions.ts`: veprimi i ruajtjes në server
- `aplikacioni/src/app/panel/page.tsx`: paneli im
- `aplikacioni/src/components/Hyrja.tsx`: butonat “Hyr me GitHub” dhe “Dil”
- `aplikacioni/src/components/ShiritiLlogarise.tsx` dhe `ButoniDil.tsx`: gjendja e hyrjes në shiritin e sipërm
- `aplikacioni/src/components/OraUdhetimit.tsx`: shfaqja e orës së ndryshuar

Skedarët që ndryshova:
- `aplikacioni/src/app/layout.tsx` dhe `globals.css`
- `aplikacioni/src/app/udhetimi/[id]/page.tsx`
- `aplikacioni/src/app/udhetimi/[id]/kerkesa/page.tsx`: kontrolli i hyrjes
- `aplikacioni/src/components/KartaUdhetimi.tsx`
- `aplikacioni/src/lib/udhetimet.ts`
- `aplikacioni/package.json`: shtova `next-auth@4.24.15`

Prova u bë lokalisht; aplikacioni nuk është publikuar në Vercel.

## Çfarë mbetet për përmirësim
Kërkesa për vend tani kërkon llogari, por mbetet simulim: nuk ruhet në databazë dhe numri i vendeve nuk zbret. Hapi i ardhshëm është një tabelë `kerkesat` (udhëtimi, udhëtari nga sesioni, statusi). Shoferi do t’i pranonte ose refuzonte vetëm kërkesat për udhëtimet e veta, me të njëjtin kontroll pronësie si te ndryshimi i orës. Edhe formulari i panelit është ende i fiksuar te ID 2; më vonë duhet të listojë të gjitha udhëtimet e shoferit.

## Ndihma nga AI (Artificial Intelligence – inteligjencë artificiale)
Përdora AI (Claude Code) për të përshtatur kodin A–G të udhëzimit me projektin tim (stilet dhe ndërruesi i temës nga Javët 3–4) dhe për të instaluar `next-auth`. Me kërkesën time AI shkroi edhe katër shtesat e mia: ridrejtimin te paneli pa hyrje, kthimin te kërkesa pas hyrjes, shiritin e llogarisë me ikona dhe orën e vjetër të vijëzuar. Për çdo hap kontrolloi tipet dhe lint-in dhe testoi faqet lokalisht.

Vetë krijova OAuth App në GitHub, gjenerova sekretin dhe vendosa variablat në `.env.local`. Po ashtu ekzekutova SQL-në në Neon SQL Editor dhe e caktova veten shofer dhe pronar të ID 2. Tri provat i bëra vetë në shfletues, përfshirë ndryshimin e ID-së në DevTools. AI verifikoi gjendjen e databazës pas çdo prove me pyetje leximi `SELECT`, pa e hapur `.env.local`. Sekretet nuk janë në kod, në raport ose në GitHub.

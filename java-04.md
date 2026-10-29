# RideShare — Java 4 · Neon dhe PostgreSQL

## Çfarë ndërtova
Vargu fiks i udhëtimeve nga Java 3 u zëvendësua me tabelën `udhetimet` në Neon (PostgreSQL). Lista (/) thërret `lexoUdhetimet()`, ndërsa detajet (/udhetimi/[id]) dhe kërkesa (/udhetimi/[id]/kerkesa) thërrasin `gjejUdhetimin(id)`, ku ID kalon si parametër te driver-i Neon, jo si tekst i bashkuar me SQL. Të gjitha leximet bëhen në server me `await`; `DATABASE_URL` lexohet vetëm në `src/lib/db.ts`, i mbrojtur me `server-only`. Faqet kanë `force-dynamic`, prandaj çdo hapje ose rifreskim e pyet databazën përsëri. Ruajta edhe kolonën `shoferi` dhe anulimin e kërkesës nga Java 3.

## Provat që bëra
### Prova 1: Ndryshimi në databazë shfaqet në aplikacion
Ndryshova orën e ID 2 nga 08:15 në 08:25 me `UPDATE udhetimet SET ora = '08:25' WHERE id = '2';`, pa prekur kodin. Pas rifreskimit, edhe lista (/) edhe detajet (/udhetimi/2) treguan 08:25 te Liridona H. E ktheva orën në 08:15 dhe pas rifreskimit të dyja faqet treguan sërish 08:15.

### Prova 2: Lista bosh dhe rikthimi
Shtova `WHERE false` vetëm te pyetja e `lexoUdhetimet` në `src/lib/udhetimet.ts`. Faqja nuk u rrëzua: shfaqi titullin dhe mesazhin “Nuk ka udhëtime për momentin.” Pasi e hoqa `WHERE false`, u kthyen të tri kartat (Dren K., Liridona H., Valon B.).

### Prova 3: Lidhja mungon, rikthimi dhe siguria
Ndryshova përkohësisht emrin `DATABASE_URL` në `.env.local` dhe rinisa serverin. Aplikacioni nuk u rrëzua, por shfaqi mesazhin “Nuk u lidhëm me databazën. Provo përsëri.” me butonin “Provo përsëri” — ndryshe nga mesazhi i listës bosh. Riktheva emrin, rinisa serverin dhe udhëtimet u shfaqën sërish. `.env.local` nuk shfaqet në listën e ndryshimeve në GitHub Desktop, sepse `.gitignore` i përjashton skedarët `.env*`.

## Ku gjendet puna
- `aplikacioni/schema.sql`: tabela `udhetimet` me tri udhëtime fiktive
- `aplikacioni/src/lib/db.ts` (i ri): lidhja private me Neon
- `aplikacioni/src/lib/udhetimet.ts`: pyetjet SQL `lexoUdhetimet` dhe `gjejUdhetimin`
- `aplikacioni/src/app/page.tsx`: lista
- `aplikacioni/src/app/udhetimi/[id]/page.tsx`: detajet
- `aplikacioni/src/app/udhetimi/[id]/kerkesa/page.tsx`: simulimi i kërkesës
- `aplikacioni/package.json`: paketat `@neondatabase/serverless` dhe `server-only`

Repository: https://github.com/mala19830/rideshare-mobile

## Çfarë mbetet për përmirësim
Kërkesa “Në pritje” dhe anulimi mbeten simulim: nuk ruhet asnjë rezervim dhe numri i vendeve në Neon nuk ndryshon. Aplikacioni vetëm lexon; ndryshimet i bën pronari i databazës në SQL Editor. Hapi i ardhshëm: hyrja e shoferit dhe kontrolli në server që secili shofer ndryshon vetëm udhëtimet e veta.

## Ndihma nga AI (Artificial Intelligence – inteligjencë artificiale)
Përdora AI (Claude Code) për të përshtatur kodin e udhëzimit të Javës 4 me projektin tim (kolona `shoferi`, komponenti i anulimit dhe stilet e Javës 3), për të shkruar `schema.sql` dhe për të kontrolluar build-in. Lidhjen me databazën e bëra vetë: krijova projektin në Neon, ekzekutova `schema.sql` në SQL Editor dhe vendosa `DATABASE_URL` në `.env.local`. Provën 3 e bëra vetë; provat 1 dhe 2 i ekzekutoi AI me kërkesën time, ndërsa unë kontrollova rezultatet në aplikacion. Verifikova gjithashtu që `.env.local` nuk shfaqet në GitHub Desktop.

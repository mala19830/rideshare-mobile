# Klasa Live

Aplikacion për telefon dhe desktop që tregon vendndodhjen e kolegëve në një grup privat. Bazohet në logjikën e `rideshare-mobile/aplikacioni`. Një adresë e përbashkët dhe një databazë Neon u mundësojnë kolegëve të shohin pozicionet që po ndahen.

## Hyrja në klasë

Hap [Klasa Live](https://klasa-live.vercel.app), shkruaj emrin dhe vendos kodin e ftesës që ta jep organizatori. Emri në listë është ai që shkruan secili. Pas hyrjes, zgjidh **Ndaj GPS-in** ose **Ndaj vetëm klasën**. Të gjithë kolegët përdorin të njëjtën adresë dhe të njëjtin kod.

Në Vercel, kjo mënyrë përdor `AUTH_PROVIDER=class-code`, `KLASA_INVITE_CODE`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` dhe `DATABASE_URL` në **Production**. Për të ndryshuar kodin, cakto një vlerë të re të rastësishme me së paku 20 karaktere dhe ripubliko projektin. Një kod i ri zhvlerëson sesionet e krijuara me kodin e mëparshëm. Përdor **Standard Protection** në Vercel për t’i lejuar studentët të hapin adresën e prodhimit nga llogari të veçanta.

## Nisja lokale

Kërkon Node.js 22.18 ose më të ri.

```powershell
cd C:\Work\Projekti\klasa-live
npm.cmd ci
npm.cmd run dev
```

Hap [localhost:3000](http://localhost:3000). [Demonstrimi](http://localhost:3000/demo) punon menjëherë me të dhëna shembull, pa llogari, pa databazë dhe pa leje për GPS-in.

Për provën offline përdor `npm.cmd run build` dhe `npm.cmd start`. Hape aplikacionin online një herë që të instalohet service worker-i. Kur interneti ndërpritet dhe faqja rifreskohet, shfaqet udhëzuesi publik i ruajtur në pajisje. Vendndodhjet, sesionet dhe komandat e ndarjes kërkojnë rrjet.

## Përditësimi i databazës

Ekzekuto `schema.sql` në Neon para publikimit të këtij versioni, edhe nëse tabela e pranisë ekziston. Skripti mund të ekzekutohet përsëri dhe shton tabelën dhe funksionin për renditjen e nisjes dhe ndaljes së ndarjes. Provoje fillimisht në databazën e testimit.

## Alternativë për një ekip të përbashkët në Vercel

1. Në hapësirën e Vercel ku studentët kanë qasje, krijo projektin `klasa-live` nga kjo dosje. Kur studentët kanë role të kufizuara, caktoju qasje te ky projekt përmes grupit të tyre të qasjes ose rolit **Project Viewer**.
2. Te **Security → Deployment Protection**, aktivizo **Vercel Authentication → All Deployments** para se të aktivizosh lokacionet. Kjo mbrojtje kontrollon qasjen e studentëve në faqe dhe në API. Mbaji pa përjashtime publike, pa lidhje kalimi **Shareable Link** dhe pa **Protection Bypass** për këtë projekt. Kontrollo adresën e prodhimit në një shfletues privat të paloguar.
3. Në të njëjtin ekip, nga **Settings → Apps**, krijo një **Sign in with Vercel App**. Aktivizo `openid`, `profile` dhe metodën `client_secret_basic`. Regjistro adresën e prodhimit me prapashtesën `/api/auth/callback/vercel`.
4. Në një databazë Neon për Klasa Live ekzekuto `schema.sql` një herë.
5. Te variablat **Production** të projektit, cakto `AUTH_PROVIDER=vercel`, `KLASA_VERCEL_TEAM_ID` me ID-në `team_…`, `VERCEL_SIGN_IN_CLIENT_ID`, `VERCEL_SIGN_IN_CLIENT_SECRET`, `NEXTAUTH_SECRET`, `DATABASE_URL` dhe `NEXTAUTH_URL` me adresën HTTPS të prodhimit. Mbaj aktiv ekspozimin e variablave sistemorë të Vercel, sepse aplikacioni përdor `VERCEL` dhe `VERCEL_ENV` për ta aktivizuar këtë mënyrë hyrjeje vetëm në prodhim.
6. Publiko versionin dhe kontrollo adresën me një student që ka qasje te projekti dhe me një llogari që nuk ka qasje. Një student i autorizuar hap adresën e përbashkët dhe zgjedh **Hyr me Vercel** për të krijuar sesionin e aplikacionit.

Qasja e ekipit varet nga **Vercel Authentication** në projektin e publikuar. Regjistrimi i llogarisë në Vercel dhe hyrja OAuth identifikojnë përdoruesin. Autorizimi i tij për projektin vjen nga qasja e dhënë në Vercel.

[Konfigurimi i Deployment Protection](https://vercel.com/docs/deployment-protection/methods-to-protect-deployments/vercel-authentication) · [Konfigurimi i Sign in with Vercel](https://vercel.com/docs/sign-in-with-vercel/manage-from-dashboard)

## Aktivizimi lokal me GitHub

1. Në një databazë Neon, ekzekuto `schema.sql` një herë.
2. Krijo një GitHub OAuth App me callback lokal `http://localhost:3000/api/auth/callback/github`.
3. Kopjo `.env.example` në `.env.local`. Plotëso `DATABASE_URL`, `GITHUB_ID`, `GITHUB_SECRET` dhe një `NEXTAUTH_SECRET` të ri. Për të gjeneruar sekretin përdor `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"`.
4. Cakto `CLASS_MEMBER_IDS` me ID-të numerike të GitHub-it, të ndara me presje, p.sh. `CLASS_MEMBER_IDS=12345,67890`. Kur dikush hyn me GitHub dhe s’është ende në listë, ekrani i tregon ID-në që t’ia dërgojë organizatorit.
5. Rinis aplikacionin pas ndryshimeve të konfigurimit.

Për dy telefona përdor të njëjtën adresë HTTPS të publikimit. Mund ta shtosh aplikacionin në ekranin kryesor nga menyja e shfletuesit.

## Prova me dy llogari

1. Hyr me dy llogari të lejuara, në dy telefona ose në dy profile të shfletuesit.
2. Në njërën, shkruaj “Salla A2” dhe zgjidh **Ndaj vetëm klasën**. Në tjetrën, kolegu dhe salla shfaqen në listë brenda një rifreskimi, normalisht brenda 5 sekondash.
3. Zgjidh **Ndalo ndarjen**, pastaj provo **Ndaj GPS-in** dhe jep lejen e shfletuesit. Zgjidh pikën për të parë saktësinë dhe për ta hapur në OpenStreetMap. Hapja e lidhjes së jashtme ia dërgon koordinatat OpenStreetMap-it.
4. Kaloje faqen në sfond ose ndalo ndarjen. Pika hiqet në rifreskimin e radhës pas konfirmimit nga serveri. Nëse komanda e ndaljes s’arrin në server, pika bëhet e padukshme 45 sekonda pas përditësimit të fundit, plus koha deri te rifreskimi i panelit.
5. Hyr me një llogari jashtë listës dhe kontrollo ekranin që kërkon leje nga organizatori.

Ndarja rifreskohet rreth çdo 10 sekonda kur faqja është në plan të parë. Klasa shënohet nga vetë përdoruesi, sepse GPS-i mund të ketë pasaktësi brenda ndërtesës. Databaza mban deri në një pikë për person. Ndalja e konfirmuar e fshin pikën, ndërsa rekordet e skaduara nuk shfaqen dhe pastrohen kur fillon një ndarje e re. Kur rrjeti rikthehet, paneli rilexon gjendjen dhe riprovon ndaljen e pakonfirmuar. Për ta ndarë sërish sallën ose GPS-in, përdoruesi e nis vetë ndarjen.

## Zbatimi i javëve 01–13

Anëtarët e klasës duhet të gjejnë shpejt sallën ose kolegët që zgjedhin ta ndajnë pozicionin. Versioni minimal mbulon hyrjen, ndarjen vullnetare dhe leximin nga grupi. Rrjedha pranohet kur një anëtar ndan sallën ose GPS-in, një anëtar i dytë e sheh dhe, pas ndaljes së konfirmuar, pika hiqet në rifreskimin tjetër.

| Java | Zbatimi në Klasa Live |
| --- | --- |
| [01](https://arbenl.github.io/lendet/2026-2027/mobile/java-01/) dhe [02](https://arbenl.github.io/lendet/2026-2027/mobile/java-02/) | Problemi, MVP-ja dhe kriteri i provës me dy anëtarë. |
| [03](https://arbenl.github.io/lendet/2026-2027/mobile/java-03/) | Next.js App Router, komponentë të veçantë dhe faqe 404 në shqip me kthim në fillim. |
| [04](https://arbenl.github.io/lendet/2026-2027/mobile/java-04/) dhe [05](https://arbenl.github.io/lendet/2026-2027/mobile/java-05/) | Neon përdoret nga serveri. Paneli dallon listën bosh nga gabimi. Sesioni përcakton qasjen dhe pronarin e shkrimit. |
| [06](https://arbenl.github.io/lendet/2026-2027/mobile/java-06/) dhe [07](https://arbenl.github.io/lendet/2026-2027/mobile/java-07/) | Manifesti PWA, udhëzuesi publik offline dhe prova e rrjedhës me dy llogari. Service worker-i ruan vetëm udhëzuesin. |
| [08](https://arbenl.github.io/lendet/2026-2027/mobile/java-08/) | GPS-i kërkohet pas klikimit dhe përdoruesi mund ta shkruajë sallën kur GPS-i nuk mund të përdoret. |
| [09](https://arbenl.github.io/lendet/2026-2027/mobile/java-09/) | Gjendje në pritje, sukses pas konfirmimit dhe mundësi për ta riprovuar ndaljen. |
| [10](https://arbenl.github.io/lendet/2026-2027/mobile/java-10/) | Polling afërsisht çdo 5 sekonda, me pauzë në sfond, pritje më të gjatë pas gabimit dhe rifreskim pas rilidhjes. |
| [11](https://arbenl.github.io/lendet/2026-2027/mobile/java-11/) | Njoftime brenda panelit për nisjen, ndaljen dhe gabimet e ndarjes. |
| [12](https://arbenl.github.io/lendet/2026-2027/mobile/java-12/) | Validim dhe ruajtje e rendit të shkrimeve në PostgreSQL. Kërkesat e vonuara për një ndarje të anuluar refuzohen gjatë dritares së riprovimit. |
| [13](https://arbenl.github.io/lendet/2026-2027/mobile/java-13/) | Komanda mbi hartë, kontrolle harte 44 px, fokus i dukshëm dhe provë në gjerësi telefoni. |

Për javët 12 dhe 13 janë përdorur temat dhe ushtrimet publike. Prezantimet e tyre nuk ishin ende të publikuara gjatë punës.

Në Chrome, me pamje mobile 390 × 844 px, komanda e ndarjes nisi 1 201 px nga maja e ekranit para ndryshimit dhe 433 px pas ndryshimit. Në të dy versionet, gjerësia e përmbajtjes ishte 390 px dhe fokusi i tastierës ishte i dukshëm. Koha lokale deri te `DOMContentLoaded` ishte 241 ms në një provë para ndryshimit dhe 89–121 ms në dy prova pas tij. Këto matje janë orientuese dhe varen nga mjedisi lokal.

## Kontrollet

```powershell
npm.cmd run check
npm.cmd test
npm.cmd run build
```

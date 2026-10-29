# RideShare · Java 7

## Rasti im
GitHub: mala19830
Kodi: P7-092
Skenari i zgjedhur (numri dhe titulli, nga Rastet 1–5): Rasti 1 · Lista dhe detajet
ID i udhëtimit në projektin tim: 2
Të dhënat fiktive të rastit: Ferizaj → AAB, 10:05, 2 vende. Ora për provën e re: 10:10.

Në projektin tim ID 2 është udhëtimi fiktiv Fushë Kosovë → AAB (shoferja Liridona H.). Rreshtit të tij në Neon i vendosa vlerat e rastit: ora 10:05 dhe 2 vende. ID 1 dhe 3 nuk u prekën.

## Parashikimi
Te lista pres të shoh udhëtimin me ID-në përkatëse, si dhe vendet e lira. Kur të klikoj "Shiko detajet", pres që vlerat nga karta paraprake të jenë njësoj me vlerat te udhëtimi. Për ID-të që nuk ekzistojnë, p.sh. 898, pres mesazh të qartë "Udhëtimi nuk u gjet" dhe mundësinë për t'u kthyer te lista e udhëtimeve.

## Dy probleme
1. Kërkesa për një udhëtim që nuk ekziston ose që është plot të dërgonte te hyrja. Pa qenë i kyçur, hapa `/udhetimi/898/kerkesa` dhe `/udhetimi/3/kerkesa` (ID 3 ka 0 vende). Në të dyja rastet serveri ridrejtoi (307) te `/panel?m=kerkesa` dhe kërkoi "Hyr me GitHub". Vetëm pas hyrjes përdoruesi do të mësonte se udhëtimi nuk u gjet ose se nuk ka vende. Faqja e detajeve `/udhetimi/898` e tregoi saktë "Udhëtimi nuk u gjet", pra problemi ishte vetëm te faqja e kërkesës.
2. Pa internet, detajet e një udhëtimi nuk hapen me faqen tonë offline. Duke lexuar Service Worker-in (`public/sw.js`) pashë se ai i trajton vetëm navigimet te `/` dhe `/offline.html`, prandaj `/udhetimi/2` pa rrjet nuk merr kopjen tonë, por faqen e gabimit të shfletuesit. Këtë e gjeta nga kodi; nuk e kam provuar ende në shfletues pa rrjet. Kjo nuk u korrigjua këtë javë; lista offline punon nga lidhja "Lista për lexim pa internet".

## Korrigjimi
Skedari: aplikacioni/src/app/udhetimi/[id]/kerkesa/page.tsx
Kjo faqe serveri lexon udhëtimin nga Neon dhe kontrollon nëse përdoruesi është i kyçur. Nëse është i kyçur, shfaq simulimin e kërkesës për vend; nëse nuk është, e dërgon te hyrja. Më parë ridrejtimi te hyrja bëhej para kontrollit nëse udhëtimi ekziston, prandaj edhe ID-të e panjohura dërgoheshin te hyrja. E ndryshova radhën: së pari `notFound()` kur udhëtimi mungon, pastaj ridrejtimi te hyrja vetëm kur udhëtimi ka vende të lira (`!brenda && udhetim.vende > 0`). Me 0 vende, mesazhi "Nuk ka vende të lira." del menjëherë, pa kërkuar hyrje. Kontrolli i hyrjes në server mbetet: simulimi i kërkesës për një udhëtim me vende hapet vetëm pas hyrjes.

## Versionet
Para: https://github.com/mala19830/rideshare-mobile/commit/14e5611cc21ed32bc4bf9a3e71b1d5c9fa135698
Pas: https://github.com/mala19830/rideshare-mobile/commit/9ec297140ffec0ae623837d7825159cce3289494

## Provat që bëra
### Prova 1
Hapat: Me `npm run dev` hapa listën `http://localhost:3000`, gjeta kartën e ID 2 (Fushë Kosovë → AAB), klikova "Shiko detajet" dhe pastaj "Kërko vend" pa qenë i kyçur.
Pritshmëria: Karta dhe detajet tregojnë të njëjtat vlera për ID 2 (ora 10:05, shoferja Liridona H., 2 vende të lira); "Kërko vend" kërkon hyrje, sepse kërkesa lejohet vetëm me llogari dhe mbetet simulim.
Vëzhgimi: Karta: "Ora 10:05 · Shoferi: Liridona H. · 2 vende të lira". Detajet `/udhetimi/2`: Shoferi Liridona H., Ora 10:05, Vendtakimi "Te stacioni kryesor", Vende të lira 2, butoni "Kërko vend". "Kërko vend" më dërgoi te paneli me mesazhin "Për të kërkuar vend në udhëtim duhet të hysh me llogarinë tënde GitHub." Hyrjen me GitHub nuk e bëra në këtë provë, prandaj simulimin pas hyrjes nuk e kam parë këtu.

### Prova 2
Hapat: Pa qenë i kyçur hapa `/udhetimi/898/kerkesa` (ID që nuk ekziston) dhe `/udhetimi/3/kerkesa` (ID 3 me 0 vende), një herë para korrigjimit (commit Para) dhe një herë pas tij (commit Pas).
Pritshmëria: Për ID 898 faqja "Udhëtimi nuk u gjet" me butonin "Kthehu te lista"; për ID 3 mesazhi "Nuk ka vende të lira." Në asnjërin rast nuk kërkohet hyrje.
Vëzhgimi: Para korrigjimit prova DËSHTOI: të dyja adresat kthyen 307 dhe më dërguan te "Hyr me GitHub". Pas korrigjimit `/udhetimi/898/kerkesa` kthen 404 me "Udhëtimi nuk u gjet" dhe butonin "Kthehu te lista"; `/udhetimi/3/kerkesa` kthen 200 me "Lipjan → AAB · Ora 07:45 · Nuk ka vende të lira." pa kërkuar hyrje. Kontrollova edhe që `/udhetimi/2/kerkesa` (2 vende) kërkon ende hyrje (307), pra kontrolli në server nuk u hoq.

### Prova 3
Hapat: Ndryshova vetëm një vlerë: ora e ID 2 nga 10:05 në 10:10 (ora e provës së re te rasti P7-704), me të njëjtin UPDATE që bën paneli i pronarit (ora e vjetër ruhet te `ora_e_meparshme`). Pastaj rifreskova listën dhe detajet e ID 2.
Pritshmëria: Meqë faqet janë `force-dynamic`, lista dhe detajet lexojnë Neon në çdo kërkesë, prandaj duhet të shfaqet menjëherë ora e ndryshuar "10:05 → 10:10" (e vjetra e vijëzuar), në të dy ekranet njësoj; vendet mbeten 2.
Vëzhgimi: Lista: "Fushë Kosovë → AAB · Ora 10:05 → 10:10 · Shoferi: Liridona H. · 2 vende të lira". Detajet: "Ora 10:05 → 10:10", "Vende të lira 2". Të dy ekranet tregojnë të njëjtat vlera.

## Ndryshimi i ri
Hyrja që ndryshova ishte ora e ID 2 (10:05 → 10:10, Prova 3). Parashikova që lista dhe detajet ta tregojnë menjëherë orën e re, sepse të dyja faqet e lexojnë udhëtimin nga Neon në çdo kërkesë (`force-dynamic`), dhe kështu ndodhi. Kontrollin me kolegun (kolegu zgjedh hyrjen) nuk e kam demonstruar ende; do ta shpjegoj dhe demonstroj në takimin e radhës.

## Ndihma nga AI
Përdora Claude (Claude Code). Parashikimin e shkrova vetë pa AI; AI vetëm i korrigjoi gabimet e shkrimit pas commit-it Para, pa ia ndryshuar kuptimin. AI gjeti dy problemet duke hapur faqet, propozoi dhe shkroi korrigjimin, ekzekutoi `tsc` dhe `eslint`, vendosi të dhënat e rastit dhe ndryshimin e orës te rreshti im i ID 2 në Neon dhe i ekzekutoi tri provat me kërkesën time. Unë i ndoqa hapat, i krahasova rezultatet me parashikimin tim dhe kontrollova që kontrolli i hyrjes në server mbeti.

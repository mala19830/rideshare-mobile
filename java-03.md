# RideShare — Java 3

Ruaje këtë skedar si `java-03.md` pranë README në repository-n tënd, jashtë dosjes `aplikacioni/`. Mos shto `.txt` pas emrit. Zëvendëso të gjitha shenjat e plotësimit me atë që ndodhi vërtet. Mjafton një fjali e qartë për çdo provë, por trego çfarë prite dhe çfarë pe.

## Çfarë ndërtova
Sot përfundova tri ekranet e RideShare në Next.js: listën me tri karta udhëtimesh (/), detajet e udhëtimit (/udhetimi/[id]) dhe kërkesën e simuluar (/udhetimi/[id]/kerkesa), plus faqen “Udhëtimi nuk u gjet” për ID që nuk ekzistojnë. Si shtesë, te kërkesa vendosa mundësinë e anulimit dhe në krye të çdo faqeje një buton për temën e çelët ose të errët.

## Provat që bëra
### Prova 1: Lista në telefon
Hapa faqen kryesore në pamjen e telefonit (375 px); prisja tri karta pa lëvizje anash; pashë saktësisht tri karta (Prishtinë, Fushë Kosovë, Lipjan), secila me orën, etiketën e vendeve dhe butonin “Shiko detajet”, pa lëvizje horizontale, si në temën e çelët ashtu edhe në të errët.

### Prova 2: Detajet e udhëtimit të dytë
Klikova kartën 2; prisja adresën /udhetimi/2 dhe vendtakimin e saj; pashë adresën /udhetimi/2 me titullin “Fushë Kosovë → AAB”, orën 08:15, vendtakimin “Te stacioni kryesor” dhe 1 vend të lirë.
Shënova edhe çfarë ndodhi te karta 3 (zero vende) dhe te /udhetimi/99: te karta 3 butoni “Nuk ka vende të lira” ishte i çaktivizuar dhe nuk kishte lidhje për kërkesë; te /udhetimi/99 u shfaq “Udhëtimi nuk u gjet”, dhe “Kthehu te lista” më ktheu te tri kartat.

### Prova 3: Kërkesa në pritje
Klikova Kërko vend; prisja “Simulim: Në pritje”, pa rezervim real; pashë adresën /udhetimi/2/kerkesa me titullin “Simulim: Në pritje” dhe mesazhin se kërkesa nuk është dërguar te shoferi; “Anulo kërkesën” e ktheu statusin në “Simulim: E anuluar” dhe “Kërko përsëri” e riktheu në pritje. Pastaj u ktheva te detajet dhe lista: “Kthehu te detajet” hapi /udhetimi/2 dhe “Kthehu te lista” tregoi sërish tri kartat, me numrin e vendeve të pandryshuar. Provat i bëra me një koleg dhe gjithçka punoi si duhet; anulimi i kërkesës ishte sugjerimi i tij, të cilin e shtuam.

## Çfarë do të përmirësoj
Kërkesa dhe anulimi janë vetëm simulim: pas rifreskimit statusi kthehet në “Në pritje” dhe numri i vendeve të lira nuk ndryshon. Javën tjetër dua që kërkesa të ruhet, që anulimi ta lirojë vërtet vendin dhe që lista të tregojë numrin e saktë të vendeve.

## Ndihma nga AI (Artificial Intelligence – inteligjencë artificiale)
Përdora AI (Claude Code) për të krijuar projektin Next.js, për të shkruar kodin e tri faqeve, komponentët dhe stilet, dhe për t’i kontrolluar faqet në shfletues. Vetë vendosa për dizajnin (modern, minimalist, jo ai i modelit), kërkova anulimin e kërkesës dhe butonin e temës, dhe i provova ekranet në shfletues paralelisht me AI-në: listën në pamjen e telefonit, detajet e kartës 2, kartën 3 pa vende, adresën /udhetimi/99 dhe rrjedhën e kërkesës me kthimin mbrapa.

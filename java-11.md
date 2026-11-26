# RideShare — Java 11: Njoftimet dhe angazhimi

## Çfarë shtova ndaj javës 10

Shtova njoftime personale për pranimin e kërkesës, listën me numrin e palexuar, polling çdo pesë sekonda, toast vetëm për ID të re gjatë sesionit të hapur dhe hapjen e kërkesës përkatëse. Ripërdora autentikimin NextAuth, Neon, kërkesën e Javës 10 dhe faqosjen ekzistuese. Leximi ruhet vetëm pasi serveri konfirmon marrësin.

## Përgatitja

Nuk u krijua kërkesë prove dhe nuk u përdorën dy sesione testimi në këtë mjedis. ID-ja e udhëtimit, ID-ja e kërkesës dhe gjendja e Neon-it nuk janë verifikuar.

### Prova 1: Rasti 1 · Përgjigjja bëhet njoftim

- Hapat dhe përgjigjja e shoferit: Nuk u ekzekutua provë me dy sesione; migrimi nuk mund të aplikohej sepse `DATABASE_URL` mungon në workspace.
- Çfarë prisja te udhëtari: Pas pranimit nga shoferi pronar, një njoftim i palexuar shfaqet nga polling-u.
- ID-ja e njoftimit, numri i palexuar dhe çfarë pashë realisht: Nuk u verifikuan në databazë ose shfletues.
- Cila kërkesë u hap dhe çfarë mbeti pas Refresh: Nuk u provua; kodi lidh njoftimin me ID-në e kërkesës dhe kontrollon qasjen e udhëtarit.

### Prova 2: Rasti 2 · Hapja dhe shënimi si i lexuar

- ID-ja e njoftimit dhe kërkesa e hapur realisht: Nuk u provuan.
- Numri i palexuar para/pas konfirmimit nga serveri: Nuk u mat në shfletues.
- Historia pas kthimit te lista dhe Refresh: Nuk u verifikua në Neon.
- Dështimi i shënimit: Nuk e provova këtë skenar shtesë.

### Prova 3: Rasti 3 · Rilidhja pa njoftime të dyfishta

- ID-ja e kërkesës tjetër, dritarja offline dhe hapat: Nuk u krijua kërkesë prove dhe DevTools Offline nuk u përdor.
- Çfarë prisja pas rilidhjes dhe dy leximeve të tjera: I njëjti rekord të shfaqet pas rikthimit të polling-ut, pa toast tjetër për të njëjtën ID.
- Numri i rekordeve, ID-ja dhe alarmet që pashë: Nuk u verifikuan në shfletues ose Neon.

## Prova me një hyrje tjetër

Nuk u krye provë me koleg ose llogari të dytë.

## Ku gjendet kodi dhe çfarë mbetet

- `aplikacioni/schema-java11.sql`: tabela unike e njoftimeve dhe funksioni atomik që pranon kërkesën, ul vendin dhe shton njoftimin. **Migrimi duhet aplikuar në Neon para provës reale.**
- `aplikacioni/src/lib/njoftimet.ts`: lexim sipas marrësit dhe shënim i sigurt si i lexuar.
- `aplikacioni/src/app/api/njoftimet/`: API e autentikuar për listën dhe leximin.
- `aplikacioni/src/components/Njoftimet.tsx`: polling, badge i palexuar, toast me deduplikim dhe hapja e kërkesës.
- Kufizim: njoftimet e listës kufizohen në 50 më të fundit.

## Zgjerime opsionale

Web Push, VAPID dhe Service Worker nuk u implementuan.

## Ndihma nga AI (Artificial Intelligence — inteligjencë artificiale)

U përdor Codex për inspektimin, implementimin dhe kontrollet lokale. Migrimi dhe rrjedha me dy sesione nuk u provuan në Neon real.

## Pas dorëzimit të parë — përditëso më vonë

Plotëso pas feedback-ut të GitHub-it dhe provave reale.

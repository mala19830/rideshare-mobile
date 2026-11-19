# Java 5 – GitHub login dhe paneli i shoferit

Ky projekt shton autentikimin GitHub (NextAuth v4), profilin në Neon dhe panelin e shoferit duke ruajtur ndërfaqen dhe testet ekzistuese.

## Konfigurimi

1. Në terminal, hyni në `aplikacioni` dhe ekzekutoni `npm install`.
2. Ekzekutoni `schema-java05.sql` **një herë** në databazën Neon të laboratorit.
3. Krijoni OAuth App në GitHub. Callback URL për lokal: `http://localhost:3000/api/auth/callback/github`; për prodhim përdorni URL-në reale të aplikacionit.
4. Krijoni `aplikacioni/.env.local` me vlerat e mëposhtme (mos e ngarkoni në Git):

```dotenv
DATABASE_URL=postgresql://...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<sekret i gjeneruar rastësisht>
GITHUB_ID=<GitHub OAuth Client ID>
GITHUB_SECRET=<GitHub OAuth Client Secret>
```

5. Ekzekutoni `npm run dev` dhe hapni `/panel`. Pas hyrjes, profilit i caktohet automatikisht roli `udhetar`.
6. Për ta provuar panelin si shofer, vendosni ID-në numerike të GitHub të llogarisë suaj (shfaqet te `/panel`):

```sql
UPDATE profilet SET roli = 'shofer' WHERE github_id = '<GITHUB_NUMERIC_ID>';
UPDATE udhetimet SET shofer_id = '<GITHUB_NUMERIC_ID>' WHERE id = '2';
```

7. Rifreskoni `/panel`, ndryshoni orën dhe verifikoni listën. Vetëm pronari i udhëtimit me rolin `shofer` mund ta ndryshojë atë.

**Kujdes:** Për deployment caktoni `NEXTAUTH_URL` dhe variablat e tjera në platformë. `schema-java05.sql` nuk duhet ekzekutuar mbi databazë prodhimi pa kontroll paraprak. Rezervimi i vendit mbetet vetëm simulim.

## Vercel

Në Vercel, lidhni repository-n `mala19830/rideshare-mobile`, zgjidhni branch-in `main` dhe caktoni Root Directory `aplikacioni`. Krijoni GitHub OAuth App nën llogarinë `mala19830` dhe përdorni domain-in e deployment-it për callback URL-në. Për shembull, për domain-in `rideshare-mobile-eight-phi.vercel.app` përdorni:
`https://rideshare-mobile-eight-phi.vercel.app/api/auth/callback/github`.

Lista dhe detajet janë publike dhe lexojnë nga Neon. Paneli shfaq gjendjen e hyrjes edhe kur mungon konfigurimi OAuth. Kërkesat reale dhe të preferuarat kërkojnë hyrje me GitHub. Për skemën e plotë aplikoni `schema.sql`, `schema-java05.sql`, `schema-java08.sql` dhe `schema-java09.sql` në atë rend. `schema-java10.sql` shton udhëtime për prova.

Në Vercel → Project Settings → Environment Variables, shtoni `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GITHUB_ID` dhe `GITHUB_SECRET` për Production. Përdorni vlera private të krijuara për llogaritë tuaja; mos i vendosni këtu, në Git ose në logje. Për Preview, caktoni variablat dhe URL-në përkatëse veçmas nëse aktivizoni preview deployments. Pas ndryshimit, bëni redeploy.

- `DATABASE_URL`: connection string nga projekti juaj Neon.
- `NEXTAUTH_URL`: URL-ja bazë e deployment-it, p.sh. `https://rideshare-mobile-eight-phi.vercel.app`.
- `NEXTAUTH_SECRET`: gjenerojeni lokalisht me një gjenerator kriptografik të sigurt.
- `GITHUB_ID` dhe `GITHUB_SECRET`: nga GitHub OAuth App që krijoni; callback URL-ja duhet të jetë ajo më sipër. Emri i saktë i variablës është `GITHUB_ID` (me nënvizë), jo `GITHUBID`.

Shtoni të njëjtat emra në `aplikacioni/.env.local` për zhvillim lokal. Mos i kopjoni vlerat e prodhimit në dokumentim ose Git.

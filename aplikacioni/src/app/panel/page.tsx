import Link from "next/link";
import Hyrja from "@/components/Hyrja";
import { profiliIm } from "@/lib/lejet";
import { ruajOren } from "./actions";

export const dynamic = "force-dynamic";

const mesazhet: Record<string, string> = {
  hyr: "Hyr në llogari para se të ndryshosh udhëtimin.",
  kerkesa: "Për të kërkuar vend në udhëtim duhet të hysh me llogarinë tënde GitHub.",
  ndaluar: "Nuk ke leje për këtë udhëtim. Ora nuk ndryshoi.",
  fushe: "Shkruaj një orë të vlefshme, p.sh. 08:25. ID duhet të jetë 1, 2 ose 3.",
  ruajtur: "Ora u ruajt me sukses. Kontrollo listën dhe detajet.",
  databaza: "Nuk u lidhëm me databazën. Kontrollo Neon dhe provo përsëri.",
};

// Pranojmë vetëm adresën e një kërkese brenda aplikacionit, jo linqe të jashtme.
function adresaPrapa(prapa: string | string[] | undefined) {
  return typeof prapa === "string" && /^\/udhetimi\/\d+\/kerkesa$/.test(prapa)
    ? prapa
    : "/panel";
}

export default async function Panel({ searchParams }: PageProps<"/panel">) {
  const { m, prapa } = await searchParams;
  const mesazh = typeof m === "string" ? mesazhet[m] : undefined;

  let p;
  try {
    p = await profiliIm();
  } catch {
    return (
      <main>
        <h1>Paneli im</h1>
        <p className="lead" role="alert">{mesazhet.databaza}</p>
        <Link className="action" href="/panel">Provo përsëri</Link>
      </main>
    );
  }

  return (
    <main>
      <Link className="back" href="/">← Kthehu te udhëtimet</Link>
      <h1>Paneli im</h1>
      {mesazh && <p className="note" role="status">{mesazh}</p>}
      {!p ? (
        <p className="lead">Lista është publike. Për panelin hyr me llogarinë tënde GitHub.</p>
      ) : (
        <>
          <p className="lead">
            Përshëndetje, {p.emri}. Roli: <strong>{p.roli}</strong>.
          </p>
          <p>ID ime GitHub: <code>{p.id}</code></p>
        </>
      )}
      <Hyrja brenda={Boolean(p)} prapa={adresaPrapa(prapa)} />
      {p?.roli === "shofer" ? (
        <form action={ruajOren} className="trip-card">
          <h2>Ndrysho orën e udhëtimit tim</h2>
          <input type="hidden" name="id" value="2" />
          <label htmlFor="ora">Ora e re</label>{" "}
          <input id="ora" name="ora" type="time" defaultValue="08:15" required />{" "}
          <button className="action" type="submit">Ruaj orën</button>
          <p className="trip-meta">
            Formulari i laboratorit provon ID 2. Serveri verifikon pronarin edhe nëse ID ndryshohet.
          </p>
        </form>
      ) : (
        p && <p>Si udhëtar mund të shohësh udhëtimet; nuk mund të ndryshosh orën e shoferit.</p>
      )}
      <p className="trip-meta">Kërkesa për vend mbetet simulim këtë javë.</p>
    </main>
  );
}

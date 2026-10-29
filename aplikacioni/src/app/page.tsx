import { KartaUdhetimi } from "@/components/KartaUdhetimi";
import { lexoUdhetimet, type Udhetim } from "@/lib/udhetimet";

// Lexo bazën përsëri në çdo kërkesë për këtë faqe.
export const dynamic = "force-dynamic";

export default async function Home() {
  let udhetimet: Udhetim[];
  try {
    udhetimet = await lexoUdhetimet();
  } catch {
    return (
      <main>
        <h1>Udhëtimet për AAB</h1>
        <p className="lead" role="alert">
          Nuk u lidhëm me databazën. Provo përsëri.
        </p>
        {/* Rifreskim i plotë, që faqja ta pyesë databazën përsëri. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a className="action" href="/">
          Provo përsëri
        </a>
      </main>
    );
  }

  return (
    <main>
      <h1>Udhëtimet për AAB</h1>
      <p className="lead">Zgjidh një nisje dhe lexo detajet para kërkesës.</p>
      {udhetimet.length === 0 ? (
        <p className="lead">Nuk ka udhëtime për momentin.</p>
      ) : (
        <div className="trip-list">
          {udhetimet.map((udhetim) => (
            <KartaUdhetimi key={udhetim.id} udhetim={udhetim} />
          ))}
        </div>
      )}
    </main>
  );
}

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { OraUdhetimit } from "@/components/OraUdhetimit";
import { StatusiKerkeses } from "@/components/StatusiKerkeses";
import { profiliIm } from "@/lib/lejet";
import { gjejUdhetimin, type Udhetim } from "@/lib/udhetimet";

export const dynamic = "force-dynamic";

export default async function Kerkesa({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let udhetim: Udhetim | undefined;
  let brenda: boolean;
  try {
    // Kërkesa për vend lejohet vetëm me llogari; kontrolli bëhet në server.
    [udhetim, brenda] = await Promise.all([
      gjejUdhetimin(id),
      profiliIm().then(Boolean),
    ]);
  } catch {
    return (
      <main>
        <h1>RideShare</h1>
        <p className="lead" role="alert">
          Nuk u lidhëm me databazën. Provo përsëri.
        </p>
        <Link className="action" href="/">
          ← Kthehu te lista
        </Link>
      </main>
    );
  }

  // Së pari: a ekziston udhëtimi dhe a ka vende? Pa këtë, përdoruesi
  // dërgohej te hyrja për një udhëtim që nuk ekziston ose që është plot.
  if (!udhetim) notFound();

  // redirect qëndron jashtë try/catch: Next.js e përdor si kontroll rrjedhe.
  // Pas hyrjes, paneli e kthen përdoruesin te kjo kërkesë.
  if (!brenda && udhetim.vende > 0) redirect(`/panel?m=kerkesa&prapa=/udhetimi/${encodeURIComponent(id)}/kerkesa`);

  return (
    <main>
      <Link className="back" href={`/udhetimi/${id}`}>
        ← Kthehu te detajet
      </Link>
      <p className="trip-meta">
        <span>
          {udhetim.nisja} → {udhetim.destinacioni}
        </span>
        <span>
          Ora <OraUdhetimit udhetim={udhetim} />
        </span>
      </p>
      {udhetim.vende > 0 ? (
        <StatusiKerkeses udhetim={udhetim} />
      ) : (
        <h1>Nuk ka vende të lira.</h1>
      )}
    </main>
  );
}

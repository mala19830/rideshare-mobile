import Link from "next/link";
import { notFound } from "next/navigation";
import { OraUdhetimit } from "@/components/OraUdhetimit";
import { gjejUdhetimin, type Udhetim } from "@/lib/udhetimet";

export const dynamic = "force-dynamic";

export default async function Detajet({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let udhetim: Udhetim | undefined;
  try {
    udhetim = await gjejUdhetimin(id);
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

  // Mungesa e udhëtimit nuk është gabim lidhjeje, prandaj qëndron jashtë try/catch.
  if (!udhetim) notFound();

  return (
    <main>
      <Link className="back" href="/">
        ← Kthehu te lista
      </Link>
      <h1>
        {udhetim.nisja} → {udhetim.destinacioni}
      </h1>
      <dl className="details">
        <div>
          <dt>Shoferi</dt>
          <dd>{udhetim.shoferi}</dd>
        </div>
        <div>
          <dt>Ora</dt>
          <dd>
            <OraUdhetimit udhetim={udhetim} />
          </dd>
        </div>
        <div>
          <dt>Vendtakimi</dt>
          <dd>{udhetim.vendtakimi}</dd>
        </div>
        <div>
          <dt>Vende të lira</dt>
          <dd>{udhetim.vende}</dd>
        </div>
      </dl>
      {udhetim.vende > 0 ? (
        <Link className="action" href={`/udhetimi/${id}/kerkesa`}>
          Kërko vend
        </Link>
      ) : (
        <button className="action" disabled>
          Nuk ka vende të lira
        </button>
      )}
    </main>
  );
}

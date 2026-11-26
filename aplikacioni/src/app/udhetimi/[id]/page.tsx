import Link from "next/link";
import { notFound } from "next/navigation";
import { gjejUdhetimin } from "@/lib/udhetimet";
import { MeetingPoint } from "@/components/MeetingPoint";
import { KerkesaUdhetimi } from "@/components/KerkesaUdhetimi";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { lexogjendjen } from "@/lib/kerkesat";

export const dynamic = "force-dynamic";

export default async function Detajet({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let udhetim;

  try {
    udhetim = await gjejUdhetimin(id);
  } catch {
    return (
      <main>
        <h1>RideShare</h1>
        <p role="alert">Nuk u lidhëm me databazën. Provo përsëri.</p>
        <Link href="/">← Kthehu te lista</Link>
      </main>
    );
  }

  if (!udhetim) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  let gjendja = null;
  if (session?.user.githubId) {
    try { gjendja = await lexogjendjen(id, session.user.githubId); } catch { /* detail page remains readable */ }
  }

  return (
    <main>
      <Link href="/">← Kthehu te lista</Link>
      <h1>
        {udhetim.nisja} – {udhetim.destinacioni}
      </h1>
      <p>Ora: {udhetim.ora}</p>
      <p>Vendtakimi: {udhetim.vendtakimi}</p>
      <p>Vende të lira: {udhetim.vende}</p>
      <MeetingPoint />
      {gjendja && <KerkesaUdhetimi id={id} initialState={gjendja} />}
      {udhetim.vende > 0 ? (
        <Link className="action" href={`/udhetimi/${id}/kerkesa`}>
          Shiko kërkesën për vend
        </Link>
      ) : (
        <button className="action" disabled>
          Nuk ka vende të lira
        </button>
      )}
    </main>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { lexogjendjen } from "@/lib/kerkesat";
import { KerkesaUdhetimi } from "@/components/KerkesaUdhetimi";

export const dynamic = "force-dynamic";

export default async function Kerkesa({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ request?: string }>;
}) {
  const { id } = await params;
  const { request } = await searchParams;
  const session = await getServerSession(authOptions);
  let state = null;
  if (session?.user.githubId) {
    try { state = await lexogjendjen(id, session.user.githubId); } catch { /* show a safe unavailable state */ }
  }
  if (request && (!state || !state.requests.some((item) => item.id === request))) notFound();
  return <main>
    <Link href={`/udhetimi/${id}`}>← Kthehu te detajet</Link>
    <h1>Kërkesa për udhëtimin {id}</h1>
    {!session && <p role="alert">Hyr me GitHub për të parë ose dërguar kërkesën.</p>}
    {session && !state && <p role="alert">Gjendja nuk është e disponueshme ose nuk ke qasje.</p>}
    {state && <KerkesaUdhetimi id={id} initialState={state} />}
  </main>;
}

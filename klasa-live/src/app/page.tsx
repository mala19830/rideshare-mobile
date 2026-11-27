import Link from "next/link";
import { Dashboard } from "@/components/dashboard";
import { ClassLogin, Login, Logout } from "@/components/account";
import { Brand, Pin } from "@/components/brand";
import { authReady, groupReady, loginProvider, viewer } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  const member = await viewer();
  const databaseReady = Boolean(process.env.DATABASE_URL);
  const loginLabel = loginProvider === "class-code" ? "me kod ftese" : loginProvider === "vercel" ? "me Vercel" : "me GitHub";
  if (member?.allowed && databaseReady) return <Dashboard user={member} />;

  return <>
    <header className="top"><div className="wrap top-inner"><Brand /><span className="quiet">Grup privat</span></div></header>
    <main className="wrap welcome">
      <section className="welcome-card">
        <span className="welcome-icon"><Pin /></span>
        <h1>Ku është klasa?</h1>
        <p>Shih vendndodhjen e kolegëve që zgjedhin ta ndajnë me grupin. Përdor GPS-in ose shëno sallën ku je.</p>
        {member && !member.allowed && loginProvider === "github" && <div className="notice">Kërkoji organizatorit të shtojë ID-në tënde të GitHub-it <strong>{member.id}</strong> në grup.</div>}
        {member && !member.allowed && loginProvider === "vercel" && <div className="notice">Dil dhe hyr përsëri me llogarinë e ekipit.</div>}
        {!member && !authReady && <div className="notice">Hyrja {loginLabel} pret konfigurimin e organizatorit.</div>}
        {authReady && (!databaseReady || !groupReady) && <div className="notice">Grupi pret konfigurimin e databazës ose të qasjes.</div>}
        {!member && authReady && loginProvider === "class-code" && <ClassLogin />}
        <div className="buttons">
          {member ? <Logout /> : authReady && loginProvider !== "class-code" && <Login provider={loginProvider} />}
          <Link className={`button ${authReady ? "secondary" : "primary"}`} href="/demo">Provo demonstrimin</Link>
        </div>
      </section>
      <div className="welcome-plot" aria-hidden="true"><span className="welcome-ring one" /><span className="welcome-ring two" />
        <i className="welcome-point first" /><i className="welcome-point second" /><i className="welcome-point third" />
        <span className="welcome-icon"><Pin /></span></div>
    </main>
  </>;
}

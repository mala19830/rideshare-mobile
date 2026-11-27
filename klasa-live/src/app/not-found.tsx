import { Brand } from "@/components/brand";

export default function NotFound() {
  return <>
    <header className="top"><div className="wrap top-inner"><Brand /></div></header>
    <main className="wrap dashboard">
      <div className="welcome-card">
        <h1>Faqja nuk u gjet</h1>
        <p>Kontrollo adresën ose kthehu te Klasa Live.</p>
        <a className="button primary" href="/">Kthehu në fillim</a>
      </div>
    </main>
  </>;
}

export function Pin() {
  return <svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z" stroke="currentColor" strokeWidth="1.7" />
    <circle cx="12" cy="10" r="2.6" stroke="currentColor" strokeWidth="1.7" />
  </svg>;
}

export function Brand() {
  return <a href="/" className="brand"><span className="brand-mark"><Pin /></span><span>Klasa<span className="brand-live">Live</span></span></a>;
}

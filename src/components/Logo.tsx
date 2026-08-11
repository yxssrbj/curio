export function Logo() {
  return (
    <button className="logo" onClick={() => window.location.reload()} aria-label="Curio home">
      <span className="logo-mark">C</span>
      <span>curio</span>
      <i />
    </button>
  );
}

import './AppHeader.css';

function AppHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="app-header">
      <div className="app-header-title">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </header>
  );
}

export default AppHeader;

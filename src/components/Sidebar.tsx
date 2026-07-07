import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './Sidebar.css';

interface MenuLeaf {
  label: string;
  to: string;
}

interface MenuGroup {
  label: string;
  children: MenuLeaf[];
}

type MenuEntry = MenuLeaf | MenuGroup;

function isGroup(entry: MenuEntry): entry is MenuGroup {
  return 'children' in entry;
}

const menuItems: MenuEntry[] = [
  { label: 'Dashboard', to: '/dashboard' },
  {
    label: 'Tanımlamalar',
    children: [{ label: 'Depolar', to: '/tanimlamalar/depolar' }],
  },
  { label: 'LOT Yönetimi', to: '/lots' },
  { label: 'Balya Yönetimi', to: '/balyalar' },
  { label: 'HVI Analizleri', to: '/hvi-analizleri' },
  { label: 'Kümeleme', to: '/kumeleme' },
  { label: 'Kalite Motoru', to: '/kalite-motoru' },
  { label: 'Ön Serim Planları', to: '/on-serim-planlari' },
  { label: 'Serim Planları', to: '/serim-planlari' },
  { label: 'Barkod & Etiket', to: '/barkod-etiket' },
  { label: 'Raporlar', to: '/raporlar' },
  { label: 'Hareket Geçmişi', to: '/hareket-gecmisi' },
];

function Sidebar() {
  const location = useLocation();

  const [acikGruplar, setAcikGruplar] = useState<Set<string>>(() => {
    const baslangicAcik = new Set<string>();
    menuItems.forEach((entry) => {
      if (isGroup(entry) && entry.children.some((child) => location.pathname.startsWith(child.to))) {
        baslangicAcik.add(entry.label);
      }
    });
    return baslangicAcik;
  });

  const grubuAcKapat = (label: string) => {
    setAcikGruplar((mevcut) => {
      const yeni = new Set(mevcut);
      if (yeni.has(label)) {
        yeni.delete(label);
      } else {
        yeni.add(label);
      }
      return yeni;
    });
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">B</div>
        <span>Balyalama</span>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((entry) => {
          if (isGroup(entry)) {
            const acik = acikGruplar.has(entry.label);
            return (
              <div className="sidebar-group" key={entry.label}>
                <button
                  type="button"
                  className="sidebar-group-toggle"
                  onClick={() => grubuAcKapat(entry.label)}
                  aria-expanded={acik}
                >
                  <span>{entry.label}</span>
                  <span className={acik ? 'sidebar-group-arrow acik' : 'sidebar-group-arrow'}>▾</span>
                </button>
                {acik && (
                  <div className="sidebar-subnav">
                    {entry.children.map((child) => (
                      <NavLink
                        key={child.to}
                        to={child.to}
                        className={({ isActive }) =>
                          isActive ? 'sidebar-sublink active' : 'sidebar-sublink'
                        }
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={entry.to}
              to={entry.to}
              className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
            >
              {entry.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;

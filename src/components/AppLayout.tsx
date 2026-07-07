import type { ReactNode } from 'react';
import Sidebar from './Sidebar';
import './AppLayout.css';

function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-layout-content">{children}</div>
    </div>
  );
}

export default AppLayout;

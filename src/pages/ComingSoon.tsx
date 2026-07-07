import AppHeader from '../components/AppHeader';
import AppLayout from '../components/AppLayout';
import './ComingSoon.css';

function ComingSoon({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <AppLayout>
      <div className="coming-soon-page">
        <AppHeader title={title} subtitle={subtitle} />
        <main className="coming-soon-content">
          <div className="coming-soon-card">
            <div className="coming-soon-icon">🚧</div>
            <h2>Bu modül yakında eklenecek</h2>
            <p>{title} modülü üzerinde çalışıyoruz. Kısa süre içinde kullanıma açılacak.</p>
          </div>
        </main>
      </div>
    </AppLayout>
  );
}

export default ComingSoon;

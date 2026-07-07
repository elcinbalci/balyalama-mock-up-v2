import type { HareketGecmisi } from '../types/domain';
import './HareketTimeline.css';

function HareketTimeline({ kayitlar }: { kayitlar: HareketGecmisi[] }) {
  if (kayitlar.length === 0) {
    return <p className="empty-msg">Bu balyaya ait hareket kaydı bulunamadı.</p>;
  }

  return (
    <div className="timeline">
      {kayitlar.map((kayit) => (
        <div className="timeline-item" key={kayit.id}>
          <div className="timeline-marker" />
          <div className="timeline-card">
            <div className="timeline-header">
              <span className="timeline-tarih">{kayit.tarih}</span>
              <span className="timeline-islem">{kayit.islem}</span>
            </div>
            <div className="timeline-durum-row">
              <span className="durum-pill">{kayit.eskiDurum}</span>
              <span className="durum-arrow">→</span>
              <span className="durum-pill durum-pill-active">{kayit.yeniDurum}</span>
            </div>
            <div className="timeline-meta">
              <span>Balya: {kayit.balyaId}</span>
              <span>Lot: {kayit.lotNo}</span>
              <span>Kullanıcı: {kayit.kullanici}</span>
            </div>
            {kayit.aciklama && <p className="timeline-aciklama">{kayit.aciklama}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

export default HareketTimeline;

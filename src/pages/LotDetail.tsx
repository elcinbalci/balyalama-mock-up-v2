import { Link, useParams } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import AppLayout from '../components/AppLayout';
import StatusBadge from '../components/StatusBadge';
import { useData } from '../context/DataContext';
import { lotDurumMeta } from '../types/domain';
import { kaliteSinifiBul } from '../utils/kaliteSinifi';
import './LotDetail.css';

function LotDetail() {
  const { lotNo } = useParams<{ lotNo: string }>();
  const { lots, balyalar } = useData();
  const lot = lots.find((item) => item.lotNo === lotNo);

  if (!lot) {
    return (
      <AppLayout>
      <div className="lot-detail-page">
        <AppHeader title="LOT Bulunamadı" />
        <main className="lot-detail-content">
          <p>Aradığınız LOT kaydı bulunamadı.</p>
          <Link className="back-link" to="/lots">
            ← LOT listesine dön
          </Link>
        </main>
      </div>
      </AppLayout>
    );
  }

  const fields: { label: string; value: string }[] = [
    { label: 'Lot No', value: lot.lotNo },
    { label: 'Giriş Tarihi', value: lot.girisTarihi },
    { label: 'Menşei Ülke', value: lot.menseiUlke },
    { label: 'Tedarikçi', value: lot.tedarikci },
    { label: 'Depo', value: lot.depo },
    { label: 'Balya Sayısı', value: lot.balyaSayisi.toLocaleString('tr-TR') },
    { label: 'Birim', value: lot.birim },
  ];

  const lotBalyalari = balyalar.filter((balya) => balya.lotNo === lot.lotNo);
  const skorluBalyalar = lotBalyalari.filter((balya) => balya.kaliteSkoru !== null);
  const ortalamaKaliteSkoru =
    skorluBalyalar.length > 0
      ? Math.round(
          skorluBalyalar.reduce((toplam, balya) => toplam + (balya.kaliteSkoru ?? 0), 0) /
            skorluBalyalar.length
        )
      : null;
  const lotSinifi = kaliteSinifiBul(ortalamaKaliteSkoru);

  return (
    <AppLayout>
    <div className="lot-detail-page">
      <AppHeader title={lot.lotNo} subtitle="LOT Detayları" />

      <main className="lot-detail-content">
        <Link className="back-link" to="/lots">
          ← LOT listesine dön
        </Link>

        <div className="lot-detail-card">
          <div className="lot-detail-card-header">
            <h2>{lot.lotNo}</h2>
            <StatusBadge {...lotDurumMeta[lot.durum]} />
          </div>

          <div className="lot-detail-grid">
            {fields.map((field) => (
              <div className="lot-detail-field" key={field.label}>
                <span className="field-label">{field.label}</span>
                <span className="field-value">{field.value}</span>
              </div>
            ))}
            <div className="lot-detail-field">
              <span className="field-label">Ortalama Kalite Skoru</span>
              <span className="field-value">
                {ortalamaKaliteSkoru ?? '—'}
                {skorluBalyalar.length > 0 && lotBalyalari.length > 0 && (
                  <span className="lot-kalite-skor-hint">
                    {' '}
                    ({skorluBalyalar.length}/{lotBalyalari.length} balya)
                  </span>
                )}
              </span>
            </div>
            <div className="lot-detail-field">
              <span className="field-label">Lot Kalite Sınıfı</span>
              <span className="field-value">
                {lotSinifi ? (
                  <StatusBadge label={lotSinifi.label} color={lotSinifi.color} dot={lotSinifi.dot} />
                ) : (
                  '—'
                )}
              </span>
            </div>
          </div>

          <div className="lot-detail-field lot-detail-description">
            <span className="field-label">Açıklama</span>
            <span className="field-value">
              {lot.aciklama || 'Açıklama girilmemiş.'}
            </span>
          </div>
        </div>
      </main>
    </div>
    </AppLayout>
  );
}

export default LotDetail;

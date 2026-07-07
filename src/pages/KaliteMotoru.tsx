import { useMemo, useState } from 'react';
import AppHeader from '../components/AppHeader';
import AppLayout from '../components/AppLayout';
import { useData } from '../context/DataContext';
import { calculateQualityScore, varsayilanAgirliklar } from '../utils/qualityEngine';
import type { ParametreAgirlik } from '../utils/qualityEngine';
import { referansAraligiMetni } from '../utils/referansAraliklari';
import { sinifTablosu, sinifAraligiMetni } from '../utils/kaliteSinifi';
import './KaliteMotoru.css';

interface KarsilastirmaSatiri {
  balyaId: string;
  eskiSkor: number | null;
  yeniSkor: number;
  fark: number;
}

function KaliteMotoru() {
  const { balyalar, hviAnalizleri, kaliteSkoruHesapla } = useData();
  const [agirliklar, setAgirliklar] = useState<ParametreAgirlik[]>(varsayilanAgirliklar);
  const [sonuclar, setSonuclar] = useState<KarsilastirmaSatiri[] | null>(null);

  const toplamAgirlik = useMemo(
    () => agirliklar.reduce((toplam, a) => toplam + a.agirlik, 0),
    [agirliklar]
  );

  const toplamGecerli = toplamAgirlik === 100;

  const handleAgirlikDegistir = (parametre: string, deger: number) => {
    setAgirliklar((onceki) =>
      onceki.map((a) => (a.parametre === parametre ? { ...a, agirlik: deger } : a))
    );
  };

  const handleSifirla = () => {
    setAgirliklar(varsayilanAgirliklar);
    setSonuclar(null);
  };

  const handleGuncelle = () => {
    if (!toplamGecerli) return;

    const hesaplanabilirBalyalar = balyalar.filter((balya) =>
      hviAnalizleri.some((h) => h.balyaId === balya.balyaId)
    );

    const yeniSonuclar: KarsilastirmaSatiri[] = hesaplanabilirBalyalar.map((balya) => {
      const hvi = hviAnalizleri.find((h) => h.balyaId === balya.balyaId)!;
      const yeniSkor = calculateQualityScore(hvi, agirliklar);
      return {
        balyaId: balya.balyaId,
        eskiSkor: balya.kaliteSkoru,
        yeniSkor,
        fark: yeniSkor - (balya.kaliteSkoru ?? 0),
      };
    });

    kaliteSkoruHesapla(
      hesaplanabilirBalyalar.map((balya) => balya.balyaId),
      agirliklar
    );

    setSonuclar(yeniSonuclar);
  };

  return (
    <AppLayout>
      <div className="kalite-motoru-page">
        <AppHeader title="Kalite Motoru" subtitle="HVI parametrelerine ağırlık atayarak balya kalite skorlarını hesapla" />
        <main className="kalite-motoru-content">
          <div className="kalite-motoru-grid">
            <div className="kalite-panel">
              <div className="kalite-panel-header">
                <h2>Parametre Ağırlıkları</h2>
                <button className="link-button" onClick={handleSifirla}>
                  Varsayılana Sıfırla
                </button>
              </div>

              <div className="agirlik-satiri agirlik-satiri-baslik">
                <div>Parametre</div>
                <div>Referans Aralığı</div>
                <div>Ağırlık (%)</div>
              </div>
              {agirliklar.map((a) => (
                <div className="agirlik-satiri" key={a.parametre}>
                  <div className="agirlik-label">{a.label}</div>
                  <div className="agirlik-referans">{referansAraligiMetni(a.parametre)}</div>
                  <input
                    type="number"
                    className="agirlik-input"
                    min={0}
                    max={100}
                    value={a.agirlik}
                    onChange={(e) => handleAgirlikDegistir(a.parametre, Number(e.target.value))}
                  />
                </div>
              ))}
            </div>

            <div className="kalite-ozet-panel">
              <div className={toplamGecerli ? 'toplam-gosterge gecerli' : 'toplam-gosterge gecersiz'}>
                <span className="toplam-label">Toplam</span>
                <span className="toplam-deger">%{toplamAgirlik}</span>
                <span className="toplam-mesaj">
                  {toplamGecerli ? 'Ağırlıklar toplamı 100 — hesaplamaya hazır' : 'Toplam 100 olmalı'}
                </span>
              </div>

              <button
                className="hesapla-button"
                disabled={!toplamGecerli}
                onClick={handleGuncelle}
              >
                Kalite Skorlarını Güncelle
              </button>

              <div className="sinif-tablosu-card">
                <h3>Kalite Sınıfı Skalası</h3>
                <div className="sinif-tablosu-satirlari">
                  {sinifTablosu.map((satir) => (
                    <div className="sinif-tablosu-satiri" key={satir.bilgi.sinif}>
                      <span className="sinif-dot" style={{ background: satir.bilgi.dot }} />
                      <span className="sinif-araligi">{sinifAraligiMetni(satir)}</span>
                      <span className="sinif-etiket" style={{ color: satir.bilgi.color }}>
                        {satir.bilgi.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {sonuclar && (
            <div className="sonuc-panel">
              <h2>{sonuclar.length} balya yeniden hesaplandı</h2>
              <div className="sonuc-table-wrapper">
                <table className="sonuc-table">
                  <thead>
                    <tr>
                      <th>Balya ID</th>
                      <th>Eski Skor</th>
                      <th>Yeni Skor</th>
                      <th>Fark</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sonuclar.map((satir) => (
                      <tr key={satir.balyaId}>
                        <td>{satir.balyaId}</td>
                        <td>{satir.eskiSkor ?? '—'}</td>
                        <td>{satir.yeniSkor}</td>
                        <td className={satir.fark > 0 ? 'fark-pozitif' : satir.fark < 0 ? 'fark-negatif' : 'fark-notr'}>
                          {satir.fark > 0 ? '▲' : satir.fark < 0 ? '▼' : '–'} {Math.abs(satir.fark)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </AppLayout>
  );
}

export default KaliteMotoru;

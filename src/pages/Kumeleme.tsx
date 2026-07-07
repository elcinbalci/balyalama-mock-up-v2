import { useMemo, useState } from 'react';
import AppHeader from '../components/AppHeader';
import AppLayout from '../components/AppLayout';
import { useData } from '../context/DataContext';
import type { Balya } from '../types/domain';
import type { KumeSonucu } from '../utils/clustering';
import './Kumeleme.css';

function mevcutKumeleriOzetle(balyalar: Balya[]): KumeSonucu[] {
  const gruplar = new Map<string, Balya[]>();

  balyalar.forEach((balya) => {
    if (!balya.kumeId) return;
    const liste = gruplar.get(balya.kumeId) ?? [];
    liste.push(balya);
    gruplar.set(balya.kumeId, liste);
  });

  return Array.from(gruplar.entries())
    .map(([kumeId, grup]) => {
      const skorlar = grup
        .filter((balya): balya is typeof balya & { kaliteSkoru: number } => balya.kaliteSkoru !== null)
        .map((balya) => balya.kaliteSkoru);
      return {
        kumeId,
        balyaIdler: grup.map((balya) => balya.balyaId),
        balyaSayisi: grup.length,
        ortalamaUHML: 0,
        ortalamaMIC: 0,
        ortalamaSTR: 0,
        ortalamaUI: 0,
        ortalamaSFI: 0,
        ortalamaKalite:
          skorlar.length > 0
            ? Math.round((skorlar.reduce((t, s) => t + s, 0) / skorlar.length) * 10) / 10
            : null,
        minKalite: skorlar.length > 0 ? Math.min(...skorlar) : null,
        maksKalite: skorlar.length > 0 ? Math.max(...skorlar) : null,
      };
    })
    .sort((a, b) => a.kumeId.localeCompare(b.kumeId));
}

function Kumeleme() {
  const { balyalar, hviAnalizleri, kumeleriOlustur } = useData();
  const [hesaplaniyor, setHesaplaniyor] = useState(false);
  const [sonMesaj, setSonMesaj] = useState<string | null>(null);

  const kumelenmemisSayisi = useMemo(
    () =>
      balyalar.filter(
        (balya) => balya.kumeId === null && hviAnalizleri.some((h) => h.balyaId === balya.balyaId)
      ).length,
    [balyalar, hviAnalizleri]
  );

  const mevcutKumeler = useMemo(() => mevcutKumeleriOzetle(balyalar), [balyalar]);

  const handleCalistir = () => {
    setHesaplaniyor(true);
    setTimeout(() => {
      const sonuc = kumeleriOlustur();
      setHesaplaniyor(false);
      setSonMesaj(
        sonuc.length > 0
          ? `${sonuc.length} yeni küme oluşturuldu, ${sonuc.reduce((t, k) => t + k.balyaSayisi, 0)} balya kümelendi.`
          : 'Kümelenecek yeni balya bulunamadı (HVI analizi tamamlanmış ve henüz kümelenmemiş balya yok).'
      );
    }, 500);
  };

  return (
    <AppLayout>
      <div className="kumeleme-page">
        <AppHeader
          title="Kümeleme"
          subtitle="HVI parametrelerine (UHML, MIC, STR, UI, SFI) göre benzer balyaları küme haline getir"
        />
        <main className="kumeleme-content">
          <div className="kumeleme-panel">
            <div className="kumeleme-tolerans-bilgisi">
              <span className="tolerans-baslik">Kural Bazlı Tolerans Aralıkları</span>
              <div className="tolerans-satirlari">
                <span>UHML ±0.5 mm</span>
                <span>MIC ±0.2</span>
                <span>STR ±1 g/tex</span>
                <span>UI ±1</span>
                <span>SFI ±1</span>
              </div>
            </div>

            <div className="dinamik-kontrol">
              <span className="bekleyen-bilgisi">
                HVI analizi tamamlanmış, henüz kümelenmemiş <strong>{kumelenmemisSayisi}</strong> balya var.
              </span>
              <button
                className="calistir-button"
                onClick={handleCalistir}
                disabled={hesaplaniyor || kumelenmemisSayisi === 0}
              >
                {hesaplaniyor ? 'Kümeleniyor...' : 'Kümeleri Oluştur'}
              </button>
            </div>

            {sonMesaj && <p className="success-msg">{sonMesaj}</p>}
          </div>

          {hesaplaniyor && <div className="hesaplaniyor-mesaji">HVI parametrelerine göre kümeleniyor, lütfen bekleyin...</div>}

          {!hesaplaniyor && (
            <div className="kume-kartlari">
              {mevcutKumeler.map((kume) => (
                <div className="kume-karti" key={kume.kumeId}>
                  <h3>{kume.kumeId}</h3>
                  <div className="kume-balya-sayisi">{kume.balyaSayisi} balya</div>
                  <div className="kume-ortalama">{kume.ortalamaKalite ?? '—'}</div>
                  <div className="kume-ortalama-label">Ortalama Kalite Skoru</div>
                  <div className="kume-araligi">
                    {kume.minKalite !== null && kume.maksKalite !== null
                      ? `Min ${kume.minKalite} · Maks ${kume.maksKalite}`
                      : 'Kalite skoru henüz hesaplanmadı'}
                  </div>
                </div>
              ))}
              {mevcutKumeler.length === 0 && (
                <div className="bos-mesaj">Henüz oluşturulmuş küme bulunmuyor.</div>
              )}
            </div>
          )}
        </main>
      </div>
    </AppLayout>
  );
}

export default Kumeleme;

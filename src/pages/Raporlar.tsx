import { useMemo, useState } from 'react';
import AppHeader from '../components/AppHeader';
import AppLayout from '../components/AppLayout';
import { useData } from '../context/DataContext';
import { hviParametreleri } from './HviNew';
import { parametreUygunlukDurumu, hviDegerAl, uygunlukDurumMeta } from '../utils/uygunlukDurumu';
import type { UygunlukDurum } from '../utils/uygunlukDurumu';
import type { Balya, HviAnaliz } from '../types/domain';
import './Raporlar.css';

const ISI_HARITASI_PARAMETRELERI = hviParametreleri.filter(
  (param) => !['moisture', 'maturity', 'reflectance'].includes(param.id)
);

interface IsiHaritasiSatiri {
  balyaId: string;
  kumeId: string | null;
  hvi: HviAnaliz | undefined;
}

function DagilimOzeti({ sayac }: { sayac: Record<UygunlukDurum, number> }) {
  return (
    <div className="dagilim-ozet">
      {(Object.keys(uygunlukDurumMeta) as UygunlukDurum[]).map((durum) => (
        <div className="dagilim-ozet-item" key={durum}>
          <span className="dagilim-nokta" style={{ background: uygunlukDurumMeta[durum].renk }} />
          <span className="dagilim-sayi">{sayac[durum]}</span>
          <span className="dagilim-label">{uygunlukDurumMeta[durum].label}</span>
        </div>
      ))}
    </div>
  );
}

function IsiHaritasiPaneli({
  baslik,
  satirlar,
  bosMesaj,
}: {
  baslik: string;
  satirlar: IsiHaritasiSatiri[];
  bosMesaj: string;
}) {
  const dagilimSayaclari = useMemo(() => {
    const sayac: Record<UygunlukDurum, number> = { iyi: 0, uyari: 0, ihlal: 0, kritik: 0 };
    satirlar.forEach(({ hvi }) => {
      if (!hvi) return;
      ISI_HARITASI_PARAMETRELERI.forEach((param) => {
        const deger = hviDegerAl(hvi, param.id);
        sayac[parametreUygunlukDurumu(param.id, deger)] += 1;
      });
    });
    return sayac;
  }, [satirlar]);

  return (
    <div className="isi-haritasi-panel">
      <div className="isi-haritasi-header">
        <h2>{baslik}</h2>
        <DagilimOzeti sayac={dagilimSayaclari} />
      </div>

      <div className="isi-haritasi-scroll">
        <table className="isi-haritasi-table">
          <thead>
            <tr>
              <th className="sticky-col">Balya ID</th>
              <th className="sticky-col-2">Küme</th>
              {ISI_HARITASI_PARAMETRELERI.map((param) => (
                <th key={param.id}>{param.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {satirlar.map((satir) => (
              <tr key={satir.balyaId}>
                <td className="sticky-col">{satir.balyaId}</td>
                <td className="sticky-col-2">{satir.kumeId ?? '—'}</td>
                {ISI_HARITASI_PARAMETRELERI.map((param) => {
                  if (!satir.hvi) {
                    return (
                      <td key={param.id} className="isi-hucre isi-hucre-bos">
                        —
                      </td>
                    );
                  }
                  const deger = hviDegerAl(satir.hvi, param.id);
                  const durum = parametreUygunlukDurumu(param.id, deger);
                  return (
                    <td
                      key={param.id}
                      className="isi-hucre"
                      style={{ background: uygunlukDurumMeta[durum].renk }}
                      title={`${param.label}: ${deger} — ${uygunlukDurumMeta[durum].label}`}
                    >
                      {deger}
                    </td>
                  );
                })}
              </tr>
            ))}
            {satirlar.length === 0 && (
              <tr>
                <td colSpan={ISI_HARITASI_PARAMETRELERI.length + 2} className="empty-row">
                  {bosMesaj}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function balyaSatirlariniOlustur(
  balyalar: Balya[],
  hviAnalizleri: HviAnaliz[],
  siraliMi = true
): IsiHaritasiSatiri[] {
  const kaynak = siraliMi
    ? balyalar.slice().sort((a, b) => a.balyaId.localeCompare(b.balyaId))
    : balyalar;
  return kaynak.map((balya) => ({
    balyaId: balya.balyaId,
    kumeId: balya.kumeId,
    hvi: hviAnalizleri.find((h) => h.balyaId === balya.balyaId),
  }));
}

function Raporlar() {
  const { lots, balyalar, serimPlanlari, hviAnalizleri } = useData();
  const [seciliLot, setSeciliLot] = useState(lots[0]?.lotNo ?? '');

  const lotBalyalari = useMemo(
    () => balyalar.filter((balya) => balya.lotNo === seciliLot),
    [balyalar, seciliLot]
  );

  const lotSerimleri = useMemo(
    () => serimPlanlari.filter((plan) => plan.lotNo === seciliLot),
    [serimPlanlari, seciliLot]
  );

  const tumBalyaSatirlari = useMemo(
    () => balyaSatirlariniOlustur(lotBalyalari, hviAnalizleri),
    [lotBalyalari, hviAnalizleri]
  );

  return (
    <AppLayout>
      <div className="raporlar-page">
        <AppHeader
          title="Raporlar"
          subtitle="Lottaki tüm balyaların ve serim planlarının HVI parametrelerine göre uygunluğunu ısı haritası olarak incele"
        />
        <main className="raporlar-content">
          <div className="raporlar-panel">
            <div className="panel-satiri">
              <span className="panel-label">Lot</span>
              <select value={seciliLot} onChange={(e) => setSeciliLot(e.target.value)}>
                {lots.map((lot) => (
                  <option key={lot.lotNo} value={lot.lotNo}>
                    {lot.lotNo}
                  </option>
                ))}
              </select>
              <span className="lot-serim-bilgisi">
                Toplam <strong>{lotBalyalari.length}</strong> balya · <strong>{lotSerimleri.length}</strong> serim
                planı
              </span>
            </div>
          </div>

          <IsiHaritasiPaneli
            baslik={`${seciliLot} — Tüm Balyalar`}
            satirlar={tumBalyaSatirlari}
            bosMesaj="Bu lotta balya bulunamadı."
          />

          {lotSerimleri.map((serim) => (
            <IsiHaritasiPaneli
              key={serim.serimId}
              baslik={`${serim.serimId} — ${serim.x} × ${serim.y} düzen, ${serim.toplamBalya} balya`}
              satirlar={balyaSatirlariniOlustur(
                serim.detay
                  .slice()
                  .sort((a, b) => a.siraNo - b.siraNo)
                  .map((d) => balyalar.find((b) => b.balyaId === d.balyaId))
                  .filter((b): b is Balya => b !== undefined),
                hviAnalizleri,
                false
              )}
              bosMesaj="Bu serim planında balya bulunamadı."
            />
          ))}
        </main>
      </div>
    </AppLayout>
  );
}

export default Raporlar;

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import AppLayout from '../components/AppLayout';
import AgirlikPaneli from '../components/AgirlikPaneli';
import SearchFilterBar from '../components/SearchFilterBar';
import FilterModal from '../components/FilterModal';
import { useData } from '../context/DataContext';
import type { HviGirisTipi } from '../types/domain';
import type { ParametreAgirlik } from '../utils/qualityEngine';
import StatusBadge from '../components/StatusBadge';
import { kaliteSinifiBul } from '../utils/kaliteSinifi';
import './HviList.css';

const girisTipiOptions = [
  { value: 'Excel', label: 'Excel' },
  { value: 'Manuel', label: 'Manuel' },
];

function HviList() {
  const { hviAnalizleri, balyalar, kaliteSkoruHesapla } = useData();
  const [panelAcik, setPanelAcik] = useState(false);
  const [sonucMesaji, setSonucMesaji] = useState<string | null>(null);
  const [arama, setArama] = useState('');
  const [secimliGirisTipleri, setSecimliGirisTipleri] = useState<HviGirisTipi[]>([]);
  const [filtreModalAcik, setFiltreModalAcik] = useState(false);

  const hesaplanabilirVarMi = hviAnalizleri.some((analiz) => {
    const balya = balyalar.find((b) => b.balyaId === analiz.balyaId);
    return balya?.durum === 'Analiz Gerçekleşti';
  });

  const filteredHviAnalizleri = useMemo(() => {
    let sonuc = hviAnalizleri;
    if (secimliGirisTipleri.length > 0) {
      sonuc = sonuc.filter((analiz) => secimliGirisTipleri.includes(analiz.girisTipi));
    }
    if (arama.trim() !== '') {
      const aramaKucuk = arama.trim().toLowerCase();
      sonuc = sonuc.filter(
        (analiz) =>
          analiz.balyaId.toLowerCase().includes(aramaKucuk) ||
          analiz.analiziYapan.toLowerCase().includes(aramaKucuk)
      );
    }
    return sonuc;
  }, [secimliGirisTipleri, arama, hviAnalizleri]);

  const handleHesapla = (agirliklar: ParametreAgirlik[]) => {
    const hedefSayisi = balyalar.filter((balya) => balya.durum === 'Analiz Gerçekleşti').length;
    kaliteSkoruHesapla([], agirliklar);
    setPanelAcik(false);
    setSonucMesaji(`${hedefSayisi} balya için kalite skoru hesaplandı.`);
    setTimeout(() => setSonucMesaji(null), 4000);
  };

  return (
    <AppLayout>
    <div className="hvi-list-page">
      <AppHeader title="HVI Analizleri" subtitle="Balya bazlı HVI analiz sonuçlarını görüntüle" />

      <main className="hvi-list-content">
        <div className="hvi-list-toolbar">
          <SearchFilterBar
            searchValue={arama}
            onSearchChange={setArama}
            searchPlaceholder="Balya ID, analizi yapan ara..."
            activeFilterCount={secimliGirisTipleri.length}
            onFilterClick={() => setFiltreModalAcik(true)}
          />
          {hesaplanabilirVarMi && (
            <button
              type="button"
              className="kalite-hesapla-btn"
              onClick={() => setPanelAcik(true)}
            >
              Kalite Skorunu Hesapla
            </button>
          )}
          <Link to="/hvi-analizleri/yeni" className="new-hvi-btn">
            + Yeni Analiz
          </Link>
        </div>

        {sonucMesaji && <p className="success-msg">{sonucMesaji}</p>}

        <div className="hvi-table-wrapper">
          <table className="hvi-table">
            <thead>
              <tr>
                <th>Balya ID</th>
                <th>Analiz Tarihi</th>
                <th>Analizi Yapan</th>
                <th>Giriş Tipi</th>
                <th>Kalite Skoru</th>
                <th>Sınıf</th>
                <th>Analiz Durumu</th>
              </tr>
            </thead>
            <tbody>
              {filteredHviAnalizleri.map((analiz) => {
                const sinif = kaliteSinifiBul(analiz.kaliteSkoru);
                return (
                  <tr key={analiz.id}>
                    <td>{analiz.balyaId}</td>
                    <td>{analiz.analizTarihi}</td>
                    <td>{analiz.analiziYapan}</td>
                    <td>
                      <span className={analiz.girisTipi === 'Excel' ? 'giris-chip excel' : 'giris-chip manuel'}>
                        {analiz.girisTipi}
                      </span>
                    </td>
                    <td>{analiz.kaliteSkoru ?? '—'}</td>
                    <td>{sinif ? <StatusBadge label={sinif.sinif} color={sinif.color} dot={sinif.dot} /> : '—'}</td>
                    <td>{analiz.analizDurumu}</td>
                  </tr>
                );
              })}
              {filteredHviAnalizleri.length === 0 && (
                <tr>
                  <td colSpan={7} className="empty-row">
                    Henüz HVI analizi bulunmuyor.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {panelAcik && (
        <div className="hvi-panel-backdrop" onClick={() => setPanelAcik(false)}>
          <div className="hvi-panel-card" onClick={(event) => event.stopPropagation()}>
            <AgirlikPaneli onHesapla={handleHesapla} onIptal={() => setPanelAcik(false)} />
          </div>
        </div>
      )}

      {filtreModalAcik && (
        <FilterModal
          title="Giriş Tipine Göre Filtrele"
          options={girisTipiOptions}
          selected={secimliGirisTipleri}
          onApply={(s) => setSecimliGirisTipleri(s as HviGirisTipi[])}
          onClose={() => setFiltreModalAcik(false)}
        />
      )}
    </div>
    </AppLayout>
  );
}

export default HviList;
